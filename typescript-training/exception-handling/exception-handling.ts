//Exception Handling in TypeScript ( Handle the exceptions or control the exceptions. 

//We can handle the exceptions in two different ways. 

//1. When there is an exception, I want to ignore it and proceed further.  => try - catch exception handling
//2. When there is no exception, I want to create one. => throw an custom exception

//Syntax of try-catch block 

// try{
//     //main code
// }catch(error){
//     //alternate code
// }finally{
//     //mandatory code (optional)
// }


let input : any ;

// console.log(input.toLowerCase());

// console.log("Execution completed.");

// try{
//     console.log(input.toLowerCase());
// }catch(abc){
//     console.log("Exception occured : " + abc);
//     console.log("Please provide a valid input.");
//     console.log(input.toUpperCase());
// }finally{
//     console.log("Execution completed.");
// }


//Syntax of throw block

// throw new Error("Custom Exception Message");

let age : number = 18;

if(age < 18){
    throw new Error("You are not eligible to vote.");
}else{
    console.log("You are eligible to vote.");
}

console.log("Execution completed.");