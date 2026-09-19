# Playwright TDD framework design - step by step 

## 1. Creating a local working directory within the workspace 
* Example: playwright-tdd-framework (local working directory)
* terminal-command : cd C:\Training\PlaywrightTrainings\July_2026\playwright-tdd-framework

## 2. Install necessary dependencies based on the project requirements. 
1. **TypeScript** — `npm install typescript ts-node @types/node` and `npx tsc --init` (tsconfig.json) for programming language support.
2. **Playwright** — `npm init playwright@latest` for web / API automation with the Playwright.
3. **PostgreSQL** — `npm install pg @types/pg` to connect to a database and perform db validations
4. **Excel** — `npm install excel xlsx` to read or work with spreadsheet data.
5. **PDF** — `npm install pdf-parse-new` for PDF utilities.

## 3. Update the global configurations at the project level within the package.json and tsconfig.json files
* package.json => "type":"module"  //To import data or methods from other files into the current 
* tsconfig.json =>"types": ["node"] //Include the node.js type definitions in this current project. 
* tsconfig.json =>"allowImportingTsExtensions": true //While importing the files, allow files with a TypeScript extension also. 
* tsconfig.json =>"noEmit": true //Whenever I am going to import TypeScript files during the execution, don't emit any .js files. Silently run all the TypeScript programs. 
* tsconfig.json =>"verbatimModuleSyntax": false  //TypeScript can remove type-only imports during the compilation. 

## 4. Creating the folder structure to maintain different components of the framework 

1. commons => To maintain all the common methods related to UI (commons\ui\web-commons.ts), API (commons\api\api-commons.ts), database (commons\db\db-commons.ts), and performance testing (commons\jmeter\jmeter-commons.ts), and of course AI-related (commons\ai\ai-commons.ts) common methods at one place 

2. config => config.json File 2: Maintain all the configurations like urls's , connection details related to UI, API, database, etc. 

3. testdata => To maintain test data related to each and every component like UI (testdata\ui\data.json), API (testdata\api\data.json), database(testdata\db\data.json), AI(testdata\ai\data.json), and performance testing 

4. utilities => To maintain the common methods related to different types of utilities we are going to use in our framework based on our application needs (for example, Excel utility, PDF utility, etc.) 

5. page-objects => We will maintain page-wise locators (page-objects\page-elements) and page-wise common methods (page-objects\page-steps) separately to implement the page object model design pattern within the framework. 

6. tests => To maintain all the test cases related to each and every component, like UI, API, database, performance testing, AI, etc. 

7. .env => To maintain environment-specific data, credentials, and secrets that we need to maintain locally 

8. test-results => To maintain all the test result reports along with videos, traces, etc., related to test execution 

9. test-results/screenshots => Maintain all the screenshots related to your test execution. 

10. files => To maintain the flat files like Excel, PDF, images, etc.  

