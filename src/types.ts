export type ContentType = 'Blog Post' | 'Twitter Thread' | 'LinkedIn Post' | 'Marketing Email';
export type ToneType = 'Professional' | 'Casual' | 'Humorous' | 'Persuasive' | 'Inspirational';

export interface GenerationRequest {
  topic: string;
  type: ContentType;
  tone: ToneType;
}

export interface GenerationResponse {
  result?: string;
  error?: string;
}
