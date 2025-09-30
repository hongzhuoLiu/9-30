# Students Choice 邮件通知系统 - 简单说明

## 这个邮件系统是干什么的？

简单说，就是让你的网站能给用户发邮件！比如：

- 有人点赞了你的评价 → 自动发邮件通知你
- 有人评论了你的帖子 → 自动发邮件通知你
- 你关注的大学有新评价 → 自动发邮件通知你
- 测试邮件功能是否正常

就像微信、微博那样的通知，但是通过邮件发送。

## 我写了哪些文件？

### 📁 后端文件（需要放到 Strapi 后端项目里）

#### 1. `config-plugins.js` - 邮件服务的总开关

**作用**：告诉 Strapi "我要用 SendGrid 发邮件"
**大白话**：就像给你的网站装了个邮局

#### 2. `email-controller.js` - 邮件发送的大脑

**作用**：

- 收到"发邮件"的指令后，真正去发邮件
- 支持不同类型的邮件（点赞通知、评论通知等）
- 有漂亮的邮件模板
  **大白话**：就像邮局的工作人员，知道怎么写信、怎么发信

#### 3. `email-routes.js` - 邮件功能的入口

**作用**：定义网址路径，比如 `/api/email/send-notification`
**大白话**：就像邮局的门牌号，告诉别人在哪里可以寄信

#### 4. `review-lifecycles.js` / `blog-lifecycles.js` / `qna-lifecycles.js` - 自动发邮件的机器人

**作用**：

- 有人发新评价 → 自动通知关注的用户
- 有人发新博客 → 自动通知关注的用户
- 有人问新问题 → 自动通知关注的用户
  **大白话**：就像设了个闹钟，一有新内容就自动提醒相关的人

#### 5. `env-example` - 密码和配置的样本

**作用**：告诉你需要设置哪些密码和配置
**大白话**：就像一个表格，告诉你需要填什么信息

### 📁 前端文件（已经改好了你现有的代码）

#### 1. `notificationsAPI.js` - 加了邮件功能

**原来**：只能创建应用内通知
**现在**：还能发邮件通知
**大白话**：给你的通知系统加了"发邮件"的按钮

#### 2. `emailNotificationHelpers.js` - 邮件发送的小助手

**作用**：

- 提供简单的函数来发各种邮件
- 不用每次都写复杂的代码
  **大白话**：就像有个秘书，你说"给张三发个点赞邮件"，它就知道怎么做

#### 3. `EmailNotificationSettings.js` - 用户的邮件设置页面

**作用**：

- 用户可以选择要不要收邮件
- 可以选择收哪种邮件（点赞、评论等）
- 可以测试邮件功能
  **大白话**：就像微信的"消息通知设置"，用户可以自己调整

#### 4. `ReviewCard.js` - 在点赞功能里加了邮件通知

**原来**：点赞只更新数据库
**现在**：点赞还会发邮件给被点赞的人
**大白话**：以前点赞是"悄悄的"，现在点赞会"告诉"对方

## 你需要做什么？

### 🔧 第一步：后端配置（必须做）

#### 1. 复制文件到 Strapi 项目

```bash
# 把这些文件复制到你的 Strapi 后端项目里：
# config-plugins.js → config/plugins.js
# email-controller.js → src/api/email/controllers/email.js
# email-routes.js → src/api/email/routes/email.js
# review-lifecycles.js → src/api/review/content-types/review/lifecycles.js
# blog-lifecycles.js → src/api/blog/content-types/blog/lifecycles.js
# qna-lifecycles.js → src/api/qna/content-types/qna/lifecycles.js
```

#### 2. 安装 SendGrid 插件

```bash
# 在你的 Strapi 项目里运行：
cd your-strapi-project
npm install @strapi/provider-email-sendgrid --save
```

#### 3. 获取 SendGrid API 密钥

1. 去 [SendGrid 网站](https://sendgrid.com) 注册账号（免费的）
2. 创建一个 API 密钥
3. 把密钥复制下来

#### 4. 设置环境变量

在你的 Strapi 项目的 `.env` 文件里添加：

```env
SENDGRID_API_KEY=你的SendGrid密钥
DEFAULT_FROM_EMAIL=noreply@studentschoice.blog
DEFAULT_REPLY_TO_EMAIL=support@studentschoice.blog
TEST_EMAIL_ADDRESS=你的测试邮箱@gmail.com
```

#### 5. 重启 Strapi

```bash
# 重启你的 Strapi 后端
npm run develop
```

### 🎨 第二步：前端配置（已经帮你改好了）

前端的代码我已经改好了，但你需要：

#### 1. 确保 Redux store 包含了新的 API

检查你的 `src/app/store.js` 文件，确保包含了 `notificationsAPI`

#### 2. 测试前端功能

- 登录你的网站
- 进入个人资料页面
- 应该能看到"邮件设置"按钮

### 🧪 第三步：测试功能

#### 1. 测试邮件发送

1. 登录网站
2. 点击个人资料 → 邮件设置
3. 输入你的邮箱
4. 点击"发送测试邮件"
5. 检查邮箱是否收到邮件

#### 2. 测试点赞通知

1. 用两个不同的账号
2. 一个账号发评价/博客/问题
3. 另一个账号点赞
4. 检查发帖人是否收到邮件

## 常见问题

### Q: 我不想用 SendGrid，可以用别的吗？

**A**: 可以！Strapi 支持很多邮件服务商：

- Gmail SMTP
- Amazon SES
- Mailgun
- 阿里云邮件推送
- 腾讯云邮件推送

只需要改 `config/plugins.js` 里的配置就行。

### Q: 邮件发不出去怎么办？

**A**: 检查这些：

1. SendGrid API 密钥是否正确
2. 发件人邮箱是否在 SendGrid 里验证过
3. 查看 Strapi 的控制台日志
4. 检查 SendGrid 控制台的活动日志

### Q: 会不会发太多邮件骚扰用户？

**A**: 不会！我加了很多保护：

1. 用户可以关闭邮件通知
2. 用户可以选择只接收某些类型的邮件
3. 有发送频率限制
4. 不会给自己发邮件（比如点赞自己的帖子）

### Q: 邮件长什么样？

**A**: 很漂亮！包含：

- 清晰的标题
- 内容预览
- 一键访问链接
- 退订说明
- Students Choice 的品牌色彩

## 成本说明

### SendGrid 免费额度

- 每天 100 封邮件（免费）
- 每月 3000+ 封邮件（免费）
- 对于新网站来说完全够用

### 付费计划

- 如果用户很多，可以升级付费计划
- 大概 $15/月 可以发 50,000 封邮件

## 下一步可以做什么？

1. **个性化邮件**：根据用户兴趣发送个性化内容
2. **邮件统计**：看邮件打开率、点击率
3. **定时邮件**：每周发送热门内容摘要
4. **邮件模板管理**：在后台可视化编辑邮件模板

## 总结

现在的状态：

- ✅ 代码写好了
- ❌ 需要你配置 SendGrid
- ❌ 需要你复制文件到 Strapi 项目
- ❌ 需要你测试功能

**预估时间**：如果你熟悉 Strapi，大概 30 分钟就能配置好。如果是第一次，可能需要 1-2 小时。

**是否可以直接用**：不行，需要你先做上面的配置步骤。但是配置完成后就可以立即使用了！
