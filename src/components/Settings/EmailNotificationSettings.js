import React, { useState, useEffect } from "react";
import { GetAuthenticationInformation } from "../AuthenticationInforamtionAndManager/AuthenticationInformation";
import { useSendTestEmailMutation } from "../../app/service/notificationsAPI";
import { getToken } from "../AuthenticationInforamtionAndManager/AuthenticationTokens";
import { API, BEARER } from "../../API";

function EmailNotificationSettings({ onClose }) {
  const { user, setUser } = GetAuthenticationInformation();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [emailTypes, setEmailTypes] = useState({
    likes: true,
    comments: true,
    newPosts: true,
    weeklyDigest: false,
  });
  const [testEmail, setTestEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [sendTestEmail] = useSendTestEmailMutation();

  useEffect(() => {
    if (user) {
      setEmailNotifications(user.emailNotifications !== false);
      setTestEmail(user.email || "");
      // 如果用户有具体的邮件类型偏好设置，可以在这里设置
      if (user.emailPreferences) {
        setEmailTypes(user.emailPreferences);
      }
    }
  }, [user]);

  const handleSaveSettings = async () => {
    if (!user) return;

    setIsLoading(true);
    setMessage("");

    try {
      const token = getToken();
      const updatedUser = {
        ...user,
        emailNotifications,
        emailPreferences: emailTypes,
      };

      const response = await fetch(`${API}/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${BEARER} ${token}`,
        },
        body: JSON.stringify(updatedUser),
      });

      if (response.ok) {
        const updatedData = await response.json();
        setUser(updatedData);
        setMessage("邮件通知设置已保存！");
      } else {
        throw new Error("保存设置失败");
      }
    } catch (error) {
      console.error("保存邮件设置错误:", error);
      setMessage("保存设置时出错，请重试");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestEmail = async () => {
    if (!testEmail) {
      setMessage("请输入测试邮箱地址");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const result = await sendTestEmail({ testEmail });
      if (result.data?.success) {
        setMessage("测试邮件已发送！请检查你的邮箱。");
      } else {
        setMessage("发送测试邮件失败，请重试");
      }
    } catch (error) {
      console.error("发送测试邮件错误:", error);
      setMessage("发送测试邮件时出错");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailTypeChange = (type, value) => {
    setEmailTypes((prev) => ({
      ...prev,
      [type]: value,
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            邮件通知设置
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            ✕
          </button>
        </div>

        {message && (
          <div
            className={`mb-4 p-3 rounded ${
              message.includes("错误") || message.includes("失败")
                ? "bg-red-100 text-red-700 border border-red-300"
                : "bg-green-100 text-green-700 border border-green-300"
            }`}
          >
            {message}
          </div>
        )}

        <div className="space-y-4">
          {/* 总开关 */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              启用邮件通知
            </label>
            <input
              type="checkbox"
              checked={emailNotifications}
              onChange={(e) => setEmailNotifications(e.target.checked)}
              className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500"
            />
          </div>

          {emailNotifications && (
            <>
              <hr className="border-gray-200 dark:border-gray-600" />

              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  通知类型
                </h3>

                {/* 点赞通知 */}
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-600 dark:text-gray-400">
                    有人点赞我的内容
                  </label>
                  <input
                    type="checkbox"
                    checked={emailTypes.likes}
                    onChange={(e) =>
                      handleEmailTypeChange("likes", e.target.checked)
                    }
                    className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500"
                  />
                </div>

                {/* 评论通知 */}
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-600 dark:text-gray-400">
                    有人评论我的内容
                  </label>
                  <input
                    type="checkbox"
                    checked={emailTypes.comments}
                    onChange={(e) =>
                      handleEmailTypeChange("comments", e.target.checked)
                    }
                    className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500"
                  />
                </div>

                {/* 新内容通知 */}
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-600 dark:text-gray-400">
                    感兴趣的页面有新内容
                  </label>
                  <input
                    type="checkbox"
                    checked={emailTypes.newPosts}
                    onChange={(e) =>
                      handleEmailTypeChange("newPosts", e.target.checked)
                    }
                    className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500"
                  />
                </div>

                {/* 周报通知 */}
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-600 dark:text-gray-400">
                    每周内容摘要
                  </label>
                  <input
                    type="checkbox"
                    checked={emailTypes.weeklyDigest}
                    onChange={(e) =>
                      handleEmailTypeChange("weeklyDigest", e.target.checked)
                    }
                    className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500"
                  />
                </div>
              </div>
            </>
          )}

          <hr className="border-gray-200 dark:border-gray-600" />

          {/* 测试邮件 */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              测试邮件服务
            </h3>
            <input
              type="email"
              placeholder="输入测试邮箱地址"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <button
              onClick={handleTestEmail}
              disabled={isLoading}
              className="w-full px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? "发送中..." : "发送测试邮件"}
            </button>
          </div>

          <hr className="border-gray-200 dark:border-gray-600" />

          {/* 保存按钮 */}
          <div className="flex gap-3">
            <button
              onClick={handleSaveSettings}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? "保存中..." : "保存设置"}
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
            >
              取消
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmailNotificationSettings;
