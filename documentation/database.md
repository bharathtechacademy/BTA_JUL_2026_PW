# What is database ?
A database is an organized collection of data that is going to help us to access, review, and update a particular piece of information in a rapid and coherent manner. 

# What is RDBMS? 
RDBMS stands for Relational Database Management System. Mainly, this RDBMS is going to talk about maintaining the data in multiple tables instead of storing it in a single table and connecting them. 

# What is SQL? 
SQL stands for Structured Query Language. SQL is the programming language that we are going to use to communicate with our database. By using SQL, we can perform CRUD operations in a database. 

# What are CRUD operations in a database? 
- C Refers to create operations. => CREATE , INSERT
- R Refers to read operations => SELECT
- U Refers to update operations. => ALTER , UPDATE
- D Refers to delete operations. => DROP , DELETE 

# Data types in SQL ?

## Numeric Data Types (Datatypes used to store numbers with decimals and without decimals )
SMALLINT => It can store numbers without decimals from -32768 to +32767
INTEGER => It can store the numbers without decimals from -2147483648 to +2147483647
BIGINT => It can store the numbers without decimals from  -19 digit to +19 digit

FLOAT => It can store numbers with decimals up to 6 decimal points. 
DOUBLE => It can store numbers with decimals up to 15 decimal points. 
DECIMAL => It can store numbers with decimals up to 16K decimal points. 

SMALLSERIAL => It can store only positive numbers without decimals from 1 to 32,767. 
SERIAL => It can store only positive numbers without decimals from 1 to +2147483647
BIGSERIAL => It can store only positive numbers without decimals from 1 to +19 digit

## Char Datatypes
CHAR(n) => It can store a fixed number of characters. 
VARCHAR(n) => It can store a variable number of characters. 
TEXT => It can store unlimited characters. 

## Boolean Data Types
BOOLEAN => It can store the result of a condition in the form of true or false. 

## Date and Time Data Types 
DATE => It can store only date. 
TIME => It can store only time.
TIMESTAMP => It can store date and time together. 
INTERVAL => It can store the period in the form of seconds, minutes, hours, days, months, years, etc. 

# OPERATORS in SQL ?

In SQL, mainly we are going to have three different types of operators. 

1. Arithmetic Operators => The operators used in mathematical operations 

+ Represents addition 
- Represents subtraction. 
* Represents multiplication 
/ Represents division 
% Represents modulus or reminder 

2. Comparison Operators => The operators used to compare two different values 

= Refers equal to 
!= Refers not equal to 
> Greater than
< less than
>= Greaterthan or equal to
<= Lessthan or equal to

3. Logical operators => The operators used to build the logic by combining two or more conditions together 

AND => It will return true only if all conditions are true. 
OR => It will return true at least if one condition is true. 
NOT => It will always return the opposite result. 
BETWEEN => It will filter the rows within the specific range. (EMPID BETWEEN 10 AND 25 => 10 to 25 Employee records will be returned)
IN => It will filter the rows based on a list of specific values. (EMPID IN (9,15,21,28))
EXISTS => Filter the rows based on the result of the subquery. (EMPID EXIST (SLECT EMPID FROM PROMOTIONLIST))
LIKE => Filter the rows based on the pattern. We are going to use some special characters like % and _ to refer to the position while filtering the records. 
IS NULL => It will return all the records having NULL value. 

# Constraints in SQL ?
Constraints, meaning conditions added on top of the DB columns to avoid the invalid data 

NOT NULL => The column having a not null constraint won't allow null values. 
UNIQUE => The column having a unique constraint won't allow duplicate values. 
PRIMARY KEY => The column having a primary key constraint won't allow duplicate values and also null values. The primary key is a unique reference to separate each and every row within the table. 
FOREIGN KEY => A foreign key constraint is the key that is going to maintain the link between two different tables, ensuring referential integrity. 
CHECK => The column having a check constraint is going to verify custom conditions. 
DEFAULT => The column having a default constraint is always going to insert the default value when the user is not going to update one.

# Default Functions in SQL ?
Default functions are a set of default methods provided by the SQL programming language to manipulate the data that we have stored previously within the database. 

## Aggregate functions. 
Aggregate functions are all about the functions designed to perform calculations on a set of rows and return a single result. 

COUNT() => It will return the total number of rows available in the table. 
SUM() => It will return the sum of all the values available in a particular column. 
AVG() => It will calculate the average value within the specific column. 
MIN() => It will return Minimum value present in the specific column 
MAX() => It will return the maximum value present in the specific column. 

## Numerical Functions 
Numerical functions are all about the functions that we are going to use to perform mathematical operations. 

