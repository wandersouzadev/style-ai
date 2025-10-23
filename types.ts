
export interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
}

export interface DesignStyle {
  name: string;
  image: string;
}

export interface ImageData {
  base64: string;
  mimeType: string;
}
