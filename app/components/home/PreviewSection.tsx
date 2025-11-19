import React from 'react';
import { TemplateType } from '../../types/template';
import { QRCodeSVG } from 'qrcode.react';
import BookmarkTemplate from '../templates/BookmarkTemplate';
import PolaroidTemplate from '../templates/PolaroidTemplate';
import GreetingTemplate from '../templates/GreetingTemplate';
import BusinessCardTemplate from '../templates/BusinessCardTemplate';

interface PreviewSectionProps {
    currentTemplate: TemplateType;
    image: string | null;
    text: string;
    qrUrl: string;
    contentRef: React.RefObject<HTMLDivElement | null>;
}

export default function PreviewSection({
    currentTemplate,
    image,
    text,
    qrUrl,
    contentRef,
}: PreviewSectionProps) {
    return (
        <div className="flex justify-center items-center">
            {currentTemplate === 'postcard' ? (
                <div className="relative">
                    <div
                        className="bg-[#f5f0e8] p-8 rounded-3xl shadow-2xl relative"
                        style={{ width: '480px' }}
                    >
                        <div ref={contentRef} className="bg-white p-6 rounded-2xl shadow-inner relative">
                            {image ? (
                                <div className="relative aspect-square bg-stone-200 rounded-xl overflow-hidden mb-6">
                                    <img
                                        src={image}
                                        alt="Uploaded"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ) : (
                                <div className="aspect-square bg-stone-100 rounded-xl flex items-center justify-center mb-6">
                                    <div className="text-center text-stone-400">
                                        <svg className="w-16 h-16 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <p className="text-sm font-light">上传你的照片</p>
                                    </div>
                                </div>
                            )}

                            {/* Bottom section with text and QR code side by side */}
                            <div className="flex items-start gap-4">
                                {/* Text area - left side */}
                                <div className="flex-1 text-left">
                                    {text ? (
                                        <p className="text-stone-700 text-sm leading-relaxed whitespace-pre-line font-serif">
                                            {text}
                                        </p>
                                    ) : (
                                        <p className="text-stone-400 text-xs font-light italic">
                                            你的文字将显示在这里
                                        </p>
                                    )}
                                </div>

                                {/* QR code section - clean and simple */}
                                <div className="flex-shrink-0 text-center">
                                    <div className="bg-white p-1.5 rounded shadow-sm border border-stone-200/50">
                                        <QRCodeSVG
                                            value={qrUrl}
                                            size={44}
                                            level="H"
                                            includeMargin={false}
                                        />
                                    </div>
                                    <p className="text-[8px] text-stone-400 mt-1.5 leading-tight">
                                        扫码查看<br />摄影作品集
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : currentTemplate === 'bookmark' ? (
                <BookmarkTemplate
                    ref={contentRef}
                    data={{ image, text, qrUrl }}
                />
            ) : currentTemplate === 'polaroid' ? (
                <PolaroidTemplate
                    ref={contentRef}
                    data={{ image, text, qrUrl }}
                />
            ) : currentTemplate === 'businesscard' ? (
                <div ref={contentRef}>
                    <BusinessCardTemplate
                        image={image}
                        text={text}
                        qrUrl={qrUrl}
                    />
                </div>
            ) : (
                <GreetingTemplate
                    ref={contentRef}
                    data={{ image, text, qrUrl }}
                />
            )}
        </div>
    );
}
