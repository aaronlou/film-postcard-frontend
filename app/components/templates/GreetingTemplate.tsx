'use client';

import { forwardRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { TemplateData } from '../../types/template';

interface GreetingTemplateProps {
  data: TemplateData;
}

const GreetingTemplate = forwardRef<HTMLDivElement, GreetingTemplateProps>(
  ({ data }, ref) => {
    const { image, text, qrUrl } = data;

    return (
      <div className="flex justify-center items-center">
        <div 
          ref={ref}
          className="bg-stone-50 rounded-lg shadow-2xl overflow-hidden"
          style={{ width: '420px', height: '580px' }}
        >
          {/* Image section - takes up top half */}
          {image ? (
            <div className="relative h-[340px] bg-stone-200">
              {/* Subtle film perforations */}
              <div className="absolute left-1 top-0 bottom-0 w-1 flex flex-col justify-around py-4">
                {[...Array(10)].map((_, i) => (
                  <div key={`l-${i}`} className="w-1 h-1 bg-stone-800/40 rounded-sm" />
                ))}
              </div>
              <div className="absolute right-1 top-0 bottom-0 w-1 flex flex-col justify-around py-4">
                {[...Array(10)].map((_, i) => (
                  <div key={`r-${i}`} className="w-1 h-1 bg-stone-800/40 rounded-sm" />
                ))}
              </div>
              <img 
                src={image} 
                alt="Greeting" 
                className="w-full h-full object-cover"
              />
              {/* Decorative border overlay */}
              <div className="absolute inset-0 border-8 border-white/10 pointer-events-none" />
            </div>
          ) : (
            <div className="h-[340px] bg-stone-100 flex items-center justify-center">
              <div className="text-center text-stone-400">
                <svg className="w-20 h-20 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm font-light">上传你的照片</p>
              </div>
            </div>
          )}

          {/* Content section - bottom half with elegant design */}
          <div className="h-[240px] bg-white/80 p-8 flex flex-col justify-between relative">
            {/* Decorative top border */}
            <div className="absolute top-0 left-8 right-8 h-px bg-stone-300" />
            
            {/* Message area */}
            <div className="flex-1 flex items-center justify-center">
              {text ? (
                <p className="text-stone-700 text-base leading-relaxed whitespace-pre-line font-serif text-center px-4">
                  {text}
                </p>
              ) : (
                <p className="text-stone-400 text-sm font-light italic text-center">
                  写下你的祝福...
                </p>
              )}
            </div>

            {/* Bottom section with decorative elements */}
            <div className="flex items-end justify-between pt-4 border-t border-stone-200/50">
              {/* Decorative flourish */}
              <div className="flex-1">
                <div className="text-stone-300 text-xs">
                  ✼ ✼ ✼
                </div>
              </div>
              
              {/* Small QR code */}
              <div className="flex-shrink-0">
                <div className="bg-white p-1 rounded shadow-sm border border-stone-200/50">
                  <QRCodeSVG 
                    value={qrUrl} 
                    size={36}
                    level="H"
                    includeMargin={false}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

GreetingTemplate.displayName = 'GreetingTemplate';

export default GreetingTemplate;
