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
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full bg-stone-900 border border-stone-800 rounded px-4 py-3 text-white text-sm focus:outline-none focus:border-stone-600 transition-colors"
              placeholder="••••••••"
            />
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
