//Css Locator => CSS locator is all about locating the web element by using CSS properties of the element. 

//Advanced CSS selector syntax :

//Syntax : reference-element > target-element

// great-grand-parent > grand-parent > parent > targetElement

//grand-parent : ul[class="leftmenu"]
//parent : li
//target : a[href="services.htm"]

// ul[class="leftmenu"] > li > a[href="services.htm"]

import { test } from "@playwright/test";

test("Advanced Css Locator", async ({ page }) => {

    //Navigate to the Google home page. 
    await page.goto("https://parabank.parasoft.com/parabank/index.htm");

    //Locate the 'Services' hyperlink
    await page.locator('ul[class="leftmenu"] > li > a[href="services.htm"]');


});