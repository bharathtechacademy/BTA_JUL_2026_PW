//Debugging : Debugging is the process of identifying and fixing the errors within the program. 
console.log("Executing Line 1");
console.log("Executing Line 2");
console.log("Executing Line 3");
sumOfNumbers(5,10) ;
console.log("Executing Line 5");
console.log("Executing Line 6");
console.log("Executing Line 7");
console.log("Executing Line 8");
console.log("Executing Line 9");
console.log("Executing Line 10");


// Debugging the program step-by-step 

// 1. Add the break points (before the line where you want to manually execute the program).
// 2. Run the program in debug mode. 


//continue(F5) => Continue the auto execution till the next breakpoint. 
//stop(Shift+F5) => Stop the execution completely. 
//Restart (Cntrl+Shift+F5) => Restarting the execution of the program from the beginning 

//Step Over(F10) => Execute the current line and move to the next line. 
//Step Into (F11) => Go inside the function and check the internal code. 
//Step Out (Shift+F11) => Come out of the function and move to the next line. 












//Logic to get the sum of two numbers
function sumOfNumbers(a, b) {
    let c = a - b;
    console.log(c);
}