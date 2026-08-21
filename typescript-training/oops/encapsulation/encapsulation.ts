//Main Class

class Person {

    private name: string = "Bharath Reddy";
    private age: number = 35;
    private city: string = "Hyderabad";

    public getName(): string {
        return this.name;
    }

    //Method to display the data
    printData() {
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
        console.log(obj.getName());

        // console.log(obj.age);
        // console.log(obj.city);
    }
}