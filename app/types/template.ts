export type TemplateType = 'postcard' | 'bookmark' | 'polaroid' | 'greeting' | 'businesscard' | 'newyear';

export interface TemplateData {
  image: string | null;
  text: string;
  qrUrl: string;
  fontFamily?: string; // 用于新年明信片的字体选择
  signature?: string; // 用于新年明信片的签名
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
