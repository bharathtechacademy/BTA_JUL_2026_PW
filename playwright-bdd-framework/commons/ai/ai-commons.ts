import { request } from '@playwright/test';
import config from '../../config/config.json' with {type: 'json'};
import data from '../../testdata/ai/data.json' with {type: 'json'};

export class AiCommons {

    private requestContext: any; //Hold the context of the API request or headers of the API request. 
    private response: any; //Hold the response of the API request. 

    //Common method to create the request context 
    async initializeRequestContext() {
        this.requestContext = await request.newContext({
            baseURL: config.ai.url // Replace with your API base URL
            
        }
        );
    }

    //Common method to send an API request and get the response 
    async getAiResponse(model :string, prompt :string) {
        const requestBody = data.generate;
        requestBody.model = model;
        requestBody.prompt = prompt;
        this.response = await this.requestContext.post(config.ai.endpoint, { data: requestBody });
        const responseBody = await this.response.json();
        return responseBody['response'];
    }

}