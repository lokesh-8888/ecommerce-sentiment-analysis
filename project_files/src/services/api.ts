import axios from 'axios';
import type { SentimentResult, AspectAnalysis, BatchResult, Stats } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const predictSentiment = async (review: string): Promise<SentimentResult> => {
  const response = await api.post('/predict', { review });
  return response.data;
};

export const analyzeAspects = async (review: string): Promise<AspectAnalysis> => {
  const response = await api.post('/aspects', { review });
  return response.data;
};

export const batchPredict = async (reviews: string[]): Promise<BatchResult> => {
  const response = await api.post('/batch', { reviews });
  return response.data;
};

export const getStats = async (): Promise<Stats> => {
  const response = await api.get('/stats');
  return response.data;
};

export const checkHealth = async (): Promise<{ status: string; model: string }> => {
  const response = await api.get('/health');
  return response.data;
};
