//hooks are nothing but the default methods provided by Playwright to add pre and post conditions while executing test cases. 

//1. test.beforeAll() => Will execute once before all the test cases in the file 
//2. test.afterAll() => Will execute once after all the test cases in the file
//3. test.beforeEach() => Will execute before each test case in the file
//4. test.afterEach() => Will execute after each test case in the file


import { test } from '@playwright/test';

//Group of test cases
test.describe('Group1', () => {

    test('Group 1- Test case 1', async ({ page }) => {
        console.log("Group 1-This is test case 1");
    });

    test('Group 1- Test case 2', async ({ page }) => {
        console.log("Group 1-This is test case 2");
    });

    test('Group 1- Test case 3', async ({ page }) => {
        console.log("Group 1-This is test case 3");
    });

});

test.describe('Group2', () => {

    //adding hooks only in group 2

    test.beforeAll(async () => {
        console.log("***********THIS IS BEFORE ALL HOOK***********");
    });

    test.afterAll(async () => {
        console.log("***********THIS IS AFTER ALL HOOK***********");
    });

    test.beforeEach(async () => {
        console.log(">>>>>>>>>>>>>>>>>THIS IS BEFORE EACH HOOK<<<<<<<<<>>>>>>>>>");
    });

    test.afterEach(async () => {
        console.log("<<<<<<<<<<<<<<<<<THIS IS AFTER EACH HOOK>>>>>>>>>>>>>>>");
    });    


    test('Group 2- Test case 1', async ({ page }) => {
        console.log("Group 2-This is test case 1");
    });

    test('Group 2- Test case 2', async ({ page }) => {
        console.log("Group 2-This is test case 2");
    });

    test('Group 2- Test case 3', async ({ page }) => {
        console.log("Group 2-This is test case 3");
    });

});