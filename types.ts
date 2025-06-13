
export interface User {
  id: string;
  email?: string;
  walletAddress?: string;
  name?: string;
}

export interface Word {
  id: string;
  text: string;
  start: number;
  end: number;
  speaker?: number; // For diarization
  keyword?: string; // To trigger knowledge retrieval
}

export interface Annotation {
  id: string;
  wordId?: string; // Link to specific word
  timestamp: number; // Or link to timestamp
  text: string;
  createdAt: Date;
}

export interface TranscriptionSession {
  id: string;
  title: string;
  createdAt: Date;
  duration: number; // in seconds
  transcriptWords: Word[];
  annotations: Annotation[];
  summary?: string;
}

export interface KnowledgeResult {
  id: string;
  query: string;
  summary: string;
  source?: {
    uri: string;
    title: string;
  };
  timestamp: Date;
}

export enum AuthMethod {
  EMAIL = 'email',
  WALLET = 'wallet',
}

export interface AppNotification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}
