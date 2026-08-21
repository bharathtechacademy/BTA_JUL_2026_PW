//this : This keyword refers to the current class instance. (This keyword can be used to access current class data and current class methods as well. )
//super : Super keyword refers to parent class properties. (Super keyword can be used to access only methods. We cannot get the parent class data. )

//Main Class
class Person {

    name: string = "Bharath Reddy";
    age: number = 35;
    city: string = "Hyderabad";

    //Method to display the data
    printData() {
        console.log(this.name);
        console.log(this.age);
        console.log(this.city);
    }

    printSalary() {
        console.log("Salary is 100000");
    }

}



//Child 1 Class
class Child extends Person {

    name: string = "Sarath Reddy";

    printSalary() {
        console.log("Salary is 200000");
    }

    state: string = "Telangana";
    //Method to display the data
    printChildData() {
        console.log(this.name);
        console.log(super.name);
        console.log(this.age);
        console.log(this.city);
        console.log(this.state);
        this.printSalary();
        super.printSalary();

    }
}