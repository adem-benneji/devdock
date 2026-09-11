# DevTools gateway

A stateless Spring Cloud Gateway using WebFlux/Netty, Spring Boot 3.5.16,
Spring Cloud BOM 2025.0.3, and Java 21. PostgreSQL, migrations, and business logic
belong in the downstream services. Do not add Spring MVC to this reactive gateway.

## Run

Use JDK 21 (recommended; Boot 3.5 supports Java through 25).
From the monorepo root:

```sh
./gateway-service/mvnw -f pom.xml verify
./gateway-service/mvnw -f gateway-service/pom.xml spring-boot:run
curl http://localhost:8080/actuator/health
# {"status":"UP"}
```

The root POM aggregates modules; each service can build independently. Add future
service modules to its `<modules>` list. No database, Redis, or Docker is needed
for the gateway or its integration tests.

## Routes and environments

These are placeholders for the planned services, not service implementations:

| Public path | Route ID | Default destination | Override |
| --- | --- | --- | --- |
| `/api/auth/**` | auth-service | `http://localhost:8081` | `AUTH_SERVICE_URL` |
| `/api/tools/**` | tools-service | `http://localhost:8082` | `TOOLS_SERVICE_URL` |
| `/api/snippets/**` | snippets-service | `http://localhost:8083` | `SNIPPETS_SERVICE_URL` |

Paths and query strings are preserved: `/api/tools/uuid?count=2` reaches the tools
service as `/api/tools/uuid?count=2`. If downstream controllers instead expose
`/uuid`, add `filters: [StripPrefix=2]` to that route.

For Docker Compose, use service DNS names and container ports, for example:

```yaml
environment:
  AUTH_SERVICE_URL: http://auth-service:8081
  TOOLS_SERVICE_URL: http://tools-service:8082
  SNIPPETS_SERVICE_URL: http://snippets-service:8083
  FRONTEND_ORIGIN: http://localhost:4200
```

Use each service's actual internal port (all can use 8080 in separate containers).
`localhost` inside a container refers to that container. Static HTTP destinations
using Compose DNS require neither Eureka nor `lb://` routes.
`SERVER_PORT` overrides the gateway's default 8080.

Angular calls `http://localhost:8080/api/...`. CORS permits only
`FRONTEND_ORIGIN` (default `http://localhost:4200`) and includes preflight support.
Use the browser's frontend origin in deployment, without a trailing slash.
Bearer Authorization headers are allowed; cookie credentials are disabled.
If you add cookie authentication later, explicitly enable credentials for trusted
origins and retain CSRF protection. Keep browser CORS policy at the gateway to
avoid duplicate headers from downstream services. CORS is not authentication.

Only `/actuator/health` is exposed, without component details. It reports gateway
health, not availability of the planned services. Proxy calls require those services
to be running. No custom health controller is needed.

## Package structure

Keep everything under `com.devtools.gatewayservice` for component scanning:

```text
src/main/java/com/devtools/gatewayservice/
  GatewayServiceApplication.java
  config/    # Future SecurityConfig and other actual bean configuration
  filters/   # Future nonblocking GlobalFilter or GatewayFilterFactory classes
  routes/    # Optional Java RouteLocator configuration for complex routing
src/main/resources/
  application.yml  # Current routes, CORS, health settings
```

Create those packages when they contain real classes. YAML is sufficient for the
current routes; avoid defining the same routes in Java as well. Filters should
handle concerns such as correlation IDs, not business logic or blocking database calls.

## Discovery and shared configuration

Start with static routes plus environment variables and profile files. For a few
services in a small team, Eureka and Config Server add deployment and operational
work without much benefit. Consider Eureka when instances have dynamically changing
addresses and your platform has no discovery mechanism. Consider Config Server when
many deployments need centrally managed configuration and coordinated updates.
Compose DNS or platform service names can remain sufficient as the project grows.
Keep secrets outside committed YAML.

## Adding JWT authentication later

Add `org.springframework.boot:spring-boot-starter-oauth2-resource-server`, then
create `config/SecurityConfig.java` with a reactive `SecurityWebFilterChain` using
`ServerHttpSecurity` and `oauth2ResourceServer(oauth2 -> oauth2.jwt(withDefaults()))`.
Use Spring Security's JWT validation rather than writing a token-parsing gateway filter.

Configure `spring.security.oauth2.resourceserver.jwt.issuer-uri` for your identity
provider and validate the expected audience as well. The provider must publish
metadata/JWKS, or configure its `jwk-set-uri` explicitly while retaining issuer
validation. Validate signatures, issuer, audience, and expiry; never put a signing
private key in the gateway.

Permit the exact login/registration endpoints you actually implement, health,
and CORS preflights; require authentication for the remaining API routes. Avoid
making all `/api/auth/**` public because future account endpoints may be private.
Integrate CORS before security so preflights and 401/403 responses receive the
correct headers (use a shared reactive CorsConfigurationSource when adding security).
Disable CSRF only for an exclusively stateless bearer-token API with no cookie-based
authentication; reassess if using sessions or cookies.

The gateway already forwards the incoming Authorization header. Downstream services
should also validate JWTs and enforce resource ownership and business permissions.
Keep them on a private network and do not trust client-supplied identity headers.
TokenRelay is unnecessary for forwarding an existing bearer header; it is useful
when the gateway itself becomes an OAuth2 login client/BFF.

## References

- [Boot 3.5 requirements](https://docs.spring.io/spring-boot/3.5/system-requirements.html)
- [Cloud 2025.0.3 release](https://spring.io/blog/2026/06/11/spring-cloud-2025-0-3-aka-northfields-has-been-released/)
- [Gateway WebFlux starter](https://docs.spring.io/spring-cloud-gateway/reference/4.3/spring-cloud-gateway-server-webflux/starter.html)
- [Reactive JWT resource server](https://docs.spring.io/spring-security/reference/reactive/oauth2/resource-server/jwt.html)
