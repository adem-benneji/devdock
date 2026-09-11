# DevTools frontend

Angular 22 application with standalone components, routing, SCSS, and HttpClient.

From this directory:

```sh
npm ci
npm start
```

Open http://localhost:4200. Start the Spring Boot gateway separately on port 8080.
The development proxy forwards `/api/**` to `http://localhost:8080`, preserving
paths. Use relative API URLs such as `/api/tools/uuid` in Angular services.
The frontend can run without the gateway; API calls require the backend services.

```sh
npm run build
npm test -- --watch=false
```

Production output is in `dist/devtools/browser`. The development proxy is not part
of the production build: configure your production reverse proxy to forward `/api`
to the gateway and fall back to `index.html` for Angular routes.

The application entry point is `src/main.ts`, providers live in
`src/app/app.config.ts`, and routes live in `src/app/app.routes.ts`.

Generated using the [Angular CLI](https://angular.dev/tools/cli).
