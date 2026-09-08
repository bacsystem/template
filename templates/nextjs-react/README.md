# __PROJECT_NAME__

Generado a partir de la plantilla `nextjs-react` del monorepo `template`.

## Desarrollo

    pnpm install
    pnpm dev

## Tests

    pnpm test

## Build & Docker

    pnpm build
    docker compose up --build

`nginx.conf` as shipped terminates plain HTTP only. The auth cookies are set
with `Secure`, so before this is exposed to real users, put TLS termination
in front of it (a cloud load balancer/ingress, or a `listen 443 ssl` block in
`nginx.conf` with real certificates) — otherwise login will appear to
succeed but the session will never persist.
