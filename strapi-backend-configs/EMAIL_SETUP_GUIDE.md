# Students Choice 邮件通知系统安装和配置指南

## 概述

这个邮件通知系统为 Students Choice 平台提供了完整的邮件通知功能，包括：

- 点赞通知
- 评论通知
- 新内容发布通知
- 邮件偏好设置管理
- 测试邮件功能

## 后端配置（Strapi）

### 1. 安装邮件提供商插件

```bash
# 在 Strapi 后端项目中运行
npm install @strapi/provider-email-sendgrid --save
```

### 2. 配置环境变量

在 Strapi 项目的 `.env` 文件中添加：

```env
# SendGrid 配置
SENDGRID_API_KEY=your_sendgrid_api_key_here
DEFAULT_FROM_EMAIL=noreply@studentschoice.blog
DEFAULT_REPLY_TO_EMAIL=support@studentschoice.blog
TEST_EMAIL_ADDRESS=admin@studentschoice.blog
```

### 3. 配置邮件插件

复制 `strapi-backend-configs/config-plugins.js` 的内容到你的 Strapi 项目的 `config/plugins.js` 文件中。

### 4. 创建邮件控制器和路由

1. 创建 `src/api/email/controllers/email.js`，复制 `strapi-backend-configs/email-controller.js` 的内容
2. 创建 `src/api/email/routes/email.js`，复制 `strapi-backend-configs/email-routes.js` 的内容

### 5. 添加生命周期钩子

为每个内容类型添加生命周期钩子：

1. `src/api/review/content-types/review/lifecycles.js` - 复制 `strapi-backend-configs/review-lifecycles.js`
2. `src/api/blog/content-types/blog/lifecycles.js` - 复制 `strapi-backend-configs/blog-lifecycles.js`
3. `src/api/qna/content-types/qna/lifecycles.js` - 复制 `strapi-backend-configs/qna-lifecycles.js`

### 6. 更新用户模型

在用户模型中添加邮件通知相关字段：

```json
{
  "emailNotifications": {
    "type": "boolean",
    "default": true
  },
  "emailPreferences": {
    "type": "json",
    "default": {
      "likes": true,
      "comments": true,
      "newPosts": true,
      "weeklyDigest": false
    }
  }
}
```

## 前端配置（React）

### 1. API 扩展

现有的 `notificationsAPI.js` 已经扩展了邮件相关的端点。

### 2. 邮件通知助手

`emailNotificationHelpers.js` 提供了发送各种邮件通知的工具函数。

### 3. 用户界面

- `EmailNotificationSettings.js` - 邮件通知偏好设置组件
- 已在 `Profile Stats.js` 中集成邮件设置按钮
- 已在 `ReviewCard.js` 中集成点赞邮件通知

## SendGrid 配置

### 1. 获取 API 密钥

1. 登录 [SendGrid 控制台](https://app.sendgrid.com/)
2. 导航到 Settings > API Keys
3. 创建新的 API 密钥，权限设置为 "Full Access"
4. 复制密钥并设置到环境变量中

### 2. 验证发件人

1. 在 SendGrid 控制台中验证你的发件人邮箱地址
2. 或设置域名验证以获得更好的投递率

### 3. 配置模板（可选）

你可以在 SendGrid 中创建邮件模板，然后在代码中引用模板 ID。

## 测试邮件功能

### 1. 后端测试

```bash
# 使用 curl 测试邮件端点
curl -X POST http://localhost:1337/api/email/test \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"testEmail": "your-test@email.com"}'
```

### 2. 前端测试

1. 登录用户账户
2. 打开个人资料页面
3. 点击"邮件设置"按钮
4. 在测试邮件部分输入邮箱地址
5. 点击"发送测试邮件"按钮

## 使用方法

### 发送点赞通知

```javascript
import { sendLikeNotificationEmail } from "../app/service/emailNotificationHelpers";

await sendLikeNotificationEmail({
  recipientUser: {
    email: "user@example.com",
    username: "Username",
    emailNotifications: true,
  },
  likerUser: currentUser,
  contentType: "review",
  contentText: "Content text...",
  contentLink: "https://studentschoice.blog/universities/123",
});
```

### 发送评论通知

```javascript
import { sendCommentNotificationEmail } from "../app/service/emailNotificationHelpers";

await sendCommentNotificationEmail({
  recipientUser: posterUser,
  commenterUser: currentUser,
  contentType: "blog",
  commentText: "Comment text...",
  contentLink: "https://studentschoice.blog/universities/123",
});
```

## 性能优化建议

### 1. 邮件发送队列

建议实现邮件发送队列，避免阻塞主要业务逻辑：

```javascript
// 在 Strapi 中使用队列处理邮件
const Bull = require("bull");
const emailQueue = new Bull("email processing");

emailQueue.process(async (job) => {
  const { emailData } = job.data;
  await strapi.plugins["email"].services.email.send(emailData);
});
```

### 2. 批量处理

对于新内容通知，可以批量处理用户列表，避免过多的数据库查询。

### 3. 缓存机制

实现用户邮件偏好的缓存机制，减少数据库查询。

## 监控和日志

### 1. 邮件发送日志

在 Strapi 中记录邮件发送状态：

```javascript
await strapi.entityService.create("api::email-log.email-log", {
  data: {
    recipient: email,
    subject: subject,
    status: "sent",
    sentAt: new Date(),
  },
});
```

### 2. 错误处理

确保邮件发送失败不影响主要业务功能，并记录错误日志。

## 安全注意事项

1. **API 密钥安全**：确保 SendGrid API 密钥安全存储，不要提交到版本控制
2. **邮件频率限制**：实现邮件发送频率限制，防止垃圾邮件
3. **用户隐私**：尊重用户的邮件通知偏好设置
4. **退订机制**：在邮件中包含退订链接

## 故障排除

### 1. 邮件发送失败

- 检查 SendGrid API 密钥是否正确
- 确认发件人邮箱已验证
- 查看 SendGrid 控制台中的活动日志

### 2. 模板渲染问题

- 检查邮件模板中的变量是否正确传递
- 确认 HTML 语法正确

### 3. 性能问题

- 实现邮件队列处理
- 优化数据库查询
- 考虑使用缓存

## 扩展功能

### 1. 邮件模板管理

可以在 Strapi 管理后台添加邮件模板管理功能。

### 2. 邮件统计

实现邮件打开率、点击率等统计功能。

### 3. 个性化推荐

基于用户行为发送个性化内容推荐邮件。

## 联系支持

如果遇到问题，请：

1. 查看 Strapi 和 SendGrid 的日志
2. 检查网络连接和防火墙设置
3. 参考 SendGrid 官方文档
4. 联系开发团队获取支持
