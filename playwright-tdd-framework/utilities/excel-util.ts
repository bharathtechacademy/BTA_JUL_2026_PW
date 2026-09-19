import fs from 'fs';
import xlsx from 'xlsx';

export class ExcelUtil {

    static readExcel(filePath : string, sheetName:string ){

        //Verify whether the excel file exists. 
        if(!fs.existsSync(filePath)){ //if file not available
            throw new Error (`File not found in the path : ${filePath}`)
        }

        //Read the workbook from the Excel file. 
        const workbook = xlsx.readFile(filePath);

        //Get the specific sheet from the workbook. 
        const sheet = workbook.Sheets[sheetName];

        //Verify whether the sheet exists in the workbook. 
        if(!sheet){
            throw new Error (`Sheet not found in the excel with name : ${sheetName}`)
        }

        return xlsx.utils.sheet_to_json(sheet);

    }
}

let data = ExcelUtil.readExcel("./files/TestData.xlsx","Sheet1");
console.log(data[3]["Phone"]);