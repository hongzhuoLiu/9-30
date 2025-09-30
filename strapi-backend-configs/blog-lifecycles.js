// Strapi Lifecycle hooks: src/api/blog/content-types/blog/lifecycles.js
"use strict";

/**
 * Blog content type lifecycle hooks
 * Automatically send email notifications when new blogs are created
 */

module.exports = {
  async afterCreate(event) {
    const { result } = event;

    try {
      // 获取相关的用户和页面信息
      const blog = await strapi.entityService.findOne(
        "api::blog.blog",
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

      if (!blog || !blog.users_permissions_user) {
        console.log(
          "Blog or user information incomplete, skipping email notification"
        );
        return;
      }

      let categoryName = "";
      let pageType = "";
      let pageId = "";

      // Determine the blog category
      if (blog.university_page) {
        categoryName = blog.university_page.universityName;
        pageType = "university";
        pageId = blog.university_page.id;
      } else if (blog.program_page) {
        categoryName = blog.program_page.programName;
        pageType = "program";
        pageId = blog.program_page.id;
      } else if (blog.subject_page) {
        categoryName = blog.subject_page.subjectName;
        pageType = "subject";
        pageId = blog.subject_page.id;
      }

      // Find users interested in this page
      const interestedUsers = await strapi.entityService.findMany(
        "plugin::users-permissions.user",
        {
          filters: {
            emailNotifications: true,
            id: { $ne: blog.users_permissions_user.id }, // Exclude the publisher
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
            subject: `New blog post for ${categoryName}!`,
            html: `
              <h2>📖 New Blog Post Published!</h2>
              <p>Hello <strong>${user.username}</strong>,</p>
              <p><strong>${categoryName}</strong> has a new blog post:</p>
              <div style="border-left: 3px solid #6b0221; padding: 15px; margin: 15px 0; background: #f9f9f9;">
                <p><strong>Author:</strong> ${
                  blog.users_permissions_user.username
                }</p>
                <p><strong>Content:</strong> ${
                  blog.blogText ? blog.blogText.substring(0, 200) : ""
                }${blog.blogText && blog.blogText.length > 200 ? "..." : ""}</p>
              </div>
              <p><a href="https://studentschoice.blog/${pageType}s/${pageId}" style="color: #6b0221; text-decoration: none; background: #f0f0f0; padding: 10px 15px; border-radius: 5px; display: inline-block;">Read Now</a></p>
              <hr style="margin: 20px 0;">
              <p style="color: #666; font-size: 12px;">
                If you no longer want to receive these emails, you can disable email notifications in your personal settings.
              </p>
            `,
          });

          console.log(
            `New blog email notification sent to user: ${user.email}`
          );
        } catch (emailError) {
          console.error(`Failed to send email to ${user.email}:`, emailError);
        }
      }

      console.log(
        `Email notification processing completed for blog ${result.id}`
      );
    } catch (error) {
      console.error("Blog afterCreate lifecycle hook error:", error);
    }
  },
};
