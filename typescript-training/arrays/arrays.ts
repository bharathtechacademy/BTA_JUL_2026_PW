//Array : Array is a data type that can store a list of values. 

//1. Storing the values within the array 
console.log("1. Storing the values within the array");
const fruits: string[] = ["Apple", "Banana", "Mango", "Orange"];
const prices: number[] = [10, 20, 30, 40];
const fruitsAndPrices: (string | number)[] = ["Apple", 10, "Banana", 20, "Mango", 30, "Orange", 40];
console.log(fruits);
console.log(prices);

//2. Accessing the values from the array 
console.log("2. Accessing the values from the array");
console.log(fruits[0]); // Apple
console.log(prices[1]); // 20
console.log(fruitsAndPrices[2]); // Banana
console.log(fruitsAndPrices[3]); // 20
console.log(fruitsAndPrices.length); // 8 (length of the array=> max index can be accessed is 7)

//3.Adding additional value to the existing array at the end 
console.log("3.Adding additional value to the existing array at the end ");
fruits.push("Grapes");
prices.push(100);
console.log(fruits);
console.log(prices);

//4. Delete the last value from an existing array
console.log("4. Delete the last value from an existing array");
fruits.pop();
prices.pop();
console.log(fruits);
console.log(prices);

//5.Adding additional value to the existing array at the begining 
console.log("5.Adding additional value to the existing array at the begining ");
fruits.unshift("Grapes");
prices.unshift(100);
console.log(fruits);
console.log(prices);

//6. Delete the first value from an existing array
console.log("6. Delete the first value from an existing array");
fruits.shift();
prices.shift();
console.log(fruits);
console.log(prices);

//7. Add and delete  values inside the array at specific index
console.log("7. Add and delete  values inside the array at specific index");
//array.splice(index , num-of-ele-to-be-deleted , values-to-be-added);
fruits.splice(1,0,"Grapes","Papaya");
console.log(fruits);

//8. Create a new array by extracting part of the values from the existing array. 
console.log("8. Create a new array by extracting part of the values from the existing array. ");
//array.slice(start-index, end-index+1);
let freshFruits :string [] = fruits.slice(3,5);
console.log(freshFruits);

//9. Create a new array by merging multiple existing arrays. 
console.log("9. Create a new array by merging multiple existing arrays. ");
let veggies: string [] = ["potato", "tomato","chilli"];
let fruitsAndVeggies :string [] = fruits.concat(veggies);
console.log(fruitsAndVeggies);

//10. Find the index of a specific value within the array. 
console.log("10. Find the index of a specific value within the array. ")
console.log(fruits.indexOf("Mango"));
console.log(fruits.indexOf("dragonfruit")); // -1 (not found)

//11.Iterate all the values from the array. 
console.log("11.Iterate all the values from the array. ");
for(let fruit of fruits){
    console.log(fruit);
}

//12. Reverse the values within the array. 
console.log("12. Reverse the values within the array. ");
console.log(fruits);
fruits.reverse();
console.log(fruits);

//13. Sort the values within the array. 
console.log("13. Sort the values within the array.");
fruits.sort();
console.log(fruits);
// prices.sort((a,b) => b-a);
fruits.reverse();
console.log(fruits);