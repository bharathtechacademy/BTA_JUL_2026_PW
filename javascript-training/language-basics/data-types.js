//Datatypes in JavaScript are divided into two different categories. 

//1. Primitive Datatypes (Immutable data types ) (That means the original value won't change if we are going to perform the operation. )
//2. Non-Primitive Datatypes (Mutable data types ) (Original value will change. )


// //Immutable
// let a = 10;
// a+10;
// console.log(a);

// //Mutable
// let empData = {
//     "name" :"abc",
//     "id":123
// }
// empData.age = 36;
// console.log(empData);

// ****************************************
// ***********Primitive Datatypes**********
// ****************************************

//number  => The data type that can store numbers with decimals or without decimals 
//Number should be stored without any quotations. 
let num1 = 10;
let num2 = 10.254;

console.log(typeof num1);
console.log(typeof num2);

//string => The data type that can store text, characters, and words .
//String should be stored always with quotations.  ( Single quotes or double quotes or back ticks)
let firstName = "Bharath";
let lastName = 'Reddy';
let role = "'Senior' SDET";
console.log(typeof firstName);
console.log(typeof lastName);
console.log(typeof role);

let empInfo = `emp first name is ${firstName} , emp last name is ${lastName} and emp Role is ${role}`;
console.log(empInfo);

//boolean => Boolean data type will store the result of a condition in the form of true or false. 
let result = 10 > 20;
console.log(typeof result);

//undefined => Undefined represents a variable that has been declared but not assigned any value. 
let empId;
console.log(typeof empId);

//null => Null represents a variable that has been declared and assigned a null value intentionally. 
let salary = 100000;
salary = null;
console.log(salary);

//Symbol => Symbol data type represents a unique hidden identifier inside an object. 
let countryOfOrigin = Symbol();
let productInfo = {
    "productName": "IPhone",
    "model": "17 Pro Max",
    [countryOfOrigin]: "China"
}
console.log(productInfo);

// ****************************************
// ******** Non-Primitive Datatypes********
// ****************************************

//object => Object data type represents a collection of key-value pairs stored together. 
// let empName = "Bharath";
// let empId = 1234;
// let visaStatus = true;

let empData = {
    "empName": "Bharath",
    "empId": 1234,
    "visaStatus": true,
    "address": {
        "street": "123 Main St",
        "city": "Hyderabad",
        "state": "Telangana"
    }
}

//Accessing the data from the object 
//method 1 : (Static Data )
console.log(empData.empName);
console.log(empData.address.city);

//method 2 : (Dynamic Data )
console.log(empData["empName"]);
console.log(empData["address"]["city"]);


//Array => Array is a data type that can store a list of values. 
let fruits = ["Apple", "Banana", "Mango", "Grapes"];
let prices = [200, 80, 100, 120];
let fruitsAndPrices = ["Apple", 200, "Banana", 80, "Mango", 100, "Grapes", 120];

//accessing the data from the array
console.log(fruits[0]);
console.log(prices[1]);
console.log(fruitsAndPrices[3]);

//function => Function is a data type that represents a block of code or collection of statements written together to complete a specific task. 

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

//Set => Set is a data type that represents a collection of unique values of any data type. 
let empIds = new Set();
empIds.add(1234);
empIds.add(7237);
empIds.add(1236);
empIds.add(1236);
empIds.add(1237);
console.log(empIds);

//Map => Map is a data type that represents a collection of key-value pairs,
//where key and value can be any data type, but key should be unique. 
let empValues = new Map();
empValues.set(1234, "Bharath");
empValues.set(1235, "Bharath");
empValues.set(1236, "Sarath");
empValues.set(1236, "ABC");
console.log(empValues);

//Date => Date represents date and time. 
let currentDate = new Date();
console.log(currentDate);

//get 
// - Current date
console.log(currentDate.getDate());
// - Current month
console.log(currentDate.getMonth() + 1); // Months are zero-based
// - Current year
console.log(currentDate.getFullYear());
// - Current hour
console.log(currentDate.getHours());
// - Current minute
console.log(currentDate.getMinutes());
// - Current second
console.log(currentDate.getSeconds());
// - Current millisecond
console.log(currentDate.getMilliseconds());
// - Current Day
console.log(currentDate.getDay() + 1); // Days are zero-based (0 = Sunday, 1 = Monday, ...)

let email = `bharath.reddy${currentDate.getTime()}@example.com`;
console.log(email);