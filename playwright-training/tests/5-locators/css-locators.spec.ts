//Css Locator => CSS locator is all about locating the web element by using CSS properties of the element. 

//CSS selector syntaxes :

//Syntax 1: tagName#id
//Syntax 2: tagName.className
//Syntax 3: tagName[attribute='value']
//Syntax 4: tagName[attribute*='value'] //Attribute value contains so and so value. 
//Syntax 5: tagName[attribute^='value'] //Attribute value starts with so and so value.
//Syntax 6: tagName[attribute$='value'] //Attribute value ends with so and so value.
//Syntax 7: tagName[attribute1='value'][attribute2='value']

import { test } from "@playwright/test";

test("Css Locator", async ({ page }) => {

    //Navigate to the Google home page. 
    await page.goto("https://www.google.com/");

    //Locate the 'Google search' textbox by using syntax 1 
    await page.locator('textarea#ti6dpd');

    //Locate the 'Google search' textbox by using syntax 2
    await page.locator('textarea.gLFyf');

    //Locate the 'Google search' textbox by using syntax 3
    await page.locator('textarea[title="Search"]');

    //Locate the 'How Search Works' link by using syntax 4
    await page.locator('a[href*="howsearchworks"]');

    //Locate the 'How Search Works' link by using syntax 5
    await page.locator('a[href^="https://google.com/search/how"]');

    //Locate the 'How Search Works' link by using syntax 6
    await page.locator('a[href$="howsearchworks"]');

     //Locate the 'Google search' textbox by using syntax 7
    await page.locator('textarea[title="Search"][aria-label="Search"][name="q"]');




});