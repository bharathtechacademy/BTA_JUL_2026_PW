import { test , expect } from "@playwright/test";

//expect is called as assertion method

test("Playwright Web Actions", async ({ page }) => {

    //Navigate to the Google home page. 
    await page.goto("https://www.example.com");

    //Locate the web element 
    const element = page.locator('h1[class="example"]');

    /* ================================================
         Common Web Element Validations
    ================================================== */

    //Check if the element is visible or not. 
    const isElementVisible = await expect(element).toBeVisible();

    //Check if the element is enabled. 
    const isElementEnabled = await expect(element).toBeEnabled();

    //If it is a checkbox, check if the checkbox is selected already. 
    const isElementSelected = await expect(element).toBeChecked();

    //Check if the element has disappeared. 
    const isElementIsHidden = await expect(element).toBeHidden();


    /* ================================================
         Button Web Element Validations
    ================================================== */

    //Locate the button element. 
    const button = page.locator("//button[@value='Log In']");

    //Verify the label of the button. 
    const buttonText = await button.textContent(); // if button label is added as a text value. 
    await expect(button).toHaveText('Log In'); // if button label is added as a text value. 

    const buttonValue = await button.getAttribute('value'); // if button label is added as a value attribute. 
    await expect(button).toHaveAttribute('value', 'Log In'); // if button label is added as a value attribute. 

    //Click on the button. 
    await button.click();

    //Right click on the button. 
    await button.click({button : 'right'});

    //Mouse hover on the button. 
    await button.hover();

    //Scroll till the button is getting displayed. 
    await button.scrollIntoViewIfNeeded();

    //Double-click on the button. 
    await button.dblclick();

    //Drag and drop the button on the other element. 
    const targetElement = await page.locator("//target");
    await button.dragTo(targetElement);

    //Force click on the button. 
    await button.click({force: true});

    // Regularly, we should not use force click for each and every element. 

    //When to use force click in our automation? 

    //When the button is not responding or in a disabled state temporarily 
    //When the element is overlapped by another element, but you still want to perform the action or extract the text from it. 



});