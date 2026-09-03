export type AspirationCategory = 'Saran' | 'Kritik' | 'Pertanyaan' | 'Lainnya';
export type AspirationStatus = 'Pending' | 'Approved' | 'Rejected';

export interface Aspiration {
  id: string;
  category: AspirationCategory;
  subject: string;
  message: string;
  isAnonymous: boolean;
  authorName?: string;
  status: AspirationStatus;
  createdAt: string;
  response?: string;
}

export interface AiProviderConfig {
  id: string;
  name: string;
  baseUrl: string;
  apiKey: string;
  model: string;
  isActive: boolean;
}

export interface AiConfig {
  personality: string;
  knowledge: string;
  providers: AiProviderConfig[];
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
}
