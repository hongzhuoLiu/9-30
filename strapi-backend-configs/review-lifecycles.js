// Strapi Lifecycle hooks: src/api/review/content-types/review/lifecycles.js
"use strict";

/**
 * Review content type lifecycle hooks
 * Automatically send email notifications when new reviews are created
 */

module.exports = {
  async afterCreate(event) {
    const { result } = event;

    try {
      // 获取相关的用户和页面信息
      const review = await strapi.entityService.findOne(
        "api::review.review",
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

      if (!review || !review.users_permissions_user) {
        console.log(
          "Review or user information incomplete, skipping email notification"
        );
        return;
      }

      let categoryName = "";
      let pageType = "";
      let pageId = "";

      // Determine the review category
      if (review.university_page) {
        categoryName = review.university_page.universityName;
        pageType = "university";
        pageId = review.university_page.id;
      } else if (review.program_page) {
        categoryName = review.program_page.programName;
        pageType = "program";
        pageId = review.program_page.id;
      } else if (review.subject_page) {
        categoryName = review.subject_page.subjectName;
        pageType = "subject";
        pageId = review.subject_page.id;
      }

      // Find users interested in this page (adjust according to your business logic)
      // For example: users following this university/program/course
      const interestedUsers = await strapi.entityService.findMany(
        "plugin::users-permissions.user",
        {
          filters: {
            // Add filter conditions here, such as universities the user follows
            // Currently sending to all users with email notifications enabled
            emailNotifications: true,
            id: { $ne: review.users_permissions_user.id }, // Exclude the publisher
          },
          fields: ["username", "email", "emailNotifications"],
          limit: 50, // Limit to maximum 50 users per notification
        }
      );

      // Send email notification to each interested user
      for (const user of interestedUsers) {
        if (!user.email || !user.emailNotifications) continue;

        try {
          await strapi.plugins["email"].services.email.send({
            to: user.email,
            from: strapi.config.get("plugins.email.settings.defaultFrom"),
            subject: `New review for ${categoryName}!`,
            html: `
              <h2>📝 New Review Published!</h2>
              <p>Hello <strong>${user.username}</strong>,</p>
              <p><strong>${categoryName}</strong> has a new review:</p>
              <div style="border-left: 3px solid #6b0221; padding: 15px; margin: 15px 0; background: #f9f9f9;">
                <p><strong>Rating:</strong> ${
                  review.reviewRating || "N/A"
                }/5.0 ⭐</p>
                <p><strong>Author:</strong> ${
                  review.users_permissions_user.username
                }</p>
                <p><strong>Content:</strong> ${
                  review.reviewText ? review.reviewText.substring(0, 200) : ""
                }${
              review.reviewText && review.reviewText.length > 200 ? "..." : ""
            }</p>
              </div>
              <p><a href="https://studentschoice.blog/${pageType}s/${pageId}" style="color: #6b0221; text-decoration: none; background: #f0f0f0; padding: 10px 15px; border-radius: 5px; display: inline-block;">View Now</a></p>
              <hr style="margin: 20px 0;">
              <p style="color: #666; font-size: 12px;">
                If you no longer want to receive these emails, you can disable email notifications in your personal settings.
              </p>
            `,
          });

          console.log(
            `New review email notification sent to user: ${user.email}`
          );
        } catch (emailError) {
          console.error(`Failed to send email to ${user.email}:`, emailError);
          // Continue processing other users, don't interrupt due to one email failure
        }
      }

      console.log(
        `Email notification processing completed for review ${result.id}`
      );
    } catch (error) {
      console.error("Review afterCreate lifecycle hook error:", error);
      // Errors in lifecycle hooks should not affect the main creation operation
    }
  },

  async afterUpdate(event) {
    // Handle post-review update logic if needed
    // For example, notify the author when a review gets many likes
    const { result } = event;

    try {
      // Check for significant like growth (adjust according to business needs)
      if (result.reviewLikes && result.reviewLikes.length >= 10) {
        const review = await strapi.entityService.findOne(
          "api::review.review",
          result.id,
          {
            populate: {
              users_permissions_user: {
                fields: ["username", "email", "emailNotifications"],
              },
            },
          }
        );

        if (
          review?.users_permissions_user?.email &&
          review.users_permissions_user.emailNotifications
        ) {
          await strapi.plugins["email"].services.email.send({
            to: review.users_permissions_user.email,
            from: strapi.config.get("plugins.email.settings.defaultFrom"),
            subject: "🎉 Your review is popular!",
            html: `
              <h2>🎉 Congratulations! Your review is popular!</h2>
              <p>Hello <strong>${
                review.users_permissions_user.username
              }</strong>,</p>
              <p>Your review has received <strong>${
                result.reviewLikes.length
              }</strong> likes!</p>
              <blockquote style="border-left: 3px solid #6b0221; padding: 10px; margin: 10px 0; background: #f9f9f9;">
                ${
                  review.reviewText ? review.reviewText.substring(0, 200) : ""
                }${
              review.reviewText && review.reviewText.length > 200 ? "..." : ""
            }
              </blockquote>
              <p>Keep sharing your experience and help more students make informed choices!</p>
            `,
          });
        }
      }
    } catch (error) {
      console.error("Review afterUpdate lifecycle hook error:", error);
    }
  },
};
