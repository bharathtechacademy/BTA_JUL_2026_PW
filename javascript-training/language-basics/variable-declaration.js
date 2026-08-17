//How to store the data in JavaScript? 
//declaration variable = data ;

// In JavaScript, we can declare the variable by using three different keywords. 

//1.var (We should avoid in the modern JavaScript programs ) (Can be used to store the data which is changing dynamically )
//2.let (Can be used to store the data which is changing dynamically )
//3.const (Can be used to store constant data )

//These variable declarations will differ mainly based on four important parameters. 

//1. Initialization 
//2. Reassignment 
//3. Re-declaration 
//4. Scope 


//1. Initialization => Adding the value at the time of declaration 
var a; //No need to initialize any value. 
let b; //No need to initialize any value. 
const c = 1234; //Compulsory we need to initialize the value at the beginning. 

//2. Reassignment => Changing the original value. 
a = 10; //We can reassign the value.
b = 20; //We can reassign the value. 
//  c = 30; //We can't reassign the value.

//3. Re-declaration => Declaring the same variable again to store different data 
var a = "Bharath"; //Re-declaration is allowed. 
// let b = "Sarath"; //Re-declaration is not allowed. 
// const c = "ABC"; //Re-declaration is not allowed. 

console.log(a);

//4. Scope => Where can we access the data? 
//var => not block scoped
//let =>  block scoped
//const =>  block scoped


{
    let x = 100;
    const y = 200;
    var z = 300;

    // console.log(x);
    // console.log(y);
    // console.log(z);
    // console.log(a);
}

// console.log(x);
// console.log(y);
console.log(z);