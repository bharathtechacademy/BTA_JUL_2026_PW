// //Class with multiple methods related to employee 
// class Employee {

//     //method 1
//     printEmployeeDetails(empId: number, empName: string) {
//         console.log("Employee Id: " + empId);
//         console.log("Employee Name: " + empName);
//     }

//     //method 2
//     printEmployeeProjects(empId: number, empProject: string) {
//         console.log("Employee Id: " + empId);
//         console.log("Employee Projects: " + empProject);
//     }

//     //method 3
//     printEmployeeRole(empId: number, empRole: string) {
//         console.log("Employee Id: " + empId);
//         console.log("Employee Role: " + empRole);
//     }
// }

// //Access the methods by creating an object of the Employee class. 
// let emp = new Employee();

// //calling method 1
// emp.printEmployeeDetails(1234,"Bharath Reddy");

// //calling method 2
// emp.printEmployeeProjects(1234, "Creatio CRM");

// //calling method 3
// emp.printEmployeeRole(1234, "Sr SDET");

//Class with multiple methods related to employee 
let empId: number = 1234;

class Employee {

    empId: number = 0; //Originally, employee ID is zero. 

    constructor(id: number) {
        this.empId = id; //Immediately after creating the object, the employee ID will be updated with the employee ID coming from the object. 
    }

    //method 1
    printEmployeeDetails(empName: string) {
        console.log("Employee Id: " + this.empId);
        console.log("Employee Name: " + empName);
    }

    //method 2
    printEmployeeProjects(empProject: string) {
        console.log("Employee Id: " + this.empId);
        console.log("Employee Projects: " + empProject);
    }

    //method 3
    printEmployeeRole(empRole: string) {
        console.log("Employee Id: " + this.empId);
        console.log("Employee Role: " + empRole);
    }
}

//Access the methods by creating an object of the Employee class. 
let emp = new Employee(1234);

//calling method 1
emp.printEmployeeDetails("Bharath Reddy");

//calling method 2
emp.printEmployeeProjects("Creatio CRM");

//calling method 3
emp.printEmployeeRole("Sr SDET");