# CKM - Codex Key Management

支持 CPA / sub2api / CockpitTools / EasyLLM 格式互转的本地工具。

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
