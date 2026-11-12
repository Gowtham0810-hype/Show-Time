import React, { useState } from 'react';
import { api } from '../../services/api';
import { User } from '../../types';
import { X, Lock, Mail, User as UserIcon } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await api.login(email, password);
        onAuthSuccess(res.user);
        onClose();
      } else {
        const res = await api.register(name, email, password);
        onAuthSuccess(res.user);
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white border border-black/10 p-8 max-w-md w-full animate-fadeIn shadow-lg relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#8e8e8e] hover:text-[#141414]"
        >
          <X size={18} />
        </button>

        <div className="label-xs text-[#8e8e8e] mb-1">
          {mode === 'login' ? 'CINEMA IDENTIFICATION' : 'NEW PATRON ACCOUNT'}
        </div>
        <h2 className="text-2xl font-normal uppercase tracking-tight mb-6">
          {mode === 'login' ? 'SIGN IN' : 'REGISTER'}
        </h2>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="label-xs text-[#8e8e8e] block mb-1">FULL NAME</label>
              <div className="flex items-center gap-2 border border-black/15 px-3 py-2 bg-[#fafafa]">
                <UserIcon size={14} className="text-[#8e8e8e]" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Adam Goya"
                  className="bg-transparent border-none outline-hidden text-xs w-full"
                />
              </div>
            </div>
          )}

          <div>
            <label className="label-xs text-[#8e8e8e] block mb-1">EMAIL ADDRESS</label>
            <div className="flex items-center gap-2 border border-black/15 px-3 py-2 bg-[#fafafa]">
              <Mail size={14} className="text-[#8e8e8e]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="adamgoya0810@gmail.com"
                className="bg-transparent border-none outline-hidden text-xs w-full"
              />
            </div>
          </div>

          <div>
            <label className="label-xs text-[#8e8e8e] block mb-1">PASSWORD</label>
            <div className="flex items-center gap-2 border border-black/15 px-3 py-2 bg-[#fafafa]">
              <Lock size={14} className="text-[#8e8e8e]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-transparent border-none outline-hidden text-xs w-full"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#141414] text-white label-xs hover:bg-black/85 transition-colors disabled:opacity-50 mt-4"
          >
            {loading ? 'AUTHENTICATING...' : mode === 'login' ? 'SIGN IN' : 'CREATE ACCOUNT'}
          </button>
        </form>

        {/* Toggle mode */}
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login');
              setErrorMsg(null);
            }}
            className="text-xs text-[#8e8e8e] hover:text-[#141414] transition-colors"
          >
            {mode === 'login'
              ? 'New to CINEMA? Create an account'
              : 'Already have credentials? Sign in here'}
          </button>
        </div>
      </div>
    </div>
  );
};
