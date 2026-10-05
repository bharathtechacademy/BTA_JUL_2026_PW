import { test } from '@playwright/test';
import { JMeterCommons } from '../../commons/jmeter/jmeter-commons.js';

test.describe('Load Tests', () => {

    let jmeter : JMeterCommons;

    test.beforeEach(() => {
        jmeter = new JMeterCommons();
    });

    test('Validate GitHub API request performance. ', async () => {        
        const testplan = "LoadTest.jmx";
        await jmeter.runJmeterTestPlan(testplan);
    });



});