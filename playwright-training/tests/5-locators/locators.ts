// Locators are nothing but the default methods provided by Playwright to identify the location of a web element within the web page. 

// Playwright is going to support mainly 9 different types of locator methods to identify the location of any web element. 

//1. getByRole('role', { name: 'name' }) 
//2. getByLabel('label')
//3. getByPlaceholder('placeholder')
//4. getByText('text')
//5. getByAltText('alt text')   
//6. getByTitle('title')
//7. getByTestId('test id')
//8. locator('selector') //css
//9. locator('xpath=selector') //xpath


//1. getByRole('role', { name: 'value' }) 
//role => button, textbox , checkbox , radio etc..
//value => text-value , value, aria-label ,label , title attribute values..

//Example: const googleSearchTextbox  =await page.getByRole('textbox', { name: 'Search' });
