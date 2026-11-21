const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

function parseMarkdownToHtml(md, title) {
  const mermaidBlocks = [];
  const codeBlocks = [];

  // Protect Mermaid and code blocks with placeholders
  let text = md
    .replace(/```mermaid([\s\S]*?)```/g, (match, p1) => {
      const idx = mermaidBlocks.length;
      mermaidBlocks.push(p1.trim());
      return `\n__MERMAID_BLOCK_${idx}__\n`;
    })
    .replace(/```([\s\S]*?)```/g, (match, p1) => {
      const idx = codeBlocks.length;
      codeBlocks.push(p1.trim());
      return `\n__CODE_BLOCK_${idx}__\n`;
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

  // Convert Tables, Lists, and Paragraphs
  const lines = text.split('\n');
  let inTable = false;
  let tableRows = [];
  let processedLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('|') && line.endsWith('|')) {
      if (line.match(/^\|(\s*:?-+:?\s*\|)+$/)) continue;
      inTable = true;
      const cells = line.split('|').slice(1, -1).map((c) => c.trim());
      tableRows.push(cells);
    } else {
      if (inTable && tableRows.length > 0) {
        let tableHtml = '<div class="table-wrapper"><table>\n<thead><tr>';
        tableRows[0].forEach((h) => { tableHtml += `<th>${h}</th>`; });
        tableHtml += '</tr></thead>\n<tbody>';
        for (let r = 1; r < tableRows.length; r++) {
          tableHtml += '<tr>';
          tableRows[r].forEach((c) => { tableHtml += `<td>${c}</td>`; });
          tableHtml += '</tr>\n';
        }
        tableHtml += '</tbody></table></div>\n';
        processedLines.push(tableHtml);
        inTable = false;
        tableRows = [];
      }

      if (line.startsWith('__MERMAID_BLOCK_') || line.startsWith('__CODE_BLOCK_')) {
        processedLines.push(line);
      } else if (line.startsWith('* ')) {
        processedLines.push(`<li>${line.substring(2)}</li>`);
      } else if (line.match(/^\d+\.\s+/)) {
        processedLines.push(`<li>${line.replace(/^\d+\.\s+/, '')}</li>`);
      } else if (line.length > 0) {
        if (!line.match(/^<(h1|h2|h3|h4|div|hr|blockquote|table|thead|tbody|tr|th|td)/)) {
          processedLines.push(`<p>${line}</p>`);
        } else {
          processedLines.push(line);
        }
      }
    }
  }

  if (inTable && tableRows.length > 0) {
    let tableHtml = '<div class="table-wrapper"><table>\n<thead><tr>';
    tableRows[0].forEach((h) => { tableHtml += `<th>${h}</th>`; });
    tableHtml += '</tr></thead>\n<tbody>';
    for (let r = 1; r < tableRows.length; r++) {
      tableHtml += '<tr>';
      tableRows[r].forEach((c) => { tableHtml += `<td>${c}</td>`; });
      tableHtml += '</tr>\n';
    }
    tableHtml += '</tbody></table></div>\n';
    processedLines.push(tableHtml);
  }

  let finalBody = processedLines.join('\n');
  finalBody = finalBody.replace(/(<li>.*?<\/li>\s*)+/gs, (match) => `<ul>${match}</ul>`);

  // Restore protected blocks
  mermaidBlocks.forEach((code, idx) => {
    finalBody = finalBody.replace(
      `__MERMAID_BLOCK_${idx}__`,
      `<div class="mermaid-diagram"><div class="mermaid">\n${code}\n</div></div>`
    );
  });
  codeBlocks.forEach((code, idx) => {
    const escaped = code.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    finalBody = finalBody.replace(
      `__CODE_BLOCK_${idx}__`,
      `<pre class="code-block"><code>${escaped}</code></pre>`
    );
  });

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <script src="mermaid.min.js"></script>
  <script>
    mermaid.initialize({
      startOnLoad: true,
      theme: 'default',
      securityLevel: 'loose',
      flowchart: { useMaxWidth: true, htmlLabels: true, curve: 'basis' }
    });
  </script>
  <style>
    @page {
      size: A4;
      margin: 16mm 14mm 18mm 14mm;
      @bottom-right { content: counter(page); }
    }
    * { box-sizing: border-box; }
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
    p { margin: 6px 0; text-align: justify; }
    strong { color: #0f172a; }
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
    .mermaid-diagram {
      margin: 14px 0;
      padding: 14px 10px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      text-align: center;
      page-break-inside: avoid;
      break-inside: avoid;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    }
    .mermaid {
      display: flex;
      justify-content: center;
      margin: 0 auto;
    }
    .mermaid svg {
      max-width: 95% !important;
      height: auto !important;
      max-height: 480px;
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
    th { background: #f1f5f9; font-weight: 700; color: #0f172a; }
    tr:nth-child(even) { background: #f8fafc; }
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

console.log('--- Compiling Enterprise Professional Documentation Suite with Vector Diagrams ---');

// Auto-assemble modular manual files if manual/ directory exists
const manualDir = path.resolve(__dirname, 'manual');
if (fs.existsSync(manualDir)) {
  const manualFiles = fs.readdirSync(manualDir)
    .filter((f) => f.endsWith('.md'))
    .sort();
  console.log(`[INFO] Assembling 13C_Payment_Gateway_Manual.md from ${manualFiles.length} modular chapters in manual/...`);
  const combinedManual = manualFiles
    .map((f) => fs.readFileSync(path.join(manualDir, f), 'utf8'))
    .join('\n\n');
  fs.writeFileSync(path.resolve(__dirname, '13C_Payment_Gateway_Manual.md'), combinedManual, 'utf8');
}

docs.forEach((doc) => {
  const mdPath = path.resolve(__dirname, doc.md);
  const htmlPath = path.resolve(__dirname, doc.html);
  const pdfPath = path.resolve(__dirname, doc.pdf);
  const tempHtmlPath = path.resolve(__dirname, `temp_${doc.html}`);

  if (!fs.existsSync(mdPath)) {
    console.warn(`File not found: ${mdPath}`);
    return;
  }

  const mdContent = fs.readFileSync(mdPath, 'utf8');
  const initialHtml = parseMarkdownToHtml(mdContent, doc.title);
  const hasMermaid = initialHtml.includes('class="mermaid"');

  if (hasMermaid) {
    // Stage 1: Render Mermaid diagrams into static SVG using Chrome DOM dump
    fs.writeFileSync(tempHtmlPath, initialHtml, 'utf8');
    try {
      const dumpCmd = `"${chromePath}" --headless=new --disable-gpu --virtual-time-budget=3000 --dump-dom "${tempHtmlPath}"`;
      const renderedDom = execSync(dumpCmd, { encoding: 'utf8', maxBuffer: 15 * 1024 * 1024 });
      fs.writeFileSync(htmlPath, renderedDom, 'utf8');
      if (fs.existsSync(tempHtmlPath)) fs.unlinkSync(tempHtmlPath);
    } catch (err) {
      console.warn(`[WARN] Mermaid rendering fallback for ${doc.name}: ${err.message}`);
      fs.writeFileSync(htmlPath, initialHtml, 'utf8');
    }
  } else {
    fs.writeFileSync(htmlPath, initialHtml, 'utf8');
  }

  // Stage 2: Print rendered HTML with vector SVGs directly to PDF
  const printCmd = `"${chromePath}" --headless=new --disable-gpu --run-all-compositor-stages-before-draw --print-to-pdf="${pdfPath}" --no-pdf-header-footer "${htmlPath}"`;
  try {
    execSync(printCmd, { stdio: 'ignore' });
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

console.log('--- Compilation Completed Successfully ---');
