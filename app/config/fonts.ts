// 手写字体配置 - 用于新年明信片模板
export interface FontConfig {
    id: string;
    name: string;
    family: string;
}

export const HANDWRITING_FONTS: FontConfig[] = [
    { id: 'ma-shan-zheng', name: '马上郑', family: "'Ma Shan Zheng', cursive" },
    { id: 'zcool-qingke', name: '庆科黄油', family: "'ZCOOL QingKe HuangYou', sans-serif" },
    { id: 'long-cang', name: '龙藏', family: "'Long Cang', cursive" },
    { id: 'zhi-mang-xing', name: '挚芒行', family: "'Zhi Mang Xing', cursive" },
];

export const DEFAULT_FONT = HANDWRITING_FONTS[0];
