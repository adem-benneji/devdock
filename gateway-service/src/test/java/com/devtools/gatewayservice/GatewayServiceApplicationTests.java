package com.devtools.gatewayservice;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.reactive.server.WebTestClient;
import reactor.core.publisher.Mono;
import reactor.netty.DisposableServer;
import reactor.netty.http.server.HttpServer;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class GatewayServiceApplicationTests {
    private static final DisposableServer UPSTREAM = HttpServer.create().host("127.0.0.1").port(0)
            .handle((request, response) -> response.sendString(Mono.just(request.uri())))
            .bindNow();

    @DynamicPropertySource
    static void upstreamUrls(DynamicPropertyRegistry registry) {
        for (String service : new String[]{"AUTH", "TOOLS", "SNIPPETS"}) {
            registry.add(service + "_SERVICE_URL", () -> "http://127.0.0.1:" + UPSTREAM.port());
        }
    }

    @LocalServerPort
    private int port;

    private WebTestClient client;

    @BeforeEach
    void connectToGateway() {
        client = WebTestClient.bindToServer().baseUrl("http://localhost:" + port).build();
    }

    @AfterAll
    static void stopUpstream() {
        UPSTREAM.disposeNow();
    }

    @Test
    void healthIsAvailableWithoutDatabaseOrDiscovery() {
        client.get().uri("/actuator/health").exchange().expectStatus().isOk()
                .expectBody().jsonPath("$.status").isEqualTo("UP");
    }

    @Test
    void routesPreservePathsAndQueriesAndAllowAngular() {
        for (String service : new String[]{"auth", "tools", "snippets"}) {
            String path = "/api/" + service + "/example?value=hello";
            client.get().uri(path).header(HttpHeaders.ORIGIN, "http://localhost:4200")
                    .exchange().expectStatus().isOk()
                    .expectHeader().valueEquals(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "http://localhost:4200")
                    .expectBody(String.class).isEqualTo(path);
        }
    }

    @Test
    void angularPreflightSucceedsIncludingUnmatchedPaths() {
        for (String path : new String[]{"/api/tools/example", "/unmatched"}) {
            client.options().uri(path)
                    .header(HttpHeaders.ORIGIN, "http://localhost:4200")
                    .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "POST")
                    .header(HttpHeaders.ACCESS_CONTROL_REQUEST_HEADERS, "authorization,content-type")
                    .exchange().expectStatus().isOk()
                    .expectHeader().valueEquals(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "http://localhost:4200")
                    .expectHeader().doesNotExist(HttpHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS);
        }
    }

    @Test
    void untrustedOriginIsRejected() {
        client.options().uri("/api/tools/example")
                .header(HttpHeaders.ORIGIN, "https://untrusted.example")
                .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "POST")
                .exchange().expectStatus().isForbidden()
                .expectHeader().doesNotExist(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN);
    }

    @Test
    void unknownPathsAreNotProxied() {
        client.get().uri("/unknown").exchange().expectStatus().isNotFound();
    }
}
