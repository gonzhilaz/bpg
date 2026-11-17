const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const htmlPath = path.resolve(__dirname, '13C_Pitch_Deck_Summary.html');
const pdfPath = path.resolve(__dirname, '13C_Pitch_Deck_Summary.pdf');

// Note: Use chrome headless with --no-pdf-header-footer
const cmd = `"${chromePath}" --headless=new --disable-gpu --run-all-compositor-stages-before-draw --print-to-pdf="${pdfPath}" --no-pdf-header-footer "${htmlPath}"`;
console.log('Executing:', cmd);
try {
  execSync(cmd, { stdio: 'inherit' });
  if (fs.existsSync(pdfPath)) {
    const stats = fs.statSync(pdfPath);
    console.log(`Success! PDF generated at: ${pdfPath} (${stats.size} bytes)`);
  } else {
    console.error('PDF file does not exist after command execution.');
  }
} catch (err) {
  console.error('Error executing Chrome:', err.message);
}
