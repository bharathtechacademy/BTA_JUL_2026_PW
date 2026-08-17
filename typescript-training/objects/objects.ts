//Objects : Object is a non-primitive data type that can help us to store multiple properties in the form of a key-value pair. 

//1. Storing the data inside the object 
console.log("1. Storing the data inside the object");
interface empInfo {
    "empName": string,
    "empId": number,
    "visaStatus": boolean,
    "salary"?: number,
    "address": {
        "street": string,
        "city": string,
        "state": string,
        "country"?:string
    }
}

let empData: empInfo  = {
    "empName": "Bharath",
    "empId": 1234,
    "visaStatus": true,
    "address": {
        "street": "123 Main St",
        "city": "Hyderabad",
        "state": "Telangana"
    }
}

let name : string = "Priya";

//storing multiple employees data inside the array of objects
let empDataArray: empInfo[] = [
    {"empName": "Bharath", "empId": 1234, "visaStatus": true, "address": {"street": "123 Main St", "city": "Hyderabad", "state": "Telangana"}},
    {"empName": "Ravi", "empId": 5678, "visaStatus": false, "address": {"street": "456 Elm St", "city": "Bangalore", "state": "Karnataka"}},
    {"empName": "Sita", "empId": 9101, "visaStatus": true, "address": {"street": "789 Oak St", "city": "Chennai", "state": "Tamil Nadu"}}
] ;

empDataArray[1]!.empName = "Ravi Varma";

//2.Access the data from the object. 
console.log("2.Access the data from the object.")
console.log(empData.empName);
console.log(empData["empName"]);

//3.Adding additional properties to the existing object 
console.log("3.Adding additional properties to the existing object");
empData.salary = 200000;
empData.address.country = "India";

//4.Update the existing property within the existing object. 
console.log("4.Update the existing property within the existing object.");
empData.empName = "Bharath Reddy";
console.log(empData);

//5. Deleting the existing property from the existing object.
console.log("5. Deleting the existing property from the existing object.");
delete empData.salary;
console.log(empData);

//6. Check if a property exists inside the object 
console.log("6. Check if a property exists inside the object");
console.log("visaStatus" in empData);
console.log("salary" in empData);

//7. Get all the keys from an object. 
console.log("7. Get all the keys from an object.");
console.log(Object.keys(empData.address));

//8. Get all the values from an object. 
console.log("8. Get all the values from an object.");
console.log(Object.values(empData));

//9. Get all the entries from an object. 
console.log("9. Get all the entries from an object.");
console.log(Object.entries(empData.address));

//10. Iterate through the object using for...in loop.
console.log("10. Iterate through the object using for...in loop.");
for (let key in empData) {
    let keyValue  = key;
    console.log(keyValue);
    console.log(`${key}: ${empData[key as keyof empInfo]}`);
}

//11. Verify the data type of the property within the object. 
console.log("11. Verify the data type of the property within the object.");
console.log(typeof empData.empName);
console.log(typeof empData.empId);
console.log(typeof empData.visaStatus);
console.log(typeof empData.salary);
console.log(typeof empData.address);

//12. Merge two objects
console.log("12. Merge two objects");
interface companyInfo{
    companyName: string,
    companyId: number,
    companyAddress: string
}

let companyData: companyInfo = {
    companyName: "Tech Solutions",
    companyId: 5678,
    companyAddress: "456 Elm St, Bangalore, Karnataka"
}

let mergedData = {...empData, ...companyData};
console.log(mergedData);


// const empData: Map<string, number[]> = new Map();
// empData.set("Alice Johnson", [75000, 5, 4.2]);
// empData.set("Bob Smith", [68000, 3, 3.8]);
// empData.set("Carol Davis", [82000, 7, 4.5]);
// empData.set("David Brown", [90000, 10, 2.0]);
// empData.set("Eva Green", [60000, 2, 3.5]);

let myMap: Map<string, Object> = new Map<string, Object>();

interface EmployeeData {
    salary: number,
    experience: number,
    rating: number
}

myMap.set("Alice Johnson", {empname: "Alice Johnson", salary: 75000, experience: 5, rating: 4.2});
myMap.set("Bob Smith", {empname: "Bob Smith", salary: 68000, experience: 3, rating: 3.8});


console.log(myMap);
console.log(myMap.get("Bob Smith"));
console.log(myMap.get("Bob Smith")["salary"]);