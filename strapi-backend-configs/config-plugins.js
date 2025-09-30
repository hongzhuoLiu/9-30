// Strapi backend configuration file: config/plugins.js
module.exports = ({ env }) => ({
  // Other plugin configurations...

  // Email configuration
  email: {
    config: {
      provider: "sendgrid",
      providerOptions: {
        apiKey: env("SENDGRID_API_KEY"),
      },
      settings: {
        defaultFrom: env("DEFAULT_FROM_EMAIL", "noreply@studentschoice.blog"),
        defaultReplyTo: env(
          "DEFAULT_REPLY_TO_EMAIL",
          "support@studentschoice.blog"
        ),
        testAddress: env("TEST_EMAIL_ADDRESS", "admin@studentschoice.blog"),
      },
      // Email sending rate limit
      ratelimit: {
        enabled: true,
        interval: 5, // 5 minutes
        max: 10, // Maximum 10 emails per 5 minutes
        delayAfter: 3,
        timeWait: 1000,
        prefixKey: "${userEmail}",
        whitelist: [], // Whitelist IP addresses
      },
    },
  },

  // Notification configuration (if needed)
  notifications: {
    enabled: true,
  },
});
