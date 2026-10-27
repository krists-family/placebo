# Validation

- Medusa schema generation, migration, seed and production build passed against native PostgreSQL 16.
- Native admin authentication and protected content API passed.
- Standalone Next.js storefront read products and prices from Medusa.
- Test checkout created a PostgreSQL order with name embroidery and Spain shipping.
- Guest receipt access was limited to the ordering visitor.
- Plain and personalized variants consumed the same physical inventory.

Stripe card authorization and webhooks were not tested because no Stripe credentials are connected. Redis event bus, workflow engine and locking providers were used in this test. Docker deployment was not run in this environment.
