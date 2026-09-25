# API testing - step by step 

## What is an API? 
API stands for Application Programming Interface. And conceptually, API is a combination of routines (task/logic), protocols (format), and a set of supporting tools to exchange information between your application UI and backend server. 

## What is the difference between an API, a web service, and a microservice? 
API, web service, and microservice: all are APIs only. 

** All web services are APIs, but all APIs are not web services. 

## webservice 
Web services are all about the APIs that run over the internet or web. 

## microservice
A microservice is a small, independently deployable API that we are going to use internally within the application to exchange information between different components. 


## Different types of API architectures 

## REST (Representational State Transfer )
RESTful services mainly use JSON format to exchange information between the client and server, and RESTful services will use different types of HTTP methods to perform different types of operations. 

GET => Get method will be used to get the existing information from the server. (READ)
POST => The POST method will be used to create the new information within the server. (CREATE)
PUT => Put method will be used to update the existing information within the server. (UPDATE)
PATCH => The `patch` method will be used to modify specific data within the record. (UPDATE)
DELETE => The delete method will be used to delete the information from the server. (DELETE)


Request: POST api.example.com/users/12345 HTTP/1.1
{
    "empId" : 1234
}

Response:
{
   "id": 12345,
   "name": "John Doe",
   "email": "johndoe@example.com"
}


## SOAP (Simple Object Access Protocol )
SOAP Services mainly rely on XML format to exchange information between client and server, and each SOAP service is mainly using a POST request to complete different types of operations between client and server. 

POST /webservice HTTP/1.1
Host: example.com
Content-Type: text/xml; charset=utf-8
Content-Length: length

<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope">
   <soap:Header/>
   <soap:Body>
      <GetUserDetails xmlns="http://example.com/">
         <UserId>12345</UserId>
      </GetUserDetails>
   </soap:Body>
</soap:Envelope>


<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope">
   <soap:Header/>
   <soap:Body>
      <GetUserDetails xmlns="http://example.com/">
         <Username>Bharath Reddy</Username>
         <Userrole>Senior SDET</Userrole>
      </GetUserDetails>
   </soap:Body>
</soap:Envelope>

## GRAPHQL
GraphQL is going to allow us to send a request from a client to retrieve specific data. And GraphQL is going to reduce the over-fetching and under-fetching of the data from the server. Even GraphQL is also going to use a POST request to send a request to our server. 


POST /graphql HTTP/1.1
Host: api.example.com
Content-Type: application/json

{
   "query": "{ user(id: \12345\) { name, email } }"
}

Response:
{
   "data": {
      "user": {
         "name": "John Doe",
         "email": "johndoe@example.com"
      }
   }
}

## What is API testing? 
API testing is a type of testing technique that involves testing the APIs directly without using the application UI. 

## Benefits of API testing 
1. Early issue detection
2. Faster test execution compared to UI 
3. Broader test coverage compared to UI 
4. Completely independent from UI changes 
5. API testing is an automation framework. 


## API Testing for Restful Services

## Request : The request is all about the input data that we are going to share with the server to complete a specific task. 

## Response : Response is all about the output information received from the server every time we send the API request. 

## What are all the details I can expect in the requirement document from my developer to begin the API testing (while sending API request)? 

1. Purpose of the API request or functionality of the API 

In our application, on which screen or which functionality are we using this APA request? On that particular screen, under which field is this APA request linked? After clicking on which button or which hyperlink will this APA request be triggered? 

2. What type of request is it / request method type? 

- GET , POST, PUT , PATCH , DELETE

3. Request URL : Request URL is going to have two important parts. 

   1. Base URL => https://api.amazon.in
   2. Endpoint => /mobile-phones/iphone?price<=50000&ram=128gb 

   /{category}/{product}?price<=50000&ram=128gb 

   Within the endpoint, we are going to have two important parameters. 
      1. Path parameters {Path parameters refer to different categories of information that we are maintaining within the server. }
      2. Query parameters {Parameter that we are going to use to filter the data received from the server }

4. Request body or payload 

- The data that we are going to share with our server through an API request 

https://api.amazon.in/electronics/alexa-devices/create

{
   "device" : "amazon-alexa-echo-3",
   "price" : 3499,
   "color" : "blue"
}

5. Request headers & Request Authorization & Authentication 

The additional metadata that we are going to share along with the API request .

Authentication: Whether you are a valid user or not 
Authorization : What are all the different areas you can access from the server? 

Common API security mechanisms to authenticate the users 
=======================================================
No Auth => No authentication. (The API endpoint doesn't need any credentials. It's an open API. )

Basic Auth => Basic Authorization (We can access the information from the server through an API request by providing a username and password. )

API Key => We can access the information through a API request by providing a unique key and value. (Ex: X-API-KEY : 581982twegjhfw454723572)

Bearer Token => We can access the information through a unique API token that includes specific roles, permissions, and an expiry date. 
(Ex: Authorization : Bearer 2895498riufthgeqkjgf3q457437t4398ybgt)

OAuth => Open authorization. 

