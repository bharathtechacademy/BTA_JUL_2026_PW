import {PI , sumOfNumbers } from '../modules/1-named-exports.ts';
import {PI as pi, sumOfNumbers as sum} from '../modules/2-export-all.ts';

console.log(`The value of Pi is : ${PI}`);
sumOfNumbers(10,10);
console.log(`The value of Pi from second module is : ${pi}`);
sum(20,20);