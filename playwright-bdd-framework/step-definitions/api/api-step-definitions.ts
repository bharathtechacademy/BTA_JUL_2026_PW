import { Given, When, Then } from '@cucumber/cucumber';
import { ApiCommons } from '../../commons/api/api-commons.ts';
import data from '../../testdata/api/data.json' with { type: 'json' };

let api: ApiCommons;

//Given API request context is initialized
Given('API request context is initialized', async () => {
    api = new ApiCommons();
    await api.initializeRequestContext();
});

//When User send a "POST" request with endpoint "/user/repos" to create a repository with name "PlaywrightRepo"
When('User send a {string} request with endpoint {string} to create a repository with name {string}', async (reqType: string, endpoint: string, repoName: string) => {
    let requestBody = data.createRepo.payload;
    requestBody.name = repoName;
    await api.getResponse(reqType, endpoint, requestBody);
});

//Then User should receive a response with status code 422
Then('User should receive a response with status code {int}', async (statusCode: number) => {
    await api.validateStatusCode(statusCode);
});

//And User should receive status message "Unprocessable Entity"
Then('User should receive status message {string}', async (statusMessage: string) => {
    await api.validateStatusMessage(statusMessage);
});

//And User should receive body having "message" as "Repository creation failed."
Then('User should receive body having {string} as {string}', async (key: string, value: string) => {
    await api.validateResponseBody(key, value);
});

//And User should receive body having "message" datatype as "string"
Then('User should receive body having {string} datatype as {string}', async (key: string, dataType: string) => {
    await api.validateResponseSchema(key, dataType);
});

//When User send a "PATCH" request with endpoint "/repos/bharattechacademy11/ValidRepo" to update the repository description as "Updated Description"
When('User send a {string} request with endpoint {string} to update the repository description as {string}', async (reqType: string, endpoint: string, description: string) => {
    let requestBody = data.updateRepo.payload;
    requestBody.description = description;
    await api.getResponse(reqType, endpoint, requestBody);
});

//When User send a "GET" request with endpoint "/repos/bharattechacademy11/ValidRepo"
When('User send a {string} request with endpoint {string}', async (reqType: string, endpoint: string) => {
    await api.getResponse(reqType, endpoint);
});
