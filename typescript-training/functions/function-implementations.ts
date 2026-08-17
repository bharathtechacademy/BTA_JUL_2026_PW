//Function : Block of code or collection of statements written together to complete a specific task 

//There are multiple ways we can implement the functions in TypeScript. 

//1. Function without parameters and without return type 
//The function is created without any parameters, and also it is not going to give us any output value. 
function login(): void {
    console.log("Launch the Chrome browser.");
    console.log("Enter the URL: www.amazon.com ");
    console.log("Enter username as Bharath and password as Bharath123. ");
    console.log("Click on the Login button. ");
}

//calling function
login();

//2. Function with parameters and without return type 
//The function is created with some input parameters as there is a change in the data, but it is not going to return any value. 
function loginWith(username: string, password: string): void {
    console.log("Launch the Chrome browser.");
    console.log("Enter the URL: www.amazon.com ");
    console.log(`Enter username as ${username} and password as ${password}. `);
    console.log("Click on the Login button. ");
}

//Calling function 
loginWith("Bharath", "Bharath123");

//3. Function with parameters and with return type 
//The function is created with input parameters, and also it is going to return some output value at the end of the execution. 
function getAccountBalance(username: string, password: string): number {
    console.log("Launch the Chrome browser.");
    console.log("Enter the URL: www.icici.com ");
    console.log(`Enter username as ${username} and password as ${password}. `);
    console.log("Click on the Login button. ");
    console.log("Click on the account section. ");
    const accountBalance: number = 10000;
    return accountBalance;
}

//Calling function
console.log(getAccountBalance("Bharath", "Bharath123"));

//4. Function without parameters and with return type 
//The function is created without any input parameters, but it is going to return some output value. 
function getCurrentYear(): number {
    let date = new Date();
    return date.getFullYear();
}

//calling function
console.log(getCurrentYear());

//5. Function with optional parameters. 
//Function is created with a couple of parameters, but it is not mandatory to enter all the parameters while calling the function.
function printEmpDetails(empId: number, empName: string, empSalary?: number): void {  //? refers optional paramater
    console.log("Employee name is " + empName);
    console.log("Employee id is " + empId);
    if (empSalary) {
        console.log("Employee salary is " + empSalary);
    }
}

//calling function
printEmpDetails(1234, "Bharath",200000);

//6. Function with default parameters 
// Function is created with a couple of parameters, and by default we are also going to provide the value if the user is not going to enter anything. 
function empInformation(empId: number, empName: string, visaStatus: boolean = false): void {  
    console.log("Employee name is " + empName);
    console.log("Employee id is " + empId);
    console.log("Employee visa status is " + visaStatus);
}

//calling function
empInformation(1234, "Bharath", true);

//7. Function with Rest Parameters 
//Function with multiple parameters like an array 
function sumOfNumbers(...numbers : number []){
    let sum:number = 0;
    for(let num of numbers){
        sum+=num;
    }
    return sum;
}

console.log(sumOfNumbers(1,2,3,4));