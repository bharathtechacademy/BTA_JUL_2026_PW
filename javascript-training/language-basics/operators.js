//Operators are nothing but a set of special characters used in JavaScript to perform different types of operations. 

//Operators in JavaScript are mainly categorized into five different categories. 

//1. Arithmetic operators 
//2. Assignment operators 
//3. Comparison operators 
//4. Logical Operators 
//5. Ternary Operator 

//1. Arithmetic operators  => The special characters used to perform mathematical operations 
// + Addition
// - substraction
// * multiplication
// / division
// % modulus (remainder)
// ++ increment (Increase the previous value by 1)
// -- decrement (Decrease the previous value by 1. )

let a = 10;
let b = 20;

//a++ => Post Increment  (Post execution of current line, increase the value by 1. )
//b-- => Post decrement. (Post execution of current line, decrease the value by 1. )
console.log(a++);
console.log(a);
console.log(b--);
console.log(b);

let c = 100;
let d = 200;

//++c => Pre increment => Increase the value by 1 first, then execute the line. 
//--d => Pre decrement => Decrease the value by 1 first. Then execute the line. 
console.log(++c); 
console.log(--d);

//2. Assignment operators  => The operators or special characters used to assign value to a variable 
//(= , += , -= , *=, /=, %=)

let i = 10;
console.log ("Initial value of 'i' is "+i);

i+=10 ; // i = i+10; => 10+10 = 20;
console.log ("After using += value of i is   "+i);

i-=5;//i = i-5 => 20 - 5 => 15
console.log ("After using -= value of i is   "+i);

i*=10; //i=i*10 = 15*10 = 150
console.log ("After using *= value of i is   "+i);

i/=20; //i=i/20 
console.log ("After using /= value of i is   "+i);

//3. Comparison operators  => Special characters used to compare two different values 
//==, ===, > , < , >=, <= , != , !==

//== Represents loose equality, loose equality meaning compare only data. 
//=== Represents strict equality, strict equality meaning compare data along with data type. 

let x = 10; //storing as number
let y = 10; //storing as number
let z = "10"; //storing as text

console.log(x == y);//true
console.log(x != z);//true (Because it is comparing only data )

console.log(x === y);//true
console.log(x !== z);//false (Because it is comparing data along with its data type )

// 4. Logical operators => Special characters used to build logic by combining multiple conditions together 
//&&(and) => All conditions must be true. 
//||(or) => Any one condition should be true. 
//!(not) => Opposite result. 

let p = 10;
let q = 20;
let r = 30;

console.log(p<q && q>r) ; // true && false = false
console.log(p<q || q>r) ; // true or false = true
console.log(!(p<q || q>r)) ; // not (true or false) = not(true) = false

//5. Ternary operator : Special characters used to write a condition in a single line or shorthand of an if-else conditional statement 
//Syntax : let result = (condition) ? value-if-true : value-if-false;
let age = 17;
let result = (age >= 18) ? "Eligible to Vote" : "Not Eligible to Vote ";
console.log(result);