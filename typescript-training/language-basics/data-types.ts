//Typescript : TypeScript is a superset of JavaScript. 

//Syntax to store data:
//Declaration Variable : DATATYPE = Data ;

//In TypeScript, there are two different categories of data types available. 

//1. Primitive Data Types
//2. Non-Primitive Data Types


// ****************************************
// ***********Primitive Datatypes**********
// ****************************************

//number  => The data type that can store numbers with decimals or without decimals 
//Number should be stored without any quotations. 

let num1: number = 10;
let num2: number = 10.254;
console.log(typeof num1);
console.log(typeof num2);

//string => The data type that can store text, characters, and words .
//String should be stored always with quotations.  ( Single quotes or double quotes or back ticks)
let firstName: string = "Bharath";
let lastName: string = 'Reddy';
let role: string = "'Senior' SDET";
console.log(firstName);
console.log(lastName);
console.log(role);
let empInfo = `emp first name is ${firstName} , emp last name is ${lastName} and emp Role is ${role}`;
console.log(empInfo);

//boolean => Boolean data type will store the result of a condition in the form of true or false. 
let result: boolean = 10 > 20;
console.log(result);

//undefined => Undefined represents a variable that has been declared but not assigned any value. 
let empId: undefined;
console.log(empId);

//null => Null represents a variable that has been declared and assigned a null value intentionally. 
let salary: null = null;
console.log(salary);

//union => Union represents more than one data type within the variable. 
let empAddress: string | number | boolean = "Hyderabad";
console.log(empAddress);
empAddress = 500081;
console.log(empAddress);

//any => any data type is allowed within the variable.  (When we are going to use any type safety will be removed. )
let data: any = "Bharath";
console.log(data);

data = 1234;
console.log(data);

data = true;
console.log(data);


// ****************************************
// ******** Non-Primitive Datatypes********
// ****************************************

//object => Object data type represents a collection of key-value pairs stored together. 
interface empInfo {
    "empName": string,
    "empId": number,
    "visaStatus": boolean,
    "address": {
        "street": string,
        "city": string,
        "state": string
    }
}

let empData: empInfo = {
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
let fruits: string[] = ["Apple", "Banana", "Mango", "Grapes"];
let prices: number[] = [200, 80, 100, 120];
let fruitsAndPrices: (number | string)[] = ["Apple", 200, "Banana", 80, "Mango", 100, "Grapes", 120];

//accessing the data from the array
console.log(fruits[0]);
console.log(prices[1]);
console.log(fruitsAndPrices[3]);

//tuples in typescript : tuple is an ordered array in TypeScript. 

//Problem Statement : Store Employee Name, Employee ID, and Visa Status within the array. 

//Array :
let empDetails: (string | number | boolean)[] = [1234, 1235, "Bharath", true];


//tuple:
let empInformation: [string, number, boolean] = ["Bharath", 1234, true];

//function => Function is a data type that represents a block of code or collection of statements written together to complete a specific task. 

function loginIntoApplication(browserName:string, url:string) : void {
    console.log(`Launch the ${browserName} Browser`);
    console.log(`Enter the URL: "${url}"`);
    console.log("Enter the username as 'Bharath' and password as 'Bharath@123'");
    console.log("Click on the login button");
}

function logoutFromApplication():void {
    console.log("Logout from the application");
    console.log("Close the browser");
}

function getAccountBalance():(number |string)[] {
    console.log("Navigate to the account balance page");
    let accountBalance:(number |string)[] = [100000,"Bharath"]; //block scope variable
    return accountBalance; //The value will be assigned to the function name. 
    // let name:string = "Bharath"; //This line will not be executed because the function has already returned a value.
}

function fail():never {
     throw new Error("This function will never return any value");
}


//Set => Set is a data type that represents a collection of unique values of any data type. 
let empIds: Set<number> = new Set();
empIds.add(1234);
empIds.add(7237);
empIds.add(1236);
empIds.add(1236);
empIds.add(1237);
console.log(empIds);

//Map => Map is a data type that represents a collection of key-value pairs,
//where key and value can be any data type, but key should be unique. 
let empValues: Map<number, string> = new Map();
empValues.set(1234, "Bharath");
empValues.set(1235, "Bharath");
empValues.set(1236, "Sarath");
empValues.set(1236, "ABC");
console.log(empValues);