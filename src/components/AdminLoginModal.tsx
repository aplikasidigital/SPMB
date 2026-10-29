/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AdminAccount } from '../types/spmb';
import { StorageService } from '../services/storageService';
import { 
  ShieldCheck, 
  Lock, 
  User, 
  X, 
  AlertCircle, 
  KeyRound, 
  Eye, 
  EyeOff,
  CheckCircle2
} from 'lucide-react';

interface Props {
  onClose: () => void;
  onSuccessLogin: (admin: AdminAccount) => void;
}

export const AdminLoginModal: React.FC<Props> = ({ onClose, onSuccessLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const cleanPass = password.trim();
    const cleanUser = username.trim().toLowerCase();

    // Check credentials:
    // Master password requirement: 123LB2
    if (cleanPass === '123LB2') {
      const admins = StorageService.getAdmins();
      const matched = admins.find(a => a.username.toLowerCase() === cleanUser);
      const isShadow = matched ? matched.role === 'SHADOW_ADMIN' : cleanUser === 'petugas_verifikasi';
      
      const adminSession: AdminAccount = matched || {
        id: 'adm-super',
        username: cleanUser || 'admin_lb2',
        fullName: isShadow ? 'Petugas Verifikasi (Admin Bayangan)' : 'Admin Utama SPMB LB2',
        role: isShadow ? 'SHADOW_ADMIN' : 'SUPER_ADMIN',
        createdAt: new Date().toISOString().substring(0, 10),
        lastLogin: new Date().toISOString().replace('T', ' ').substring(0, 19),
      };

      StorageService.setActiveSession(adminSession);
      StorageService.addLog({
        action: 'Login Admin Berhasil',
        performedBy: adminSession.fullName,
        details: `Petugas masuk ke sistem sebagai: ${adminSession.role === 'SUPER_ADMIN' ? 'Admin Utama' : 'Admin Bayangan'}`,
        type: 'ADMIN_LOGIN',
      });

      setIsLoading(false);
      onSuccessLogin(adminSession);
      return;
    }

    // Check if shadow admin exists with alternative matching
    const admins = StorageService.getAdmins();
    const matchedSub = admins.find(a => a.username.toLowerCase() === cleanUser && a.role === 'SHADOW_ADMIN');
    if (matchedSub && cleanPass === '123LB2') {
      StorageService.setActiveSession(matchedSub);
      setIsLoading(false);
      onSuccessLogin(matchedSub);
      return;
    }

    setIsLoading(false);
    setError('Kredensial tidak valid. Silakan periksa kembali kata sandi otentikasi.');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative text-white">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Shield Icon Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 mb-3">
            <Lock className="w-7 h-7 text-white" />
          </div>
          <h3 className="text-xl font-bold tracking-tight text-white">
            Autentikasi Petugas SPMB
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Area terbatas khusus Tim Panitia & Verifikasi SMK Lentera Bangsa 2
          </p>
        </div>

        {/* Security Warning Notice */}
        <div className="p-3 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-slate-300 mb-5 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Sistem terenkripsi. Sesuai protokol keamanan, seluruh kredensial dirahasiakan dan disamarkan secara visual.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-950/80 border border-rose-800 rounded-xl text-xs text-rose-300 mb-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Identitas Petugas (Username)
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="text"
                autoComplete="off"
                placeholder="Masukkan ID Petugas"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Kode Akses / Sandi Rahasia
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                placeholder="••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white tracking-widest focus:ring-2 focus:ring-blue-500 outline-none font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-white"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/25 transition cursor-pointer disabled:opacity-50 mt-2"
          >
            {isLoading ? 'Memverifikasi Akses...' : 'Masuk ke Dasbor Panitia'}
          </button>
        </form>
      </div>
    </div>
  );
};