Open authorization is a framework that is going to allow users to access the information from the server by providing limited access to the Server temporarily . 


## What are all the details I can expect in the requirement document to validate the response? 

1. Response code or status code & Status Message : Response code is all about the unique number generated by the server every time you send the API request. Based on this response code, we can automatically understand the status of the request. 

2XX => Symbol of success (200 -OK , 201 - Created , 204 - No Content)
4XX => Client-side error. (401- Authorized , 400 - Bad request.  , 404 - Not found. , 422 - Unprocessable entity )
5XX => Server-side error (500- Internal server error. , 503 - Bad gateway. , 503 - Service unavailable. , 504 - Gateway timeout. )

1XX => Informational codes (100 -Processing)
3XX => Redirectional Codes (Temporary redirection, permanent redirection, etc. )

2. Response body : The response body is all about the output response result from the server based on our request. 

Request :  https://api.amazon.in/mobile-phones/iphone?price<=50000&ram=128gb 

Response : 

Success Response :

{
  "status": "success",
  "message": "Products fetched successfully",
  "data": [
    {
      "id": "iphone-15-128gb",
      "name": "iPhone 15",
      "price": 49999,
      "storage": "128GB",
      "currency": "INR"
    },
    {
      "id": "iphone-14-128gb",
      "name": "iPhone 14",
      "price": 44999,
      "storage": "128GB",
      "currency": "INR"
    }
  ]
}

Sample error response: 

If the query parameters are invalid, you could return:

{
  "success": false,
  "statusCode": 400,
  "message": "Invalid request parameters",
  "errors": [
    {
      "field": "price",
      "code": "INVALID_FORMAT",
      "message": "price must be a valid maximum price"
    }
  ]
}


3. Response schema :  Schema is all about the format or nature of the response data that we can expect from the response. Within this, each and every key and its respective data type need to be updated clearly. 

{
  "status": "string",
  "message": "string",
  "data": [
    {
      "id": "string",
      "name": "string",
      "price": "number",
      "storage": "string",
      "currency": "string"
    }
  ]
}

4. Response headers : Response headers are all about the additional metadata sent by the server along with the actual response. 

"session-id" : "845142837r981fghwdqjhvg12q"

5. Maximum response time : Maximum, how much time should it take to get the response for each and every request? 

Ex: Maximum response time is 2 seconds for each and every request, up to 10,000 Concurrent users.

6. Error handling : For each and every mistake made by the user while sending the API request, what kind of error message or what kind of API response can we expect from the server? 

## How to perform API testing? What are all the different tools available in the market? 

There are multiple tools available. 

Postman, JMeter, Newman, RestAssured, Playwright, etc. 

## How to use the Postman tool for API Testing ?  (step by step)

Step 1 : Create a local workspace within the Postman tool. 
A workspace is all about a template or a space that is going to allow us to store multiple APA collections together or APA-related projects together. 

Postman Home -> Workspaces Dropdown -> Create -> Update Name of Workspace -> Click on Create Workspace

Step 2: Create a new environment. 
Environment is all about a set of templates that we are going to use to maintain the APA configuration-related data to test each and every APA request. 

- Environment variables => Set of variables we can store and access across the environment 

Environment => Create => Update Env name => Update Data in the form of 'Variable' and 'Value'

- Global variables  => Set of variables we can store and access across the Postman workspace 

Variables => Globals => Update Data in the form of 'Variable' and 'Value'
 
- Collection variables => Top variables we can store within the collection and access within the same collection 

Collections => Create => Update collection name => Variables => Update Data in the form of 'Variable' and 'Value'

Step 3 : Create New API collection 
API collection is all about a set of API requests stored together in a folder. 

Collections => Create => Update collection name 

Step 4 : Add each and every API request within the API collection. 

Collections => Current API Collection => View More Actions => Add request => Update API request details in the HTTP request template. 


## API testing in Github

### Scenarios to be validated by using API testing 

1. Creating a duplicate code repository with valid credentials 
2. Create a valid repository with valid credentials. 
3. Update the existing repository details with valid credentials. 
4. Search and get existing repository details with valid credentials. 
5. Delete the existing repository with valid credentials. 

GitHub API Documentation : https://docs.github.com/en/rest/repos/repos?apiVersion=2026-03-10


API Documentation for each request:

1. Creating a duplicate code repository with valid credentials 
https://docs.github.com/en/rest/repos/repos?apiVersion=2026-03-10#create-a-repository-for-the-authenticated-user

2. Create a valid repository with valid credentials. 
https://docs.github.com/en/rest/repos/repos?apiVersion=2026-03-10#create-a-repository-for-the-authenticated-user

3. Update the existing repository details with valid credentials. 
https://docs.github.com/en/rest/repos/repos?apiVersion=2026-03-10#update-a-repository

4. Search and get existing repository details with valid credentials. 
https://docs.github.com/en/rest/repos/repos?apiVersion=2026-03-10#get-a-repository

5. Delete the existing repository with valid credentials. 
https://docs.github.com/en/rest/repos/repos?apiVersion=2026-03-10#delete-a-repository