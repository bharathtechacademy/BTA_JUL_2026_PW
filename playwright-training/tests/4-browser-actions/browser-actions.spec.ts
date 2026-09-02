import {test , chromium, expect} from '@playwright/test';

test('browser actions', async ({}) => {

    // Launch the Chromium 'browser engine' to get the edge browser. 
    // const browserEngine = await chromium.launch(); //chrome browser
    const browserEngine = await chromium.launch({channel : 'msedge', headless : false}); //edge browser in headed mode

    // Launch the 'browser context' within the browser engine. (kind of incognito)
    const browserContext = await browserEngine.newContext();

    // Clear all the cookies within the browser context. 
    await browserContext.clearCookies();

    // Launch the new 'page' within the browser context. (browser tab)
    const page = await browserContext.newPage();

    // Maximize the browser window to a specific resolution. (1920,1080)
    await page.setViewportSize({ width: 1920, height: 1080 });

    // Launch the application by using URL https://www.google.com. 
    await page.goto('https://www.google.com');

    // Verify whether the Google application is launched successfully by using the title of the web page. 
    await expect(page).toHaveTitle("Google");

    // Then launch the different applications within the same page by using another URL: https://www.playwright.dev 
    await page.goto('https://www.playwright.dev');
    
    // Navigate back to the previous application that is Google. 
    await page.goBack();

    // Move forward to the next application, that is Playwright.
    await page.goForward();
    
    // Reload the page. (Refresh the web page)
    await page.reload();

    // Launch the new page
    const page2 = await browserContext.newPage();

    // Launch a new application with the URL: https://www.selenium.dev. 
    await page2.goto('https://www.selenium.dev');

    // Go back to the previous tab and display Playwright application. 
    await page.bringToFront();

    // Verify the URL of the browser window. 
    const currentURL =await page.url();
    console.log("Current URL of the browser window is: " + currentURL);

    // Close the current page. 
    await page.close();

    // Close the browser context and all the pages within the context.
    await browserContext.close();
    await browserEngine.close();

});