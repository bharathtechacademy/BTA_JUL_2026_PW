class Person {

    static name: string = "Bharath Reddy";
    age: number = 35;
    city: string = "Hyderabad";

    //Method to display the data
    static printData1() {
        console.log(this.name);
    }

    printData2() {
        console.log(Person.name);
        console.log(this.age);
        console.log(this.city);
    }

}

let obj = new Person();
Person.printData1();
obj.printData2();