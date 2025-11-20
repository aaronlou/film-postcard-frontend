import React from 'react';
import { TemplateType } from '../../types/template';
import { useAuth } from '../../context/AuthContext';

interface ControlPanelProps {
    currentTemplate: TemplateType;
    text: string;
    setText: (text: string) => void;
    qrUrl: string;
    setQrUrl: (url: string) => void;
    onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    isUploadingImage: boolean;
    image: string | null;
    onDownload: () => void;
    onOrderClick: () => void;
    isPolishing: boolean;
    handlePolishText: () => void;
}

export default function ControlPanel({
    currentTemplate,
    text,
    setText,
    qrUrl,
    setQrUrl,
    onImageUpload,
    isUploadingImage,
    image,
    onDownload,
    onOrderClick,
    isPolishing,
    handlePolishText,
}: ControlPanelProps) {
    const { user, isAuthenticated } = useAuth();

    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg border border-stone-200">
                <h2 className="text-xl sm:text-2xl font-serif text-stone-800 mb-4 sm:mb-6">上传与创作</h2>

                <div className="space-y-4 sm:space-y-6">
                    {/* 名片模板不显示图片上传，其他模板显示 */}
                    {currentTemplate !== 'businesscard' && (
                        <div>
                            <label className="block text-sm font-medium text-stone-700 mb-3">
                                选择照片
                                {isUploadingImage && (
                                    <span className="ml-2 text-xs text-stone-500 italic">上传中...</span>
                                )}
                            </label>
                            {/* 🔒 登录状态提示 */}
                            {!isAuthenticated ? (
                                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-3">
                                    <div className="flex items-start gap-3">
                                        <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-blue-900 mb-1">上传图片需要登录</p>
                                            <p className="text-xs text-blue-700">
                                                请先
                                                <a href="/auth" className="underline hover:text-blue-800 font-medium">登录或注册</a>
                                                ，享更多存储空间和定制功能
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : user && (
                                <p className="text-xs text-stone-500 mb-2">
                                    {user.userTier || 'FREE'} 等级 | 单文件最大 {((user.singleFileLimit || 10 * 1024 * 1024) / (1024 * 1024)).toFixed(0)}MB
                                    {user.storageUsed !== undefined && user.storageLimit && (
                                        <span className="ml-2">
                                            | 已使用 {((user.storageUsed || 0) / (1024 * 1024)).toFixed(1)}MB/{((user.storageLimit) / (1024 * 1024)).toFixed(0)}MB
                                        </span>
                                    )}
                                </p>
                            )}
                            <div className="relative group">
                                <input
                                    type="file"
                                    id="image-upload"
                                    accept="image/*"
                                    onChange={onImageUpload}
                                    disabled={isUploadingImage}
                                    className="hidden"
                                />
                                <label
                                    htmlFor="image-upload"
                                    className={`flex flex-col items-center justify-center w-full h-32 sm:h-40 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 ${isUploadingImage
                                            ? 'border-stone-200 bg-stone-50 opacity-50 cursor-not-allowed'
                                            : 'border-stone-300 bg-white/50 hover:bg-white hover:border-stone-400 hover:shadow-md group-hover:scale-[1.01]'
                                        }`}
                                >
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        {isUploadingImage ? (
                                            <svg className="animate-spin h-8 w-8 text-stone-400 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                        ) : (
                                            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-stone-400 mb-3 group-hover:text-stone-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        )}
                                        <p className="mb-2 text-sm text-stone-600 font-medium">
                                            {isUploadingImage ? '正在上传...' : '点击上传照片'}
                                        </p>
                                        <p className="text-xs text-stone-400">
                                            支持 JPG, PNG (最大 {((user?.singleFileLimit || 10 * 1024 * 1024) / (1024 * 1024)).toFixed(0)}MB)
                                        </p>
                                    </div>
                                </label>
                            </div>
                        </div>
                    )}

                    {/* 名片模板显示头像提示 */}
                    {currentTemplate === 'businesscard' && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                            <div className="flex items-start gap-3">
                                <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-amber-900 mb-1">名片使用个人头像</p>
                                    <p className="text-xs text-amber-700">
                                        {isAuthenticated && user?.avatarUrl
                                            ? '名片将自动使用你的个人头像，可前往'
                                            : '请先登录并在'
                                        }
                                        <a href={isAuthenticated ? `/u/${user?.username}` : '/auth'} className="underline hover:text-amber-800">
                                            {isAuthenticated && user?.avatarUrl ? '个人主页' : '个人主页'}
                                        </a>
                                        {isAuthenticated && user?.avatarUrl
                                            ? '修改头像'
                                            : '上传头像'
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <label className="text-sm font-medium text-stone-700">
                                {currentTemplate === 'businesscard' ? '职位/个人签名' : '写下你的文字'}
                            </label>
                            <button
                                onClick={handlePolishText}
                                disabled={!text.trim() || isPolishing}
                                className="text-xs text-stone-400 hover:text-stone-600 transition-colors disabled:text-stone-300 disabled:cursor-not-allowed italic flex items-center gap-1"
                            >
                                {isPolishing ? (
                                    <>
                                        <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>优化中...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>✨</span>
                                        <span>让AI润色</span>
                                    </>
                                )}
                            </button>
                        </div>
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder={currentTemplate === 'businesscard' ? 'PHOTOGRAPHER / 独立摄影师' : '全世界的冰都会重逢\n北冰洋与尼罗河会在混云中交融'}
                            rows={4}
                            className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:ring-2 focus:ring-stone-400 focus:border-transparent resize-none text-stone-700 placeholder:text-stone-300 bg-white/80 transition-all hover:bg-white"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-stone-700 mb-3">
                            二维码链接
                        </label>
                        <p className="text-xs text-stone-500 mb-2">
                            {isAuthenticated && user ? (
                                <>
                                    <span className="block sm:inline">已自动填充你的个人主页：</span>
                                    <a href={`/u/${user.username}`} target="_blank" className="text-amber-600 hover:text-amber-700 underline break-all">
                                        https://film.isnap.world/u/{user.username}
                                    </a>
                                </>
                            ) : (
                                <>
                                    <span className="block sm:inline">还没有个人作品空间？</span>
                                    <a href="/auth" className="text-amber-600 hover:text-amber-700 underline">点击创建</a>
                                    <span className="block sm:inline">你的专属页面（如：film.isnap.world/u/yourname）</span>
                                </>
                            )}
                        </p>
                        <input
                            type="url"
                            value={qrUrl}
                            onChange={(e) => setQrUrl(e.target.value)}
                            placeholder={isAuthenticated && user ? `https://film.isnap.world/u/${user.username}` : "https://film.isnap.world/u/yourname"}
                            className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:ring-2 focus:ring-stone-400 focus:border-transparent text-stone-700 placeholder:text-stone-400 bg-white/80"
                        />
                    </div>

                    <button
                        onClick={onDownload}
                        disabled={currentTemplate !== 'businesscard' && !image}
                        className="w-full bg-stone-800 text-white py-4 px-6 rounded-full font-medium hover:bg-stone-700 transition-all disabled:bg-stone-300 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                    >
                        {currentTemplate === 'postcard' ? '下载明信片' :
                            currentTemplate === 'bookmark' ? '下载书签' :
                                currentTemplate === 'polaroid' ? '下载拍立得' :
                                    currentTemplate === 'businesscard' ? '下载名片' : '下载贺卡'}
                    </button>

                    <button
                        onClick={onOrderClick}
                        disabled={currentTemplate !== 'businesscard' && !image}
                        className="w-full bg-white text-stone-800 py-4 px-6 rounded-full font-medium border-2 border-stone-800 hover:bg-stone-50 transition-all disabled:bg-stone-100 disabled:border-stone-300 disabled:text-stone-400 disabled:cursor-not-allowed"
                    >
                        定制下单
                    </button>
                </div>
            </div>
        </div>
    );
}