ABS() => It will return the absolute value or positive value of any number. => SELECT ABS(-129.99) => 129.99
CEIL() => It will return the nearest next integer value. => SELECT CEIL(123.11) => 124
FLOOR() => It will return the nearest previous integer value. => SELECT FLOOR (125.95) => 125
ROUND() => It will return the rounded value for a particular number based on the decimal point specified. => SELECT ROUND(125.995,2) => 126.00
POWER() => It will return the power of a specific number.  => SELECT POWER (2,3) => 8
SQRT() => It will return the square root of a specific number. => SELECT SQRT (4) => 2

## String Functions
String functions are all about the default methods in SQL to manipulate and transform the text or character data types. 

LENGTH() => It will return the total number of characters stored in the string. 
UPPER() => It will convert all the characters of the string into uppercase. 
LOWER() => It will convert all the characters of the string into lower case. 
TRIM() => It will remove beginning and trailing spaces from the string. 
CONCAT() => It will join two different strings together. 
SUBSTRING() => It will extract part of the string based on the start and end index specified. 




-- CREATE OPERATIONS

--CREATE NEW DATABASE
--CREATE DATABASE DB_NAME;
CREATE DATABASE STUDENT ;

--DELETE DATABASE
--DROP DATABASE DB_NAME
DROP DATABASE STUDENT;

--CREATE DB TABLE IN DATABASE
--CREATE TABLE TB_NAME (COL1_NAME DATATYPE CONSTRAINT ,COL2_NAME DATATYPE CONSTRAINT)
CREATE TABLE EMP_INFO (EMP_ID SERIAL PRIMARY KEY , EMP_NAME VARCHAR(30) NOT NULL, EMAIL VARCHAR(40) UNIQUE NOT NULL, EMP_AGE INTEGER CHECK(EMP_AGE>=18), EMP_SALARY INTEGER CHECK(EMP_SALARY>=10000));

-- CHECK THE NEW TABLE IN DATABASE
SELECT * FROM EMP_INFO;

--INSERT DATA INTO DATABASE TABLE
--INSERT INTO TB_NAME (COL1, COL2...) VALUES (COL1_VAL, COL2_VAL...);
INSERT INTO EMP_INFO (EMP_NAME,EMAIL,EMP_AGE,EMP_SALARY)
VALUES 
('BHARATH','Bharath@test.com',36, 200000),
('Kranthi', 'Kranthi@test.com',30, 100000),
('Priya','Priya@test.com',30, 150000)

--INSERT INVALID DATA INTO DATABASE TABLE
INSERT INTO EMP_INFO (EMP_NAME,EMAIL,EMP_AGE,EMP_SALARY)
VALUES 
('Sarath','Sarath@test.com',16, 200000)

-- UPDATE OPERATIONS (ALTER , UPDATE)

--UPDATE TABLE NAME 
--ALTER TABLE OLD_TB_NAME RENAME TO NEW_TB_NAME;
ALTER TABLE EMP_INFO RENAME TO NEW_EMP_INFO;

-- CHECK THE NEW TABLE IN DATABASE
SELECT * FROM NEW_EMP_INFO;

--UPDATE TABLE COLUMN NAME 
ALTER TABLE NEW_EMP_INFO RENAME EMAIL TO EMP_EMAIL;

-- UPDATE ADDITIONAL COLUMN IN THE DATABASE TABLE
ALTER TABLE NEW_EMP_INFO ADD EMP_ADDRESS VARCHAR(50);

-- REMOVE EXISTING COLUMN FROM DB TABLE
ALTER TABLE NEW_EMP_INFO DROP EMP_ADDRESS ;

-- UPDATE THE DATA WITH IN THE DB_TABLE
--UPDATE TB_NAME SET COL_NAME = NEW_VALUE  WHERE CONDITION;
UPDATE NEW_EMP_INFO SET EMP_AGE = 36 WHERE EMP_ID = 2;

--DELETE OPEATIONS (DROP , DELETE)

--DELETE EXISTING COLUMN FROM THE DATABASE
--ALTER TABLE TB_NAME DROP COL_NAME;
ALTER TABLE NEW_EMP_INFO DROP EMP_ADDRESS ;

--DELETE SPECIFIC RECORD FROM THE TABLE
-- DELETE FROM TABLE WHERE CONDITION;
DELETE FROM NEW_EMP_INFO WHERE EMP_ID = 2; 

--DELETE ALL RECORDS FROM THE TABLE
-- DELETE FROM TABLE;
-- TRUNCATE TABLE;
DELETE FROM NEW_EMP_INFO; 

-- DELETE ENTIRE TABLE
--DROP TABLE TB_NAME
DROP TABLE NEW_EMP_INFO;

-- DELETE DATABASE
--DROP DATABASE DB_NAME
DROP DATABASE STUDENT;


--READ OPERATIONS (SELECT QUERIES)