const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const mdPath = path.join(__dirname, 'Captain_Payment_Gateway_Manual.md');
const htmlPath = path.join(__dirname, 'manual_print.html');
const pdfPath = path.join(__dirname, 'Captain_Payment_Gateway_Manual.pdf');

const mdContent = fs.readFileSync(mdPath, 'utf8');

// Basic markdown to HTML converter for structured documentation
function parseMarkdown(md) {
  let html = md
    // Escape HTML special chars inside code blocks first
    .replace(/```([\s\S]*?)```/g, (match, p1) => {
      const escaped = p1.replace(/</g, '&lt;').replace(/>/g, '&gt;');
      return `<pre class="code-block"><code>${escaped}</code></pre>`;
    })
    // Headers
    .replace(/^# (.*$)/gim, '<h1 class="doc-title">$1</h1>')
    .replace(/^## (.*$)/gim, '<h2 class="section-title">$1</h2>')
    .replace(/^### (.*$)/gim, '<h3 class="sub-title">$1</h3>')
    .replace(/^#### (.*$)/gim, '<h4 class="sub2-title">$1</h4>')
    // Images
    .replace(/!\[(.*?)\]\((.*?)\)/gim, '<div class="img-box"><img src="$2" alt="$1" /><p class="caption">$1</p></div>')
    // Bold & Italic
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    // Horizontal Rule
    .replace(/^---$/gim, '<hr class="divider" />')
    // Blockquotes
    .replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>')
    // Unordered lists
    .replace(/^\* (.*$)/gim, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/gim, '<ul>$1</ul>')
    // Paragraphs
    .replace(/^\s*(\n)?(.+)/gim, function(m){
      return /\<(\/)?(h1|h2|h3|h4|ul|ol|li|blockquote|pre|img|div|hr|table|tr|th|td)/.test(m) ? m : '<p>'+m+'</p>';
    });

  return html;
}

const bodyHtml = parseMarkdown(mdContent);

const fullHtml = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Captain Crypto Payment Gateway Manual</title>
  <style>
    @page {
      size: A4;
      margin: 18mm 15mm 20mm 15mm;
      @bottom-right {
        content: counter(page);
      }
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
      line-height: 1.6;
      font-size: 11pt;
      background: #ffffff;
      margin: 0;
      padding: 0;
    }
    .doc-title {
      font-size: 24pt;
      font-weight: 800;
      color: #0f172a;
      border-bottom: 3px solid #06b6d4;
      padding-bottom: 8px;
      margin-top: 10px;
      margin-bottom: 15px;
    }
    .section-title {
      font-size: 16pt;
      font-weight: 700;
      color: #0f172a;
      border-bottom: 1.5px solid #e2e8f0;
      padding-bottom: 6px;
      margin-top: 28px;
      page-break-after: avoid;
    }
    .sub-title {
      font-size: 12.5pt;
      font-weight: 600;
      color: #0369a1;
      margin-top: 18px;
      margin-bottom: 6px;
      page-break-after: avoid;
    }
    .sub2-title {
      font-size: 11pt;
      font-weight: 600;
      color: #334155;
      margin-top: 12px;
      margin-bottom: 4px;
    }
    p {
      margin: 8px 0;
      text-align: justify;
    }
    strong {
      color: #0f172a;
    }
    ul {
      margin: 6px 0 12px 20px;
      padding: 0;
    }
    li {
      margin-bottom: 4px;
    }
    .divider {
      border: 0;
      height: 1px;
      background: #e2e8f0;
      margin: 20px 0;
    }
    .code-block {
      background: #0f172a;
      color: #38bdf8;
      padding: 12px 14px;
      border-radius: 8px;
      font-family: "Consolas", "Courier New", monospace;
      font-size: 9.5pt;
      overflow-x: auto;
      margin: 12px 0;
      page-break-inside: avoid;
    }
    .img-box {
      margin: 16px 0;
      text-align: center;
      page-break-inside: avoid;
    }
    .img-box img {
      max-width: 95%;
      height: auto;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    .caption {
      font-size: 9pt;
      color: #64748b;
      font-style: italic;
      margin-top: 4px;
      text-align: center;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 14px 0;
      font-size: 9.5pt;
      page-break-inside: avoid;
    }
    th, td {
      border: 1px solid #cbd5e1;
      padding: 8px 10px;
      text-align: left;
    }
    th {
      background: #f1f5f9;
      font-weight: 600;
      color: #0f172a;
    }
    tr:nth-child(even) {
      background: #f8fafc;
    }
    blockquote {
      border-left: 4px solid #06b6d4;
      background: #f0fdf4;
      padding: 8px 14px;
      margin: 12px 0;
      border-radius: 0 8px 8px 0;
      font-size: 10pt;
    }
  </style>
</head>
<body>
  ${bodyHtml}
</body>
</html>`;

fs.writeFileSync(htmlPath, fullHtml, 'utf8');
console.log('HTML generated at:', htmlPath);

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const cmd = `"${chromePath}" --headless --disable-gpu --print-to-pdf="${pdfPath}" --no-pdf-header-footer "${htmlPath}"`;

console.log('Generating PDF via headless Chrome...');
execSync(cmd, { stdio: 'inherit' });

if (fs.existsSync(pdfPath)) {
  const stats = fs.statSync(pdfPath);
  console.log(`PDF created successfully: ${pdfPath} (${stats.size} bytes)`);
} else {
  console.error('PDF generation failed');
}

