import { Page , Locator , expect } from '@playwright/test';
import config from '../../config/config.json' with { type : 'json' };

export class WebCommons {

    page : Page ;

    constructor(page: Page) {
        this.page = page;
    }

    // Common method to launch the application and verify the title of the application 
    async launchApplication(){
        await this.page.goto(config.web.url);
        await expect(this.page).toHaveTitle(config.web.title);
    }

    // Common method to generate a web element from the locator 
    async element(locatorText : string) : Promise<Locator> {
        return this.page.locator(locatorText);
    }

    // Common method to scroll to the element 
    async scrollToElement(locator : string) : Promise<void> {
        const element = await this.element(locator);
        await element.scrollIntoViewIfNeeded();
    }

    // Common method to click on the web element 
    async click(locator : string) : Promise<void> {
        const element = await this.element(locator);
        await element.click();
    }

    // Common method to type text into the web element 
    async enterText(locator : string, text : string) : Promise<void> {
        const element = await this.element(locator);
        await element.clear();
        await element.fill(text);
    }

    // Common method to select option from a dropdown 
    async selectOption(locator : string, optionValue : string) : Promise<void> {
        const element = await this.element(locator);
        await element.selectOption(optionValue);
    }

    // Common method to perform a double-click on the web element 
    async doubleClick(locator : string) : Promise<void> {
        const element = await this.element(locator);
        await element.dblclick();
    }

    //Common method to perform a right-click on the web element.
    async rightClick(locator : string) : Promise<void> {
        const element = await this.element(locator);
        await element.click({ button: 'right' });
    }

    // Common method to perform a hover action on the web element
    async hoverElement(locator : string) : Promise<void> {
        const element = await this.element(locator);
        await element.hover();
    }

    // Common method to perform a force click on the web element 
    async forceClick(locator : string) : Promise<void> {
        const element = await this.element(locator);
        await element.click({ force: true });
    }

    // Common method to get the text value from the web element.
    async getText(locator : string) : Promise<string | null> {
        const element = await this.element(locator);
        return element.textContent() ?? '';
    }

    // Common method to get the attribute value from the web element 
    async getAttribute(locator : string, attributeName : string) : Promise<string | null> {
        const element = await this.element(locator);
        return element.getAttribute(attributeName);
    }

    // Common method to select the option from the checkbox
    async selectCheckbox(locator : string , status : boolean) : Promise<void> {
        const element = await this.element(locator);
        const isChecked = await element.isChecked();
        if(isChecked !== status) {
            await element.check();
        }
    }

    // Common method to verify whether an element is displayed 
    async isElementDisplayed(locator : string) : Promise<boolean> {
        const element = await this.element(locator);
        return await element.isVisible();
    }

    // Common method to verify whether an element is enabled 
    async isElementEnabled(locator : string) : Promise<boolean> {
        const element = await this.element(locator);
        return await element.isEnabled();
    }

    // Common method to upload the file 
    async uploadFile(locator : string, filePath : string) : Promise<void> {
        const element = await this.element(locator);
        await element.setInputFiles(filePath);
    }

    // Common method to take the element screenshot 
    async takeScreenshot(locator : string, screenshotPath : string ) : Promise<void> {
        const element = await this.element(locator);
        await element.screenshot({ path: screenshotPath });
    }

    // Common method to take the page screenshot 
    async takeFullPageScreenshot(screenshotPath : string , fullpage: boolean ) : Promise<void> {
        await this.page.screenshot({ path: screenshotPath, fullPage: fullpage });
    }

    // Common method  to Launch the new tab. 
    async launchNewTab() : Promise<void> {
        const context = this.page.context();
        const newPage = await context.newPage();
        this.page = newPage;
    }

    // Common method to handle the alert 
    async handleAlert(action : string , promptText?: string) : Promise<void> {
        this.page.on('dialog', async dialog => {
            if(action.toLowerCase() === 'accept') {
                await dialog.accept(promptText);
            } else if(action.toLowerCase() === 'dismiss') {
                await dialog.dismiss();
            }
        });
    }

    // Common method to locate the element inside the frame 
    async frameElement (frameLocator: string, elementLocator: string) : Promise<any> {
        const frame = await this.page.frameLocator(frameLocator);
        return await frame.locator(elementLocator);
    }

    // Common method to compare two different values 
    async compareValues(value1: any, value2: any) : Promise<void> {
        await expect(value1).toBe(value2);
    }

    // Common method to verify whether an element has disappeared from the page 
    async isElementDisappeared(locator : string) : Promise<boolean> {
        const element = await this.element(locator);
        return await element.isHidden();
    }

}