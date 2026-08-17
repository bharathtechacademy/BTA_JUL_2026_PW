//Inheritance in TypeScript

//Accessing the parent class properties in the child class without creating any object 


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

}

//Child Class
class Child1 extends Person { // Child extends parent (single inheritance)

    state: string = "Telangana";

    //Method to display the data
    printData() {
        // let parent = new Person();
        console.log(this.name);
        console.log(this.age);
        console.log(this.city);
        console.log(this.state);
    }


}


//Child Class
class Child2 extends Person { // Child2 also extends same parent (hierarchical inheritance)

    state: string = "Telangana";

    //Method to display the data
    printData() {
        // let parent = new Person();
        console.log(this.name);
        console.log(this.age);
        console.log(this.city);
        console.log(this.state);
    }


}

class grandChild extends Child1 { // grandChild extends child1 (multilevel inheritance)

    country: string = "India";

    //Method to display the data
    printData() {
        // let parent = new Person();
        console.log(this.name);
        console.log(this.age);
        console.log(this.city);
        console.log(this.state);
        console.log(this.country);
    }

}

// class outsider extends Person, Child1 { // outsider extends both parent and child1 (multiple inheritance)
//     // This will throw an error because TypeScript does not support multiple inheritance directly.
//     // You can use interfaces to achieve similar functionality.
// }