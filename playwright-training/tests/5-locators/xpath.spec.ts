//XPath => XML Path of  WebElement 

//1. Absolute XPath
//Syntax: /html/body/div[1]/div[2]/div[1]/h1

//2. Relative XPath
//Syntax: //tagname[@attribute='value']

//Xpath Locator Syntaxes

//Syntax 1 : //tagName [@Attribute = "Attribute-Value"]
//Syntax 2 : //tagName [text() = "Text-Value"]

//Syntax 3 : //tagName [contains(@Attribute , "Partial-Attribute-Value")]
//Syntax 4 : //tagName [contains(text() , "Partial-Text-Value")]

//Syntax 5 : //tagName [starts-with(@Attribute , "Attribute-Value-Starts-with")]
//Syntax 6 : //tagName [starts-with(text() , "Text-Value-Starts-with")]

//Syntax 7 : //tagName [@Attribute1 = "Attribute-Value" and @Attribute2 = "Attribute-Value" and text() = "Text-Value"]

//Syntax 8 : Advanced XPath with relationships 
//reference-element-xpath/relationship::target-element-xpath

// target  > sibling > parent > ancestor > ancestor's parent


//ancestor: //ul[@class="leftmenu"]
//parent : //li
//sibling: N/A
//target : //a[text()='Services']

//ul[@class="leftmenu"]/child::li/child::a[text()='Services']
//ul[@class="leftmenu"]//a[text()='Services']
//li[text()="Solutions"]/following-sibling::li/child::a[text()='Services']
//a[text()="Admin Page"]/parent::li/preceding-sibling::li/child::a[text()="Services"]

//child
//parent
//ancestor
//following-sibling
//preceding-sibling
//following
//preceding
// / (child)
// //(with in the family)

import { test } from "@playwright/test";

test("Css Locator", async ({ page }) => {

    //Navigate to the Google home page. 
    await page.goto("https://parabank.parasoft.com/parabank/index.htm");

    //Locate the 'Logo' by using syntax 1 
    await page.locator('//img[@class="logo"]');

    //Locate the 'Caption' by using syntax 2 
    await page.locator('//p[text()="Experience the difference"]');

    //Locate the 'Logo' by using syntax 3 
    await page.locator('//img[contains(@src,"logo")]');

    //Locate the 'Caption' by using syntax 4 
    await page.locator('//p[contains(text(),"difference")]');

    //Locate the 'Logo' by using syntax 5 
    await page.locator('//img[starts-with(@src,"images/logo")]');

    //Locate the 'Caption' by using syntax 6 
    await page.locator('//p[starts-with(text(),"Experience")]');

    //Locate the 'Logo' by using syntax 7
    await page.locator('//img[@alt="ParaBank" and @class="logo"  and @title="ParaBank"]');

    //Locate the 'Caption' by using syntax 7
    await page.locator('//p[@class="caption" and text()="Experience the difference"]');

    await page.locator(getMenu("Services"));
    await page.locator(getMenu("Admin Page"));
    await page.locator(getMenu("Solutions"));

    let date = new Date();
    let day = date.getDate().toString();
    let month = date.toLocaleString('default', { month: 'long' });
    await page.locator(selectDate(day, month));

});

function getMenu(menuName : string) : string{
    return `//ul[@class="leftmenu"]//a[text()='${menuName}']`
}

function selectDate(date: string, month: string) : string{
    return `//div[text()="${date}" and contains(@aria-label,"${month}")]`;
}