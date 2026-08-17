// Test Case 1: verify the home page.
console.log("******************TEST CASE 1: VERIFY THE HOME PAGE******************");
loginIntoApplication("Chrome", "https://www.qa.icici.com/");
console.log("Verify the home page is displayed or not");
logoutFromApplication();

// Test Case 2: verify the account balance
console.log("******************TEST CASE 2: VERIFY THE ACCOUNT BALANCE******************");
loginIntoApplication("Firefox", "https://www.dev.icici.com/");
console.log("Verify the home page is displayed");
console.log("Verify the account balance is displayed as " + getAccountBalance());
logoutFromApplication();

// Test Case 3: verify the account statement
console.log("******************TEST CASE 3: VERIFY THE ACCOUNT STATEMENT******************");
loginIntoApplication("Edge", "https://www.icici.com/");
console.log("Verify the home page is displayed");
console.log("Navigate to the account statement page");
console.log("Verify the account statement is displayed with the following details:");
logoutFromApplication();


//Steps to Create Functions

//1. Identify the duplicate code and separate the same from the program. 
//2. Separate the duplicate code and add it inside the block / curly braces.
//3. Add a unique name along with 'function' keyword to each and every block to call the function. 

function loginIntoApplication(browserName, url) {
    console.log(`Launch the ${browserName} Browser`);
    console.log(`Enter the URL: "${url}"`);
    console.log("Enter the username as 'Bharath' and password as 'Bharath@123'");
    console.log("Click on the login button");
}

function logoutFromApplication() {
    console.log("Logout from the application");
    console.log("Close the browser");
}

function getAccountBalance() {
    console.log("Navigate to the account balance page");
    let accountBalance = 100000; //block scope variable
    return accountBalance; //The value will be assigned to the function name. 
}