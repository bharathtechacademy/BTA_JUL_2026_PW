//Jumping Statements

//Jumping statements are all about a set of keywords we are going to use to terminate the execution.

//The main jumping statements in TypeScript are:
//1. break => Terminates the current loop or switch statement.
//2. continue => Skips the current iteration of the loop and moves to the next iteration.
//3. return => Exits from the current function and optionally returns a value.

for(let i:number = 1 ; i<=10; i++){

    if(i>=5 && i<=7){
        // break; // break statement will break the entire loop. 
        continue; // Continue statement will skip current iteration only. 
    }

    console.log(i);
}