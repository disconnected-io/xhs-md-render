const puppeteer = require("puppeteer-core");
const fs = require("fs");

const W = 400;
const H = 533;
const SCALE = 2;

const templates = [
  // ── 浅色系 ──
  {
    id: "cream-red",
    name: "米白·红线",
    bg: "#fdf8f0",
    accent: "#d44444",
    accent2: "#c75b20",
    text: "#1a1a1a",
    geo: `<div style="position:absolute;width:200px;height:200px;border-radius:50%;border:3px solid rgba(212,68,68,0.12);top:-60px;right:-60px"></div><div style="position:absolute;width:10px;height:10px;border-radius:50%;background:rgba(199,91,32,0.3);top:160px;left:80px"></div><div style="position:absolute;width:60px;height:2px;background:rgba(212,68,68,0.15);top:120px;right:100px;transform:rotate(-25deg)"></div>`,
  },
  {
    id: "cream-orange",
    name: "米白·暖橙",
    bg: "#faf5ee",
    accent: "#e87830",
    accent2: "#cc5533",
    text: "#1a1a1a",
    geo: `<div style="position:absolute;width:180px;height:180px;border-radius:50%;border:3px solid rgba(232,120,48,0.1);top:-40px;right:60px"></div><div style="position:absolute;width:120px;height:120px;border-radius:50%;border:2px solid rgba(204,85,51,0.08);top:50%;right:-30px"></div><div style="position:absolute;width:8px;height:8px;border-radius:50%;background:rgba(204,85,51,0.25);top:200px;left:60px"></div><div style="position:absolute;width:6px;height:6px;border-radius:50%;background:rgba(232,120,48,0.2);top:280px;right:120px"></div>`,
  },
  {
    id: "cream-leaf",
    name: "米白·青叶",
    bg: "#f6faf3",
    accent: "#2e7d32",
    accent2: "#558b2f",
    text: "#1a1a1a",
    geo: `<div style="position:absolute;width:250px;height:250px;border-radius:50%;background:radial-gradient(circle,rgba(46,125,50,0.06) 0%,transparent 70%);top:-80px;right:-80px"></div><div style="position:absolute;width:160px;height:160px;border-radius:50%;border:3px solid rgba(85,139,47,0.08);bottom:-40px;left:-40px"></div><div style="position:absolute;width:10px;height:10px;border-radius:50%;background:rgba(46,125,50,0.2);top:150px;left:100px"></div><div style="position:absolute;width:70px;height:2px;background:rgba(46,125,50,0.12);top:240px;right:160px;transform:rotate(-15deg)"></div>`,
  },
  {
    id: "cream-ink",
    name: "米白·墨点",
    bg: "#fdfaf6",
    accent: "#1a1a2e",
    accent2: "#c75b20",
    text: "#1a1a1a",
    geo: `<div style="position:absolute;width:16px;height:16px;border-radius:50%;background:rgba(26,26,46,0.08);top:100px;right:120px"></div><div style="position:absolute;width:10px;height:10px;border-radius:50%;background:rgba(26,26,46,0.1);top:180px;right:80px"></div><div style="position:absolute;width:6px;height:6px;border-radius:50%;background:rgba(199,91,32,0.18);top:160px;right:160px"></div><div style="position:absolute;width:12px;height:12px;border-radius:50%;background:rgba(26,26,46,0.06);top:280px;right:200px"></div><div style="position:absolute;width:8px;height:8px;border-radius:50%;background:rgba(199,91,32,0.15);top:350px;right:100px"></div>`,
  },
  // ── 暗色系 ──
  {
    id: "dark-red",
    name: "暗夜·绯红",
    bg: "#0f0f1f",
    accent: "#ff6b6b",
    accent2: "#ffa94d",
    text: "#ebeaf0",
    geo: `<div style="position:absolute;width:240px;height:240px;border-radius:50%;border:3px solid rgba(255,107,107,0.1);top:-50px;right:-50px"></div><div style="position:absolute;width:100px;height:100px;border-radius:50%;background:rgba(255,169,77,0.04);top:40%;right:60px"></div><div style="position:absolute;width:8px;height:8px;border-radius:50%;background:rgba(255,107,107,0.3);top:200px;left:80px"></div><div style="position:absolute;width:60px;height:2px;background:rgba(255,169,77,0.15);top:160px;right:120px;transform:rotate(20deg)"></div>`,
  },
  {
    id: "dark-gold",
    name: "暗夜·金辉",
    bg: "#0d0d1a",
    accent: "#ffa94d",
    accent2: "#ffd43b",
    text: "#ebeaf0",
    geo: `<div style="position:absolute;width:220px;height:220px;border-radius:50%;background:radial-gradient(circle,rgba(255,169,77,0.08) 0%,transparent 60%);top:-40px;right:40px"></div><div style="position:absolute;width:140px;height:140px;border-radius:50%;border:2px solid rgba(255,212,59,0.08);bottom:60px;right:-30px"></div><div style="position:absolute;width:10px;height:10px;border-radius:50%;background:rgba(255,169,77,0.25);top:180px;left:90px"></div><div style="position:absolute;width:6px;height:6px;border-radius:50%;background:rgba(255,212,59,0.3);bottom:200px;right:160px"></div>`,
  },
  {
    id: "dark-purple",
    name: "暗夜·紫雾",
    bg: "#0f0a1a",
    accent: "#b388ff",
    accent2: "#e040fb",
    text: "#ebeaf0",
    geo: `<div style="position:absolute;width:260px;height:260px;border-radius:50%;background:radial-gradient(circle,rgba(179,136,255,0.06) 0%,transparent 65%);top:-60px;right:-40px"></div><div style="position:absolute;width:160px;height:160px;border-radius:50%;border:2px solid rgba(224,64,251,0.08);bottom:-30px;left:-30px"></div><div style="position:absolute;width:8px;height:8px;border-radius:50%;background:rgba(179,136,255,0.25);top:200px;right:140px"></div><div style="position:absolute;width:50px;height:2px;background:rgba(224,64,251,0.12);top:300px;left:120px;transform:rotate(-35deg)"></div>`,
  },
  {
    id: "dark-teal",
    name: "暗夜·青蓝",
    bg: "#0a1218",
    accent: "#64ffda",
    accent2: "#00bcd4",
    text: "#ebeaf0",
    geo: `<div style="position:absolute;width:230px;height:230px;border-radius:50%;border:3px solid rgba(100,255,218,0.08);top:-50px;right:80px"></div><div style="position:absolute;width:130px;height:130px;border-radius:50%;background:rgba(0,188,212,0.04);bottom:80px;right:-20px"></div><div style="position:absolute;width:10px;height:10px;border-radius:50%;background:rgba(100,255,218,0.25);top:220px;left:100px"></div><div style="position:absolute;width:70px;height:2px;background:rgba(0,188,212,0.12);top:260px;right:140px;transform:rotate(15deg)"></div>`,
  },
  // ── 白色系 ──
  {
    id: "white-red",
    name: "纯白·炽红",
    bg: "#ffffff",
    accent: "#e53935",
    accent2: "#ff6f00",
    text: "#111111",
    geo: `<div style="position:absolute;width:200px;height:200px;border-radius:50%;border:3px solid rgba(229,57,53,0.08);top:-40px;right:-40px"></div><div style="position:absolute;width:12px;height:12px;border-radius:50%;background:rgba(229,57,53,0.2);top:200px;left:80px"></div><div style="position:absolute;width:80px;height:2px;background:rgba(255,111,0,0.1);top:160px;right:120px;transform:rotate(-20deg)"></div>`,
  },
  {
    id: "white-blue",
    name: "纯白·科技蓝",
    bg: "#fafcff",
    accent: "#1565c0",
    accent2: "#0d47a1",
    text: "#111111",
    geo: `<div style="position:absolute;width:180px;height:180px;border-radius:50%;border:3px solid rgba(21,101,192,0.08);top:30px;right:60px"></div><div style="position:absolute;width:100px;height:100px;border-radius:50%;border:2px solid rgba(13,71,161,0.06);bottom:100px;right:80px"></div><div style="position:absolute;width:8px;height:8px;border-radius:50%;background:rgba(21,101,192,0.2);top:200px;left:100px"></div><div style="position:absolute;width:60px;height:2px;background:rgba(21,101,192,0.1);top:260px;right:120px;transform:rotate(-15deg)"></div>`,
  },
];

