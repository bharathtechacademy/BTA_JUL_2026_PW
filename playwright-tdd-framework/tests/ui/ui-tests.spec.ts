import { test } from '@playwright/test';

import data from '../../testdata/ui/data.json' with {type: 'json'};
import {CookiePageSteps} from '../../page-objects/page-steps/cookies-page-steps.js';
import {HomePageSteps} from '../../page-objects/page-steps/home-page-steps.js';
import {LoginPageSteps} from '../../page-objects/page-steps/login-page-steps.js';

let cookiePage: CookiePageSteps;
let homePage: HomePageSteps;
let loginPage: LoginPageSteps;

test.describe('Create your CRM UI tests', () => {

//Initialize the page objects before each and every test case. 
test.beforeEach( async ({page}) =>{
    cookiePage = new CookiePageSteps(page);
    loginPage = new LoginPageSteps(page);
    homePage = new HomePageSteps(page);
})

//Test Case 1: Verify the cookies pop-up is displayed within the Create Show CRM application. 
test ('Verify cookie pop-up' , async() =>{
    await loginPage.launchApplication();
    cookiePage.verifyCookiesPopUpIsDisplayed();
})

//Test Case 2 : Verify cookies pop-up content. 
test('Verify cookies popup content', async() =>{
    const testdata = data["Verify cookies popup content"];
    await loginPage.launchApplication();
    await cookiePage.verifyCookiesPopUpIsDisplayed();
    await cookiePage.verifyCookiesPopupContent(testdata.cookiesPopupContent);
})

// Test Case 3 : Verify cookie pop-up logos. 
test('Verify cookie pop-up logos', async() =>{
    await loginPage.launchApplication();
    await cookiePage.verifyCookiesPopUpIsDisplayed();
    await cookiePage.verifyCookiePopupLogos();
})

// Test Case 4 : Verify cookie pop-up switch buttons
test('Verify cookie pop-up switch buttons', async() =>{
    await loginPage.launchApplication();
    await cookiePage.verifyCookiesPopUpIsDisplayed();
    await cookiePage.verifyCookiePopupSwitchButtons();
})

// Test Case 5 : Verify cookie pop-up selection buttons
test('Verify cookie pop-up selection buttons', async() =>{
    await loginPage.launchApplication();
    await cookiePage.verifyCookiesPopUpIsDisplayed();
    await cookiePage.verifyCookiePopupSelectionButtons();
})

// Test Case 6 : Verify show details functionality in the cookies pop-up. 
test('Verify show details functionality in the cookies pop-up', async() =>{
    await loginPage.launchApplication();
    await cookiePage.verifyCookiesPopUpIsDisplayed();
    await cookiePage.verifyCookiePopupShowDetailsLink();
    await cookiePage.clickOnShowDetailsLink();
    await cookiePage.verifyExpandedViewOfCookiesPopup();
})

// Test Case 7 : Verify closing the cookies pop-up.
test('Verify closing the cookies pop-up', async() =>{
    const testdata = data["Verify closing the cookies pop-up"];
    await loginPage.launchApplication();
    await cookiePage.verifyCookiesPopUpIsDisplayed();
    await cookiePage.verifyCookiePopupSelectionButtons();
    await cookiePage.clickOnSelectionButton(testdata.button);
    await cookiePage.verifyCookiesPopupIsDisappeared();
})

// Test Case 8 : Verify the login page is displayed. 
test('Verify the login page is displayed', async() =>{
    const testdata = data["Verify the login page is displayed"];
    await loginPage.launchApplication();
    await cookiePage.verifyCookiesPopUpIsDisplayed();
    await cookiePage.verifyCookiePopupSelectionButtons();
    await cookiePage.clickOnSelectionButton(testdata.button);
    await cookiePage.verifyCookiesPopupIsDisappeared();
    await loginPage.verifyLoginPageIsDisplayed();
})

// Test Case 9 :  Verify login functionality with valid credentials. 
test('Verify valid login', async() =>{
    const testdata = data["Verify valid login"];
    await loginPage.launchApplication();
    await cookiePage.verifyCookiesPopUpIsDisplayed();
    await cookiePage.verifyCookiePopupSelectionButtons();
    await cookiePage.clickOnSelectionButton(testdata.button);
    await cookiePage.verifyCookiesPopupIsDisappeared();
    await loginPage.verifyLoginPageIsDisplayed();
    await loginPage.enterCredentials(testdata.username, testdata.password);
    await loginPage.clickOnLoginButton();
    await loginPage.waitForLoginAuthenticationPage();
    await loginPage.enterLoginEmail(testdata.username);
    await loginPage.clickOnContinueButton();
    await loginPage.enterLoginPassword(testdata.password);
    await loginPage.clickOnContinueButton();
    await homePage.verifyHomePageIsDisplayed();
})








})