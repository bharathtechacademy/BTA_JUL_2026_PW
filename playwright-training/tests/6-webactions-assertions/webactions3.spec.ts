import { test, expect } from '@playwright/test';

test('Handling the Alerts', async ({ page }) => {

    // Navigate to the alerts page. 
    await page.goto('https://demoqa.com/alerts');

    // Locate the buttons to trigger the alerts. 
    const infoAlertButton = await page.locator('//button[@id="alertButton"]');
    const confirmAlertButton = await page.locator('//button[@id="confirmButton"]');
    const promptAlertButton = await page.locator('//button[@id="promtButton"]');

    // Handle the alert - when alerts populate. 
    await page.once('dialog', async dialog => {

        //Print an alert message in the console. 
        console.log(await dialog.message());

        //Click on the OK button.
        await dialog.accept();
    })

    // Now get the information alert. 
    await infoAlertButton.click();

    // Handle the alert - when alerts populate. 
    await page.once('dialog', async dialog => {

        //Print an alert message in the console. 
        console.log(await dialog.message());

        //Click on the CANCEL button.
        await dialog.dismiss();
    })

    // Now get the information alert. 
    await confirmAlertButton.click();

    // Handle the alert - when alerts populate. 
    await page.once('dialog', async dialog => {

        //Print an alert message in the console. 
        console.log(await dialog.message());

        //Click on the OK button.
        await dialog.accept("Playwright");
    })

    // Now get the information alert. 
    await promptAlertButton.click();

    //take screenshot at the end
    await page.screenshot({path : 'files/alerts_handling.png' , fullPage : true} );
});