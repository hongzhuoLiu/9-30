// Installation command (run in Strapi backend project)
/*
npm install @strapi/provider-email-sendgrid --save
*/

// Email service API: src/api/email/controllers/email.js
"use strict";

/**
 * Email controller
 */

module.exports = {
  /**
   * Send notification email
   */
  async sendNotificationEmail(ctx) {
    try {
      const {
        recipientEmail,
        recipientName,
        notificationType,
        notificationData,
        emailPreferences = true,
      } = ctx.request.body;

      // Check if user has enabled email notifications
      if (!emailPreferences) {
        return ctx.send({
          success: true,
          message: "User has disabled email notifications",
        });
      }

      let emailTemplate;
      let subject;

      // Select email template based on notification type
      switch (notificationType) {
        case "new_like":
          subject = "Someone liked your content!";
          emailTemplate = {
            subject: subject,
            text: `Hi ${recipientName}, ${notificationData.likerName} liked your ${notificationData.contentType}.`,
            html: `
              <h2>🎉 Someone liked your content!</h2>
              <p>Hi <strong>${recipientName}</strong>,</p>
              <p><strong>${notificationData.likerName}</strong> liked your ${notificationData.contentType}:</p>
              <blockquote style="border-left: 3px solid #6b0221; padding: 10px; margin: 10px 0; background: #f9f9f9;">
                ${notificationData.contentText}
              </blockquote>
              <p><a href="${notificationData.contentLink}" style="color: #6b0221; text-decoration: none;">View details</a></p>
              <hr style="margin: 20px 0;">
              <p style="color: #666; font-size: 12px;">
                If you don't want to receive these emails, you can disable email notifications in your personal settings.
              </p>
            `,
          };
          break;

        case "new_comment":
          subject = "Someone commented on your content!";
          emailTemplate = {
            subject: subject,
            text: `Hi ${recipientName}, ${notificationData.commenterName} commented on your ${notificationData.contentType}.`,
            html: `
              <h2>💬 Someone commented on your content!</h2>
              <p>Hi <strong>${recipientName}</strong>,</p>
              <p><strong>${notificationData.commenterName}</strong> commented on your ${notificationData.contentType}:</p>
              <blockquote style="border-left: 3px solid #6b0221; padding: 10px; margin: 10px 0; background: #f9f9f9;">
                ${notificationData.commentText}
              </blockquote>
              <p><a href="${notificationData.contentLink}" style="color: #6b0221; text-decoration: none;">View and reply</a></p>
              <hr style="margin: 20px 0;">
              <p style="color: #666; font-size: 12px;">
                If you don't want to receive these emails, you can disable email notifications in your personal settings.
              </p>
            `,
          };
          break;

        case "new_post":
          subject = `New ${notificationData.postType} in ${notificationData.categoryName}!`;
          emailTemplate = {
            subject: subject,
            text: `Hi ${recipientName}, there's a new ${notificationData.postType} in ${notificationData.categoryName}.`,
            html: `
              <h2>📝 New content published!</h2>
              <p>Hi <strong>${recipientName}</strong>,</p>
              <p>There's a new ${notificationData.postType} in <strong>${
              notificationData.categoryName
            }</strong>:</p>
              <h3>${notificationData.postTitle || "New content"}</h3>
              <p>Author: <strong>${notificationData.authorName}</strong></p>
              <blockquote style="border-left: 3px solid #6b0221; padding: 10px; margin: 10px 0; background: #f9f9f9;">
                ${notificationData.postPreview}
              </blockquote>
              <p><a href="${
                notificationData.postLink
              }" style="color: #6b0221; text-decoration: none;">View now</a></p>
              <hr style="margin: 20px 0;">
              <p style="color: #666; font-size: 12px;">
                If you don't want to receive these emails, you can disable email notifications in your personal settings.
              </p>
            `,
          };
          break;

        case "weekly_digest":
          subject = "Weekly content digest";
          emailTemplate = {
            subject: subject,
            text: `Hi ${recipientName}, here's your weekly content digest.`,
            html: `
              <h2>📊 Weekly content digest</h2>
              <p>Hi <strong>${recipientName}</strong>,</p>
              <p>Here are this week's most popular contents:</p>
              ${notificationData.digestContent || ""}
              <p><a href="${
                notificationData.websiteLink
              }" style="color: #6b0221; text-decoration: none;">Visit website for more</a></p>
              <hr style="margin: 20px 0;">
              <p style="color: #666; font-size: 12px;">
                If you don't want to receive weekly digest emails, you can disable email notifications in your personal settings.
              </p>
            `,
          };
          break;

        default:
          subject = "You have a new notification";
          emailTemplate = {
            subject: subject,
            text: `Hi ${recipientName}, you have a new notification.`,
            html: `
              <h2>🔔 New notification</h2>
              <p>Hi <strong>${recipientName}</strong>,</p>
              <p>You have a new notification, please log in to view details.</p>
              <p><a href="${
                notificationData.websiteLink || "https://studentschoice.blog"
              }" style="color: #6b0221; text-decoration: none;">View now</a></p>
            `,
          };
      }

      // Send email
      await strapi.plugins["email"].services.email.send({
        to: recipientEmail,
        from: strapi.config.get("plugins.email.settings.defaultFrom"),
        subject: emailTemplate.subject,
        text: emailTemplate.text,
        html: emailTemplate.html,
      });

      ctx.send({
        success: true,
        message: "Email sent successfully",
        data: {
          recipient: recipientEmail,
          subject: emailTemplate.subject,
          type: notificationType,
        },
      });
    } catch (error) {
      console.error("Email sending failed:", error);
      ctx.throw(500, "Email sending failed: " + error.message);
    }
  },

  /**
   * Send test email
   */
  async sendTestEmail(ctx) {
    try {
      const { testEmail } = ctx.request.body;

      await strapi.plugins["email"].services.email.send({
        to:
          testEmail || strapi.config.get("plugins.email.settings.testAddress"),
        from: strapi.config.get("plugins.email.settings.defaultFrom"),
        subject: "Students Choice - Email Service Test",
        text: "This is a test email. If you received this email, it means the email service is configured correctly!",
        html: `
          <h2>🎉 Email service test successful!</h2>
          <p>If you received this email, it means Students Choice email service is configured correctly!</p>
          <p>You can now receive notification emails normally.</p>
        `,
      });

      ctx.send({
        success: true,
        message: "Test email sent successfully",
      });
    } catch (error) {
      console.error("Test email sending failed:", error);
      ctx.throw(500, "Test email sending failed: " + error.message);
    }
  },
};
