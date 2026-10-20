# Prompt Engineering Frameworks 

## What is a prompt? 
A prompt is an instruction written in natural language to share with the AI model to guide its response. In short, this is an input that we are going to share with the AI model about what you want to generate from the AI model. 

## What is prompt engineering? 
Prompt engineering is the skill of designing and structuring inputs to get accurate and relevant output from the AI model. 

## Why prompt engineering matters ?
Without prompt engineering, if you try to add some random prompts, it may give us generic answers. It may miss most of the edge case scenarios that we are looking for. It may also produce inconsistent output. 

Instead, if you are going to use prompt engineering ,
We can get production-ready results. Always, AI is going to behave like an expert, and very importantly, it is going to save a lot of time in regular day-to-day activities. 

## Prompt engineering frameworks 
Prompt engineering framework is all about how exactly we can write a structured and organized prompt to get accurate output. 

There are multiple prompt engineering frameworks available in the market to write a better prompt to get a relevant response every time from the AI model. 

A couple of prompt engineering frameworks are 

1. RACE Framework
2. CLEAR Framework


## 1.RACE Framework

- R Refers to role 
- A Refers to action 
- C Refers to context 
- E Refers to expectation or examples 

### Before RACE Framework

Prompt: 
Can you read the above user story and write all the possible test cases with detailed test steps? It should cover all the positive, negative, and edge cases related to this particular user story. 

### After RACE Framework

Role : Act as a senior quality analyst with great experience in software testing. 

Action : Write all the possible positive, negative, and edge-case test cases for the given user story. 

Context : This application is related to Creatio CRM. It is a CRM-based application. Recently, our developer designed a login page. Now we need to validate this login page with all the possible test scenarios to identify the defects. For that, we need to generate detailed test cases that should cover end-to-end functionality related to login validations. Very importantly, I want to upload all these test cases in Jira by following the standard Jira test case template. 

Expectation :  Write all the positive, negative, and edge cases in the below format. (sample.csv)

sample.csv
==========
Key,Name,Status,Precondition,Objective,Folder,Priority,Component,Labels,Owner,Estimated Time,Coverage (Issues),Coverage (Pages),Test Script (Step-by-Step) - Step,Test Script (Step-by-Step) - Test Data,Test Script (Step-by-Step) - Expected Result,Test Script (Plain Text),Test Script (BDD)
CRM-T1,Verify whether the cookies consent pop-up is getting displayed,Draft,,,,Normal,,,712020:70b6d18c-4fad-49c8-a864-1fdeb607c853,,,,Launch the browser,Chrome Browser,Browser should be launched successfully,,
,,,,,,,,,,,,,Enter URL and Launch the application,URL :  <https://accounts.creatio.com/login/alm.>,CREATIO CRM application should be launched successfully. ,,
,,,,,,,,,,,,,Verify whether cookies consent pop-up is getting displayed,N/A,Cookies consent pop-up should be displayed successfully,,
CRM-T2,Verify valid login with correct credentials,Draft,,,,Normal,,,,,,,,Launch the browser,Chrome Browser,,
,,,,,,,,,,,,,Enter URL and Launch the application,URL : <https://accounts.creatio.com/login/alm>,CREATIO CRM application should be launched successfully,,
,,,,,,,,,,,,,Verify whether cookies consent pop-up is getting displayed,N/A,Cookies consent pop-up should be displayed successfully,,
,,,,,,,,,,,,,"Select ""Allow All"" button",N/A,Cookies pop-up should be closed successfully,,
,,,,,,,,,,,,,Enter valid business email,validuser@domain.com,Email field should accept valid format,,
,,,,,,,,,,,,,Enter valid password,ValidPassword123,Password field should accept valid input,,
,,,,,,,,,,,,,Click Login,N/A,User should be logged in successfully,,


## 2. CLEAR Framework

Clear framework is slightly more human-like and iterative, especially when it comes to the prompt. 

- C refers to context. 
- L refers to limitations. 
- E Refers to examples 
- A Refers to action 
- R Refers to Role 


Role : Act as a senior quality analyst with great experience in software testing. 

Action : Write all the possible positive, negative, and edge-case test cases for the given user story. 

Context : This application is related to Creatio CRM. It is a CRM-based application. Recently, our developer designed a login page. Now we need to validate this login page with all the possible test scenarios to identify the defects. For that, we need to generate detailed test cases that should cover end-to-end functionality related to login validations. Very importantly, I want to upload all these test cases in Jira by following the standard Jira test case template. 

Expectation :  Write all the positive, negative, and edge cases in the below format. (sample.csv)

sample.csv
==========
Key,Name,Status,Precondition,Objective,Folder,Priority,Component,Labels,Owner,Estimated Time,Coverage (Issues),Coverage (Pages),Test Script (Step-by-Step) - Step,Test Script (Step-by-Step) - Test Data,Test Script (Step-by-Step) - Expected Result,Test Script (Plain Text),Test Script (BDD)
CRM-T1,Verify whether the cookies consent pop-up is getting displayed,Draft,,,,Normal,,,712020:70b6d18c-4fad-49c8-a864-1fdeb607c853,,,,Launch the browser,Chrome Browser,Browser should be launched successfully,,
,,,,,,,,,,,,,Enter URL and Launch the application,URL :  <https://accounts.creatio.com/login/alm.>,CREATIO CRM application should be launched successfully. ,,
,,,,,,,,,,,,,Verify whether cookies consent pop-up is getting displayed,N/A,Cookies consent pop-up should be displayed successfully,,
CRM-T2,Verify valid login with correct credentials,Draft,,,,Normal,,,,,,,,Launch the browser,Chrome Browser,,
,,,,,,,,,,,,,Enter URL and Launch the application,URL : <https://accounts.creatio.com/login/alm>,CREATIO CRM application should be launched successfully,,
,,,,,,,,,,,,,Verify whether cookies consent pop-up is getting displayed,N/A,Cookies consent pop-up should be displayed successfully,,
,,,,,,,,,,,,,"Select ""Allow All"" button",N/A,Cookies pop-up should be closed successfully,,
,,,,,,,,,,,,,Enter valid business email,validuser@domain.com,Email field should accept valid format,,
,,,,,,,,,,,,,Enter valid password,ValidPassword123,Password field should accept valid input,,
,,,,,,,,,,,,,Click Login,N/A,User should be logged in successfully,,


Limitations / Mandatory Steps :

* Every time you are going to generate the test cases, add mandatory steps mentioned below In each and every test case 
1. Launch the Chrome browser. 
2. Enter the URL - www.accounts.creatio.com/login/alm  and launch the application. 
3. Verify whether the cookies pop-up is getting displayed. 
4. Select the "Allow All" button and close the cookies pop-up. 
5. Verify whether the login page is displayed successfully. 

* Every time you are going to generate the test cases, consider that all the test cases should not exceed a count of 20. Within those 20 test cases, you should cover all the scenarios and functionality. 