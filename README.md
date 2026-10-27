# Placebo

A complete scrub cap storefront with a vintage visual identity inspired by the supplied mood references: red and sky stripes, butter yellow, lavender, bold serif lettering and cream paper backgrounds.

## What is included

- Responsive landing page, searchable collection, individual product pages and fit selection.
- Optional name embroidery, a persistent basket, discounts, EU delivery, checkout and private guest receipts.
- About, contact, team enquiry and policy pages, with saved newsletter consent and enquiries.
- An authenticated admin for the hosted review: products, images, inventory, orders, cancellation, customers, promotions, enquiries, subscriber exports, store content and settings.
- A separate Medusa 2 backend with PostgreSQL, Redis and the native Medusa Admin. A custom Placebo admin extension manages site content, enquiries and newsletter records.
- Docker Compose for the standalone Next.js, Medusa, PostgreSQL and Redis stack.

## Two runtime modes

| Mode | Storefront | Data and administration | Payments |
| --- | --- | --- | --- |
| `preview` | Next.js source, compiled for the Sites Worker runtime | Persistent D1 and R2, private authenticated `/admin` | Test orders only |
| `medusa` | Standalone Next.js, or the Worker connected to an external HTTPS Medusa server | Medusa, PostgreSQL, Redis, native `/app` admin | Medusa system provider for tests, Stripe when configured |

The published private review uses `preview`. It creates persistent test orders, changes real review inventory and saves admin edits, but never charges a card or sends a parcel. Its database is separate from Medusa. Switching runtimes does not migrate preview orders, products or content automatically.

The supplied product photographs, product descriptions and initial inventory are concept samples. Replace them with the merchant's actual products before opening for sales. The policies explicitly identify the private review; edit them to the final merchant terms before launch. Newsletter and enquiry forms save records; outbound email has not been configured.

## Run the production stack locally

Requires Docker Compose. Copy the example settings:

```sh
cp .env.example .env.local
cp .env.docker.example .env.docker
cp backend/.env.example backend/.env
```

Set a strong PostgreSQL password in `.env.docker`. Set different random `JWT_SECRET` and `COOKIE_SECRET` values in `backend/.env`; `openssl rand -hex 32` generates each secret. Keep all real environment files out of git. The Compose stack supplies its internal database and Redis URLs.

```sh
docker compose --env-file .env.docker up -d --build postgres redis medusa
docker compose --env-file .env.docker exec medusa npm run seed
docker compose --env-file .env.docker exec medusa npx medusa user -e YOUR_EMAIL -p YOUR_ADMIN_PASSWORD
docker compose --env-file .env.docker cp medusa:/app/.env.frontend backend/.env.frontend
```

Copy the generated `MEDUSA_PUBLISHABLE_KEY` from `backend/.env.frontend` into `.env.local`. Leave `COMMERCE_MODE=medusa`, `ALLOW_TEST_ORDERS=true` and `LIVE_PAYMENTS_ENABLED=false` for local testing. Then start the storefront:

```sh
docker compose --env-file .env.docker up -d --build storefront
```

Open `http://localhost:3000` for the shop and `http://localhost:9000/app` for Medusa Admin. Sign in with the admin account you created. The seed sets up four designs, two fits and plain/name price variants. Plain and embroidered versions of each fit share one physical inventory item, so they cannot oversell separate copies of the same cap. The initial seed is idempotent and does not reset existing stock on reruns.

Spain delivery is initially €4.90; other supported EU countries are €7.90. Shipping becomes free at €90 of items after discounts. Change native shipping prices and rules in Medusa Admin. The seed uses a zero tax calculation for concept testing; configure the actual tax treatment and displayed prices before launch.

For development without Docker, run PostgreSQL and Redis, set the URLs in `backend/.env`, install backend dependencies with `npm ci`, then run `npm run db:migrate`, `npm run seed` and `npm run dev` from `backend/`. In the project root, use `corepack pnpm install --frozen-lockfile` and `pnpm dev:next`. Production uses `pnpm build:next` and `pnpm start:next`; run the built Medusa server from `backend/.medusa/server` after `npm run build`.

