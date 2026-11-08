import React, { useState, useEffect } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  FileText,
  FileCode,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  FolderOpen,
  LogOut,
  UserCheck,
} from 'lucide-react';
import { StudentProfile, WishItem, HollandScoreResult, StudentRecord } from '../types';
import {
  googleSignIn,
  getAccessToken,
  logoutGoogle,
  getCurrentUser,
  initAuth,
} from '../services/firebaseAuth';
import {
  uploadJsonToDrive,
  uploadBlobToDrive,
  listAppDriveFiles,
  GoogleDriveFile,
} from '../services/googleDrive';
import { generateResultPDFBlob, removeDiacritics } from '../utils/exportPdf';
import { generateWishesExcelBlob, generateClassListExcelBlob } from '../utils/exportExcel';

interface GoogleDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'student-wishes' | 'student-results' | 'teacher-class';
  profile?: StudentProfile;
  wishes?: WishItem[];
  hollandResult?: HollandScoreResult;
  studentRecords?: StudentRecord[];
  className?: string;
}

export const GoogleDriveModal: React.FC<GoogleDriveModalProps> = ({
  isOpen,
  onClose,
  mode,
  profile,
  wishes = [],
  hollandResult,
  studentRecords = [],
  className = '12A1',
}) => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadFormat, setUploadFormat] = useState<'excel' | 'pdf' | 'json'>('excel');
  const [savedFiles, setSavedFiles] = useState<GoogleDriveFile[]>([]);
  const [latestUploadedFile, setLatestUploadedFile] = useState<GoogleDriveFile | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Initialize Auth state
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setCurrentUser(user);
        if (token) setAccessToken(token);
      },
      () => {
        setCurrentUser(null);
        setAccessToken(null);
      }
    );
    const existing = getCurrentUser();
    if (existing) setCurrentUser(existing);
    return () => unsubscribe();
  }, []);

  // Fetch recent files once token is available
  useEffect(() => {
    if (accessToken) {
      loadRecentFiles(accessToken);
    }
  }, [accessToken]);

  const loadRecentFiles = async (token: string) => {
    try {
      const files = await listAppDriveFiles(token);
      setSavedFiles(files);
    } catch (e) {
      console.warn('Failed to fetch recent files:', e);
    }
  };

  const handleSignIn = async () => {
    setIsAuthenticating(true);
    setErrorMsg(null);
    try {
      const res = await googleSignIn();
      setCurrentUser(res.user);
      setAccessToken(res.accessToken);
      await loadRecentFiles(res.accessToken);
    } catch (err: any) {
      setErrorMsg(err.message || 'Đăng nhập Google thất bại. Vui lòng thử lại.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleSignOut = async () => {
    await logoutGoogle();
    setCurrentUser(null);
    setAccessToken(null);
    setSavedFiles([]);
    setLatestUploadedFile(null);
    setSuccessMsg(null);
  };

  // Determine target file name based on mode and format
  const getTargetFileName = (format: 'excel' | 'pdf' | 'json') => {
    const ext = format === 'excel' ? 'xlsx' : format === 'pdf' ? 'pdf' : 'json';
    if (mode === 'teacher-class') {
      return `LopToanThayHung_Lop_${className || '12'}_DanhSachHocSinh_2027.${ext}`;
    }
    const cleanName = profile?.fullName
      ? removeDiacritics(profile.fullName).replace(/\s+/g, '_')
      : 'HocSinh';
    const cName = profile?.className ? removeDiacritics(profile.className).replace(/\s+/g, '_') : '12';

    if (mode === 'student-results') {
      return `LopToanThayHung_${cleanName}_${cName}_KetQua_Holland_2027.${ext}`;
    }
    return `LopToanThayHung_${cleanName}_${cName}_15NguyenVong_2027.${ext}`;
  };

  const handleConfirmUpload = async () => {
    let token = accessToken;
    if (!token) {
      try {
        setIsAuthenticating(true);
        const res = await googleSignIn();
        setCurrentUser(res.user);
        setAccessToken(res.accessToken);
        token = res.accessToken;
      } catch (err: any) {
        setErrorMsg('Bạn cần đăng nhập Google để lưu tệp lên Drive.');
        setIsAuthenticating(false);
        return;
      } finally {
        setIsAuthenticating(false);
      }
    }

    if (!token) return;

    setIsUploading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    setLatestUploadedFile(null);

    const fileName = getTargetFileName(uploadFormat);

    try {
      let uploaded: GoogleDriveFile;

      if (uploadFormat === 'json') {
        const payload =
          mode === 'teacher-class'
            ? {
                className,
                exportDate: new Date().toISOString(),
                totalStudents: studentRecords.length,
                records: studentRecords,
              }
            : {
                studentProfile: profile,
                hollandResult,
                wishes,
                exportDate: new Date().toISOString(),
                app: 'Lớp Toán Thầy Hùng - Định hướng nghề nghiệp & 15 Nguyện vọng 2027',
              };

        uploaded = await uploadJsonToDrive(fileName, payload, token);
      } else if (uploadFormat === 'pdf') {
        if (!profile) throw new Error('Chưa có thông tin học sinh để tạo PDF.');
        const pdfBlob = generateResultPDFBlob(profile, wishes, hollandResult);
        uploaded = await uploadBlobToDrive(fileName, 'application/pdf', pdfBlob, token);
      } else {
        // Excel
        let excelBlob: Blob;
        if (mode === 'teacher-class') {
          excelBlob = generateClassListExcelBlob(className, studentRecords);
        } else {
          if (!profile) throw new Error('Chưa có thông tin học sinh để tạo Excel.');
          excelBlob = generateWishesExcelBlob(
            profile,
            wishes,
            hollandResult?.hollandCodeString || ''
          );
        }
        uploaded = await uploadBlobToDrive(
          fileName,
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          excelBlob,
          token
        );
      }

      setLatestUploadedFile(uploaded);
      setSuccessMsg(`Đã lưu tệp "${uploaded.name}" thành công vào Google Drive của bạn!`);
      await loadRecentFiles(token);
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi khi tải tệp lên Google Drive. Vui lòng thử lại.');
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          aria-label="Đóng"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Lưu dữ liệu vào Google Drive
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {mode === 'teacher-class'
                ? `Lưu danh sách học sinh Lớp ${className} vào Google Drive của Thầy Cô`
                : 'Lưu bảng 15 nguyện vọng & kết quả định hướng vào Google Drive của em'}
            </p>
          </div>
        </div>

        {/* User Account Bar */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 mb-5">
          {currentUser ? (
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 overflow-hidden">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'Google User'}
                    className="w-8 h-8 rounded-full border border-slate-300 dark:border-slate-600"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold">
                    <UserCheck className="w-4 h-4" />
                  </div>
                )}
                <div className="truncate">
                  <p className="text-xs font-bold text-slate-800 dark:text-white truncate">
                    {currentUser.displayName || 'Tài khoản Google'}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {currentUser.email}
                  </p>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="text-xs text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 flex items-center gap-1 font-medium transition cursor-pointer shrink-0"
              >
                <LogOut className="w-3.5 h-3.5" />
                Đăng xuất
              </button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Chưa kết nối tài khoản Google Drive
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  Đăng nhập để tự động lưu tệp vào Drive cá nhân
                </p>
              </div>
              <button
                onClick={handleSignIn}
                disabled={isAuthenticating}
                className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition cursor-pointer"
              >
                {isAuthenticating ? (
                  <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                )}
                Đăng nhập Google
              </button>
            </div>
          )}
        </div>

        {/* Format Selection */}
        <div className="mb-5">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
            Chọn định dạng tệp muốn lưu lên Drive:
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={() => setUploadFormat('excel')}
              className={`p-3 rounded-xl border text-center transition cursor-pointer flex flex-col items-center gap-1.5 ${
                uploadFormat === 'excel'
                  ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 font-bold ring-2 ring-emerald-400/30'
                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-300'
              }`}
            >
              <FileSpreadsheet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs">Bảng Excel (.xlsx)</span>
              <span className="text-[10px] text-slate-400">Chuẩn bảng biểu</span>
            </button>

            <button
              type="button"
              onClick={() => setUploadFormat('pdf')}
              className={`p-3 rounded-xl border text-center transition cursor-pointer flex flex-col items-center gap-1.5 ${
                uploadFormat === 'pdf'
                  ? 'border-red-500 bg-red-50/70 dark:bg-red-950/30 text-red-700 dark:text-red-400 font-bold ring-2 ring-red-400/30'
                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-300'
              }`}
            >
              <FileText className="w-5 h-5 text-red-600 dark:text-red-400" />
              <span className="text-xs">Phiếu PDF (.pdf)</span>
              <span className="text-[10px] text-slate-400">In ấn / Ký tên</span>
            </button>

            <button
              type="button"
              onClick={() => setUploadFormat('json')}
              className={`p-3 rounded-xl border text-center transition cursor-pointer flex flex-col items-center gap-1.5 ${
                uploadFormat === 'json'
                  ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 font-bold ring-2 ring-blue-400/30'
                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-300'
              }`}
            >
              <FileCode className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="text-xs">Hồ sơ (.json)</span>
              <span className="text-[10px] text-slate-400">Dữ liệu gốc</span>
            </button>
          </div>
        </div>

        {/* Confirmation Details Card (Required by Workspace Integration Rules) */}
        <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-200 mb-5 space-y-1.5">
          <p className="font-bold flex items-center gap-1.5 text-amber-800 dark:text-amber-300">
            <FolderOpen className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            Chi tiết tệp sẽ lưu vào Google Drive:
          </p>
          <div className="pl-5 space-y-1 text-slate-600 dark:text-slate-300">
            <p>
              • <strong>Tên tệp:</strong> <code className="font-mono text-[11px] bg-white/80 dark:bg-slate-800 px-1 py-0.5 rounded">{getTargetFileName(uploadFormat)}</code>
            </p>
            <p>
              • <strong>Thư mục:</strong> <span className="font-medium text-amber-700 dark:text-amber-300">LopToanThayHung_DinhHuong2027</span> trên Google Drive cá nhân
            </p>
            <p>
              • <strong>Nội dung:</strong> {mode === 'teacher-class' ? `Bảng dữ liệu ${studentRecords.length} học sinh Lớp ${className}` : `Hồ sơ ${profile?.fullName || 'học sinh'}, kết quả Holland và danh sách 15 nguyện vọng`}
            </p>
          </div>
        </div>

        {/* Feedback Alerts */}
        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-xs text-red-600 dark:text-red-400 flex items-start gap-2 mb-4">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && latestUploadedFile && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-xs text-emerald-800 dark:text-emerald-300 mb-4 space-y-2">
            <div className="flex items-center gap-2 font-bold text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
            {latestUploadedFile.webViewLink && (
              <a
                href={latestUploadedFile.webViewLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition shadow-sm text-xs"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Mở tệp ngay trên Google Drive
              </a>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition cursor-pointer"
          >
            Đóng
          </button>
          <button
            type="button"
            onClick={handleConfirmUpload}
            disabled={isUploading}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-500/20 transition cursor-pointer disabled:opacity-50"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Đang lưu lên Drive...
              </>
            ) : (
              <>
                <UploadCloud className="w-4 h-4" />
                Xác nhận lưu lên Drive
              </>
            )}
          </button>
        </div>

        {/* Recent Files in Drive */}
        {savedFiles.length > 0 && (
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2.5 flex items-center gap-1.5">
              <FolderOpen className="w-3.5 h-3.5 text-blue-500" />
              Các tệp đã lưu trên Google Drive gần đây ({savedFiles.length}):
            </p>
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {savedFiles.map((f) => (
                <div
                  key={f.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs"
                >
                  <span className="font-medium text-slate-700 dark:text-slate-200 truncate max-w-[280px]">
                    {f.name}
                  </span>
                  {f.webViewLink ? (
                    <a
                      href={f.webViewLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 shrink-0 text-[11px]"
                    >
                      Mở <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
