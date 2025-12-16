'use client';

import { forwardRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { TemplateData } from '../../types/template';

interface NewYearPostcardTemplateProps {
    data: TemplateData;
}

const NewYearPostcardTemplate = forwardRef<HTMLDivElement, NewYearPostcardTemplateProps>(
    ({ data }, ref) => {
        const { image, text, qrUrl, fontFamily, signature } = data;

        return (
            <div className="flex justify-center items-center">
                <div
                    ref={ref}
                    id="newyear-preview-content"
                    className="relative bg-gradient-to-b from-red-900 via-red-800 to-red-900 p-6 rounded-lg shadow-2xl overflow-hidden"
                    style={{ width: '420px', height: '600px' }}
                >
                    {/* 复古纸张纹理叠加层 */}
                    <div
                        className="absolute inset-0 opacity-10 pointer-events-none"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                        }}
                    />

                    {/* 装饰性边框 */}
                    <div className="absolute inset-3 border-2 border-amber-400/40 rounded pointer-events-none" />
                    <div className="absolute inset-4 border border-amber-300/20 rounded pointer-events-none" />

                    {/* 角落装饰 - 祥云图案 */}
                    <div className="absolute top-2 left-2 text-amber-400/60 text-2xl">☁</div>
                    <div className="absolute top-2 right-2 text-amber-400/60 text-2xl">☁</div>
                    <div className="absolute bottom-2 left-2 text-amber-400/60 text-2xl rotate-180">☁</div>
                    <div className="absolute bottom-2 right-2 text-amber-400/60 text-2xl rotate-180">☁</div>

                    {/* 顶部灯笼装饰 */}
                    <div className="absolute top-1 left-1/2 -translate-x-1/2 flex gap-8">
                        <span className="text-3xl drop-shadow-lg">🏮</span>
                        <span className="text-3xl drop-shadow-lg">🏮</span>
                    </div>

                    {/* 主内容区域 */}
                    <div className="relative h-full flex flex-col pt-10">
                        {/* 新年标题 */}
                        <div className="text-center mb-4">
                            <p className="text-amber-300 text-sm tracking-[0.3em] font-light">
                                新年快乐 · HAPPY NEW YEAR
                            </p>
                        </div>

                        {/* 照片区域 */}
                        {image ? (
                            <div className="relative mx-auto w-[320px] h-[240px] bg-stone-900 rounded overflow-hidden shadow-lg">
                                {/* 照片边框装饰 */}
                                <div className="absolute inset-0 border-4 border-amber-100/90 z-10 pointer-events-none" />
                                <img
                                    src={image}
                                    alt="New Year"
                                    className="w-full h-full object-cover"
                                />
                    
                            </div>
                        ) : (
                            <div className="relative mx-auto w-[320px] h-[240px] bg-stone-800/50 rounded flex items-center justify-center border-2 border-dashed border-amber-400/30">
                                <div className="text-center text-amber-300/60">
                                    <svg className="w-16 h-16 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <p className="text-sm font-light">上传你的摄影作品</p>
                                </div>
                            </div>
                        )}

                        {/* 分隔装饰 */}
                        <div className="flex items-center justify-center gap-3 my-4">
                            <div className="h-px w-12 bg-gradient-to-r from-transparent to-amber-400/50" />
                            <span className="text-amber-400/70 text-lg">✦</span>
                            <div className="h-px w-12 bg-gradient-to-l from-transparent to-amber-400/50" />
                        </div>

                        {/* 手写体文字区域 */}
                        <div className="flex-1 flex items-center justify-center px-6">
                            {text ? (
                                <p
                                    className="text-amber-100 text-xl leading-relaxed whitespace-pre-line text-center"
                                    style={{ fontFamily: fontFamily || "'Ma Shan Zheng', cursive" }}
                                >
                                    {text}
                                </p>
                            ) : (
                                <p className="text-amber-300/40 text-sm font-light italic text-center">
                                    写下你的新年祝福...
                                </p>
                            )}
                        </div>

                        {/* 底部区域 */}
                        <div className="flex items-end justify-between pt-4 mt-auto">
                            {/* 年份装饰 */}
                            <div className="text-amber-400/60 text-xs tracking-wider">
                                <span className="block">2026</span>
                                <span className="block text-[10px]">马年大吉</span>
                            </div>

                            {/* 二维码 */}
                            <div className="flex-shrink-0 text-center">
                                <div className="bg-amber-50 p-1.5 rounded shadow-lg">
                                    <QRCodeSVG
                                        value={qrUrl}
                                        size={40}
                                        level="H"
                                        includeMargin={false}
                                    />
                                </div>
                                <p className="text-[8px] text-amber-300/60 mt-1">
                                    扫码查看我的作品集
                                </p>
                            </div>

                            {/* 署名区域 */}
                            <div className="text-amber-300 text-xs text-right tracking-wider" style={{ fontFamily: fontFamily || "'Ma Shan Zheng', cursive" }}>
                                {signature ? (
                                    <>
                                        <span className="block text-[10px] text-amber-400/50">来自</span>
                                        <span className="block text-sm">{signature}</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="block text-amber-400/60">新春</span>
                                        <span className="block text-[10px] text-amber-400/60">贺岁</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
);

NewYearPostcardTemplate.displayName = 'NewYearPostcardTemplate';

export default NewYearPostcardTemplate;
