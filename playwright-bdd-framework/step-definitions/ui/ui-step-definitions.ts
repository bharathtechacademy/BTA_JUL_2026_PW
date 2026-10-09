import { Given, When, Then } from '@cucumber/cucumber';
import { loginPage,homePage,cookiePage } from '../../support/hooks.ts';

//Given Launch the Creatio CRM application
Given('Launch the Creatio CRM application', async () => {
    await loginPage.launchApplication(); 
})

//Then Cookies page should be displayed
Then('Cookies page should be displayed', async()=>{
     await cookiePage.verifyCookiesPopUpIsDisplayed();
})

//And Verify cookies pop-up content
Then('Verify cookies pop-up content', async (expectedContent :string) => {
     await cookiePage.verifyCookiesPopupContent(expectedContent);
})

//And Verify cookies popup logos
Then('Verify cookies popup logos', async () => {
    await cookiePage.verifyCookiePopupLogos();
})

//And Verify cookies popup switch buttons
Then('Verify cookies popup switch buttons', async ()=>{
     await cookiePage.verifyCookiePopupSwitchButtons();
})

//And Verify cookies popup selection buttons
Then('Verify cookies popup selection buttons', async ()=>{
     await cookiePage.verifyCookiePopupSelectionButtons();
})

//And Verify show details link
Then('Verify show details link', async ()=>{
     await cookiePage.verifyCookiePopupShowDetailsLink();
})

//When User clicks on show details link
When('User clicks on show details link', async ()=>{
     await cookiePage.clickOnShowDetailsLink();
})

//Then cookies popup should display in expanded view
Then('cookies popup should display in expanded view', async ()=>{
     await cookiePage.verifyExpandedViewOfCookiesPopup();
})

//Then cookies popup should be closed
Then('cookies popup should be closed', async ()=>{
     await cookiePage.verifyCookiesPopupIsDisappeared();
})

//When User clicks on "allow all" button
When('User clicks on {string} button', async (buttonName : string)=>{
     await cookiePage.clickOnSelectionButton(buttonName);
})

//And Login page should be displayed
Then('Login page should be displayed', async ()=>{
     await loginPage.verifyLoginPageIsDisplayed();
})

//When User enters "<username>" and "<password>" in the login page
When('User enters {string} and {string} in the login page', async (username : string, password : string)=>{
     await loginPage.enterCredentials(username, password);
})

//And User clicks on the login button
When('User clicks on the login button', async ()=>{
    await loginPage.clickOnLoginButton();
})

//Then Login Authentication Page should be displayed
Then('Login Authentication Page should be displayed', async ()=>{
    await loginPage.waitForLoginAuthenticationPage();
})

//When User enter login email "<username>"
When('User enter login email {string}', async (username : string)=>{
    await loginPage.enterLoginEmail(username);
})

//And Click on continue button
When('Click on continue button', async ()=>{
    await loginPage.clickOnContinueButton();
})

//And User enters login password "<password>"
When('User enters login password {string}', async (password : string)=>{
     await loginPage.enterLoginPassword(password);
})

//Then Login should be "<result>"
Then('Login should be {string}', async (result : string)=>{
    if(result === 'success'){
         await loginPage.waitForLoginAuthenticationPage();
    } else {
         await loginPage.verifyErrorMessageIsDisplayed();
    }
})

//When User clicks on the profile icon
When('User clicks on the profile icon', async ()=>{
    await homePage.clickOnProfileIcon();
})

//When User clicks on the logout button
When('User clicks on the logout button', async ()=>{
    await homePage.clickOnLogoutButton();
})

//Then Logout should be successful and navigate to the login page
Then('Logout should be successful and navigate to the login page', async ()=>{
    await loginPage.verifyLoginPageIsDisplayed();
})