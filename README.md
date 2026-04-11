# CKM - Codex Key Management

CKM（Codex Key Management）是一款免费开源的 OpenAI Codex Token 格式转换工具，专为开发者和 AI 工程师设计。它支持多种主流 token 格式之间的互转，包括 [CPA](https://github.com/router-for-me/CLIProxyAPI)、[sub2api](https://github.com/Wei-Shaw/sub2api)、[CockpitTools](https://github.com/jlcodes99/cockpit-tools) 和 [EasyLLM](https://github.com/libaxuan/EasyLLM)。

## 在线演示

- 🌐 [https://7402cd8c.ckm-156.pages.dev](https://7402cd8c.ckm-156.pages.dev)
- 🌐 [http://easyai.ccwu.cc/](http://easyai.ccwu.cc/)

## 部署到 Cloudflare Pages

### 方式一：通过 Dashboard（推荐）

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Workers & Pages** → **Create application** → **Pages**
3. 选择 **Connect to Git**（连接你的 GitHub/GitLab 仓库）或直接 **Upload assets**
4. 构建设置保持默认（无需构建）
5. 点击 **Save and Deploy**

### 方式二：通过 Wrangler CLI

```bash
# 安装 Wrangler
npm install -g wrangler

# 登录
wrangler login

# 部署
wrangler pages deploy . --project-name=ckm
```

### 方式三：通过 Git 直连

1. 将项目推送到 GitHub/GitLab
2. 在 Cloudflare Pages 中连接仓库
3. 设置：
   - **Build command**: 留空
   - **Build output directory**: `/`
4. 每次推送自动部署

## 本地运行

```bash
python -m http.server 8000
```

或使用任意静态服务器。

## 功能

- ✅ CPA ↔ sub2api ↔ CockpitTools ↔ EasyLLM 互转
- ✅ 拖拽上传
- ✅ 批量转换
- ✅ 数据仅在浏览器本地处理，不上传服务器
