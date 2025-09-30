// Email notification helper functions
import { store } from "../store";
import { notificationsAPI } from "../service/notificationsAPI";

/**
 * Email notification types
 */
export const EMAIL_NOTIFICATION_TYPES = {
  NEW_LIKE: "new_like",
  NEW_COMMENT: "new_comment",
  NEW_POST: "new_post",
  WEEKLY_DIGEST: "weekly_digest",
};

/**
 * Content type mapping
 */
export const CONTENT_TYPE_MAPPING = {
  review: "review",
  blog: "blog",
  qna: "Q&A",
};

/**
 * Send notification email - generic function
 * @param {Object} params - Email parameters
 * @param {string} params.recipientEmail - Recipient email
 * @param {string} params.recipientName - Recipient name
 * @param {string} params.notificationType - Notification type
 * @param {Object} params.notificationData - Notification data
 * @param {boolean} params.emailPreferences - Whether email notifications are enabled
 */
export const sendNotificationEmail = async ({
  recipientEmail,
  recipientName,
  notificationType,
  notificationData,
  emailPreferences = true,
}) => {
  try {
    if (!emailPreferences) {
      console.log("User has disabled email notifications");
      return {
        success: true,
        message: "User has disabled email notifications",
      };
    }

    const result = await store.dispatch(
      notificationsAPI.endpoints.sendNotificationEmail.initiate({
        recipientEmail,
        recipientName,
        notificationType,
        notificationData,
        emailPreferences,
      })
    );

    return result.data;
  } catch (error) {
    console.error("Failed to send email notification:", error);
    throw error;
  }
};

/**
 * Send like notification email
 */
export const sendLikeNotificationEmail = async ({
  recipientUser,
  likerUser,
  contentType,
  contentText,
  contentLink,
}) => {
  return sendNotificationEmail({
    recipientEmail: recipientUser.email,
    recipientName: recipientUser.username,
    notificationType: EMAIL_NOTIFICATION_TYPES.NEW_LIKE,
    notificationData: {
      likerName: likerUser.username,
      contentType: CONTENT_TYPE_MAPPING[contentType] || contentType,
      contentText:
        contentText.substring(0, 100) + (contentText.length > 100 ? "..." : ""),
      contentLink,
    },
    emailPreferences: recipientUser.emailNotifications !== false,
  });
};

/**
 * Send comment notification email
 */
export const sendCommentNotificationEmail = async ({
  recipientUser,
  commenterUser,
  contentType,
  commentText,
  contentLink,
}) => {
  return sendNotificationEmail({
    recipientEmail: recipientUser.email,
    recipientName: recipientUser.username,
    notificationType: EMAIL_NOTIFICATION_TYPES.NEW_COMMENT,
    notificationData: {
      commenterName: commenterUser.username,
      contentType: CONTENT_TYPE_MAPPING[contentType] || contentType,
      commentText:
        commentText.substring(0, 200) + (commentText.length > 200 ? "..." : ""),
      contentLink,
    },
    emailPreferences: recipientUser.emailNotifications !== false,
  });
};

/**
 * Send new content notification email
 */
export const sendNewPostNotificationEmail = async ({
  recipientUser,
  authorUser,
  contentType,
  contentTitle,
  contentLink,
  subscribersList,
}) => {
  // Skip if user has disabled email notifications
  if (recipientUser.emailNotifications === false) {
    return {
      success: true,
      skipped: true,
      reason: "Email notifications disabled",
    };
  }

  return sendNotificationEmail({
    recipientEmail: recipientUser.email,
    recipientName: recipientUser.username,
    notificationType: EMAIL_NOTIFICATION_TYPES.NEW_POST,
    notificationData: {
      authorName: authorUser.username,
      contentType: CONTENT_TYPE_MAPPING[contentType] || contentType,
      contentTitle,
      contentLink,
      subscriberCount: subscribersList?.length || 0,
    },
    emailPreferences: true, // Already checked above
  });
};

/**
 * Send test email
 */
export const sendTestEmail = async (testEmail) => {
  try {
    const result = await store.dispatch(
      notificationsAPI.endpoints.sendTestEmail.initiate({
        testEmail,
      })
    );

    return result.data;
  } catch (error) {
    console.error("Failed to send test email:", error);
    throw error;
  }
};

/**
 * Generate content link
 */
export const generateContentLink = (
  contentType,
  contentId,
  pageType,
  pageId
) => {
  const baseUrl = window.location.origin;

  switch (pageType) {
    case "university":
      return `${baseUrl}/universities/${pageId}`;
    case "program":
      return `${baseUrl}/programs/${pageId}`;
    case "subject":
      return `${baseUrl}/subjects/${pageId}`;
    default:
      return `${baseUrl}/`;
  }
};

/**
 * Combined function to create notification and send email
 */
export const createNotificationAndSendEmail = async ({
  notificationData,
  emailData,
}) => {
  try {
    // Create in-app notification
    const notificationResult = await store.dispatch(
      notificationsAPI.endpoints.createNotification.initiate(notificationData)
    );

    // Send email notification
    const emailResult = await sendNotificationEmail(emailData);

    return {
      notification: notificationResult.data,
      email: emailResult,
    };
  } catch (error) {
    console.error("Failed to create notification and send email:", error);
    throw error;
  }
};
