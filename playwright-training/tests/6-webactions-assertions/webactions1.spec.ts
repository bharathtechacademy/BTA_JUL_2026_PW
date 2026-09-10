import { test, expect } from "@playwright/test";


test("Parabank App Automation", async ({ page }) => {

// 1. Launch application using url (https://parabank.parasoft.com/parabank/index.htm)
await page.goto("https://parabank.parasoft.com/parabank/index.htm");

// 2.verify application logo is displayed
const logo = await page.locator('img[class="logo"]');
await expect(logo).toBeVisible();

// 3.Verify application caption displayed as "Experience the difference"
const caption = await page.locator('p[class="caption"]');
await expect(caption).toHaveText("Experience the difference");

// 4.Enter invalid username
const usernameInput = await page.locator('input[name="username"]');
await usernameInput.fill("invalidUser");

// 5.Enter empty Password
const passwordInput = await page.locator('input[name="password"]');
await passwordInput.fill(" ");

// 6.Click on login button
await page.locator('input[value="Log In"]').click();

// 7.Verify the error message "Please enter a username and password."
const errorMessage = await page.locator('p[class="error"]');
await expect(errorMessage).toHaveText("The username and password could not be verified.");

// 8.Click on admin page link
const adminPageLink = await page.locator('//a[text()="Admin Page"]');
await adminPageLink.click();

// 9.select the option "soap" from dba mode radio button
await selectDBAMode(page, "soap");

// 10.Scroll to element dropdown
const loanProviderDropdown = await page.locator('select#loanProvider');
await loanProviderDropdown.scrollIntoViewIfNeeded();

// 11.Select the option web service from the dropdown
await loanProviderDropdown.selectOption({label : 'Web Service'});

// 12.click on submit button
const submitButton = await page.locator('input[value="Submit"]');
await submitButton.click();

// 13.verify submission is successful by validating success message
const successMessage = await page.locator('//b[text()="Settings saved successfully."]');
await expect(successMessage).toBeVisible();

// 14.Click on services page link
const servicesPageLink = await page.locator('ul[class="leftmenu"] > li > a[href="services.htm"]');
await servicesPageLink.click();

// 15.wait for service page
const bookstoreServices = await page.locator('//span[text()="Bookstore services:"]');
await expect(bookstoreServices).toBeVisible();

// 16.Scroll down till bookstore services table
await bookstoreServices.scrollIntoViewIfNeeded();

// 17.get total rows of books store services table
const tableRows = await page.locator('//span[text()="Bookstore services:"]/following-sibling::table[1]//tbody//tr');
const totalRows = await tableRows.count();
console.log(`Total rows in the bookstore services table: ${totalRows}`);

// 18.get total columns of books store services table
const tableColumns = await page.locator('//span[text()="Bookstore services:"]/following-sibling::table[1]//tbody//tr[1]//td');
const totalColumns = await tableColumns.count();
console.log(`Total columns in the bookstore services table: ${totalColumns}`);

// 19.Print table data (row wise and column wise data)
for(let r: number = 1; r <= totalRows; r++) { //Iterate from row 1 to the last row. 

    for(let c: number = 1; c <= totalColumns; c++) { //Iterate from column 1 to the last column. 

        //Locate the cell based on the row and column indexes. 
        const cell = await page.locator(`//span[text()="Bookstore services:"]/following-sibling::table[1]//tbody//tr[${r}]//td[${c}]`);
        const cellText = await cell.textContent();
        console.log(`Row ${r} Column ${c}: ${cellText}`);
    }
}

});


//Select the dba mode 
async function selectDBAMode(page:any, option :string) {

    //Locate the radio button based on the option. 
    const radioButton = await page.locator(`input[value="${option}"]`);

    //Click on the radio button to select the radio button. 
    await radioButton.check();
}