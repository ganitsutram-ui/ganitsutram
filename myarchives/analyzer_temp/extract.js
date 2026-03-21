const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth');
const pdfParse = require('pdf-parse');

const archiveDir = path.join(__dirname, '..');
const outputDir = __dirname;

async function extract() {
    console.log("--- Starting Full Extraction ---");
    
    // 1. DOCX
    try {
        const docPath = path.join(archiveDir, 'GanitSutram_FINAL_v17.docx');
        const docResult = await mammoth.extractRawText({path: docPath});
        const docText = docResult.value;
        fs.writeFileSync(path.join(outputDir, 'GanitSutram_Manuscript.txt'), docText);
        console.log(`\nDocument: GanitSutram_FINAL_v17.docx -> GanitSutram_Manuscript.txt`);
        console.log(`Length: ${docText.split(/\s+/).length} words`);
    } catch (e) {
        console.error("Error DOCX:", e.message);
    }

    // 2. PDF 1
    try {
        const pdf1Path = path.join(archiveDir, 'The_Golden_Thread_of_Computations (1).pdf');
        const pdf1Buffer = fs.readFileSync(pdf1Path);
        const pdf1Result = await pdfParse(pdf1Buffer);
        const pdf1Text = pdf1Result.text;
        fs.writeFileSync(path.join(outputDir, 'Golden_Thread.txt'), pdf1Text);
        console.log(`\nDocument: The_Golden_Thread_of_Computations (1).pdf -> Golden_Thread.txt`);
        console.log(`Length: ${pdf1Text.split(/\s+/).length} words`);
    } catch (e) {
        console.error("Error PDF 1:", e.message);
    }

    // 3. PDF 2
    try {
        const pdf2Path = path.join(archiveDir, 'Vedic_Math_Architecture.pdf');
        const pdf2Buffer = fs.readFileSync(pdf2Path);
        const pdf2Result = await pdfParse(pdf2Buffer);
        const pdf2Text = pdf2Result.text;
        fs.writeFileSync(path.join(outputDir, 'Vedic_Math_Architecture.txt'), pdf2Text);
        console.log(`\nDocument: Vedic_Math_Architecture.pdf -> Vedic_Math_Architecture.txt`);
        console.log(`Length: ${pdf2Text.split(/\s+/).length} words`);
    } catch (e) {
        console.error("Error PDF 2:", e.message);
    }
}

extract();
