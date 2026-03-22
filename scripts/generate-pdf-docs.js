/*
Ganitsutram | AITDL Network © 2026 | Vikram Samvat 2083
Author: Jawahar R Mallah
Website: https://www.aitdl.com
Contact: aitdlnetwork@outlook.com | jawahar.mallah@gmail.com
*/

/* 
Project: GanitSūtram
Author: Jawahar R Mallah
Company: AITDL | aitdl.com
Date: VS 2082 | 2026-03-08
*/

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const MD_SOURCE = path.join(__dirname, '..', 'docs', 'GanitSutram-Technical-Documentation.md');
const PDF_OUTPUT = path.join(__dirname, '..', 'docs', 'GanitSutram-Technical-Documentation-v1.0.pdf');
const CSS_PATH = path.join(__dirname, '..', 'docs', 'pdf-css.css');

// 1. Prepare Cover Page HTML
const coverHtml = `
<div class="cover-page">
  <div style="position: absolute; top: 2.5cm; left: 2.5cm; font-size: 10pt; color: #ffffff; opacity: 0.8;">
    AITDL | aitdl.com
  </div>

  <div class="cover-sanskrit">गणितसूत्रम्</div>
  <h1 class="cover-title">GanitSūtram</h1>
  <div class="cover-subtitle">Complete Technical Documentation</div>
  
  <div class="cover-divider"></div>
  
  <div style="font-size: 14pt; margin-bottom: 0.5em;">Version: v1.0</div>
  <div style="font-size: 16pt; font-style: italic; color: #ffb300;">"Ancient Mathematics. Modern Platform."</div>

  <div style="position: absolute; bottom: 2.5cm; width: 100%; text-align: center;">
    <div style="font-size: 12pt; margin-bottom: 0.3em;">Author: Jawahar R Mallah</div>
    <div style="font-size: 12pt; margin-bottom: 0.3em;">Organisation: AITDL | aitdl.com</div>
    <div style="font-size: 11pt; margin-bottom: 0.3em;">Vikram Samvat: VS 2082 | Gregorian: 2026-03-08</div>
    <div style="font-size: 9pt; opacity: 0.6; margin-top: 1em;">Confidential — All Rights Reserved</div>
  </div>
</div>

<div style="page-break-after: always;"></div>
`;

// 2. Read existing content and prepend cover
let content = fs.readFileSync(MD_SOURCE, 'utf8');

// If the content already has a cover, we replace it or just ensure we don't double it.
// For this script, we'll assume we are creating a fresh final version.
const finalMarkdown = coverHtml + content;

const TEMP_MD = path.join(__dirname, '..', 'docs', 'temp_doc.md');
fs.writeFileSync(TEMP_MD, finalMarkdown, 'utf8');

// 3. Generate PDF using md-to-pdf
console.log('[PDF Gen] Starting professional documentation generation...');

try {
  // Ensure dependencies
  // execSync('npm install --no-save md-to-pdf', { stdio: 'inherit' });

  const config = {
    stylesheet: [CSS_PATH],
    pdf_options: {
      format: 'A4',
      margin: {
        top: '2.5cm',
        bottom: '2.5cm',
        left: '2.5cm',
        right: '2.5cm'
      },
      displayHeaderFooter: true,
      headerTemplate: `
        <div style="font-family: 'Helvetica', sans-serif; font-size: 8pt; width: 100%; padding: 0 2.5cm; display: flex; justify-content: space-between; color: #666;">
          <span>GanitSūtram | AITDL</span>
          <span class="title"></span>
        </div>
      `,
      footerTemplate: `
        <div style="font-family: 'Helvetica', sans-serif; font-size: 8pt; width: 100%; padding: 0 2.5cm; display: flex; justify-content: space-between; color: #666;">
          <div style="flex: 1; text-align: center;"><span class="pageNumber"></span></div>
          <div style="flex: 1; text-align: right;">© GanitSūtram | AITDL | aitdl.com</div>
        </div>
      `
    }
  };

  const configPath = path.join(__dirname, '..', 'docs', 'pdf-config.json');
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

  console.log('[PDF Gen] Running md-to-pdf...');
  // We use npx to ensure it's available without global install
  execSync(`npx md-to-pdf "${TEMP_MD}" --config-file "${configPath}"`, { stdio: 'inherit' });

  // Rename temp output to final
  const tempPdf = TEMP_MD.replace('.md', '.pdf');
  if (fs.existsSync(tempPdf)) {
    // Delete existing PDF if it exists to avoid EPERM on Windows
    if (fs.existsSync(PDF_OUTPUT)) {
      try {
        fs.unlinkSync(PDF_OUTPUT);
      } catch (delErr) {
        console.warn(`[PDF Gen] Warning: Could not delete existing PDF, attempt to overwrite: ${delErr.message}`);
      }
    }
    fs.renameSync(tempPdf, PDF_OUTPUT);
    console.log(`[PDF Gen] SUCCESS! Documentation generated at: ${PDF_OUTPUT}`);
  }

  // Cleanup
  fs.unlinkSync(TEMP_MD);
  fs.unlinkSync(configPath);

} catch (err) {
  console.error('[PDF Gen] FAILED:', err.message);
  process.exit(1);
}
