'use client';

import { forwardRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { TemplateData } from '../../types/template';

interface BookmarkTemplateProps {
  data: TemplateData;
}

const BookmarkTemplate = forwardRef<HTMLDivElement, BookmarkTemplateProps>(
  ({ data }, ref) => {
    const { image, text, qrUrl } = data;

    return (
      <div className="flex justify-center items-center">
        <div
          ref={ref}
          id="bookmark-preview-content"
          className="bg-amber-50 p-6 rounded-2xl shadow-2xl"
          style={{ width: '280px', height: '600px' }}
        >
          <div className="bg-white h-full rounded-xl shadow-inner p-4 flex flex-col">
            {/* Image section */}
            {image ? (
              <div className="relative h-64 bg-stone-200 rounded-lg overflow-hidden mb-4">
                {/* Subtle film perforations on left */}
                <div className="absolute left-1 top-0 bottom-0 w-0.5 flex flex-col justify-around py-3">
                  {[...Array(6)].map((_, i) => (
                    <div key={`l-${i}`} className="w-0.5 h-0.5 bg-stone-800/40 rounded-sm" />
                  ))}
                </div>
                {/* Subtle film perforations on right */}
                <div className="absolute right-1 top-0 bottom-0 w-0.5 flex flex-col justify-around py-3">
                  {[...Array(6)].map((_, i) => (
                    <div key={`r-${i}`} className="w-0.5 h-0.5 bg-stone-800/40 rounded-sm" />
                  ))}
                </div>
                <img
                  src={image}
                  alt="Bookmark"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="h-64 bg-stone-100 rounded-lg flex items-center justify-center mb-4">
                <div className="text-center text-stone-400">
                  <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-xs font-light">上传照片</p>
                </div>
              </div>
            )}

            {/* Text section */}
            <div className="flex-1 flex flex-col justify-center text-center px-2">
              {text ? (
                <p className="text-stone-700 text-xs leading-relaxed whitespace-pre-line font-serif">
                  {text}
                </p>
              ) : (
                <p className="text-stone-400 text-xs font-light italic">
                  你的文字将显示在这里
                </p>
              )}
            </div>

            {/* QR code at bottom */}
            <div className="flex justify-center pt-3 border-t border-stone-200 mt-auto">
              <div className="text-center">
                <div className="bg-white p-1 rounded shadow-sm border border-stone-200/50 inline-block">
                  <QRCodeSVG
                    value={qrUrl}
                    size={36}
                    level="H"
                    includeMargin={false}
                  />
                </div>
                <p className="text-[7px] text-stone-400 mt-1">
                  扫码查看作品集
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

BookmarkTemplate.displayName = 'BookmarkTemplate';

export default BookmarkTemplate;
