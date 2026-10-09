import { Given, When, Then } from '@cucumber/cucumber';
import { JMeterCommons } from '../../commons/jmeter/jmeter-commons.ts';


let jmeter: JMeterCommons;

//Given Initialize the Jmeter Utility
Given('Initialize the Jmeter Utility', async () => {
    jmeter = new JMeterCommons();    
});

//Then Run the JMeter test plan "LoadTest.jmx" and publish results
Then('Run the JMeter test plan {string} and publish results', async (testPlan: string) => {
    await jmeter.runJmeterTestPlan(testPlan);
});