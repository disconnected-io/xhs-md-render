# xhs-md-render

Markdown → 小红书图片渲染器。把你的 Markdown 文章转成 1200×1600 的精美 JPEG，适合小红书图文发布。

## 功能

- **Markdown 转图片**：自动解析 Markdown，分页渲染为 1200×1600 JPEG
- **封面模板**：6 套内置封面设计（极简红线、几何圆环、对角线切割、极光绿意、墨点散落、渐变光晕）
- **手机适配**：大字号（正文 36px），手机阅读舒适
- **浅色主题**：米白底色 + 温暖配色，小红书风格

## 安装

```bash
npm install
```

依赖 Chrome 浏览器（`puppeteer-core` 会调用系统已安装的 Chrome）。

## 使用

### 渲染文章

```bash
node render.js <你的文章.md>
```

输出：
- `文章_p0.jpg` — 封面页
- `文章_p1.jpg` ~ `文章_pN.jpg` — 内容页

### 预览封面模板

```bash
node preview.js
```

在浏览器中打开 `preview.html` 对比 6 套封面模板，选好编号后配置 `render.js` 中的封面模板。

## 自定义

编辑 `render.js` 顶部的 CSS 变量和封面 HTML 来定制样式。`preview.js` 中的 `templates` 数组包含 6 套模板配色和几何装饰。

## 案例

用这个工具渲染的 [Claude Code + DeepSeek effort level 完整分析](https://gist.github.com/disconnected-io/272036a680a8a159d2de64d37442d7b5)。

## License

MIT
