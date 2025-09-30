import { createApi } from "@reduxjs/toolkit/query/react";
import { customBaseQuery } from "./shared/apiBaseQuery";

export const notificationsAPI = createApi({
  reducerPath: "notificationsAPI",
  baseQuery: customBaseQuery,

  endpoints: (builder) => ({
    getNotifications: builder.query({
      query: (userId) =>
        `/notifications?filters[toUser][id][$eq]=${userId}&sort=createdAt:desc&populate=*`,
    }),
    createNotification: builder.mutation({
      query: (notificationData) => ({
        url: "/notifications",
        method: "POST",
        body: { data: notificationData },
      }),
    }),
    markNotificationRead: builder.mutation({
      query: ({ id }) => ({
        url: `/notifications/${id}`,
        method: "PUT",
        body: { data: { isRead: true } },
      }),
    }),
    // 新增邮件通知功能
    sendNotificationEmail: builder.mutation({
      query: (emailData) => ({
        url: "/email/send-notification",
        method: "POST",
        body: emailData,
      }),
    }),
    sendTestEmail: builder.mutation({
      query: (testData) => ({
        url: "/email/test",
        method: "POST",
        body: testData,
      }),
    }),
    // 批量操作
    markAllNotificationsRead: builder.mutation({
      query: (userId) => ({
        url: `/notifications/mark-all-read`,
        method: "PUT",
        body: { userId },
      }),
    }),
    deleteNotification: builder.mutation({
      query: ({ id }) => ({
        url: `/notifications/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useCreateNotificationMutation,
  useMarkNotificationReadMutation,
  useSendNotificationEmailMutation,
  useSendTestEmailMutation,
  useMarkAllNotificationsReadMutation,
  useDeleteNotificationMutation,
} = notificationsAPI;
