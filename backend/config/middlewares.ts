import type { Core } from '@strapi/strapi';

const config: Core.Config.Middlewares = [
  'strapi::logger',
  'strapi::errors',
  'strapi::security',
  {
    name: 'strapi::cors',
    config: {
      // The default is a wildcard, which is fine while both halves are on localhost and wrong
      // once the frontend is on Vercel. Read from the environment because the Vercel URL is
      // not known until it is deployed, and preview deployments each get their own.
      origin: (process.env.FRONTEND_URLS ?? 'http://localhost:3000').split(','),
    },
  },
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];

export default config;
