
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import aiChatService from '../src/services/aiChatService.js';
import config from '../src/config/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../.env') });

async function testAIChat() {
    console.log('--- Config Check ---');
    console.log('Default Provider:', config.ai.defaultProvider);
    console.log('Vertex Project ID:', config.ai.vertexAI.projectId ? 'SET' : 'NOT SET');
    console.log('Claude API Key:', config.ai.claude.apiKey ? 'SET' : 'NOT SET');
    console.log('Gemini API Key:', config.ai.gemini.apiKey ? 'SET' : 'NOT SET');

    console.log('\n--- Availability Check ---');
    const providers = aiChatService.getAvailableProviders();
    console.log('Available Providers:', providers);

    if (providers.length === 0) {
        console.error('ERROR: No AI providers available.');
        return;
    }

    console.log('\n--- Selection Check ---');
    try {
        const selected = aiChatService.selectProvider();
        console.log('Selected Provider (Default):', selected);
    } catch (e) {
        console.error('Selection Error:', e.message);
    }

    console.log('\n--- Generation Check (Gemini 2.0 Flash) ---');
    try {
        // Use the service which now defaults to gemini-2.0-flash
        const response = await aiChatService.generateResponse(
            'Hello! Confirm you are working.', 
            [], 
            { provider: 'gemini' }
        );
        console.log('Response Success:', response.success);
        if (!response.success) {
            console.error('Response Error:', response.error);
        } else {
            console.log('Response Text:', response.data.text);
        }
    } catch (e) {
        console.error('Runtime execution error:', e);
    }
}

testAIChat().catch(console.error);
