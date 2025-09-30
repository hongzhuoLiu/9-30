// Strapi Lifecycle hooks: src/api/qna/content-types/qna/lifecycles.js
"use strict";

/**
 * QnA content type lifecycle hooks
 * Automatically send email notifications when new Q&A are created
 */

module.exports = {
  async afterCreate(event) {
    const { result } = event;

    try {
      // 获取相关的用户和页面信息
      const qna = await strapi.entityService.findOne(
        "api::qna.qna",
        result.id,
        {
          populate: {
            users_permissions_user: {
              fields: ["username", "email"],
            },
            university_page: {
              fields: ["universityName", "id"],
            },
            program_page: {
              fields: ["programName", "id"],
            },
            subject_page: {
              fields: ["subjectName", "id"],
            },
          },
        }
      );

      if (!qna || !qna.users_permissions_user) {
        console.log(
          "QnA or user information incomplete, skipping email notification"
        );
        return;
      }

      let categoryName = "";
      let pageType = "";
      let pageId = "";

      // Determine the Q&A category
      if (qna.university_page) {
        categoryName = qna.university_page.universityName;
        pageType = "university";
        pageId = qna.university_page.id;
      } else if (qna.program_page) {
        categoryName = qna.program_page.programName;
        pageType = "program";
        pageId = qna.program_page.id;
      } else if (qna.subject_page) {
        categoryName = qna.subject_page.subjectName;
        pageType = "subject";
        pageId = qna.subject_page.id;
      }

      // Find users interested in this page
      const interestedUsers = await strapi.entityService.findMany(
        "plugin::users-permissions.user",
        {
          filters: {
            emailNotifications: true,
            id: { $ne: qna.users_permissions_user.id }, // Exclude the publisher
          },
          fields: ["username", "email", "emailNotifications"],
          limit: 50,
        }
      );

      // Send email notification to each interested user
      for (const user of interestedUsers) {
        if (!user.email || !user.emailNotifications) continue;

        try {
          await strapi.plugins["email"].services.email.send({
            to: user.email,
            from: strapi.config.get("plugins.email.settings.defaultFrom"),
            subject: `New question for ${categoryName}!`,
            html: `
              <h2>❓ New Question Posted!</h2>
              <p>Hello <strong>${user.username}</strong>,</p>
              <p><strong>${categoryName}</strong> has a new question:</p>
              <div style="border-left: 3px solid #6b0221; padding: 15px; margin: 15px 0; background: #f9f9f9;">
                <p><strong>Asked by:</strong> ${
                  qna.users_permissions_user.username
                }</p>
                <p><strong>Question:</strong> ${
                  qna.qnaText ? qna.qnaText.substring(0, 200) : ""
                }${qna.qnaText && qna.qnaText.length > 200 ? "..." : ""}</p>
              </div>
              <p>Maybe you can help answer this question!</p>
              <p><a href="https://studentschoice.blog/${pageType}s/${pageId}" style="color: #6b0221; text-decoration: none; background: #f0f0f0; padding: 10px 15px; border-radius: 5px; display: inline-block;">View and Answer</a></p>
              <hr style="margin: 20px 0;">
              <p style="color: #666; font-size: 12px;">
                If you no longer want to receive these emails, you can disable email notifications in your personal settings.
              </p>
            `,
          });

          console.log(`New Q&A email notification sent to user: ${user.email}`);
        } catch (emailError) {
          console.error(`Failed to send email to ${user.email}:`, emailError);
        }
      }

      console.log(
        `Email notification processing completed for Q&A ${result.id}`
      );
    } catch (error) {
      console.error("QnA afterCreate lifecycle hook error:", error);
    }
  },
};
