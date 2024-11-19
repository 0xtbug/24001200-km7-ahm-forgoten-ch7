const Sentry = require("@sentry/node");
const { nodeProfilingIntegration } = require("@sentry/profiling-node");

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  maxBreadcrumbs: 50,
  debug: false,
  integrations: [nodeProfilingIntegration()],
  tracesSampleRate: 1.0,
});

module.exports = Sentry;
