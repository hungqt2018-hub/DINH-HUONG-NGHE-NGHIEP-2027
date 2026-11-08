import React, { useState } from 'react';
import { PWAInstallButton } from './PWAInstallButton';
import { PrivacyModal } from './PrivacyModal';
import {
  GraduationCap,
  Moon,
  Sun,
  Shield,
  UserCheck,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface HeaderProps {
  currentStudentName: string;
  className: string;
  onOpenTeacherPortal: () => void;
  onResetData: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  step: number;
  onSelectStep: (step: number) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentStudentName,
  className,
  onOpenTeacherPortal,
  onResetData,
  darkMode,
  onToggleDarkMode,
}) => {
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <span className="font-extrabold text-sm tracking-tight">∑ LTH</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 dark:text-white text-base sm:text-lg tracking-tight">
                  LỚP TOÁN THẦY HÙNG
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                  2009 • 2027
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate max-w-[200px] sm:max-w-none">
                Định hướng nghề nghiệp & Xếp 15 nguyện vọng
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Student badge */}
            {currentStudentName && (
              <div className="hidden md:flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-200/70 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200">
                <UserCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span className="font-medium max-w-[120px] truncate">{currentStudentName}</span>
                {className && <span className="text-slate-400 font-mono">({className})</span>}
              </div>
            )}

            {/* PWA Install */}
            <PWAInstallButton />

            {/* Teacher button */}
            <button
              onClick={onOpenTeacherPortal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/80 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold transition active:scale-95 cursor-pointer"
              title="Khu vực dành cho Giáo viên (Thầy Hùng)"
            >
              <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="hidden sm:inline">Trang Thầy Hùng</span>
              <span className="sm:hidden">GV</span>
            </button>

            {/* Dark mode */}
            <button
              onClick={onToggleDarkMode}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              aria-label="Đổi chế độ sáng / tối"
              title={darkMode ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Privacy */}
            <button
              onClick={() => setShowPrivacy(true)}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              title="Quyền riêng tư & bảo mật dữ liệu"
            >
              <Shield className="w-4 h-4" />
            </button>

            {/* Reset data */}
            <button
              onClick={() => setShowResetConfirm(true)}
              className="p-2 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition cursor-pointer"
              title="Xóa dữ liệu / Bắt đầu lại"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Privacy Modal */}
      <PrivacyModal
        isOpen={showPrivacy}
        onClose={() => setShowPrivacy(false)}
      />

      {/* Confirm Reset Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Xác nhận làm mới dữ liệu?</h3>
            <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Thao tác này sẽ xóa thông tin cá nhân và bài làm trắc nghiệm hiện tại trên thiết bị để em bắt đầu lại từ đầu. Quyền riêng tư của em luôn được bảo đảm.
            </p>
            <div className="mt-5 flex gap-2">
              <button
                onClick={() => {
                  onResetData();
                  setShowResetConfirm(false);
                }}
                className="flex-1 rounded-xl bg-red-600 py-2.5 text-xs font-semibold text-white hover:bg-red-700 transition"
              >
                Xóa & Bắt đầu lại
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="rounded-xl px-4 py-2.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
