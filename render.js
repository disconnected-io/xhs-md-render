const { marked } = require("marked");
const puppeteer = require("puppeteer-core");
const fs = require("fs");

// Parse --cover argument
let coverId = "cream-red"; // default
for (let i = 2; i < process.argv.length; i++) {
  if (process.argv[i].startsWith("--cover=")) {
    coverId = process.argv[i].split("=")[1];
  }
}

const mdPath = process.argv[2];
if (!mdPath) { console.error("Usage: node render.js <markdown-file> [--cover=template-id]"); process.exit(1); }

// Cover templates (must match preview.js)
const TEMPLATES = {
  "cream-red":    { name:"米白·红线", bg:"#fdf8f0", accent:"#d44444", accent2:"#c75b20", text:"#1a1a1a",
    geo: `<div style="position:absolute;width:280px;height:280px;border-radius:50%;border:3px solid rgba(212,68,68,0.12);top:-60px;right:-60px"></div><div style="position:absolute;width:180px;height:180px;border-radius:50%;border:3px solid rgba(199,91,32,0.10);bottom:-50px;left:-50px"></div><div style="position:absolute;width:120px;height:120px;border-radius:50%;background:rgba(212,68,68,0.06);top:50%;right:80px"></div><div style="position:absolute;width:16px;height:16px;border-radius:50%;background:rgba(199,91,32,0.25);top:180px;left:100px"></div><div style="position:absolute;width:10px;height:10px;border-radius:50%;background:rgba(212,68,68,0.2);bottom:240px;right:140px"></div><div style="position:absolute;width:80px;height:2px;background:rgba(212,68,68,0.12);top:220px;right:180px;transform:rotate(-30deg)"></div>` },
  "cream-orange": { name:"米白·暖橙", bg:"#faf5ee", accent:"#e87830", accent2:"#cc5533", text:"#1a1a1a",
    geo: `<div style="position:absolute;width:180px;height:180px;border-radius:50%;border:3px solid rgba(232,120,48,0.1);top:-40px;right:60px"></div><div style="position:absolute;width:120px;height:120px;border-radius:50%;border:2px solid rgba(204,85,51,0.08);top:50%;right:-30px"></div><div style="position:absolute;width:60px;height:60px;border-radius:50%;background:rgba(232,120,48,0.06);top:60%;right:80px"></div><div style="position:absolute;width:8px;height:8px;border-radius:50%;background:rgba(204,85,51,0.25);top:200px;left:60px"></div><div style="position:absolute;width:6px;height:6px;border-radius:50%;background:rgba(232,120,48,0.2);top:280px;right:120px"></div>` },
  "cream-leaf":   { name:"米白·青叶", bg:"#f6faf3", accent:"#2e7d32", accent2:"#558b2f", text:"#1a1a1a",
    geo: `<div style="position:absolute;width:250px;height:250px;border-radius:50%;background:radial-gradient(circle,rgba(46,125,50,0.06) 0%,transparent 70%);top:-80px;right:-80px"></div><div style="position:absolute;width:160px;height:160px;border-radius:50%;border:3px solid rgba(85,139,47,0.08);bottom:-40px;left:-40px"></div><div style="position:absolute;width:10px;height:10px;border-radius:50%;background:rgba(46,125,50,0.2);top:150px;left:100px"></div><div style="position:absolute;width:70px;height:2px;background:rgba(46,125,50,0.12);top:240px;right:160px;transform:rotate(-15deg)"></div>` },
  "cream-ink":    { name:"米白·墨点", bg:"#fdfaf6", accent:"#1a1a2e", accent2:"#c75b20", text:"#1a1a1a",
    geo: `<div style="position:absolute;width:16px;height:16px;border-radius:50%;background:rgba(26,26,46,0.08);top:100px;right:120px"></div><div style="position:absolute;width:10px;height:10px;border-radius:50%;background:rgba(26,26,46,0.1);top:180px;right:80px"></div><div style="position:absolute;width:6px;height:6px;border-radius:50%;background:rgba(199,91,32,0.18);top:160px;right:160px"></div><div style="position:absolute;width:12px;height:12px;border-radius:50%;background:rgba(26,26,46,0.06);top:280px;right:200px"></div><div style="position:absolute;width:8px;height:8px;border-radius:50%;background:rgba(199,91,32,0.15);top:350px;right:100px"></div>` },
  "dark-red":     { name:"暗夜·绯红", bg:"#0f0f1f", accent:"#ff6b6b", accent2:"#ffa94d", text:"#ebeaf0",
    geo: `<div style="position:absolute;width:240px;height:240px;border-radius:50%;border:3px solid rgba(255,107,107,0.1);top:-50px;right:-50px"></div><div style="position:absolute;width:100px;height:100px;border-radius:50%;background:rgba(255,169,77,0.04);top:40%;right:60px"></div><div style="position:absolute;width:8px;height:8px;border-radius:50%;background:rgba(255,107,107,0.3);top:200px;left:80px"></div><div style="position:absolute;width:60px;height:2px;background:rgba(255,169,77,0.15);top:160px;right:120px;transform:rotate(20deg)"></div>` },
  "dark-gold":    { name:"暗夜·金辉", bg:"#0d0d1a", accent:"#ffa94d", accent2:"#ffd43b", text:"#ebeaf0",
    geo: `<div style="position:absolute;width:220px;height:220px;border-radius:50%;background:radial-gradient(circle,rgba(255,169,77,0.08) 0%,transparent 60%);top:-40px;right:40px"></div><div style="position:absolute;width:140px;height:140px;border-radius:50%;border:2px solid rgba(255,212,59,0.08);bottom:60px;right:-30px"></div><div style="position:absolute;width:10px;height:10px;border-radius:50%;background:rgba(255,169,77,0.25);top:180px;left:90px"></div><div style="position:absolute;width:6px;height:6px;border-radius:50%;background:rgba(255,212,59,0.3);bottom:200px;right:160px"></div>` },
  "dark-purple":  { name:"暗夜·紫雾", bg:"#0f0a1a", accent:"#b388ff", accent2:"#e040fb", text:"#ebeaf0",
    geo: `<div style="position:absolute;width:260px;height:260px;border-radius:50%;background:radial-gradient(circle,rgba(179,136,255,0.06) 0%,transparent 65%);top:-60px;right:-40px"></div><div style="position:absolute;width:160px;height:160px;border-radius:50%;border:2px solid rgba(224,64,251,0.08);bottom:-30px;left:-30px"></div><div style="position:absolute;width:8px;height:8px;border-radius:50%;background:rgba(179,136,255,0.25);top:200px;right:140px"></div><div style="position:absolute;width:50px;height:2px;background:rgba(224,64,251,0.12);top:300px;left:120px;transform:rotate(-35deg)"></div>` },
  "dark-teal":    { name:"暗夜·青蓝", bg:"#0a1218", accent:"#64ffda", accent2:"#00bcd4", text:"#ebeaf0",
    geo: `<div style="position:absolute;width:230px;height:230px;border-radius:50%;border:3px solid rgba(100,255,218,0.08);top:-50px;right:80px"></div><div style="position:absolute;width:130px;height:130px;border-radius:50%;background:rgba(0,188,212,0.04);bottom:80px;right:-20px"></div><div style="position:absolute;width:10px;height:10px;border-radius:50%;background:rgba(100,255,218,0.25);top:220px;left:100px"></div><div style="position:absolute;width:70px;height:2px;background:rgba(0,188,212,0.12);top:260px;right:140px;transform:rotate(15deg)"></div>` },
  "white-red":    { name:"纯白·炽红", bg:"#ffffff", accent:"#e53935", accent2:"#ff6f00", text:"#111111",
    geo: `<div style="position:absolute;width:200px;height:200px;border-radius:50%;border:3px solid rgba(229,57,53,0.08);top:-40px;right:-40px"></div><div style="position:absolute;width:12px;height:12px;border-radius:50%;background:rgba(229,57,53,0.2);top:200px;left:80px"></div><div style="position:absolute;width:80px;height:2px;background:rgba(255,111,0,0.1);top:160px;right:120px;transform:rotate(-20deg)"></div>` },
  "white-blue":   { name:"纯白·科技蓝", bg:"#fafcff", accent:"#1565c0", accent2:"#0d47a1", text:"#111111",
    geo: `<div style="position:absolute;width:180px;height:180px;border-radius:50%;border:3px solid rgba(21,101,192,0.08);top:30px;right:60px"></div><div style="position:absolute;width:100px;height:100px;border-radius:50%;border:2px solid rgba(13,71,161,0.06);bottom:100px;right:80px"></div><div style="position:absolute;width:8px;height:8px;border-radius:50%;background:rgba(21,101,192,0.2);top:200px;left:100px"></div><div style="position:absolute;width:60px;height:2px;background:rgba(21,101,192,0.1);top:260px;right:120px;transform:rotate(-15deg)"></div>` },
};

