import { test, expect } from "@playwright/test";

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
     await button.click({ button: 'right' });

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
     await button.click({ force: true });

     // Regularly, we should not use force click for each and every element. 

     //When to use force click in our automation? 

     //When the button is not responding or in a disabled state temporarily 
     //When the element is overlapped by another element, but you still want to perform the action or extract the text from it. 


     /* ================================================
          Textbox Web Element Validations
     ================================================== */

     //Locate the textbox element. 
     const textbox = page.locator("//input[@value='Log In']");

     //Verify the placeholder of the text box. 
     const placeHolderText = await textbox.getAttribute("placeholder");

     //Clear the pre-populated text within the text box. 
     await textbox.clear();

     //Type the text within the text box
     await textbox.fill("Bharath");

     //Verify the text entered into the text box. 
     const textEntered = await textbox.getAttribute("value");

     //Press the function keys within the text box. 
     await textbox.press("Enter");

     /* ================================================
         Checkbox Web Element Validations
    ================================================== */

     //Locate the checkbox element. 
     const checkbox = page.locator("//input[@value='Log In']");

     //Check the checkbox only if it is not selected already. 
     const checked = await checkbox.isChecked();

     if (!checked) {
          await checkbox.check();
     }


     /* ================================================
         Radiobutton Web Element Validations
    ================================================== */

     //Locate the radio button element. 
     const radiobutton = page.locator("//input[@value='Log In']");

     //Select the radio button 
     await radiobutton.check();


     /* ================================================
         Dropdown Web Element Validations
    ================================================== */

     //Locate the dropdown element. 
     const dropdown = page.locator("//select[@value='Log In']");

     //Select one of the options from the dropdown. 
     await dropdown.selectOption({ label: 'Web Service' });
     await dropdown.selectOption({ value: 'ws' });
     await dropdown.selectOption({ index: 1 });

     //Verify the option selected from the drop-down. 
     const selectedOption = await dropdown.inputValue();

     //Extract all the options available in the drop-down. 
     const allOptions = await dropdown.locator("option").allTextContents();

     //Verify the dropdown is a multi-select dropdown. 
     const isMultiSelect = await dropdown.getAttribute("multiple");

     //Select multiple options from the dropdown. 
     if (isMultiSelect) {
          await dropdown.selectOption([{ label: 'Web Service' }, { value: 'ws' }, { index: 1 }]);
     }

     /* ================================================
         Image Web Element Validations
    ================================================== */

     //Locate the image element. 
     const image = page.locator("//img[@alt='Sample Image']");

     //Verify the image is visible on the page. 
     const isImageVisible = await image.isVisible();

     //Verify whether the image is a valid image. 
     const imageSource = await image.getAttribute("src");
     const expectedImageSource = "https://m.media-amazon.com/images/I/719ij4T+bEL._AC_UL320_.jpg";

     //Verify the image source is as expected.
     const isImageSourceValid = imageSource === expectedImageSource;

     //Verify the position of the image within the application or web page. 
     const imagePosition = await image.boundingBox();
     const x = imagePosition?.x;
     const y = imagePosition?.y;

     //Verify the resolution of the image within the application or web page. 
     const imageResolution = await image.boundingBox();
     const width = imageResolution?.width;
     const height = imageResolution?.height;

     /* ================================================
         Hyperlink Web Element Validations
    ================================================== */

     //Locate the hyperlink element. 
     const hyperlink = page.locator("//a[@alt='Sample Image']");

     //Verify the hyperlink associated with the web element. 
     const hyperlinkReference = await hyperlink.getAttribute("href");
     await expect(hyperlinkReference).toBe("https://google.com/search/howsearchworks/?fg=1");

     //Verify the hyperlink by navigating to the page. 
     await hyperlink.click();
     await expect(page).toHaveURL("https://google.com/search/howsearchworks/?fg=1");

     /* ================================================
         Text / Label Web Element Validations
    ================================================== */

     //Locate the text / label element. 
     const textLabel = page.locator("//label[@for='sampleInput']");

     //Verify the text / label is visible on the page. 
     const isTextLabelVisible = await textLabel.isVisible();

     //Verify the text / label content. 
     const textLabelContent = await textLabel.textContent();

     /* ================================================
         File Upload Web Element Validations
    ================================================== */

     //Locate the text / label element. 
     const uploadButton = page.locator("//input[@for='sampleInput']");

     //Upload the file by selecting the files. 
     await uploadButton.setInputFiles('path/to/file.jpg');

     /* ================================================
         Alert Web Element Validations
    ================================================== */

    //Locate the element that is going to generate the alert. 
     const alertButton = page.locator("//button[@value='Generate Alert']");

     //If an alert comes, specify the action to be performed. 
     page.once('dialog', async dialog => {

          //Copy the message from the alert. 
          const alertMessage = dialog.message();

          //Accept the alert or click on the OK button. 
          await dialog.accept();

          //Dismiss the alert or click on the Cancel button. 
          //await dialog.dismiss();

          //Enter the text into the alert text box. 
          //await dialog.accept('Text to be entered into the alert text box');
     });

     //Click on the button to generate the alert.
     await alertButton.click();

     /* ================================================
         FRAME Web Element Validations
    ================================================== */

    // Locate the main page element that contains the frame. 
    const frame = page.frameLocator("//iframe[@id='frame1']");

    //Locate the frame element that is added inside the frame. 
    const frameElement = frame.locator("//h1[@id='sampleHeading']");


});