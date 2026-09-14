//Handling browser windows 

import { test, expect} from '@playwright/test';

test('Handling new window ', async ({page}) => {

    //1. Navigate to the application by using the URL https://demoqa.com/browser-windows
    await page.goto('https://demoqa.com/browser-windows');

    //2. Click on the new window button. 
    const newWindowButton = await page.locator('button#windowButton');
    await newWindowButton.click();
    
    //3. Wait for the new window to open. 
    await page.waitForEvent('popup');

    //4. Collect all the windows and store it in one of the variable
    const allWindows =await page.context().pages();

    //5. Switch to the new window from the current window. 
    const newPage = allWindows[1];//It is going to collect second window details. 

    //6. Verify elements available in the new window. 
    const newWindowElement = await newPage.locator('h1[id="sampleHeading"]');
    console.log(await newWindowElement.textContent());

});

test.only('Handling new tab ', async ({page}) => {

    //1. Navigate to the application by using the URL https://demoqa.com/browser-windows
     await page.goto('https://demoqa.com/browser-windows');

    //2. Click on the new tab button. 
    const newTabButton = await page.locator('button#tabButton');
    await newTabButton.click();

    //3. Wait for the new tab to open. 
    await page.waitForEvent('popup');
    
    //4. Collect all the windows and store it in one of the variable
    const allWindows = await page.context().pages();

    //5. Switch to the new tab from the current window. 
    const newPage = allWindows[1];//It is going to collect second window details. 

    //6. Verify elements available in the new tab. 
    const newTabElement = await newPage.locator('h1[id="sampleHeading"]');
    console.log(await newTabElement.textContent());

});