# GitHub Pages 自动部署配置 ✅

本项目已完成 GitHub Actions 工作流配置，可以自动将 Next.js 应用程序部署到 GitHub Pages。

## ✅ 配置完成状态

-   ✅ GitHub Actions 工作流 (`.github/workflows/deploy.yml`)
-   ✅ Next.js 静态导出配置 (`next.config.js`)
-   ✅ 动态路由静态参数生成 (`generateStaticParams`)
-   ✅ GitHub Pages 兼容性配置 (`.nojekyll`)
-   ✅ 构建测试通过，静态文件已生成

## 部署配置说明

### 1. GitHub Actions 工作流

工作流文件位于 `.github/workflows/deploy.yml`，包含以下功能：

-   **触发条件**: 推送到 `main` 分支时自动触发
-   **构建环境**: Ubuntu latest + Node.js 18
-   **缓存优化**: 缓存 Node.js 依赖和 Next.js 构建结果
-   **静态生成**: 使用 `next build` 生成静态文件到 `out` 目录
-   **自动部署**: 将构建产物部署到 GitHub Pages

### 2. Next.js 配置修改

`next.config.js` 已配置为支持静态导出：

```javascript
const nextConfig = {
    output: 'export', // 启用静态导出
    trailingSlash: true, // URL 末尾添加斜杠
    images: { unoptimized: true }, // 禁用图片优化
    basePath: process.env.NODE_ENV === 'production' ? '/nextjs-instruction-dataset' : '',
    assetPrefix: process.env.NODE_ENV === 'production' ? '/nextjs-instruction-dataset/' : '',
};
```

### 3. 动态路由支持

项目中的动态路由 `/projects/[id]` 已配置静态参数生成：

-   位置: `app/projects/[id]/static-params.ts`
-   功能: 根据 mock 数据预生成所有项目页面的静态路径

## 使用方法

### 首次部署设置

1. **启用 GitHub Pages**:

    - 进入仓库 Settings → Pages
    - Source 选择 "GitHub Actions"
    - 保存设置

2. **配置权限**:
    - 进入仓库 Settings → Actions → General
    - 在 "Workflow permissions" 部分选择 "Read and write permissions"
    - 勾选 "Allow GitHub Actions to create and approve pull requests"

### 自动部署

-   每次推送到 `main` 分支时，GitHub Actions 会自动：
    1. 检出代码
    2. 安装 Node.js 和依赖
    3. 构建 Next.js 应用
    4. 部署到 GitHub Pages

### 部署后访问

部署完成后，可通过以下 URL 访问：

```
https://[your-username].github.io/nextjs-instruction-dataset/
```

## 文件说明

-   `.github/workflows/deploy.yml` - GitHub Actions 工作流配置
-   `public/.nojekyll` - 防止 GitHub Pages 使用 Jekyll 处理
-   `next.config.js` - Next.js 静态导出配置
-   `app/projects/[id]/static-params.ts` - 动态路由静态参数

## 注意事项

1. **路径配置**: 生产环境下所有资源路径会自动添加仓库名前缀
2. **构建时间**: 首次部署可能需要 3-5 分钟
3. **缓存**: 后续部署会利用缓存，构建时间更短
4. **浏览器缓存**: 部署后可能需要强制刷新浏览器查看最新版本

## 本地测试静态导出

可以在本地测试静态导出是否正常：

```bash
# 构建静态文件
npm run build

# 预览构建结果（需要安装 serve）
npx serve out
```

## 故障排除

-   查看 GitHub Actions 日志：仓库 → Actions 选项卡
-   检查构建错误：通常在 "Build with Next.js" 步骤
-   确认 Pages 设置：Settings → Pages → Source 应为 "GitHub Actions"

## 🚀 立即部署

**所有配置已完成！** 现在只需要：

1. **提交并推送代码到 GitHub**：

    ```bash
    git add .
    git commit -m "Add GitHub Pages deployment configuration"
    git push origin main
    ```

2. **在 GitHub 仓库中启用 Pages**：

    - 进入仓库 Settings → Pages
    - Source 选择 "GitHub Actions"
    - 保存设置

3. **等待自动部署**：
    - GitHub Actions 将自动开始构建和部署
    - 几分钟后即可通过 GitHub Pages URL 访问您的应用

部署完成后的访问地址：

```
https://[your-username].github.io/nextjs-instruction-dataset/
```
