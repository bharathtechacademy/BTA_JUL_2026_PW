//Async functions : Asynchronous functions in TypeScript are all about the function that will return a promise, and it is going to wait for a certain time to fulfill the promise. 


// //Normal Function to Generate Random Number 
// function generateRandomNumber(): number {
//     return Math.random();
// }

// //calling normal function to generate random number
// console.log("Random Number : ", generateRandomNumber());


//Async Function to Generate Random Number
async function generateRandomNumberAsync(): Promise<number> {

    return new Promise((resolve, reject) => {

        setTimeout(() => {
            const random = Math.random();
            console.log(random);
            if (random > 0.5) {
                resolve(random); //returning the number
            } else {
                reject(new Error('Random number is less than 0.5.'))
            }
        }, 5000);


    });

}

//calling async functions
console.log("Random Number : ",  generateRandomNumberAsync());