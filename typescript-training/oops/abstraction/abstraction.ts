//Abstraction : Abstraction is a concept of hiding the implementation of methods. 

//method : Method is a block of code or collection of statements written together to complete a specific task. 

abstract class CommonMethods {

    // loginIntoApplication() {
    //     console.log("Launch the application. ")
    //     console.log("Enter the credentials. ")
    //     console.log("Click on the login button. ")
    // }

    abstract loginIntoApplication(): void;

    logoutFromApplication(): void {
        console.log("Click on the profile icon.  ")
        console.log("Click on the logout button. ")
        console.log("Verify logout is successful.  ")
    }
}

class Test extends CommonMethods {

    loginIntoApplication(): void {
        console.log("Launch the application. ")
        console.log("Enter the credentials. ")
        console.log("Click on the login button. ")
    }

}

//let obj = new CommonMethods(); // Cannot create an instance of an abstract class.
let obj = new Test();
obj.loginIntoApplication();
obj.logoutFromApplication();