//Callback functions : 

//Program: 
console.log("Execution Started"); //sec 1
console.log("Line 2 Executed");
console.log("Line 3 Executed");
console.log("Line 4 Executed");
setTimeout(() => {
    console.log(getSumUpto(10000000000));
}, 5000);
setTimeout(() => {
    console.log(getSumUpto(10000000000));
}, 5000);
console.log("Line 6 Executed");
console.log("Line 7 Executed");
console.log("Line 8 Executed");
console.log("Line 9 Executed");
console.log("Execution Completed");//sec 10
//it will take break for 5 sec
// in 15th sec it will run the logic


//Function to get the sum of numbers from 1 to the given input number 
function getSumUpto(n: number): number {
    let sum = 0;
    for (let i = 1; i <= n; i++) {
        sum += i;
    }
    return sum;
}