const coverT = TEMPLATES[coverId] || TEMPLATES["cream-red"];
console.log(`Cover template: ${coverT.name} (${coverId})`);

marked.setOptions({ gfm: true, breaks: true });

const W = 1200;
const H = 1600;
const SCALE = 2;
const PX = 52;
const PT = 56;
const PB = 48;
const CONTENT_H = H - PT - PB;  // usable height per page

const CSS = `
*{margin:0;padding:0;box-sizing:border-box}
body{
  width:${W}px;
  font-family:"PingFang SC","Microsoft YaHei","Noto Sans SC","Heiti SC",sans-serif;
  background:#fdf8f0;
  color:#2d2d2d;
  display:flex;flex-direction:column;justify-content:center;
  min-height:${H}px;
  padding:${PT}px ${PX}px ${PB}px;
  line-height:1.7;
  -webkit-font-smoothing:antialiased;
}
h1{
  font-size:50px;font-weight:900;letter-spacing:1px;
  color:#d44444;
  margin-bottom:40px;padding-left:22px;padding-bottom:4px;
  border-left:6px solid #d44444;line-height:1.3;
}
h2{
  font-size:40px;font-weight:800;color:#c75b20;
  margin-top:44px;margin-bottom:18px;padding-bottom:8px;
  border-bottom:2px solid rgba(199,91,32,0.2);
}
h3{
  font-size:34px;font-weight:700;color:#d47830;
  margin-top:32px;margin-bottom:14px;
}
p{
  margin-bottom:18px;font-size:36px;color:#3a3a3a;line-height:1.7;
}
strong{color:#1a1a1a;font-weight:800;}
blockquote{
  margin:22px 0;padding:20px 28px;
  border-left:5px solid #d44444;
  background:rgba(212,68,68,0.05);
  border-radius:0 10px 10px 0;
  font-size:34px;color:#4a4a4a;line-height:1.7;
}
code{
  background:#f0e8db;padding:4px 12px;border-radius:5px;
  font-family:"Cascadia Code","Fira Code",Consolas,monospace;
  font-size:32px;color:#c75b20;word-break:break-word;
}
pre{
  background:#f4ede4;padding:26px 30px;border-radius:12px;
  margin:22px 0;border:1px solid #e8ddd0;overflow-x:auto;
}
pre code{background:none;padding:0;color:#5a4a3a;font-size:30px;line-height:1.8;}
table{
  width:100%;border-collapse:collapse;margin:22px 0;font-size:32px;border-radius:10px;overflow:hidden;
}
thead tr{background:rgba(199,91,32,0.08);}
th{
  padding:16px 20px;text-align:left;font-weight:800;
  color:#c75b20;border-bottom:2px solid rgba(199,91,32,0.2);
}
td{padding:14px 20px;border-bottom:1px solid #e8ddd0;color:#3a3a3a;}
tr:last-child td{border-bottom:none}
hr{
  border:none;height:2px;
  background:linear-gradient(90deg,transparent,rgba(199,91,32,0.3),transparent);
  margin:36px 0;
}
a{color:#c75b20;text-decoration:none;font-weight:600}
ul,ol{margin:14px 0 14px 32px;color:#3a3a3a;font-size:36px;}
li{margin-bottom:8px;line-height:1.7}
`;

