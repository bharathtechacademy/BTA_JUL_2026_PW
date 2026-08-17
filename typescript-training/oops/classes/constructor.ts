// Employee Class

class Employee {

    // Properties /data 
    empId: number = 1234;
    empName: string = "John Doe";
    empProject: string = "TypeScript Training";

    //method 
    empAddress() {
        console.log("Employee Address is : New York");
    }

    //constructor
    constructor() {
        
    }

}


// Access data from employee class By creating the object of the employee class 
let obj = new Employee(); //Object of Employee class
console.log(obj.empId);
console.log(obj.empName);


