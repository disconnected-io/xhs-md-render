const puppeteer = require("puppeteer-core");
const fs = require("fs");

const W = 400;   // thumbnail width
const H = 533;   // thumbnail height (~ 1600/3)
const SCALE = 2;
const N = 6;       // number of templates

const templates = [
  {
    name: "极简红线",
    bg: "#fdf8f0",
    accent: "#d44444",
    accent2: "#c75b20",
    text: "#1a1a1a",
    geo: `
    <div style="position:absolute;width:200px;height:200px;border-radius:50%;border:3px solid rgba(212,68,68,0.12);top:-60px;right:-60px"></div>
    <div style="position:absolute;width:10px;height:10px;border-radius:50%;background:rgba(199,91,32,0.3);top:160px;left:80px"></div>
    <div style="position:absolute;width:60px;height:2px;background:rgba(212,68,68,0.15);top:120px;right:100px;transform:rotate(-25deg)"></div>`,
  },
  {
    name: "几何圆环",
    bg: "#faf5ee",
    accent: "#e87830",
    accent2: "#cc5533",
    text: "#1a1a1a",
    geo: `
    <div style="position:absolute;width:180px;height:180px;border-radius:50%;border:3px solid rgba(232,120,48,0.1);top:-40px;right:60px"></div>
    <div style="position:absolute;width:120px;height:120px;border-radius:50%;border:2px solid rgba(204,85,51,0.08);top:50%;right:-30px"></div>
    <div style="position:absolute;width:60px;height:60px;border-radius:50%;background:rgba(232,120,48,0.06);top:60%;right:80px"></div>
    <div style="position:absolute;width:8px;height:8px;border-radius:50%;background:rgba(204,85,51,0.25);top:200px;left:60px"></div>
    <div style="position:absolute;width:6px;height:6px;border-radius:50%;background:rgba(232,120,48,0.2);top:280px;right:120px"></div>`,
  },
  {
    name: "对角线切割",
    bg: "#fefaf5",
    accent: "#c0392b",
    accent2: "#d47830",
    text: "#1a1a1a",
    geo: `
    <div style="position:absolute;top:0;right:0;width:0;height:0;border-left:100px solid transparent;border-top:100px solid rgba(212,68,68,0.06)"></div>
    <div style="position:absolute;bottom:0;left:0;width:0;height:0;border-right:150px solid transparent;border-bottom:150px solid rgba(199,91,32,0.04)"></div>
    <div style="position:absolute;width:180px;height:180px;border-radius:50%;border:2px solid rgba(212,68,68,0.08);bottom:-40px;right:200px"></div>
    <div style="position:absolute;width:12px;height:12px;border-radius:50%;background:rgba(199,91,32,0.2);top:200px;right:100px"></div>
    <div style="position:absolute;width:80px;height:2px;background:rgba(212,68,68,0.1);top:180px;right:160px;transform:rotate(45deg)"></div>`,
  },
  {
    name: "极光绿意",
    bg: "#f6faf3",
    accent: "#2e7d32",
    accent2: "#558b2f",
    text: "#1a1a1a",
    geo: `
    <div style="position:absolute;width:250px;height:250px;border-radius:50%;background:radial-gradient(circle,rgba(46,125,50,0.06) 0%,transparent 70%);top:-80px;right:-80px"></div>
    <div style="position:absolute;width:160px;height:160px;border-radius:50%;border:3px solid rgba(85,139,47,0.08);bottom:-40px;left:-40px"></div>
    <div style="position:absolute;width:10px;height:10px;border-radius:50%;background:rgba(46,125,50,0.2);top:150px;left:100px"></div>
    <div style="position:absolute;width:6px;height:6px;border-radius:50%;background:rgba(85,139,47,0.25);bottom:250px;right:120px"></div>
    <div style="position:absolute;width:70px;height:2px;background:rgba(46,125,50,0.12);top:240px;right:160px;transform:rotate(-15deg)"></div>`,
  },
  {
    name: "墨点散落",
    bg: "#fdfaf6",
    accent: "#1a1a2e",
    accent2: "#c75b20",
    text: "#1a1a1a",
    geo: `
    <div style="position:absolute;width:16px;height:16px;border-radius:50%;background:rgba(26,26,46,0.08);top:100px;right:120px"></div>
    <div style="position:absolute;width:10px;height:10px;border-radius:50%;background:rgba(26,26,46,0.1);top:180px;right:80px"></div>
    <div style="position:absolute;width:6px;height:6px;border-radius:50%;background:rgba(199,91,32,0.18);top:160px;right:160px"></div>
    <div style="position:absolute;width:12px;height:12px;border-radius:50%;background:rgba(26,26,46,0.06);top:280px;right:200px"></div>
    <div style="position:absolute;width:8px;height:8px;border-radius:50%;background:rgba(199,91,32,0.15);top:350px;right:100px"></div>
    <div style="position:absolute;width:4px;height:4px;border-radius:50%;background:rgba(26,26,46,0.12);top:140px;right:60px"></div>
    <div style="position:absolute;width:14px;height:14px;border-radius:50%;border:2px solid rgba(26,26,46,0.06);bottom:250px;right:140px"></div>`,
  },
  {
    name: "渐变光晕",
    bg: "#faf7f2",
    accent: "#d44444",
    accent2: "#e87830",
    text: "#1a1a1a",
    geo: `
    <div style="position:absolute;width:300px;height:300px;border-radius:50%;background:radial-gradient(circle,rgba(212,68,68,0.08) 0%,transparent 60%);top:20px;right:-40px"></div>
    <div style="position:absolute;width:200px;height:200px;border-radius:50%;background:radial-gradient(circle,rgba(232,120,48,0.06) 0%,transparent 60%);bottom:120px;right:60px"></div>
    <div style="position:absolute;width:120px;height:120px;border-radius:50%;background:radial-gradient(circle,rgba(212,68,68,0.04) 0%,transparent 60%);top:50%;left:-40px"></div>
    <div style="position:absolute;width:8px;height:8px;border-radius:50%;background:rgba(212,68,68,0.2);top:200px;left:120px"></div>
    <div style="position:absolute;width:6px;height:6px;border-radius:50%;background:rgba(232,120,48,0.25);top:300px;right:160px"></div>`,
  },
];

