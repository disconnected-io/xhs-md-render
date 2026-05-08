const { marked } = require("marked");
const puppeteer = require("puppeteer-core");
const fs = require("fs");

const mdPath = process.argv[2];
if (!mdPath) { console.error("Usage: node render.js <markdown-file>"); process.exit(1); }

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
      background:#fdf8f0;
      display:flex;flex-direction:column;justify-content:center;align-items:flex-start;
      text-align:left;padding:40px 60px;position:relative;overflow:hidden;
    }
    .geo1{
      position:absolute;width:300px;height:300px;border-radius:50%;
      border:3px solid rgba(212,68,68,0.10);
      top:-80px;right:-80px;
    }
    .geo2{
      position:absolute;width:200px;height:200px;border-radius:50%;
      border:3px solid rgba(199,91,32,0.08);
      bottom:-60px;right:120px;
    }
    .geo3{
      position:absolute;width:80px;height:80px;border-radius:50%;
      background:rgba(212,68,68,0.05);
      top:45%;right:60px;
    }
    .geo4{
      position:absolute;width:14px;height:14px;border-radius:50%;
      background:rgba(199,91,32,0.2);
      top:120px;right:180px;
    }
    .geo5{
      position:absolute;width:8px;height:8px;border-radius:50%;
      background:rgba(212,68,68,0.15);
      bottom:200px;right:100px;
    }
    .line1{
      position:absolute;width:100px;height:2px;
      background:rgba(212,68,68,0.1);
      top:160px;right:140px;transform:rotate(-25deg);
    }
    .kw{
      font-size:44px;font-weight:900;letter-spacing:8px;color:#c75b20;
      margin-bottom:32px;text-transform:uppercase;position:relative;z-index:1;
    }
    .q{
      font-size:80px;font-weight:900;line-height:1.2;letter-spacing:1px;
      margin-bottom:0;color:#d44444;position:relative;z-index:1;
    }
    .punch{
      font-size:150px;font-weight:900;line-height:1;
      color:#cc3333;position:relative;z-index:1;
      margin:0;
    }
    .tag{
      font-size:64px;font-weight:900;letter-spacing:10px;
      color:#c75b20;margin-top:12px;position:relative;z-index:1;
    }
    .bar{
      width:120px;height:5px;border-radius:2px;
      background:#d44444;
      margin-top:6px;position:relative;z-index:1;
    }
  </style></head><body>
    <div class="geo1"></div><div class="geo2"></div><div class="geo3"></div>
    <div class="geo4"></div><div class="geo5"></div>
    <div class="line1"></div>
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
