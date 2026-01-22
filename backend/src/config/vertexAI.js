import { VertexAI } from '@google-cloud/vertexai';
import logger from '../utils/logger.js';

const vertexAIConfig = {
  projectId: process.env.GCP_PROJECT_ID,
  location: process.env.GCP_LOCATION || 'us-central1',
  model: process.env.VERTEX_AI_MODEL || 'gemini-1.5-pro',
  embeddingModel: process.env.VERTEX_EMBEDDING_MODEL || 'text-embedding-004',
  temperature: parseFloat(process.env.AI_TEMPERATURE) || 0.7,
  maxOutputTokens: parseInt(process.env.AI_MAX_TOKENS, 10) || 4096,
};

// Initialize Vertex AI client
let vertexAI = null;

export const getVertexAIClient = () => {
  if (!vertexAI && vertexAIConfig.projectId) {
    try {
      vertexAI = new VertexAI({
        project: vertexAIConfig.projectId,
        location: vertexAIConfig.location,
      });
      logger.info('Vertex AI client initialized', {
        projectId: vertexAIConfig.projectId,
        location: vertexAIConfig.location,
      });
    } catch (error) {
      logger.error('Failed to initialize Vertex AI client:', error);
      throw error;
    }
  }
  return vertexAI;
};

export default vertexAIConfig;
