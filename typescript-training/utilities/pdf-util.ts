import fs from 'fs';
// @ts-ignore
import pdf from 'pdf-parse-fork';

export class PdfUtil {

    //Common method to read data from a PDF file 
    static async readPdf(filePath: string): Promise<string> {

        //Verify whether the pdf file exists. 
        if (!fs.existsSync(filePath)) { //if file not available
            throw new Error(`File not found in the path : ${filePath}`)
        }

        //Read the text and return the same
        return (await pdf(fs.readFileSync(filePath))).text;

    }
}

let pdfText = await PdfUtil.readPdf('./files/Data.pdf');
console.log(pdfText);
console.log(pdfText.includes('How to install Playwright '));