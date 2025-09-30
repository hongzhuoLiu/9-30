// Email route configuration: src/api/email/routes/email.js
"use strict";

/**
 * Email route configuration
 */

module.exports = {
  routes: [
    {
      method: "POST",
      path: "/email/send-notification",
      handler: "email.sendNotificationEmail",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "POST",
      path: "/email/test",
      handler: "email.sendTestEmail",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
