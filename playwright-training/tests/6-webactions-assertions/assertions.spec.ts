//Assertions are the default methods provided by Playwright to compare expected result versus actual result. 

//In Playwright, there are two different types of assertions available. 

//1. Hard assertions => Hard assertions will fail the program immediately when there is a mismatch. 
//2. Soft assertions => Continue the program execution even when there is a mismatch and fail at the end of the execution. 


//Syntax for Hard Assertion : expect(actual).toBe(expected);

//Syntax for Soft Assertion : expect.soft(actual).toBe(expected);

import { test, expect } from "@playwright/test";

test.skip('Hard Assertion Example', async ({ page }) => {

    //Navigate to the google page. 
    await page.goto('https://www.google.com');

    //Verify the title of the page
    await expect(page).toHaveTitle('Google2');

    //Verify the current URL populated within the browser. 
    await expect(page).toHaveURL('https://www.google.com');

    console.log("Execution completed successfully. ");
});

test('Soft Assertion Example', async ({ page }) => {

    //Navigate to the google page. 
    await page.goto('https://www.google.com');

    //Verify the title of the page
    await expect.soft(page).toHaveTitle('Google2');

    //Verify the current URL populated within the browser. 
    await expect(page).toHaveURL('https://www.google2.com');

    console.log("Execution completed successfully. ");
});

//By default, Playwright provides multiple default assertion methods for day-to-day validations that you are performing in any applications. 

//expect(element).toBeVisible() : To verify whether the element is visible on the page or not. 
//expect(element).toBeHidden() : To verify whether the element is hidden on the page or not. 
//expect(element).toBeEnabled() : To verify whether the element is enabled on the page or not. 
//expect(element).toBeDisabled() : To verify whether the element is disabled on the page or not. 
//expect(element).toBeChecked() : To verify whether the element (checkbox or radio button) is checked on the page or not. 
//expect(element).toHaveText(text) : To verify whether the element contains the expected text or not. 
//expect(element).toHaveAttribute(attribute, value) : To verify whether the element contains the expected attribute with the expected value or not. 
//expect(page).toHaveURL(url) : To verify whether the current page URL matches the expected URL or not. 
//expect(page).toHaveTitle(title) : To verify whether the current page title matches the expected title or not. 