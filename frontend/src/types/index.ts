export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

export interface LoginRequest {
  username: string;
  password?: string;
}

export interface SignupRequest {
  username: string;
  email: string;
  password?: string;
}

export interface JwtResponse {
  accessToken: string;
  refreshToken: string;
  id: number;
  username: string;
  email: string;
  role: string;
}

export interface Note {
  id: number;
  title: string;
  content: string;
  pinned: boolean;
  archived: boolean;
  favorite: boolean;
  category: string;
  tags: string; // Comma separated list
  aiSummary?: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: number;
  fileName: string;
  fileType: string;
  filePath: string;
  fileSize: number;
  extractedText?: string;
  aiSummary?: string;
  aiTags?: string;
  aiCategory?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  id: number;
  action: string;
  details: string;
  createdAt: string;
}

export interface DashboardSummary {
  totalNotes: number;
  totalDocuments: number;
  recentNotes: Note[];
  recentDocuments: Document[];
  timeline: ActivityLog[];
  productivityScore: number;
  dailyQuote: string;
}

export interface UniversalSearchResult {
  type: 'NOTE' | 'DOCUMENT' | 'EVENT' | 'TASK' | 'GOAL' | 'LEARNING' | 'CAREER' | 'TRANSACTION';
  id: number;
  title: string;
  category: string;
  tags?: string;
  snippet: string;
  aiSummary?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

export interface Event {
  id: number;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  allDay: boolean;
  color?: string;
  category?: string;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  dueDate?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED';
  category?: string;
  createdAt: string;
}

export interface Goal {
  id: number;
  title: string;
  description?: string;
  targetDate?: string;
  progress: number;
  status: 'IN_PROGRESS' | 'ACHIEVED' | 'ABANDONED';
  category?: string;
  createdAt: string;
}

export interface Learning {
  id: number;
  topic: string;
  source?: string;
  status: 'TO_LEARN' | 'LEARNING' | 'COMPLETED';
  progress: number;
  notes?: string;
  createdAt: string;
}

export interface JobApplication {
  id: number;
  company: string;
  role: string;
  status: 'APPLIED' | 'INTERVIEWING' | 'OFFER' | 'REJECTED';
  salary?: string;
  url?: string;
  notes?: string;
  appliedDate?: string;
  createdAt: string;
}

export interface Transaction {
  id: number;
  description: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  category?: string;
  date: string;
  createdAt: string;
}