const coverHTML = (t) => `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><style>
*{margin:0;padding:0;box-sizing:border-box}
body{
  width:${W}px;height:${H}px;font-family:"PingFang SC","Microsoft YaHei","Noto Sans SC","Heiti SC",sans-serif;
  background:${t.bg};display:flex;flex-direction:column;justify-content:center;
  text-align:left;padding:13px 20px;position:relative;overflow:hidden;
  color:${t.text};
}
.kw{font-size:15px;font-weight:900;letter-spacing:3px;color:${t.accent2};margin-bottom:11px;text-transform:uppercase;position:relative;z-index:1}
.q{font-size:27px;font-weight:900;line-height:1.2;letter-spacing:1px;color:${t.accent};position:relative;z-index:1;margin-bottom:0}
.punch{font-size:50px;font-weight:900;line-height:1;color:${t.accent};position:relative;z-index:1;margin:0}
.tag{font-size:21px;font-weight:900;letter-spacing:4px;color:${t.accent2};margin-top:4px;position:relative;z-index:1}
.bar{width:40px;height:2px;border-radius:2px;background:${t.accent};margin-top:2px;position:relative;z-index:1}
.label{position:absolute;bottom:8px;right:11px;font-size:8px;color:${t.accent2};opacity:0.4;z-index:1}
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

  // Render each template thumbnail
  for (const t of templates) {
    const html = coverHTML(t);
    const jpgPath = `D:\\code_project\\xhs\\preview_${t.id}.jpg`;
    await page.setViewport({ width: W, height: H, deviceScaleFactor: SCALE });
    await page.setContent(html, { waitUntil: "load", timeout: 15000 });
    await page.screenshot({ path: jpgPath, type: "jpeg", quality: 85 });
    console.log(`  ${t.id} → preview_${t.id}.jpg`);
  }

  // Build interactive comparison page
  let cards = "";
  for (const t of templates) {
    cards += `<div class="card" data-id="${t.id}" onclick="select('${t.id}')">
      <img src="preview_${t.id}.jpg" width="${W}" height="${H}">
      <div class="name">${t.name}</div>
      <div class="check">✓</div>
    </div>`;
  }

  const comparison = `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{background:#1a1a1a;padding:30px;font-family:"PingFang SC","Microsoft YaHei",sans-serif}
    h1{color:#fff;text-align:center;margin-bottom:6px;font-size:28px}
    .sub{color:#888;text-align:center;margin-bottom:12px;font-size:14px}
    .sel{color:#ffa94d;text-align:center;margin-bottom:24px;font-size:16px;font-weight:600}
    .grid{display:grid;grid-template-columns:repeat(5,1fr);gap:16px;max-width:2100px;margin:0 auto}
    .card{background:#2a2a2a;border-radius:12px;overflow:hidden;cursor:pointer;position:relative;transition:transform .15s,box-shadow .15s;border:3px solid transparent}
    .card:hover{transform:translateY(-4px);box-shadow:0 8px 24px rgba(0,0,0,0.4)}
    .card.selected{border-color:#ffa94d;box-shadow:0 0 0 3px rgba(255,169,77,0.25)}
    .card img{width:100%;display:block}
    .name{color:#ccc;text-align:center;padding:8px 4px;font-size:13px;font-weight:600}
    .check{position:absolute;top:8px;right:8px;width:24px;height:24px;border-radius:50%;background:#ffa94d;color:#000;display:none;align-items:center;justify-content:center;font-size:14px;font-weight:900}
    .card.selected .check{display:flex}
    .btn-bar{text-align:center;margin-top:24px}
    .btn{display:inline-block;padding:12px 36px;border-radius:8px;background:#ffa94d;color:#000;font-weight:700;font-size:16px;text-decoration:none;cursor:pointer}
    .cmd{color:#aaa;text-align:center;margin-top:12px;font-size:13px;font-family:monospace}
  </style></head><body>
    <h1>封面模板预览 — 点击选择</h1>
    <div class="sub">共 ${templates.length} 套模板 · 3 种配色风格</div>
    <div class="sel" id="sel-label">当前未选择</div>
    <div class="grid">${cards}</div>
    <div class="btn-bar"><span class="btn" onclick="apply()">使用选中模板渲染</span></div>
    <div class="cmd" id="cmd"></div>
    <script>
      let current = null;
      function select(id) {
        document.querySelectorAll('.card').forEach(c => c.classList.remove('selected'));
        document.querySelector('.card[data-id="'+id+'"]').classList.add('selected');
        current = id;
        document.getElementById('sel-label').textContent = '已选择: ' + id;
      }
      function apply() {
        if (!current) return alert('请先点击选择一个模板');
        var cmd = 'node render.js 文章.md --cover=' + current;
        document.getElementById('cmd').innerHTML =
          '<b>已选择 ' + current + '</b><br>复制运行: <code>' + cmd + '</code>';
        // Try clipboard
        try { navigator.clipboard.writeText(cmd); }
        catch(e) {}
      }
    </script>
  </body></html>`;

  fs.writeFileSync("D:\\code_project\\xhs\\preview.html", comparison, "utf-8");
  console.log(`\nPreview: D:\\code_project\\xhs\\preview.html`);

  await browser.close();
  console.log("Done.");
})();
