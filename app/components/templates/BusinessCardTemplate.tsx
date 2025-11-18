import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '@/app/context/AuthContext';

interface BusinessCardTemplateProps {
  image: string | null;
  text: string;
  qrUrl: string;
}

export default function BusinessCardTemplate({ image, text, qrUrl }: BusinessCardTemplateProps) {
  const { user } = useAuth();

  return (
    <div className="bg-white p-8 rounded-lg shadow-xl" style={{ width: '400px', height: '240px' }}>
      <div className="h-full flex flex-col justify-between">
        {/* Top Section - Name & Title */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-light text-stone-900 tracking-wide mb-1">
              {user?.displayName || '摄影师'}
            </h2>
            <p className="text-sm text-stone-500 font-light tracking-wider">
              {text || 'PHOTOGRAPHER'}
            </p>
          </div>
          
          {/* Avatar/Photo - Apple-style elegant circular design */}
          {(image || user?.avatarUrl) ? (
            <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-stone-100 to-stone-200 ml-4 flex-shrink-0 ring-2 ring-stone-200 ring-offset-2 shadow-sm">
              <img
                src={image || user?.avatarUrl || ''}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-stone-200 to-stone-300 ml-4 flex-shrink-0 ring-2 ring-stone-200 ring-offset-2 shadow-sm flex items-center justify-center">
              <span className="text-white text-xl font-light">
                {user?.displayName?.charAt(0).toUpperCase() || '摄'}
              </span>
            </div>
          )}
        </div>

        {/* Bottom Section - QR Code & Contact */}
        <div className="flex items-end justify-between pt-4 border-t border-stone-200">
          <div className="flex-1">
            <p className="text-xs text-stone-400 font-light mb-1">作品集</p>
            <p className="text-xs text-stone-600 font-mono break-all">
              {qrUrl.replace('https://', '').replace('http://', '')}
            </p>
          </div>
          
          {/* QR Code */}
          <div className="ml-4 bg-white p-2 rounded flex-shrink-0">
            <QRCodeSVG
              value={qrUrl}
              size={64}
              level="M"
              includeMargin={false}
              fgColor="#292524"
              bgColor="#ffffff"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
