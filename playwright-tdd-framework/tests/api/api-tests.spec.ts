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

    /**
     * @testcase TC_API_001 - Create a Duplicate Repository
     * @feature  GitHub Repository Management API
     * @description
     *   Validates the API behaviour when a POST request is made to create a repository
     *   that already exists for the authenticated user.
     * @validations
     *   - HTTP status code matches the expected error code (e.g. 422 Unprocessable Entity)
     *   - HTTP status message matches the expected error message
     *   - Response body "message" field contains the expected conflict/error text
     *   - "message" field value is of the expected data type (string)
     */
    test('Create a duplicate repo', async () => {
        const data = testdata.duplicateRepo;
        await api.getResponse(data.requestType, data.endpoint, data.payload);
        await api.validateStatusCode(data.expCode);
        await api.validateStatusMessage(data.expMessage);
        await api.validateResponseBody("message", data.expError);
        await api.validateResponseSchema("message", data.expErrorDatatype);
    })

    /**
     * @testcase TC_API_002 - Create a Valid Repository
     * @feature  GitHub Repository Management API
     * @description
     *   Validates the API behaviour when a POST request is made to create a new,
     *   unique repository for the authenticated user.
     * @validations
     *   - HTTP status code matches the expected success code (e.g. 201 Created)
     *   - HTTP status message matches the expected success message
     *   - Response body "name" field matches the expected repository name
     *   - "name" field value is of the expected data type (string)
     */
    test('Create a valid repo', async () => {
        const data = testdata.validRepo;
        await api.getResponse(data.requestType, data.endpoint, data.payload);
        await api.validateStatusCode(data.expCode);
        await api.validateStatusMessage(data.expMessage);
        await api.validateResponseBody("name", data.expRepo);
        await api.validateResponseSchema("name", data.expRepoDatatype);
    })

    /**
     * @testcase TC_API_003 - Update an Existing Repository
     * @feature  GitHub Repository Management API
     * @description
     *   Validates the API behaviour when a PATCH request is made to update the
     *   details (e.g. name/description) of an existing repository.
     * @validations
     *   - HTTP status code matches the expected success code (e.g. 200 OK)
     *   - HTTP status message matches the expected success message
     *   - Response body "name" field reflects the updated repository name
     *   - "name" field value is of the expected data type (string)
     */
    test('Update repo', async () => {
        const data = testdata.updateRepo;
        await api.getResponse(data.requestType, data.endpoint, data.payload);
        await api.validateStatusCode(data.expCode);
        await api.validateStatusMessage(data.expMessage);
        await api.validateResponseBody("name", data.expRepo);
        await api.validateResponseSchema("name", data.expRepoDatatype);
    })

    /**
     * @testcase TC_API_004 - Get an Existing Repository
     * @feature  GitHub Repository Management API
     * @description
     *   Validates the API behaviour when a GET request is made to retrieve the
     *   details of an existing repository for the authenticated user.
     * @validations
     *   - HTTP status code matches the expected success code (e.g. 200 OK)
     *   - HTTP status message matches the expected success message
     *   - Response body "name" field matches the expected repository name
     *   - "name" field value is of the expected data type (string)
     */
    test('Get repo', async () => {
        const data = testdata.getRepo;
        await api.getResponse(data.requestType, data.endpoint, data.payload);
        await api.validateStatusCode(data.expCode);
        await api.validateStatusMessage(data.expMessage);
        await api.validateResponseBody("name", data.expRepo);
        await api.validateResponseSchema("name", data.expRepoDatatype);
    })

    /**
     * @testcase TC_API_005 - Delete an Existing Repository
     * @feature  GitHub Repository Management API
     * @description
     *   Validates the API behaviour when a DELETE request is made to permanently
     *   remove an existing repository belonging to the authenticated user.
     * @validations
     *   - HTTP status code matches the expected success code (e.g. 204 No Content)
     *   - HTTP status message matches the expected success message
     */
    test('Delete repo', async () => {
        const data = testdata.deleteRepo;
        await api.getResponse(data.requestType, data.endpoint, data.payload);
        await api.validateStatusCode(data.expCode);
        await api.validateStatusMessage(data.expMessage);
    })















})