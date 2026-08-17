//Strings : String is a collection of characters. 

let firstName: string = "Bharath";
let lastName: string = 'Reddy';
let role: string = "'Senior' SDET";
console.log(firstName);
console.log(lastName);
console.log(role);
let empInfo = `emp first name is ${firstName} , emp last name is ${lastName} and emp Role is ${role}`;
console.log(empInfo);

//1. Storing string inside the variable 
console.log("1. Storing string inside the variable");
let originalString: string = " Username : Admin | Password : admin123 ";
console.log(originalString);

//2. Method to calculate the total number of characters available inside the string. 
console.log("2. Method to calculate the total number of characters available inside the string. ");
console.log(`Total number of characters inside the string are ${originalString.length}`)

//3. Method to get a specific character by using an index 
console.log("3. Method to get a specific character by using an index ");
let charAtIndex5 :string = originalString.charAt(5);
console.log(`Character at index 5 is '${charAtIndex5}'`);

//Reverse the original String
let reverseString:string ="";
 for(let i:number = originalString.length-1;i>=0;i--){
    reverseString = reverseString+originalString.charAt(i);
 }
console.log(reverseString);

//4. Method to eliminate unwanted spaces from the string 
console.log("4. Method to eliminate unwanted spaces from the string");
let trimmedString: string = originalString.trim();
console.log(`String after eliminating unwanted spaces: '${trimmedString}'`);

//5. Method to eliminate all the spaces from the string 
console.log("5. Method to eliminate all the spaces from the string");
console.log(`Original String : '${originalString}'`);
console.log(`String after removing spaces: '${originalString.replace(/ /g, "")}'`);

//6. Method to eliminate all the alphabets from the string 
console.log("6. Method to eliminate all the alphabets from the string");
console.log(`Original String : '${originalString}'`);
console.log(`String after removing alphabets: '${originalString.replace(/[a-zA-Z]/g, "")}'`);

//7. Method to eliminate all the numbers from the string 
console.log("7. Method to eliminate all the numbers from the string");
console.log(`Original String : '${originalString}'`);
console.log(`String after removing numbers: '${originalString.replace(/[0-9]/g, "")}'`);

//8. Method to eliminate all the special chars from the string 
console.log("8. Method to eliminate all the special chars from the string");
console.log(`Original String : '${originalString}'`);
console.log(`String after removing special chars: '${originalString.replace(/[^0-9a-zA-Z]/g, "")}'`);

//9. Method to convert all the characters of the string into uppercase. 
console.log("9. Method to convert all the characters of the string into uppercase.");
console.log(`Original String : '${originalString}'`);
console.log(`Uppercase String : '${originalString.toUpperCase()}'`);

//10. Method to convert all the characters of the string into lowercase. 
console.log("10. Method to convert all the characters of the string into lowercase.");
console.log(`Original String : '${originalString}'`);
console.log(`Lowercase String : '${originalString.toLowerCase()}'`);

//11. Method to extract part of the string
console.log("11. Method to extract part of the string");
console.log(`Original String : '${originalString}'`);
console.log(`Username : '${originalString.substring(12, 17)}'`);
console.log(`Password : '${originalString.substring(31)}'`);

//12. Method to split the string 
console.log("12. Method to split the string");
let splitString: string[] = originalString.split(" ");
console.log(`Original String : '${originalString}'`);
console.log(`Username: ${splitString[3]} , Password: ${splitString[7]}`);

//13. Method to compare two different string values 
console.log("13. Method to compare two different string values");
//== (Loose Equality) It will compare only the value of the string. 
//=== (Strict Equality) It will compare both value and type of the string. 
let string1: string = "10";
let string2: string | number = 10;
console.log(`Loose Equality (==) : ${string1 == string2}`);
console.log(`Strict Equality (===) : ${string1 === string2}`);
//includes() => It will check whether the string contains a special character or not. 
//startsWith() => It will check whether the string starts with a specific substring or not.
//endsWith() => It will check whether the string ends with a specific substring or not.
console.log(`Check Bharath Reddy contains 'Reddy' : ${"Bharath Reddy".includes("hara")}`);
console.log(`Check Bharath Reddy starts with 'Bharath' : ${"Bharath Reddy".startsWith("Bharath")}`);
console.log(`Check Bharath Reddy ends with 'Reddy' : ${"Bharath Reddy".endsWith("Reddy")}`);

//14. Method to convert string to other data types and vice versa. 
console.log("14. Method to convert string to other data types and vice versa.");
let stdCode : number = 100;
let phone : number = 123400;
let std : string = String(stdCode);
console.log(std+phone);

let balance : string = " Account Balance  : $19999.99 ";
balance = balance.replace(/[^0-9.]/g,"");
console.log(balance);
let bal :number = parseFloat(balance); //parseInt(balance); //parseFloat(balance);
console.log(bal>=10000);