const coverHTML = (t) => `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><style>
*{margin:0;padding:0;box-sizing:border-box}
body{
  width:${W}px;height:${H}px;font-family:"PingFang SC","Microsoft YaHei","Noto Sans SC","Heiti SC",sans-serif;
  background:${t.bg};display:flex;flex-direction:column;justify-content:center;
  text-align:left;padding:20px 32px;position:relative;overflow:hidden;
}
.kw{font-size:22px;font-weight:900;letter-spacing:6px;color:${t.accent2};margin-bottom:16px;text-transform:uppercase;position:relative;z-index:1}
.q{font-size:40px;font-weight:900;line-height:1.2;color:${t.accent};position:relative;z-index:1;margin-bottom:0}
.punch{font-size:75px;font-weight:900;line-height:1;color:${t.accent};position:relative;z-index:1;margin:4px 0}
.tag{font-size:32px;font-weight:900;letter-spacing:8px;color:${t.accent2};margin-top:8px;position:relative;z-index:1}
.bar{width:60px;height:3px;border-radius:2px;background:${t.accent};margin-top:4px;position:relative;z-index:1}
.label{position:absolute;bottom:12px;right:16px;font-size:12px;color:rgba(0,0,0,0.25);z-index:1}
</style></head><body>
${t.geo}
<div class="kw">CLAUDE CODE  ×  DEEPSEEK</div>
<div class="q">你可能根本没在</div>
<div class="q">Claude Code 开启</div>
<div class="punch">DeepSeek max</div>
<div class="tag">两个常见误区</div>
<div class="bar"></div>
<div class="label">${t.name}</div>
</body></html>`;

(async () => {
  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();

  for (let i = 0; i < N; i++) {
    const t = templates[i];
    const html = coverHTML(t);
    const htmlPath = `D:\\code_project\\xhs\\preview_t${i + 1}.html`;
    const jpgPath = `D:\\code_project\\xhs\\preview_t${i + 1}.jpg`;
    fs.writeFileSync(htmlPath, html, "utf-8");

    await page.setViewport({ width: W, height: H, deviceScaleFactor: SCALE });
    await page.setContent(html, { waitUntil: "load", timeout: 15000 });
    await page.screenshot({ path: jpgPath, type: "jpeg", quality: 85 });
    console.log(`  [${i + 1}/${N}] ${t.name} → ${jpgPath}`);
  }

  // Build comparison page
  let grid = "";
  for (let i = 0; i < N; i++) {
    const t = templates[i];
    grid += `<div class="card">
      <img src="preview_t${i + 1}.jpg" width="${W}" height="${H}">
      <div class="name">${t.name}</div>
    </div>`;
  }

  const comparison = `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{background:#1a1a1a;padding:30px;font-family:"PingFang SC","Microsoft YaHei",sans-serif}
    h1{color:#fff;text-align:center;margin-bottom:10px;font-size:24px}
    .sub{color:#888;text-align:center;margin-bottom:30px;font-size:14px}
    .grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;max-width:1300px;margin:0 auto}
    .card{background:#2a2a2a;border-radius:12px;overflow:hidden}
    .card img{width:100%;display:block}
    .name{color:#ccc;text-align:center;padding:10px;font-size:14px;font-weight:600}
  </style></head><body>
    <h1>封面模板预览</h1>
    <div class="sub">选择喜欢的模板，用对应编号渲染完整文章</div>
    <div class="grid">${grid}</div>
  </body></html>`;

  const compPath = "D:\\code_project\\xhs\\preview.html";
  fs.writeFileSync(compPath, comparison, "utf-8");
  console.log(`\nComparison page: ${compPath}`);

  await browser.close();
  console.log("Done. Open preview.html in browser.");
})();
