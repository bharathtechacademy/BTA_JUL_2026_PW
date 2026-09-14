// Handling Frames
import { test, expect } from '@playwright/test';

test('handling frames', async ({ page }) => {

    //Navigate to the web page by using a URL "http://demoqa.com/frames"
    await page.goto('http://demoqa.com/frames');

    //Locate the main page element (page header)
    const mainPageElement = await page.locator('h1[class="text-center"]')

    //Locate the frame. 
    const frame = await page.frameLocator('iframe#frame1');

    //Locate the frame element
    const frameElement = await frame.locator('h1[id="sampleHeading"]')

    //Copy and print the frame element text. 
    console.log(await frameElement.textContent());

    //Copy and print the main page element text. 
    console.log(await mainPageElement.textContent());
});