const md = fs.readFileSync(mdPath, "utf-8");

// Split by h2, then sub-split long sections by h3
const sections = [];
const lines = md.split("\n");
let cur = "";
let inCB = false;

function flushSection() {
  if (!cur.trim()) return;
  if ((cur.match(/\n### /g) || []).length > 1) {
    const subLines = cur.split("\n");
    let subCur = "";
    let subCB = false;
    for (const line of subLines) {
      if (line.startsWith("```")) subCB = !subCB;
      if (!subCB && /^### /.test(line) && subCur.trim()) {
        sections.push(subCur.trimEnd());
        subCur = line + "\n";
      } else { subCur += line + "\n"; }
    }
    if (subCur.trim()) sections.push(subCur.trimEnd());
  } else {
    sections.push(cur.trimEnd());
  }
  cur = "";
}

for (const line of lines) {
  if (line.startsWith("```")) inCB = !inCB;
  if (!inCB && /^## /.test(line) && cur.trim()) { flushSection(); cur = line + "\n"; }
  else { cur += line + "\n"; }
}
flushSection();
console.log(`Sections: ${sections.length}`);

const wrap = (body) =>
  `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><style>${CSS}</style></head><body>${body}</body></html>`;

(async () => {
  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();

  // Measure each section
  const heights = [];
  for (const sec of sections) {
    const html = marked.parse(sec);
    await page.setContent(wrap(html), { waitUntil: "load", timeout: 15000 });
    heights.push(await page.evaluate((pt, pb) => document.body.scrollHeight - pt - pb, PT, PB));
  }

  // Distribute into pages with CONTENT_H target
  const pages = [];
  let buf = "";
  let bufH = 0;

  for (let i = 0; i < sections.length; i++) {
    const h = heights[i];
    // If section alone is taller than CONTENT_H, it gets its own page
    if (buf !== "" && bufH + h > CONTENT_H) {
      pages.push(buf.trimEnd());
      buf = sections[i];
      bufH = h;
    } else {
      buf += (buf ? "\n" : "") + sections[i];
      bufH += h;
    }
  }
  if (buf.trim()) pages.push(buf.trimEnd());

  console.log(`Content pages: ${pages.length}`);

  const base = mdPath.replace(/\.md$/, "");

  // Set fixed viewport for all pages
  await page.setViewport({ width: W, height: H, deviceScaleFactor: SCALE });

  // ── Cover page ──
  const coverHTML = `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{
      width:${W}px;height:${H}px;
      font-family:"PingFang SC","Microsoft YaHei","Noto Sans SC","Heiti SC",sans-serif;
      background:${coverT.bg};color:${coverT.text};
      display:flex;flex-direction:column;justify-content:center;align-items:flex-start;
      text-align:left;padding:40px 60px;position:relative;overflow:hidden;
    }
    .kw{font-size:44px;font-weight:900;letter-spacing:8px;color:${coverT.accent2};margin-bottom:32px;text-transform:uppercase;position:relative;z-index:1}
    .q{font-size:80px;font-weight:900;line-height:1.2;letter-spacing:1px;margin-bottom:0;color:${coverT.accent};position:relative;z-index:1}
    .punch{font-size:150px;font-weight:900;line-height:1;color:${coverT.accent};position:relative;z-index:1;margin:0}
    .tag{font-size:64px;font-weight:900;letter-spacing:10px;color:${coverT.accent2};margin-top:12px;position:relative;z-index:1}
    .bar{width:120px;height:5px;border-radius:2px;background:${coverT.accent};margin-top:6px;position:relative;z-index:1}
  </style></head><body>
    ${coverT.geo}
    <div class="kw">CLAUDE CODE  ×  DEEPSEEK</div>
    <div class="q">你可能根本没在</div>
    <div class="q">Claude Code 开启</div>
    <div class="punch">DeepSeek max</div>
    <div class="tag">两个常见误区</div>
    <div class="bar"></div>
  </body></html>`;

  const coverPath = `${base}_p0.jpg`;
  await page.setContent(coverHTML, { waitUntil: "load", timeout: 15000 });
  await page.screenshot({ path: coverPath, type: "jpeg", quality: 90, clip: { x: 0, y: 0, width: W, height: H } });
  console.log(`  [封面] ${coverPath} (${W}×${H})`);

  // ── Content pages ──
  for (let i = 0; i < pages.length; i++) {
    const bodyHTML = marked.parse(pages[i]);
    const html = wrap(bodyHTML);
    const htmlPath = `${base}_p${i + 1}.html`;
    const jpgPath = `${base}_p${i + 1}.jpg`;

    fs.writeFileSync(htmlPath, html, "utf-8");
    await page.setContent(html, { waitUntil: "load", timeout: 15000 });

    await page.screenshot({
      path: jpgPath,
      type: "jpeg",
      quality: 90,
      clip: { x: 0, y: 0, width: W, height: H }
    });
    console.log(`  [${i + 1}/${pages.length}] ${jpgPath} (${W}×${H})`);
  }

  await browser.close();
  console.log("Done.");
})();
