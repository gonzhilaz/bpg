const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

function parseMarkdownToHtml(md, title) {
  let html = md
    // Code blocks
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
    .replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>');

  // Convert Markdown Tables
  const lines = html.split('\n');
  let inTable = false;
  let tableRows = [];
  let processedLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('|') && line.endsWith('|')) {
      // Check if separator line
      if (line.match(/^\|(\s*:?-+:?\s*\|)+$/)) {
        continue;
      }
      inTable = true;
      const cells = line
        .split('|')
        .slice(1, -1)
        .map((c) => c.trim());
      tableRows.push(cells);
    } else {
      if (inTable) {
        // Output accumulated table
        if (tableRows.length > 0) {
          let tableHtml = '<div class="table-wrapper"><table>\n<thead><tr>';
          tableRows[0].forEach((h) => {
            tableHtml += `<th>${h}</th>`;
          });
          tableHtml += '</tr></thead>\n<tbody>';
          for (let r = 1; r < tableRows.length; r++) {
            tableHtml += '<tr>';
            tableRows[r].forEach((c) => {
              tableHtml += `<td>${c}</td>`;
            });
            tableHtml += '</tr>\n';
          }
          tableHtml += '</tbody></table></div>\n';
          processedLines.push(tableHtml);
        }
        inTable = false;
        tableRows = [];
      }

      // Process lists or paragraphs
      if (line.startsWith('* ')) {
        processedLines.push(`<li>${line.substring(2)}</li>`);
      } else if (line.match(/^\d+\.\s+/)) {
        processedLines.push(`<li>${line.replace(/^\d+\.\s+/, '')}</li>`);
      } else if (line.length > 0) {
        if (!line.match(/^<(h1|h2|h3|h4|div|hr|blockquote|pre|code|table|thead|tbody|tr|th|td)/)) {
          processedLines.push(`<p>${line}</p>`);
        } else {
          processedLines.push(line);
        }
      }
    }
  }

  if (inTable && tableRows.length > 0) {
    let tableHtml = '<div class="table-wrapper"><table>\n<thead><tr>';
    tableRows[0].forEach((h) => {
      tableHtml += `<th>${h}</th>`;
    });
    tableHtml += '</tr></thead>\n<tbody>';
    for (let r = 1; r < tableRows.length; r++) {
      tableHtml += '<tr>';
      tableRows[r].forEach((c) => {
        tableHtml += `<td>${c}</td>`;
      });
      tableHtml += '</tr>\n';
    }
    tableHtml += '</tbody></table></div>\n';
    processedLines.push(tableHtml);
  }

  let finalBody = processedLines.join('\n');
  finalBody = finalBody.replace(/(<li>.*?<\/li>\s*)+/gs, (match) => `<ul>${match}</ul>`);

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    @page {
      size: A4;
      margin: 16mm 14mm 18mm 14mm;
      @bottom-right {
        content: counter(page);
      }
    }
    * {
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #0f172a;
      line-height: 1.55;
      font-size: 10pt;
      background: #ffffff;
      margin: 0;
      padding: 0;
    }
    .doc-title {
      font-size: 20pt;
      font-weight: 800;
      color: #0f172a;
      border-bottom: 3px solid #0284c7;
      padding-bottom: 6px;
      margin-top: 5px;
      margin-bottom: 12px;
      letter-spacing: -0.5px;
    }
    .section-title {
      font-size: 14pt;
      font-weight: 700;
      color: #0369a1;
      border-bottom: 1.5px solid #e2e8f0;
      padding-bottom: 5px;
      margin-top: 24px;
      margin-bottom: 10px;
      page-break-after: avoid;
      break-after: avoid;
    }
    .sub-title {
      font-size: 11.5pt;
      font-weight: 600;
      color: #0f172a;
      margin-top: 14px;
      margin-bottom: 6px;
      page-break-after: avoid;
      break-after: avoid;
    }
    .sub2-title {
      font-size: 10.5pt;
      font-weight: 600;
      color: #334155;
      margin-top: 10px;
      margin-bottom: 4px;
      page-break-after: avoid;
      break-after: avoid;
    }
    p {
      margin: 6px 0;
      text-align: justify;
    }
    strong {
      color: #0f172a;
    }
    ul, ol {
      margin: 6px 0 10px 18px;
      padding: 0;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    li {
      margin-bottom: 4px;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .divider {
      border: 0;
      height: 1px;
      background: #e2e8f0;
      margin: 16px 0;
    }
    .code-block {
      background: #091e42;
      color: #38bdf8;
      padding: 10px 12px;
      border-radius: 8px;
      font-family: "Consolas", "Courier New", monospace;
      font-size: 8.5pt;
      overflow-x: auto;
      margin: 10px 0;
      page-break-inside: avoid;
      break-inside: avoid;
      border: 1px solid #1e293b;
    }
    .table-wrapper {
      margin: 12px 0;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 8.5pt;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    th, td {
      border: 1px solid #cbd5e1;
      padding: 6px 8px;
      text-align: left;
      vertical-align: top;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    th {
      background: #f1f5f9;
      font-weight: 700;
      color: #0f172a;
    }
    tr:nth-child(even) {
      background: #f8fafc;
    }
    blockquote {
      border-left: 3.5px solid #0284c7;
      background: #f0f9ff;
      padding: 8px 12px;
      margin: 10px 0;
      border-radius: 0 6px 6px 0;
      font-size: 9.5pt;
      color: #0369a1;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .img-box {
      margin: 14px 0;
      text-align: center;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .img-box img {
      max-width: 90%;
      height: auto;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.06);
    }
    .caption {
      font-size: 8.5pt;
      color: #64748b;
      margin-top: 4px;
      font-style: italic;
    }
  </style>
</head>
<body>
  ${finalBody}
</body>
</html>`;
}

const docs = [
  {
    name: 'Technical Specification Document (TSD)',
    md: '13C_Technical_Specification_Document.md',
    html: '13C_Technical_Specification_Document.html',
    pdf: '13C_Technical_Specification_Document.pdf',
    title: '13C Payment Gateway - Technical Specification Document (TSD)',
  },
  {
    name: 'Functional Specification Document (FSD)',
    md: '13C_Functional_Specification_Document.md',
    html: '13C_Functional_Specification_Document.html',
    pdf: '13C_Functional_Specification_Document.pdf',
    title: '13C Payment Gateway - Functional Specification Document (FSD)',
  },
  {
    name: 'UAT Test Matrix & RAG Report',
    md: '13C_UAT_Test_Matrix.md',
    html: '13C_UAT_Test_Matrix.html',
    pdf: '13C_UAT_Test_Matrix.pdf',
    title: '13C Payment Gateway - UAT Test Matrix & RAG Report',
  },
  {
    name: 'User Operational Manual & Integration Guide',
    md: '13C_Payment_Gateway_Manual.md',
    html: 'manual_print.html',
    pdf: '13C_Payment_Gateway_Manual.pdf',
    title: '13C Payment Gateway - Panduan Operasional Resmi',
  },
];

console.log('--- Compiling Enterprise Professional Documentation Suite ---');

docs.forEach((doc) => {
  const mdPath = path.resolve(__dirname, doc.md);
  const htmlPath = path.resolve(__dirname, doc.html);
  const pdfPath = path.resolve(__dirname, doc.pdf);

  if (!fs.existsSync(mdPath)) {
    console.warn(`File not found: ${mdPath}`);
    return;
  }

  const mdContent = fs.readFileSync(mdPath, 'utf8');
  const htmlContent = parseMarkdownToHtml(mdContent, doc.title);
  fs.writeFileSync(htmlPath, htmlContent, 'utf8');

  const cmd = `"${chromePath}" --headless=new --disable-gpu --run-all-compositor-stages-before-draw --print-to-pdf="${pdfPath}" --no-pdf-header-footer "${htmlPath}"`;
  try {
    execSync(cmd, { stdio: 'ignore' });
    if (fs.existsSync(pdfPath)) {
      const stats = fs.statSync(pdfPath);
      console.log(`[SUCCESS] ${doc.name} -> ${doc.pdf} (${stats.size} bytes)`);
    } else {
      console.error(`[ERROR] PDF not generated: ${doc.pdf}`);
    }
  } catch (err) {
    console.error(`[ERROR] Failed to compile ${doc.name}: ${err.message}`);
  }
});

console.log('--- Compilation Completed ---');
