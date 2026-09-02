//test.only() => This annotation will be used to run only a particular test case. 
//test.skip() => This annotation will be used to skip a particular test case. 
//test.fixme() => This annotation will be used to mark a specific test case that needs to be fixed. 
//test.fail() => This annotation will be used to mark a specific test case that is expected to fail. 
//test.slow() => This annotation will represent a slow test case that is going to wait for three times more than the regular wait time. 

import {test, expect} from '@playwright/test';

test.fail('Test Case 1', async ({ page }) => {
    console.log("This is test case 1");
    expect(1).toBe(2);//verify 1 is equal to 2
});

test('Test Case 2', async ({ page }) => {
    test.slow(); // Marking this test case as slow
    console.log("This is test case 2");
    await new Promise(resolve => setTimeout(resolve, 32000)); // Simulating a slow test case with a 32-second delay
});

test('Test Case 3', async ({ page }) => {
    console.log("This is test case 3");
});