import { Page } from '@playwright/test';
import cookiesPage from '../page-elements//cookies-page-elements.json'  with {type: 'json'};
import { WebCommons } from '../../commons/ui/web-commons.js';

export class CookiePageSteps {
    page: Page;
    web: WebCommons

    constructor(page: Page) {
        this.page = page;
        this.web = new WebCommons(page);
    }

    // Method to Verify the cookies pop-up is displayed. 
    async verifyCookiesPopUpIsDisplayed() {
        await this.web.isElementDisplayed(cookiesPage.cookiesPageHeader);
    }

    // Method to Verify cookies pop-up content. 
    async verifyCookiesPopupContent(expectedValue: string) {
        await this.web.isElementDisplayed(cookiesPage.cookiesContent);
        const actualValue =await this.web.getText(cookiesPage.cookiesContent);
        await this.web.compareValues(actualValue,expectedValue);
    }

    // Method to Verify cookie pop-up logos. 
    async verifyCookiePopupLogos() {
        await this.web.isElementDisplayed(cookiesPage.creatioLogo);
        await this.web.isElementDisplayed(cookiesPage.cookiebotLogo);
    }

    // Method to Verify switch buttons in the cookies popup. 
    async verifyCookiePopupSwitchButtons() {
        await this.web.isElementDisplayed(cookiesPage.necessarySwitchButton);
        await this.web.isElementDisplayed(cookiesPage.preferencesSwitchButton);
        await this.web.isElementDisplayed(cookiesPage.statisticsSwitchButton);
        await this.web.isElementDisplayed(cookiesPage.marketingSwitchButton);
    }

    // Method to verify selection buttons in the cookies popup. 
    async verifyCookiePopupSelectionButtons() {
        await this.web.isElementDisplayed(cookiesPage.allowAllButton);
        await this.web.isElementDisplayed(cookiesPage.allowSelection);
        await this.web.isElementDisplayed(cookiesPage.denyButton);
    }

    // Method to verify show-details link in the cookies popup. 
    async verifyCookiePopupShowDetailsLink() {
        await this.web.isElementDisplayed(cookiesPage.showDetailsLink);
    }

    // Method to Click on the "Show Details" link. 
    async clickOnShowDetailsLink() {
        await this.web.click(cookiesPage.showDetailsLink);
    }

    // Method to verify expanded view of cookies pop-up
    async verifyExpandedViewOfCookiesPopup() {
        await this.web.isElementDisplayed(cookiesPage.cookiePopupExpandedView);
    }

    // Method to click on the selection buttons in the cookies popup. 
    async clickOnSelectionButton(buttonName: string) {
        switch(buttonName.toLowerCase()) {
            case 'allow all':
                await this.web.click(cookiesPage.allowAllButton);
                break;
            case 'allow selection':
                await this.web.click(cookiesPage.allowSelection);
                break;
            case 'deny':
                await this.web.click(cookiesPage.denyButton);
                break;
            default:
                throw new Error(`Button with name "${buttonName}" not found in cookies popup.`);
        }
    }

    // Method to verify cookies popup is disappered after clicking on selection button
    async verifyCookiesPopupIsDisappeared() {
        await this.web.isElementDisappeared(cookiesPage.cookiePopupExpandedView);
    }

}