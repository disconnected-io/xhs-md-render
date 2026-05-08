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

## 模板

10 套封面模板，4 种配色风格。点击 `preview.html` 选择后复制命令，或直接 `--cover=` 指定：

```bash
# 米白系
node render.js 文章.md --cover=cream-red     # 米白·红线（默认）
node render.js 文章.md --cover=cream-orange  # 米白·暖橙
node render.js 文章.md --cover=cream-leaf    # 米白·青叶
node render.js 文章.md --cover=cream-ink     # 米白·墨点

# 暗夜系
node render.js 文章.md --cover=dark-red      # 暗夜·绯红
node render.js 文章.md --cover=dark-gold     # 暗夜·金辉
node render.js 文章.md --cover=dark-purple   # 暗夜·紫雾
node render.js 文章.md --cover=dark-teal     # 暗夜·青蓝

# 纯白系
node render.js 文章.md --cover=white-red     # 纯白·炽红
node render.js 文章.md --cover=white-blue    # 纯白·科技蓝
```

### 模板预览

<img src="example/preview_cream-red.jpg" width="200"> <img src="example/preview_cream-orange.jpg" width="200"> <img src="example/preview_cream-leaf.jpg" width="200"> <img src="example/preview_cream-ink.jpg" width="200"> <img src="example/preview_dark-red.jpg" width="200">
<img src="example/preview_dark-gold.jpg" width="200"> <img src="example/preview_dark-purple.jpg" width="200"> <img src="example/preview_dark-teal.jpg" width="200"> <img src="example/preview_white-red.jpg" width="200"> <img src="example/preview_white-blue.jpg" width="200">

## 案例

以下是 Claude Code + DeepSeek effort level 完整分析文章（[Gist 原文](https://gist.github.com/disconnected-io/272036a680a8a159d2de64d37442d7b5)）的渲染效果：

<img src="example/page0.jpg" width="300"> <img src="example/page1.jpg" width="300"> <img src="example/page2.jpg" width="300">
<img src="example/page3.jpg" width="300"> <img src="example/page4.jpg" width="300"> <img src="example/page5.jpg" width="300">
<img src="example/page6.jpg" width="300"> <img src="example/page7.jpg" width="300"> <img src="example/page8.jpg" width="300">
<img src="example/page9.jpg" width="300"> <img src="example/page10.jpg" width="300"> <img src="example/page11.jpg" width="300">
<img src="example/page12.jpg" width="300"> <img src="example/page13.jpg" width="300"> <img src="example/page14.jpg" width="300">
<img src="example/page15.jpg" width="300"> <img src="example/page16.jpg" width="300"> <img src="example/page17.jpg" width="300">

## 为什么开源

本来只是为了给一篇文章配图，结果小红书死活发不出 18 张图——审核、限流、折叠轮着来。图都做好了，不发可惜，干脆把工具开源了。没什么技术含量，能用就行。

## License

MIT
