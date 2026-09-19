import { Page } from '@playwright/test';
import loginPage from '../page-elements//login-page-elements.json'  with {type: 'json'};
import { WebCommons } from '../../commons/ui/web-commons.js';

export class LoginPageSteps {
    page: Page;
    web: WebCommons

    constructor(page: Page) {
        this.page = page;
        this.web = new WebCommons(page);
    }

    // Method to launch the application
    async launchApplication(){
        await this.web.launchApplication();
    }

    // Method to verify the login page is displayed 
    async verifyLoginPageIsDisplayed() {
        await this.web.isElementDisplayed(loginPage.loginPageHeader);
    }

    // Method to enter credentials
    async enterCredentials(username: string, password?: string) {
        await this.web.enterText(loginPage.businessEmailTextBox, username);
        if(password != undefined) {
            await this.web.enterText(loginPage.passwordTextBox, password);
        }
    }

    // Method to click on the login button
    async clickOnLoginButton() {
        await this.web.click(loginPage.loginButton);
    }

    // Method to verify forgot password link is displayed
    async verifyForgotPasswordLinkIsDisplayed() {
        await this.web.isElementDisplayed(loginPage.forgotPasswordLink);
    }

    // Method to click on the forgot password link
    async clickOnForgotPasswordLink() {
        await this.web.click(loginPage.forgotPasswordLink);
    }

    // Method to verify forgot password confirmation message is displayed
    async verifyForgotPasswordConfirmationMessageIsDisplayed() {
        await this.web.isElementDisplayed(loginPage.forgotPasswordConfirmationMsg);
    }

    // Method to verify error message is displayed
    async verifyErrorMessageIsDisplayed() {
        await this.web.isElementDisplayed(loginPage.loginErrorMessage);
    }

    // Method to verify social media login options are displayed
    async verifySocialMediaLoginOptionsAreDisplayed() {
        await this.web.isElementDisplayed(loginPage.googleIcon);
        await this.web.isElementDisplayed(loginPage.linkedInIcon);
    }

    // Method to verify sign-up link is displayed
    async verifySignUpLinkIsDisplayed() {
        await this.web.isElementDisplayed(loginPage.signUpLink);
    }

    // Method to wait for login authentication page
    async waitForLoginAuthenticationPage() {
        await this.web.isElementDisplayed(loginPage.loginAuthHeader);
    }

    // Method to enter login email on the authentication page
    async enterLoginEmail(email: string) {
        await this.web.enterText(loginPage.loginEmail, email);
    }

    // Method to click on the continue button on the authentication page
    async clickOnContinueButton() {
        await this.web.click(loginPage.continueButton);
    }

    // Method to enter login password on the authentication page
    async enterLoginPassword(password: string) {
        await this.web.enterText(loginPage.loginPassword, password);
    }


}