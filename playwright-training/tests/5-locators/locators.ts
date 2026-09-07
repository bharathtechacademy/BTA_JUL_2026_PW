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

//2. getByLabel('value')
//label => label text value of the web element

//tagname => label 
//value => text-value

//Example: 
//html code : <label data-v-30ff22b1="" data-v-957b4417="" class="oxd-label">Username</label>
//const usernameTextbox = await page.getByLabel('Username');

//3. getByPlaceholder('value')
//placeholder => placeholder attribute value of the web element

//Example:
//html code : <input data-v-1f99f73c="" class="oxd-input oxd-input--active" name="username" placeholder="Username" autofocus="">
//const usernameTextbox = await page.getByPlaceholder('Username');

//4. getByText('value')
//value => text-value of the web element

//Example:
//html code : <h5 data-v-7b563373="" data-v-0af708be="" class="oxd-text oxd-text--h5 orangehrm-login-title">Login</h5>
//const loginTitle = await page.getByText('Login');

//5. getByAltText('value')
//value => alt attribute value of the web element

//Example:
//html code : <img data-v-17f5fb62="" src="/web/images/ohrm_branding.png?v=1783336755185" alt="company-branding">
//const companyBrandingImage = await page.getByAltText('company-branding');

//6. getByTitle('value')
//value => title attribute value of the web element

//Example:
//html code :<textarea jsname="yZiJbe" class="gLFyf" aria-controls="Alh6id" aria-owns="Alh6id" autofocus="" title="Search" aria-label="Search" placeholder="" aria-autocomplete="both" aria-expanded="false" aria-haspopup="false" autocapitalize="off" autocomplete="off" autocorrect="off" id="ti6dpd" maxlength="2048" name="q" role="combobox" rows="1" spellcheck="false" data-ved="0ahUKEwiW4buHs9GWAxURleEIHYe6Il0Q39UDCBE"></textarea>
//const searchTextarea = await page.getByTitle('Search');


//7. getByTestId('value')
//value => data-testid attribute value of the web element

//Example(chatgpt.com) : 
// //html code : <div class="wm-desktop-layout _Td-r0q_root" data-desktop-layout="" data-testid="desktop-app-shell" >
//const desktopAppShell = await page.getByTestId('desktop-app-shell');