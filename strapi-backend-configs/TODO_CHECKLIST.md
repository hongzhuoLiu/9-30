# 📋 Students Choice 邮件通知系统 - 配置清单

## ✅ 已完成

- [x] 邮件系统代码编写完成
- [x] 前端组件集成完成
- [x] 文档编写完成

## 🔧 你需要做的事情

### 第一部分：获取 SendGrid 账号（15 分钟）

#### 1. 注册 SendGrid 账号

- [ ] 访问 https://sendgrid.com
- [ ] 点击 "Start for Free" 注册免费账号
- [ ] 验证邮箱地址

#### 2. 创建 API 密钥

- [ ] 登录 SendGrid 控制台
- [ ] 导航到 Settings → API Keys
- [ ] 点击 "Create API Key"
- [ ] 选择 "Full Access"
- [ ] 复制生成的 API 密钥（只显示一次！）

#### 3. 验证发件人邮箱

- [ ] 在 SendGrid 控制台，去 Settings → Sender Authentication
- [ ] 添加并验证你的发件人邮箱（比如 noreply@studentschoice.blog）

### 第二部分：配置 Strapi 后端（20 分钟）

#### 1. 安装邮件插件

```bash
# 在你的 Strapi 后端项目目录运行：
cd /path/to/your/strapi/project
npm install @strapi/provider-email-sendgrid --save
```

- [ ] 运行上面的安装命令

#### 2. 复制配置文件

需要把我写的文件复制到你的 Strapi 项目里：

**复制这个文件：** `strapi-backend-configs/config-plugins.js`
**到这个位置：** `你的Strapi项目/config/plugins.js`

- [ ] 复制 plugins.js 配置文件

**创建邮件 API 目录和文件：**

```bash
# 在你的 Strapi 项目里创建这些目录：
mkdir -p src/api/email/controllers
mkdir -p src/api/email/routes
```

- [ ] 创建目录结构

**复制这个文件：** `strapi-backend-configs/email-controller.js`
**到这个位置：** `你的Strapi项目/src/api/email/controllers/email.js`

- [ ] 复制邮件控制器

**复制这个文件：** `strapi-backend-configs/email-routes.js`
**到这个位置：** `你的Strapi项目/src/api/email/routes/email.js`

- [ ] 复制邮件路由

#### 3. 添加生命周期钩子

**复制这个文件：** `strapi-backend-configs/review-lifecycles.js`
**到这个位置：** `你的Strapi项目/src/api/review/content-types/review/lifecycles.js`

- [ ] 复制 review 生命周期钩子

**复制这个文件：** `strapi-backend-configs/blog-lifecycles.js`
**到这个位置：** `你的Strapi项目/src/api/blog/content-types/blog/lifecycles.js`

- [ ] 复制 blog 生命周期钩子

**复制这个文件：** `strapi-backend-configs/qna-lifecycles.js`
**到这个位置：** `你的Strapi项目/src/api/qna/content-types/qna/lifecycles.js`

- [ ] 复制 qna 生命周期钩子

#### 4. 设置环境变量

在你的 Strapi 项目的 `.env` 文件里添加这几行：

```env
SENDGRID_API_KEY=你从SendGrid复制的API密钥
DEFAULT_FROM_EMAIL=noreply@studentschoice.blog
DEFAULT_REPLY_TO_EMAIL=support@studentschoice.blog
TEST_EMAIL_ADDRESS=你的测试邮箱@example.com
```

- [ ] 添加环境变量到 .env 文件

#### 5. 重启 Strapi

```bash
# 在你的 Strapi 项目目录运行：
npm run develop
# 或者如果你用 yarn：
yarn develop
```

- [ ] 重启 Strapi 服务

### 第三部分：测试功能（10 分钟）

#### 1. 测试基本邮件发送

- [ ] 用 Postman 或 curl 测试邮件 API：

```bash
curl -X POST http://localhost:1337/api/email/test \
  -H "Content-Type: application/json" \
  -d '{"testEmail": "你的邮箱@example.com"}'
```

#### 2. 测试前端邮件设置

- [ ] 打开你的网站
- [ ] 登录用户账号
- [ ] 进入个人资料页面
- [ ] 点击"邮件设置"按钮
- [ ] 发送测试邮件
- [ ] 检查邮箱是否收到邮件

#### 3. 测试点赞邮件通知

- [ ] 用两个不同的用户账号
- [ ] 一个用户发布评价/博客/问答
- [ ] 另一个用户点赞这个内容
- [ ] 检查发布者是否收到邮件通知

### 第四部分：用户模型更新（可选，10 分钟）

如果你想让用户能完全控制邮件设置，需要在 Strapi 的用户模型里添加字段：

- [ ] 在 Strapi 管理后台，进入 Content-Type Builder
- [ ] 选择 User (from users-permissions)
- [ ] 添加字段：
  - `emailNotifications` (Boolean, 默认值: true)
  - `emailPreferences` (JSON, 默认值: {"likes":true,"comments":true,"newPosts":true,"weeklyDigest":false})

## 🚨 注意事项

### 重要提醒：

1. **API 密钥安全**：SendGrid API 密钥要保密，不要提交到 Git
2. **邮箱验证**：必须在 SendGrid 里验证发件人邮箱
3. **测试环境**：先在开发环境测试，确认没问题再部署到生产环境

### 如果遇到问题：

1. **邮件发不出去**：检查 Strapi 控制台日志
2. **API 密钥错误**：重新检查 .env 文件
3. **路由不存在**：确认文件复制到了正确位置
4. **权限问题**：确认 Strapi 有读写文件权限

## 📞 需要帮助？

如果你在配置过程中遇到问题：

1. **查看错误日志**：Strapi 控制台会显示详细错误信息
2. **检查文件位置**：确认所有文件都复制到了正确的位置
3. **验证 SendGrid 设置**：在 SendGrid 控制台查看活动日志
4. **测试网络连接**：确认服务器能连接到 SendGrid

## ⏰ 预估完成时间

- **有经验的开发者**：30-45 分钟
- **第一次配置**：1-2 小时
- **包含测试**：额外 15-30 分钟

完成这个清单后，你的邮件通知系统就完全可以使用了！🎉
