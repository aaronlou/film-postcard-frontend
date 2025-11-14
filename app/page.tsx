'use client';

import { useState, useRef } from 'react';
import html2canvas from 'html2canvas';

export default function Home() {
  const [image, setImage] = useState<string | null>(null);
  const [text, setText] = useState('');
  const postcardRef = useRef<HTMLDivElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownload = async () => {
    if (!postcardRef.current) return;
    
    try {
      const canvas = await html2canvas(postcardRef.current, {
        scale: 2,
        backgroundColor: '#f5f0e8',
        logging: false,
      });
      
      const link = document.createElement('a');
      link.download = `postcard-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Failed to generate postcard:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-stone-100 to-neutral-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-serif font-light text-stone-800 mb-3 tracking-wide">
            Film Postcard
          </h1>
          <p className="text-stone-600 text-lg font-light">Create your vintage memory</p>
        </header>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Control Panel */}
          <div className="space-y-6">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-stone-200">
              <h2 className="text-2xl font-serif text-stone-800 mb-6">Upload & Create</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-3">
                    Choose Your Photo
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="block w-full text-sm text-stone-600 file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-stone-800 file:text-white hover:file:bg-stone-700 file:cursor-pointer cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-3">
                    Write Your Message
                  </label>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="全世界的冰都会重逢\n北冰洋与尼罗河会在混云中交融"
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:ring-2 focus:ring-stone-400 focus:border-transparent resize-none text-stone-700 placeholder:text-stone-400 bg-white/80"
                  />
                </div>

                <button
                  onClick={handleDownload}
                  disabled={!image}
                  className="w-full bg-stone-800 text-white py-4 px-6 rounded-full font-medium hover:bg-stone-700 transition-all disabled:bg-stone-300 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  Download Postcard
                </button>
              </div>
            </div>
          </div>

          {/* Postcard Preview */}
          <div className="flex justify-center items-center">
            <div className="relative">
              <div 
                ref={postcardRef}
                className="bg-[#f5f0e8] p-8 rounded-3xl shadow-2xl"
                style={{ width: '480px' }}
              >
                <div className="bg-white p-6 rounded-2xl shadow-inner">
                  {image ? (
                    <div className="aspect-square bg-stone-200 rounded-xl overflow-hidden mb-6">
                      <img 
                        src={image} 
                        alt="Uploaded" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="aspect-square bg-gradient-to-br from-stone-100 to-stone-200 rounded-xl flex items-center justify-center mb-6">
                      <div className="text-center text-stone-400">
                        <svg className="w-16 h-16 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-sm font-light">Upload your photo</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="text-center space-y-2">
                    {text ? (
                      <p className="text-stone-700 text-base leading-relaxed whitespace-pre-line font-serif">
                        {text}
                      </p>
                    ) : (
                      <p className="text-stone-400 text-sm font-light italic">
                        Your message will appear here
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
