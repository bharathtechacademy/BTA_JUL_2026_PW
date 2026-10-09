import { Browser, BrowserContext, Page, chromium } from '@playwright/test';
import { CookiePageSteps } from '../page-objects/page-steps/cookies-page-steps.ts';
import { HomePageSteps } from '../page-objects/page-steps/home-page-steps.ts';
import { LoginPageSteps } from '../page-objects/page-steps/login-page-steps.ts';
import { BeforeAll, Before, After, AfterAll, setDefaultTimeout } from '@cucumber/cucumber';


//Declare global variables to store browser, browser context, and page details. 
let browser: Browser;
let context: BrowserContext;
export let page: Page;

export let cookiePage: CookiePageSteps;
export let homePage: HomePageSteps;
export let loginPage: LoginPageSteps;

setDefaultTimeout(90*1000); //90000 milliseconds /90 sec

//Method to launch browser once before executing all scenarios. 
BeforeAll(async () => {
    browser = await chromium.launch({ headless: false });
})

//Method to create a browser context page and also initialize page objects before each and every scenario 
Before(async () => {
    context = await browser.newContext();
    page = await context.newPage();
    loginPage = new LoginPageSteps(page);
    cookiePage = new CookiePageSteps(page);
    homePage = new HomePageSteps(page);
})

//Method to Capture the screenshots of failure cases and close the browser context after each and every scenario. 
After(async (scenario) => {
    if (scenario.result?.status === 'FAILED') {
        await page.screenshot({ path: `./reports/screenshots/${scenario.pickle.name.replace(/[^a-zA-Z0-9]/g, '_')}.png` })
    }
    await context.close();
})

// Close the browser engine after all scenarios are completed. 
AfterAll(async () => {
    await browser.close();
})
