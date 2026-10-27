import { loadEnv, defineConfig } from '@medusajs/framework/utils';
loadEnv(process.env.NODE_ENV || 'development', process.cwd());
if (!process.env.JWT_SECRET || !process.env.COOKIE_SECRET) {
  throw new Error('Set JWT_SECRET and COOKIE_SECRET before starting Medusa.');
}
export default defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL,
    http: {
      storeCors: process.env.STORE_CORS || 'http://localhost:3000',
      adminCors: process.env.ADMIN_CORS || 'http://localhost:9000',
      authCors: process.env.AUTH_CORS || 'http://localhost:3000,http://localhost:9000',
      jwtSecret: process.env.JWT_SECRET,
      cookieSecret: process.env.COOKIE_SECRET,
    },
  },
  admin: { disable: process.env.DISABLE_MEDUSA_ADMIN === 'true' },
  modules: [
    { resolve: './src/modules/placebo' },
    ...(process.env.REDIS_URL ? [
      { resolve: '@medusajs/medusa/event-bus-redis', options: { redisUrl: process.env.REDIS_URL } },
      { resolve: '@medusajs/medusa/workflow-engine-redis', options: { redis: { redisUrl: process.env.REDIS_URL } } },
      { resolve: '@medusajs/medusa/locking', options: { providers: [{
        resolve: '@medusajs/medusa/locking-redis', id: 'locking-redis', is_default: true,
        options: { redisUrl: process.env.REDIS_URL },
      }] } },
    ] : []),
    ...(process.env.STRIPE_API_KEY ? [{
      resolve: '@medusajs/medusa/payment',
      options: { providers: [{
        resolve: '@medusajs/medusa/payment-stripe', id: 'stripe',
        options: {
          apiKey: process.env.STRIPE_API_KEY,
          webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
          automatic_payment_methods: true, capture: true,
        },
      }] },
    }] : []),
    {
      resolve: '@medusajs/medusa/file',
      options: { providers: process.env.S3_ENDPOINT ? [{
        resolve: '@medusajs/medusa/file-s3', id: 's3',
        options: {
          file_url: process.env.S3_FILE_URL,
          access_key_id: process.env.S3_ACCESS_KEY_ID,
          secret_access_key: process.env.S3_SECRET_ACCESS_KEY,
          region: process.env.S3_REGION || 'auto',
          bucket: process.env.S3_BUCKET,
          endpoint: process.env.S3_ENDPOINT,
        },
      }] : [{
        resolve: '@medusajs/medusa/file-local', id: 'local',
        options: {
          backend_url: (process.env.MEDUSA_PUBLIC_URL || 'http://localhost:9000').replace(/\/$/, '') + '/static',
        },
      }] },
    },
  ],
});
