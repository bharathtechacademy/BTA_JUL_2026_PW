//Function : A function is a block of code or a collection of statements written together to complete a specific task. 

//1. Named Functions
//2. Anonymous Functions
//3. Arrow Functions


//1. Named Functions => The function is declared with some name. 

//Syntax :
// function functionName(parameters) {
//     //code to be executed
// }

// Example:
function add(a: number, b: number): number {
    return a + b;
}


//2. Arrow Functions => The function is declared without any name, And Implementation is done using the arrow operator (=>).

//Syntax :
// (parameters) => {
//     //code to be executed
// }

let sum = (a:number,b:number) => a+b;
console.log(sum(1,2));

//3. Anonymous Functions => The function is declared without any name, And Implementation is done using the function keyword.

// Anonymous functions will be used as a parameter to another function. 

//Syntax :
// function(parameters) {
//     //code to be executed
// }

//Example:
let multiply = function(a:number,b:number) {
    return a*b;
};

let divide = (a:number,b:number) => a/b;
console.log(divide(4,2));



//normal function with number as parameter
function square(num: number): void { // num is a parameter with  type as number
    console.log(num * num);
}


//calling the function
square(5); // Output: 25 // actual value passed is 5 


// Function with function as a parameter
function calculate(num: (x:number) => number): void { // num is a parameter with  type as number
    console.log(num(5));
}


//Calling function
calculate(
    (a:number):number =>{
        return a*a ;
    }
)


calculate(
    (a:number):number =>{
        return a*a*a ;
    }
)