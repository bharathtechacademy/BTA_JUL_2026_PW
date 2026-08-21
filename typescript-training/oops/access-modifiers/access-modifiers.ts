// Access Modifiers in TypeScript

// Access Modifiers are nothing but a set of keywords used to control the access of class properties (data, methods and objects)

// There are mainly three different types of access modifiers we are going to use in TypeScript. 

//1. public / no access modifier
//2. protected
//3. private


//1. public / no access modifier

// The public access modifier is the default access modifier in TypeScript. 
// Public data can be accessed within the class. 
// Public data can be accessed within the child class. 
// Public data can be accessed outside of the class as well. 

//2. protected

// Protected data can be accessed within the class. 
// Protected data can be accessed within the child class. 
// Protected data cannot be accessed outside of the class.


//3. private

// Private data can be accessed within the class. 
// Private data cannot be accessed within the child class. 
// Private data cannot be accessed outside of the class.


//Main Class
class Person {

    private name: string = "Bharath Reddy";
    private age: number = 35;
    private city: string = "Hyderabad";

    //Method to display the data
    printData() {
        console.log(this.name);
        console.log(this.age);
        console.log(this.city);
    }

}

//Child Class
class Child extends Person {

    //Method to access the data from parent class (Person)
    printChildData() {
        console.log(this.name);
        console.log(this.age);
        console.log(this.city);

    }
}

//Outsider Class
class Outsider {
    //Method to display the data
    printOutsiderData() {
        let obj = new Person();
        console.log(obj.name);
        console.log(obj.age);
        console.log(obj.city);
    }
}


let obj = new Person();
obj.printData(); //Accessing the data from main class

