import { request, expect } from '@playwright/test';
import config from '../../config/config.json' with {type: 'json'};

export class ApiCommons {

    private requestContext: any; //Hold the context of the API request or headers of the API request. 
    private response: any; //Hold the response of the API request. 

    //Common method to create the request context 
    async initializeRequestContext() {
        this.requestContext = await request.newContext({
            baseURL: config.api.base_url, // Replace with your API base URL
            extraHTTPHeaders: {
                'Accept': 'application/vnd.github+json',
                'X-GitHub-Api-Version': '2026-03-10',
                'Authorization': `Bearer ${config.api.token}`
            }
        }
        );
    }

    //Common method to send an API request and get the response 
    async getResponse(requestType: string, endpoint: string, requestBody?: any) {

        //Convert request type into lowercase. 
        requestType = requestType.toLowerCase();

        switch (requestType) {

            case 'get':
                this.response = await this.requestContext.get(endpoint);
                break;
            case 'post':
                this.response = await this.requestContext.post(endpoint, { data: requestBody });
                break;
            case 'put':
                this.response = await this.requestContext.put(endpoint, { data: requestBody });
                break;
            case 'patch':
                this.response = await this.requestContext.patch(endpoint, { data: requestBody });
                break;
            case 'delete':
                this.response = await this.requestContext.delete(endpoint);
                break;
            default:
                throw new Error(`Invalid request type: ${requestType}`);
        }

        //Wait for 2 seconds and print the response body in the console. 
        await new Promise(resolve => setTimeout(resolve, 2000));
        if (requestType !== 'delete')
            console.log(await this.response.json());
    }


    //Common method to validate the status code 
    async validateStatusCode(expCode: number) {
        const actualCode = await this.response.status();
        await expect(actualCode).toBe(expCode);
    }

    //Common method to validate the status message 
    async validateStatusMessage(expMessage: string) {
        const actualMessage = await this.response.statusText();
        await expect(actualMessage).toContain(expMessage);
    }

    //Common method to validate the response body 
     async validateResponseBody(key:string , expValue: any) {
        const responseBody = await this.response.json();
        const actualValue = await responseBody[key];
        await expect(actualValue).toBe(expValue);
    }

    //Common method to validate the response headers 
    async validateResponseHeaders(key: string, expValue: any) {
       const responseHeaders = await this.response.headers();
       const actualValue = responseHeaders[key];
       await expect(actualValue).toBe(expValue);
    }

    //Common method to validate the response schema 
    async validateResponseSchema(key:string, expDataType:string){
        const responseBody = await this.response.json();
        const actualValue = await responseBody[key];
        const actualDataType = typeof actualValue;
        await expect(actualDataType).toBe(expDataType);
    }
   

}