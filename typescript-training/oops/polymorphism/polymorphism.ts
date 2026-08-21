// Polymorphism => Polymorphism is a concept of having one single method with multiple implementations. 

//Polymorphism can be implemented in two different ways. 

//1. Compile time for polymorphism(method overloading)(not allowed in typescript)
//2. Run time for polymorphism(method overriding)(allowed in typescript)

//1. Compile time for polymorphism
//Multiple methods with the same name within the same class with different parameters

//2. Run time for polymorphism
//Maintaining multiple methods with the same name and the same parameters between parent and child classes 


class Parent {

    loginIntoApplication(): void {
        console.log("Enter the username. ")
        console.log("Enter the password. ")
        console.log("Click on the login button. ")
    }

}


class Child extends Parent {

    loginIntoApplication(): void {
        console.log("Launch the Chrome Browser and enter URL: www.amazon.in ")
        // console.log("Enter the username. ")
        // console.log("Enter the password. ")
        // console.log("Click on the login button. ")
    }


    // add(a: number, b: number): void {
    //     console.log(a + b);
    // }

    // add(x: string, y: string): void {
    //     console.log(x + y);
    // }

}

let obj = new Child();
// obj.add(10, 20);
// obj.add("Hello, ", "World!");
obj.loginIntoApplication();