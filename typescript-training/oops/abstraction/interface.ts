//Interface is all about 100% abstract class With full of abstract methods only 

interface CommonMethods1 {

    loginIntoApplication(): void;

    logoutFromApplication(): void ;

}

interface CommonMethods2 {

    navigateToApplication(): void;

    closeTheApplication(): void;

}

class Test implements CommonMethods1, CommonMethods2 {

    loginIntoApplication(): void {
        console.log("Login into application");
    }

    logoutFromApplication(): void {
        console.log("Logout from application");
    }

    navigateToApplication(): void {
        console.log("Navigate to application");
    }

    closeTheApplication(): void {
        console.log("Close the application");
    }

}