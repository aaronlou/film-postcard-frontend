'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';

export default function AuthPage() {
  const router = useRouter();
  const { login, register } = useAuth();
  
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    displayName: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let success = false;
      
      if (isLogin) {
        success = await login(formData.username, formData.password);
      } else {
        success = await register(
          formData.username,
          formData.password,
          formData.email || undefined,
          formData.displayName || undefined
        );
      }

      if (success) {
        router.push(`/u/${formData.username}`);
      } else {
        setError(isLogin ? '用户名或密码错误' : '注册失败，用户名可能已存在');
      }
    } catch (err) {
      setError('操作失败，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-light text-white mb-2 tracking-wide">
            {isLogin ? 'Welcome Back' : 'Join Us'}
          </h1>
          <p className="text-stone-500 text-sm">
            {isLogin ? 'Sign in to your account' : 'Create your photographer profile'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username */}
          <div>
            <label className="block text-stone-400 text-xs mb-2 font-light tracking-wide">
              USERNAME
            </label>
            <input
              type="text"
              required
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full bg-stone-900 border border-stone-800 rounded px-4 py-3 text-white text-sm focus:outline-none focus:border-stone-600 transition-colors"
              placeholder="your_username"
            />
          </div>

          {/* Email (Register only) */}
          {!isLogin && (
            <>
              <div>
                <label className="block text-stone-400 text-xs mb-2 font-light tracking-wide">
                  EMAIL <span className="text-stone-600">(optional)</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-stone-900 border border-stone-800 rounded px-4 py-3 text-white text-sm focus:outline-none focus:border-stone-600 transition-colors"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-stone-400 text-xs mb-2 font-light tracking-wide">
                  DISPLAY NAME <span className="text-stone-600">(optional)</span>
                </label>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  className="w-full bg-stone-900 border border-stone-800 rounded px-4 py-3 text-white text-sm focus:outline-none focus:border-stone-600 transition-colors"
                  placeholder="Your Name"
                />
              </div>
            </>
          )}

          {/* Password */}
          <div>
            <label className="block text-stone-400 text-xs mb-2 font-light tracking-wide">
              PASSWORD
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-stone-900 border border-stone-800 rounded px-4 py-3 pr-12 text-white text-sm focus:outline-none focus:border-stone-600 transition-colors"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-red-400 text-xs text-center py-2 bg-red-950/20 rounded border border-red-900">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black py-3 rounded font-light text-sm tracking-wide hover:bg-stone-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        {/* Toggle */}
        <div className="mt-8 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-stone-400 text-sm hover:text-white transition-colors"
          >
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <span className="border-b border-stone-600 hover:border-white transition-colors">
              {isLogin ? 'Sign up' : 'Sign in'}
            </span>
          </button>
        </div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <a
            href="/"
            className="text-stone-600 text-xs hover:text-stone-400 transition-colors"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
