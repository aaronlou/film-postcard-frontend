import { RefObject } from 'react';
import { TemplateType } from '../types/template';
import { API_ENDPOINTS } from '../config/api';
import { toast } from 'sonner';

interface UsePostcardGeneratorProps {
    currentTemplate: TemplateType;
    contentRef: RefObject<HTMLElement | null>;
    uploadedImageId: string | null;
    text: string;
    qrUrl: string;
}

export function usePostcardGenerator({
    currentTemplate,
    contentRef,
    uploadedImageId,
    text,
    qrUrl,
}: UsePostcardGeneratorProps) {

    const handleDownload = async () => {
        if (!contentRef.current) return;

        try {
            const element = contentRef.current;

            // Temporarily remove rounded corners and shadows for clean export
            const originalClassList = element.className;
            element.className = element.className
                .replace('rounded-2xl', '')
                .replace('shadow-inner', '')
                .trim();

            // Small delay to ensure style changes are applied
            await new Promise(resolve => setTimeout(resolve, 50));

            // Dynamic import for performance
            const html2canvas = (await import('html2canvas')).default;

            const canvas = await html2canvas(element, {
                scale: 2,
                backgroundColor: '#ffffff',
                logging: false,
                useCORS: true,
                allowTaint: true,
                // Improve color rendering
                foreignObjectRendering: false,
                imageTimeout: 0,
                removeContainer: true,
            });

            // Restore original styling
            element.className = originalClassList;

            const link = document.createElement('a');
            const templateName = currentTemplate === 'postcard' ? 'postcard' :
                currentTemplate === 'bookmark' ? 'bookmark' :
                    currentTemplate === 'polaroid' ? 'polaroid' :
                        currentTemplate === 'businesscard' ? 'businesscard' : 'greeting';
            link.download = `${templateName}-${Date.now()}.jpg`;
            link.href = canvas.toDataURL('image/jpeg', 0.95);
            link.click();

            toast.success('下载已开始');

            // Record download to backend for analytics (non-blocking)
            try {
                await fetch(API_ENDPOINTS.recordDownload, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        imageId: uploadedImageId,
                        templateType: currentTemplate,
                        text,
                        qrUrl,
                        timestamp: new Date().toISOString(),
                    }),
                });
            } catch (error) {
                // Silent fail - don't interrupt user download experience
                console.error('Failed to record download:', error);
            }
        } catch (error) {
            console.error('Failed to generate image:', error);
            toast.error('图片生成失败，请重试');
        }
    };

    return { handleDownload };
}
