//Loops in Typescript

//Loop statements are nothing but a set of conditions that we are going to add along with the statement to execute the same code multiple times. 


let name: string = "Kranthi";

//Before Loops
// console.log(name);
// console.log(name);
// console.log(name);
// console.log(name);
// console.log(name);
// console.log(name);
// console.log(name);
// console.log(name);
// console.log(name);
// console.log(name);


//Loop Statements are also mainly divided into two different categories. 

//1. for loop => When we know the total number of iterations to be executed before itself 
//2. while loop => When we don't know the total number of iterations to be executed before 

//1.for loop : 

//Syntax : for(condition-to-start ; condition-to-end ; interval ) {
//statements to execute 
//}

//For loop to print the name 10 times 
for (let i: number = 1; i <= 10; i++) {
    console.log(name);
}


//2.while loop 
//syntax : while (condition-to-start) {
//statements
//}

let j: number = 1;
let pageLoaded: boolean = false;

while (j > 0) {

    //condition to break the loop
    if (j > 10 || pageLoaded) {
        break;
    }
    console.log("Refresh the Page");
    j++;
}


//Special cases in the loop statements

//1. for..of loop => Use to iterate over the values of an array or existing list. 
//2. for..in loop
//3. do..while loop


//Array 
let fruits: string[] = ["Apple", "Banana", "Mango", "Grapes"];

//Print each fruit name from the array by using a normal for loop. 
for (let i: number = 0; i < fruits.length; i++) {
    console.log(fruits[i])
}


//1. for..of loop => Iterate over each and every value of the given list. 
//Syntax :
//for(let value of array){
//console.log(value)
//}

for (let fruit of fruits) {
    console.log(fruit);
}

//2. for..in loop => Iterate over each and every property of the object. 
//Syntax:
//for(let key in object){
    //code to execute
//}

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

for(let key in empData){
    console.log(key);
    console.log(empData[key as keyof empInfo]);
}


//do..while loop => Execute the statements at least once and then check for the condition.
//Syntax :
//do{
//statements to execute
//}while(condition-to-check)

let x: number = 0;

// while(x>0){
//     console.log("Refresh the Page");
//     x++;
// }

do{
    console.log("Refresh the Page");
    x++;
}while(x>0);