export interface SentimentResult {
  sentiment: string;
  confidence: number;
  positive_score: number;
  negative_score: number;
  review?: string;
}

export interface AspectDetail {
  aspect: string;
  confidence: number;
  example: string;
}

export interface AspectAnalysis {
  overall_sentiment: SentimentResult;
  strengths: AspectDetail[];
  weaknesses: AspectDetail[];
  total_aspects: number;
}

export interface BatchResult {
  results: SentimentResult[];
  summary: {
    total: number;
    positive: number;
    negative: number;
    positive_percentage: number;
  };
}

export interface Stats {
  total: number;
  positive: number;
  negative: number;
  positive_percentage: number;
}
