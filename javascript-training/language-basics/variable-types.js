//Variables are divided into different categories. 

//1. Local Variables => The variables declared inside the block 
//2. Global Variables => The variables declared outside the block


let empName = "Bharath"; //global variable => Can be accessed throughout the file 

{
    let empAge = 36; //local variable, can be accessed with in the block (wont be visible out side of the block)
    // console.log(empName);
    // console.log(empAge);
}

console.log(empName);
console.log(empAge);