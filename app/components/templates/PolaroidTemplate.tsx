'use client';

import { forwardRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { TemplateData } from '../../types/template';

interface PolaroidTemplateProps {
  data: TemplateData;
}

const PolaroidTemplate = forwardRef<HTMLDivElement, PolaroidTemplateProps>(
  ({ data }, ref) => {
    const { image, text, qrUrl } = data;

    return (
      <div className="flex justify-center items-center">
        <div
          ref={ref}
          id="polaroid-preview-content"
          className="bg-white p-4 rounded-sm shadow-2xl"
          style={{ width: '360px' }}
        >
          {/* Photo area - square format */}
          {image ? (
            <div className="relative aspect-square bg-stone-200 overflow-hidden mb-4">
              <img
                src={image}
                alt="Polaroid"
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="aspect-square bg-stone-100 flex items-center justify-center mb-4">
              <div className="text-center text-stone-400">
                <svg className="w-16 h-16 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm font-light">上传你的照片</p>
              </div>
            </div>
          )}

          {/* White bottom area - like real Polaroid */}
          <div className="pt-4 pb-2 min-h-[100px] flex items-center justify-between">
            {/* Handwritten-style text area */}
            <div className="flex-1 pr-3">
              {text ? (
                <p className="text-stone-700 text-sm leading-relaxed whitespace-pre-line font-serif" style={{ fontFamily: "'Courier New', monospace" }}>
                  {text}
                </p>
              ) : (
                <p className="text-stone-400 text-xs font-light italic">
                  写下你的回忆...
                </p>
              )}
            </div>

            {/* Small QR code in bottom right */}
            <div className="flex-shrink-0">
              <div className="bg-white p-1 rounded shadow-sm border border-stone-200/50">
                <QRCodeSVG
                  value={qrUrl}
                  size={32}
                  level="H"
                  includeMargin={false}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

PolaroidTemplate.displayName = 'PolaroidTemplate';

export default PolaroidTemplate;
