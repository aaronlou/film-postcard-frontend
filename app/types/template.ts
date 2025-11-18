export type TemplateType = 'postcard' | 'bookmark' | 'polaroid' | 'greeting' | 'businesscard';

export interface TemplateData {
  image: string | null;
  text: string;
  qrUrl: string;
}

export interface OrderData {
  name: string;
  phone: string;
  address: string;
  quantity: number;
}

export interface TemplateConfig {
  id: TemplateType;
  name: string;
  nameCN: string;
  icon: string;
  description: string;
  descriptionCN: string;
}