## Connect live checkout

1. Host Medusa, PostgreSQL and Redis on a persistent server, using HTTPS for the public backend and storefront addresses. Set `MEDUSA_PUBLIC_URL`, `STOREFRONT_URL` and the CORS settings accordingly.
2. Configure `STRIPE_API_KEY` and `STRIPE_WEBHOOK_SECRET` on Medusa, and replace the test system payment provider with the Stripe provider on the EUR region in Medusa Admin. Configure Stripe's webhook endpoint at `https://YOUR_MEDUSA_HOST/hooks/payment/stripe_stripe` for `payment_intent.amount_capturable_updated`, `payment_intent.succeeded`, `payment_intent.payment_failed` and `payment_intent.partially_funded`.
3. Configure the storefront with the HTTPS `MEDUSA_BACKEND_URL`, its `MEDUSA_PUBLISHABLE_KEY`, `MEDUSA_ADMIN_URL` and matching `STRIPE_PUBLIC_KEY`.
4. Complete actual inventory, shipping, tax, contact details and policies. Set `LEGAL_DETAILS_READY=true`, `LIVE_PAYMENTS_ENABLED=true` and `ALLOW_TEST_ORDERS=false` only after successful Stripe test payments, declines, webhook delivery and refunds.

For a hosted Sites storefront, set these values through the Site's runtime environment settings. Its commerce requests are made server-side to Medusa. The standalone Docker stack uses `.env.local` and `backend/.env` instead.

Use S3-compatible object storage for production image uploads by setting the `S3_*` variables. The local file provider and persistent Docker upload volume are included for local development. Configure backups for PostgreSQL and object storage, and use an email provider if automatic transactional messages are required.

Medusa documentation: [Deployment](https://docs.medusajs.com/learn/deployment/general), [Stripe provider](https://docs.medusajs.com/resources/commerce-modules/payment/payment-provider/stripe), [shipping price rules](https://docs.medusajs.com/resources/commerce-modules/pricing/price-rules).

## Hosted review administration

`PRIVATE_ADMIN_ENABLED=true` grants administration to the signed-in owner of this owner-private Site. Before expanding the Site's audience, set it to `false` and put the owner's stable Site user ID in `ADMIN_USER_IDS`. Server routes enforce this access, and mutations require a matching Origin header. Native Medusa uses its own admin accounts and authentication instead.

Preview stock is reduced transactionally when an order is placed. An order can only cancel once, restoring its stock once. Customer receipts require the ordering browser's secret visitor cookie. Discount usage limits and nonnegative stock are enforced in the database. CSV exports escape spreadsheet formula prefixes. Image uploads validate type and file signatures.

## Build and verification

```sh
pnpm exec tsc --noEmit
pnpm build:next
cd backend && npx tsc --noEmit && npm run build
```

The hosted build uses the Sites `build-site.mjs` helper. The Drizzle migration in `drizzle/` defines its review database; publishing applies the migration to the hosted database.

`tests/commerce-review.mjs` runs HTTP integration checks against the built Worker: pages/assets, personalized baskets, discounts, shipping, input and Origin validation, order idempotency, receipt privacy, admin authorization, cancellation, content edits, forms and a race for the last cap. Run `node tests/commerce-review.mjs` after building and applying the migration to the local review database. The test changes local review data.

See `backend/VALIDATION.md` for the completed native backend checks and their limits. Live Stripe payments and an actual Docker deployment require the merchant's infrastructure and credentials.

## Source layout

- `app/`, `components/`: Next.js storefront and review admin.
- `lib/preview-commerce.ts`: persistent review commerce.
- `lib/medusa-commerce.ts`: native Medusa storefront adapter.
- `db/`, `drizzle/`: review database schema and migration.
- `backend/`: Medusa configuration, custom module, APIs, seed and admin extension.
- `public/images/`, `public/fonts/`: locally served concept photography and fonts.
- `docker-compose.yml`, `Dockerfile`, `backend/Dockerfile`: standalone deployment.
- `.openai/hosting.json`: hosted Site identity and storage bindings.

No passwords, database files, source credentials or build output belong in source control.
