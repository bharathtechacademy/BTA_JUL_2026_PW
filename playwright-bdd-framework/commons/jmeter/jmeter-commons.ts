import { exec } from 'child_process';

export class JMeterCommons {

    //Common method to run a command from the command line (cmd)
    runCommand(command: string) :Promise<string> {

          return new Promise((resolve, reject) => {

            exec(command, (error, stdout, stderr) => { //error => Error in the command. , stdout => Output received from the command. , stderr => Error received from the command. 

                if(error){
                    reject(`Error while executing the command ${error.message}`)
                } else{
                    resolve(stdout);
                }
                console.log(`Command executed successfully. : ${command}`)
            })
          })       
    }

    // Common method to run the JMeter test plan 
    async runJmeterTestPlan(testplanName:string): Promise<void>{        

        //Collect and store the JMETER folder structure and each and every file path. 
        const projectRoot = process.cwd();//playwright-tdd-framework
        const jmeterBasePath = `${projectRoot}/step-definitions/load/jmeter`;//Path to Jmeter folder 
        const jmeterToolPath = `${jmeterBasePath}/bin/jmeter.bat`;//Path to the JMETER.bat file to launch JMeter using CMD 
        const jmeterTestPlanPath = `${jmeterBasePath}/testplans/${testplanName}`;//Full path to the JMeter test plan file
        console.log(`Execution started for JMeter test plan. : ${jmeterTestPlanPath}`);

        //Add the folder structure to store the test results. 
        const jmeterResultsPath = `${jmeterBasePath}/results/TestResults_${Date.now()}.csv`;//path to store the JMeter test results
        const jmeterHtmlReport = `${jmeterBasePath}/report-output`;//path to store the JMeter HTML report

        //Construct the command to run the JMeter test plan. 
        const jmeterCommand = `"${jmeterToolPath}" -n -t "${jmeterTestPlanPath}" -l "${jmeterResultsPath}"`;//Command to run the JMeter test plan

        //Run the JMeter test plan using the constructed command.
        console.log(`Execution started for JMeter test plan. : ${testplanName}`);
        await this.runCommand(jmeterCommand);
        console.log(`Execution completed for JMeter test plan. : ${testplanName}`);
        console.log(`JMeter test results stored at: ${jmeterResultsPath}`);
        
        // Generate an HTML report from the test results generated in the CSV file. 
        const jmeterReportCommand = `"${jmeterToolPath}" -g "${jmeterResultsPath}" -o "${jmeterHtmlReport}"`;//Command to generate the HTML report
        await this.runCommand(jmeterReportCommand);
        console.log(`JMeter HTML report generated at: ${jmeterHtmlReport}`);

        
    }

}