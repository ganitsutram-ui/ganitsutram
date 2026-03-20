const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth');
const pdfParse = require('pdf-parse');

const archiveDir = path.join(__dirname, '..');

async function extract() {
    console.log("--- Starting Extraction ---");
    
    // 1. DOCX
    try {
        const docPath = path.join(archiveDir, 'GanitSutram_FINAL_v17.docx');
        const docResult = await mammoth.extractRawText({path: docPath});
        const docText = docResult.value;
        const wordCount = docText.split(/\s+/).length;
        console.log(`\nDocument: GanitSutram_FINAL_v17.docx`);
        console.log(`Length: ${wordCount} words`);
        console.log(`First 500 chars: ${docText.substring(0, 500).replace(/\n/g, ' ')}...`);
    } catch (e) {
        console.error("Error DOCX:", e.message);
    }

    // 2. PDF 1
    try {
        const pdf1Path = path.join(archiveDir, 'The_Golden_Thread_of_Computations (1).pdf');
        const pdf1Buffer = fs.readFileSync(pdf1Path);
        const pdf1Result = await pdfParse(pdf1Buffer);
        const pdf1Text = pdf1Result.text;
        const pdf1WordCount = pdf1Text.split(/\s+/).length;
        console.log(`\nDocument: The_Golden_Thread_of_Computations (1).pdf`);
        console.log(`Length: ${pdf1WordCount} words, ${pdf1Result.numpages} pages`);
        console.log(`First 500 chars: ${pdf1Text.substring(0, 500).replace(/\n/g, ' ')}...`);
    } catch (e) {
        console.error("Error PDF 1:", e.message);
    }

    // 3. PDF 2
    try {
        const pdf2Path = path.join(archiveDir, 'Vedic_Math_Architecture.pdf');
        const pdf2Buffer = fs.readFileSync(pdf2Path);
        const pdf2Result = await pdfParse(pdf2Buffer);
        const pdf2Text = pdf2Result.text;
        const pdf2WordCount = pdf2Text.split(/\s+/).length;
        console.log(`\nDocument: Vedic_Math_Architecture.pdf`);
        console.log(`Length: ${pdf2WordCount} words, ${pdf2Result.numpages} pages`);
        console.log(`First 500 chars: ${pdf2Text.substring(0, 500).replace(/\n/g, ' ')}...`);
    } catch (e) {
        console.error("Error PDF 2:", e.message);
    }
}

extract();
