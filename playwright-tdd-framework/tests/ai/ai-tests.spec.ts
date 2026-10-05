import { AiCommons } from '../../commons/ai/ai-commons.js';
import {test} from '@playwright/test';

test('AI response test', async () => {
    const aiCommons = new AiCommons();
    await aiCommons.initializeRequestContext();
    const response = await aiCommons.getAiResponse('llama3.2:1b', 'Give me complete list of prime numbers from 1 to 20?');
    console.log(response);
});