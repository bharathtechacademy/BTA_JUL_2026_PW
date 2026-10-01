import { test } from '@playwright/test';
import { ApiCommons } from '../../commons/api/api-commons.js';
import testdata from '../../testdata/api/data.json' with {type: 'json'};

test.describe('GitHub API tests ', () => {

    let api: ApiCommons;

    //Before each and every test case, create an object of API common methods and also initialize the request context. 
    test.beforeEach(async () => {
        api = new ApiCommons();
        await api.initializeRequestContext();
    })

    //Test Case 1: Request to create a duplicate repository within GitHub 
    test('Create a duplicate repo', async () => {
        const data = testdata.duplicateRepo;
        await api.getResponse(data.requestType, data.endpoint, data.payload);
        await api.validateStatusCode(data.expCode);
        await api.validateStatusMessage(data.expMessage);
        await api.validateResponseBody("message", data.expError);
        await api.validateResponseSchema("message", data.expErrorDatatype);
    })

    //Test Case 2: Request to create a valid repository within GitHub 
    test('Create a valid repo', async () => {
        const data = testdata.validRepo;
        await api.getResponse(data.requestType, data.endpoint, data.payload);
        await api.validateStatusCode(data.expCode);
        await api.validateStatusMessage(data.expMessage);
        await api.validateResponseBody("name", data.expRepo);
        await api.validateResponseSchema("name", data.expRepoDatatype);
    })

    //Test Case 3: Request to update a repository within GitHub 
    test('Update repo', async () => {
        const data = testdata.updateRepo;
        await api.getResponse(data.requestType, data.endpoint, data.payload);
        await api.validateStatusCode(data.expCode);
        await api.validateStatusMessage(data.expMessage);
        await api.validateResponseBody("name", data.expRepo);
        await api.validateResponseSchema("name", data.expRepoDatatype);
    })

    //Test Case 4: Request to get a existing repository within GitHub 
    test('Get repo', async () => {
        const data = testdata.getRepo;
        await api.getResponse(data.requestType, data.endpoint, data.payload);
        await api.validateStatusCode(data.expCode);
        await api.validateStatusMessage(data.expMessage);
        await api.validateResponseBody("name", data.expRepo);
        await api.validateResponseSchema("name", data.expRepoDatatype);
    })

    //Test Case 5: Request to delete a existing repository within GitHub 
    test('Delete repo', async () => {
        const data = testdata.deleteRepo;
        await api.getResponse(data.requestType, data.endpoint, data.payload);
        await api.validateStatusCode(data.expCode);
        await api.validateStatusMessage(data.expMessage);
    })















})