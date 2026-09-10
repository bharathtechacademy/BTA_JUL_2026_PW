import { test, expect } from '@playwright/test';


test('Fill and submit the automation practice form', async ({ page }) => {

    // 1. Enter URL and Launch the application (https://demoqa.com/automation-practice-form)
    await page.goto("https://demoqa.com/automation-practice-form");

    // 2. Wait for Page-load
    const pageHeader = await page.locator('//h1[text()="Practice Form"]');
    await expect(pageHeader).toBeVisible();

    // 3. Enter First name and Last name
    const firstName = await page.locator('//input[@id="firstName"]');
    await firstName.fill("Bharath");

    const lastName = await page.locator('//input[@id="lastName"]');
    await lastName.fill("Reddy");

    // 4. Enter Email
    const email = await page.locator('//input[@id="userEmail"]');
    await email.fill('BharathTechAcademy@Gmail.com');

    // 5. Select Gender (Male)
    await selectGender(page,"Male");

    // 6. Enter mobile number
    const mobileNumber = await page.locator('//input[@id="userNumber"]');
    await mobileNumber.fill('9553220022');

    // 7.Select DOB (1-Feb-1991)
    await selectDOB(page, "1", "February", "1991");

    // 8.Search and Select Computer Science and English
    await selectSubjects(page, ["Computer Science", "English"]);

    // 9.Select Hobbies as Sports and Reading
    await selectHobbies(page, ["Sports", "Reading"]);

    // 10.Upload photo
    const photoUpload = await page.locator('//input[@id="uploadPicture"]');
    const filePath = "files/Photo.png";
    await photoUpload.setInputFiles(filePath);

    // 11.Submit Details
    const submitButton = await page.locator('//button[@id="submit"]');
    await submitButton.click();

});

//Common function to select the gender 
async function selectGender(page : any, option : string){
    const gender = await page.locator(`//label[text()="${option}"]`);
    await gender.click();
}

//Common function to select the date of birth 
async function selectDOB(page: any, date:string, month :string , year:string){

    //Launch the calendar
    const dobField = await page.locator('//input[@id="dateOfBirthInput"]');
    await dobField.click();

    //Select the month
    const monthDropdown = await page.locator('//select[@class="react-datepicker__month-select"]');
    await monthDropdown.selectOption({ label: month });

    //Select the year
    const yearDropdown = await page.locator('//select[@class="react-datepicker__year-select"]');
    await yearDropdown.selectOption({ label: year });

    //Select the date
    const dateLocator = await page.locator(`//div[text()="${date}" and  contains(@aria-label,"${month}")]`);
    await dateLocator.click();

}

//Common method to select the subjects 
async function selectSubjects(page: any, subjects: string[]){

    //Locate the subject suggestion box. 
    const subjectsInput = await page.locator('//input[@id="subjectsInput"]');

    for(const subject of subjects){
        //Fill the subject name in the suggestion box. 
        await subjectsInput.fill(subject);

        //Press Enter to select the suggestion. 
        await subjectsInput.press('Enter');
    }
}

//Common method to select the hobbies 
async function selectHobbies(page: any, hobbies: string[]){

    for(const hobby of hobbies){
        const hobbyLocator = await page.locator(`//label[text()="${hobby}"]`);
        await hobbyLocator.click();
    }

}


