import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import {
  StudentRecord,
  SchoolMajorRecord,
  ThresholdSettings,
  HollandCode,
} from '../types';
import { exportClassListToExcel, exportSchoolDatabaseToExcel } from '../utils/exportExcel';
import { exportResultToPDF } from '../utils/exportPdf';
import { GoogleDriveModal } from './GoogleDriveModal';
import {
  GraduationCap,
  Users,
  Database,
  BarChart3,
  Sliders,
  Download,
  Upload,
  Plus,
  Trash2,
  Edit,
  CheckCircle2,
  Lock,
  LogOut,
  Search,
  FileSpreadsheet,
  X,
  FileText,
  UploadCloud,
} from 'lucide-react';

interface TeacherPortalProps {
  isOpen: boolean;
  onClose: () => void;
  studentRecords: StudentRecord[];
  onUpdateStudentRecord: (updated: StudentRecord) => void;
  schoolsDatabase: SchoolMajorRecord[];
  onUpdateSchoolsDatabase: (updated: SchoolMajorRecord[]) => void;
  thresholds: ThresholdSettings;
  onUpdateThresholds: (thresholds: ThresholdSettings) => void;
}

export const TeacherPortal: React.FC<TeacherPortalProps> = ({
  isOpen,
  onClose,
  studentRecords,
  onUpdateStudentRecord,
  schoolsDatabase,
  onUpdateSchoolsDatabase,
  thresholds,
  onUpdateThresholds,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Tabs: 'STUDENTS' | 'STATS' | 'DATABASE' | 'SETTINGS'
  const [activeTab, setActiveTab] = useState<'STUDENTS' | 'STATS' | 'DATABASE' | 'SETTINGS'>('STUDENTS');
  const [classFilter, setClassFilter] = useState<string>('ALL');
  const [searchStudent, setSearchStudent] = useState<string>('');
  const [isDriveModalOpen, setIsDriveModalOpen] = useState<boolean>(false);

  // Selected student for detail inspection / teacher note
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null);
  const [teacherNoteInput, setTeacherNoteInput] = useState<string>('');

  // Database edit state
  const [editingSchoolRecord, setEditingSchoolRecord] = useState<SchoolMajorRecord | null>(null);
  const [isNewSchoolModalOpen, setIsNewSchoolModalOpen] = useState<boolean>(false);

  if (!isOpen) return null;

  // Password verification
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === 'thayhung2027' || passwordInput === '123456' || passwordInput.trim() === 'thayhung') {
      setIsAuthenticated(true);
      setPasswordError(null);
    } else {
      setPasswordError('Mật khẩu không đúng. Mật khẩu mặc định là thayhung2027');
    }
  };

  // If not authenticated, render login prompt
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
        <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-900/60 flex items-center justify-center text-blue-700 dark:text-blue-300">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                  Khu vực Thầy Hùng & Giáo viên
                </h3>
                <p className="text-xs text-slate-500">Quản lý lớp học & Cơ sở dữ liệu 2027</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Nhập mật khẩu giáo viên
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Gợi ý: thayhung2027"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>
              {passwordError && (
                <p className="text-xs text-red-500 mt-1.5">{passwordError}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 py-2.5 text-sm font-bold text-white shadow-md transition active:scale-98 cursor-pointer"
            >
              Đăng nhập vào Trang Giáo viên
            </button>
          </form>

          <p className="text-[11px] text-center text-slate-400 mt-4">
            Mật khẩu mặc định: <span className="font-mono font-bold text-slate-600 dark:text-slate-300">thayhung2027</span>
          </p>
        </div>
      </div>
    );
  }

  // Classes list
  const classes = Array.from(new Set(studentRecords.map((r) => r.profile.className).filter(Boolean)));

  // Filtered students
  const filteredStudents = studentRecords.filter((rec) => {
    const matchClass = classFilter === 'ALL' || rec.profile.className === classFilter;
    const matchSearch =
      searchStudent.trim() === '' ||
      rec.profile.fullName.toLowerCase().includes(searchStudent.toLowerCase()) ||
      rec.profile.schoolName.toLowerCase().includes(searchStudent.toLowerCase());
    return matchClass && matchSearch;
  });

  // Calculate statistics
  const hollandDist: Record<HollandCode, number> = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
  studentRecords.forEach((r) => {
    if (r.hollandResult?.top3) {
      hollandDist[r.hollandResult.top3[0]] = (hollandDist[r.hollandResult.top3[0]] || 0) + 1;
    }
  });

  // Top selected majors
  const majorCounter: Record<string, number> = {};
  const schoolCounter: Record<string, number> = {};
  studentRecords.forEach((r) => {
    r.wishes.forEach((w) => {
      if (w.majorName) majorCounter[w.majorName] = (majorCounter[w.majorName] || 0) + 1;
      if (w.schoolName) schoolCounter[w.schoolName] = (schoolCounter[w.schoolName] || 0) + 1;
    });
  });

  const topMajors = Object.entries(majorCounter)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const topSchools = Object.entries(schoolCounter)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Save Teacher Note
  const handleSaveTeacherNote = () => {
    if (!selectedStudent) return;
    const updated: StudentRecord = {
      ...selectedStudent,
      teacherNotes: teacherNoteInput,
      isConsulted: true,
    };
    onUpdateStudentRecord(updated);
    setSelectedStudent(updated);
  };

  // Toggle Consulted Status
  const handleToggleConsulted = (student: StudentRecord) => {
    const updated: StudentRecord = {
      ...student,
      isConsulted: !student.isConsulted,
    };
    onUpdateStudentRecord(updated);
    if (selectedStudent?.profile.id === student.profile.id) {
      setSelectedStudent(updated);
    }
  };

  // Import Database from Excel/CSV file
  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json<any>(ws);

        if (Array.isArray(data) && data.length > 0) {
          const imported: SchoolMajorRecord[] = data.map((d, idx) => ({
            id: `imp-${Date.now()}-${idx}`,
            schoolCode: d.schoolCode || d['Mã trường'] || '',
            schoolName: d.schoolName || d['Tên trường'] || '',
            province: d.province || d['Tỉnh thành'] || 'Huế',
            region: (d.region || d['Khu vực'] || 'Huế') as any,
            schoolType: (d.schoolType || d['Loại hình'] || 'Công lập') as any,
            majorCode: d.majorCode || d['Mã ngành'] || '',
            majorName: d.majorName || d['Tên ngành'] || '',
            hollandPrimary: (d.hollandPrimary || d['Holland chính'] || 'I') as HollandCode,
            hollandSecondary: (d.hollandSecondary || d['Holland phụ'] || 'R') as HollandCode,
            admissionCombinations: d.admissionCombinations || d['Tổ hợp'] || 'A00, A01',
            admissionMethod: d.admissionMethod || d['Phương thức'] || 'Thi tốt nghiệp THPT',
            benchmarkScore: typeof d.benchmarkScore === 'number' ? d.benchmarkScore : null,
            benchmarkYear: d.benchmarkYear || 2024,
            source: d.source || 'Nhập từ file Excel',
            tuitionFeeText: String(d.tuitionFeeText || '18.0'),
            updatedAt: new Date().toISOString().split('T')[0],
            isSample: true,
          }));

          onUpdateSchoolsDatabase([...schoolsDatabase, ...imported]);
          alert(`Đã nhập thành công ${imported.length} dòng dữ liệu ngành - trường từ file!`);
        }
      } catch (err) {
        console.error(err);
        alert('Lỗi khi đọc file Excel. Vui lòng kiểm tra lại định dạng file!');
      }
    };
    reader.readAsBinaryString(file);
  };

  // Delete major from database
  const handleDeleteSchoolRecord = (id: string) => {
    if (confirm('Em có chắc chắn muốn xóa dòng dữ liệu này?')) {
      onUpdateSchoolsDatabase(schoolsDatabase.filter((s) => s.id !== id));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-2 sm:p-4">
      <div className="w-full max-w-6xl h-[92vh] rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-900 via-indigo-900 to-teal-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-400/20 border border-teal-300/30 flex items-center justify-center text-teal-300">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-base sm:text-lg">
                  TRANG QUẢN TRỊ GIÁO VIÊN – THẦY HÙNG
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-400/20 border border-teal-300/30 text-teal-300">
                  Tuyển sinh 2027
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Theo dõi tiến độ, nhận xét nguyện vọng và quản lý cơ sở dữ liệu
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAuthenticated(false)}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
              title="Đăng xuất"
            >
              <LogOut className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
              title="Đóng trang giáo viên"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="px-5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab('STUDENTS')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'STUDENTS'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Danh sách học sinh ({studentRecords.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('STATS')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'STATS'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Thống kê lớp học</span>
          </button>

          <button
            onClick={() => setActiveTab('DATABASE')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'DATABASE'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>CSDL Ngành – Trường ({schoolsDatabase.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('SETTINGS')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'SETTINGS'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Ngưỡng phân nhóm</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50 dark:bg-slate-950/40">
          {/* TAB 1: STUDENTS LIST */}
          {activeTab === 'STUDENTS' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Class Filter */}
                  <select
                    value={classFilter}
                    onChange={(e) => setClassFilter(e.target.value)}
                    className="rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-semibold"
                  >
                    <option value="ALL">Tất cả các lớp</option>
                    {classes.map((cls) => (
                      <option key={cls} value={cls}>Lớp {cls}</option>
                    ))}
                  </select>

                  {/* Search Input */}
                  <div className="relative min-w-[200px]">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={searchStudent}
                      onChange={(e) => setSearchStudent(e.target.value)}
                      placeholder="Tìm theo tên học sinh..."
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                    />
                  </div>
                </div>

                {/* Export Excel Button & Google Drive Button */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => exportClassListToExcel(classFilter, filteredStudents)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white shadow-xs transition active:scale-95 cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Xuất Excel</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsDriveModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-xs transition active:scale-95 cursor-pointer"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>Lưu lên Drive</span>
                  </button>
                </div>
              </div>

              {/* Students Table */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500">
                      <tr>
                        <th className="py-3 px-3 text-center w-12">STT</th>
                        <th className="py-3 px-3 font-bold">Họ và tên</th>
                        <th className="py-3 px-3">Lớp</th>
                        <th className="py-3 px-3">Trường THPT</th>
                        <th className="py-3 px-3 text-center">Mã Holland</th>
                        <th className="py-3 px-3 text-center">Số NV</th>
                        <th className="py-3 px-3 text-center">Tình trạng</th>
                        <th className="py-3 px-3 text-center w-28">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {filteredStudents.map((rec, idx) => (
                        <tr
                          key={rec.profile.id || idx}
                          className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition cursor-pointer"
                          onClick={() => {
                            setSelectedStudent(rec);
                            setTeacherNoteInput(rec.teacherNotes || '');
                          }}
                        >
                          <td className="py-3 px-3 text-center font-bold text-slate-400">
                            {idx + 1}
                          </td>
                          <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                            {rec.profile.fullName}
                          </td>
                          <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                            {rec.profile.className}
                          </td>
                          <td className="py-3 px-3 text-slate-500 truncate max-w-[160px]">
                            {rec.profile.schoolName}
                          </td>
                          <td className="py-3 px-3 text-center font-mono font-bold text-teal-600 dark:text-teal-400">
                            {rec.hollandResult?.hollandCodeString || '-'}
                          </td>
                          <td className="py-3 px-3 text-center font-mono font-semibold">
                            {rec.wishes.length}/15
                          </td>
                          <td className="py-3 px-3 text-center">
                            {rec.isConsulted ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                Đã tư vấn
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                                Chưa tư vấn
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                exportResultToPDF(rec.profile, rec.wishes, rec.hollandResult);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-[11px] font-semibold transition"
                            >
                              Xuất PDF
                            </button>
                          </td>
                        </tr>
                      ))}

                      {filteredStudents.length === 0 && (
                        <tr>
                          <td colSpan={8} className="py-8 text-center text-slate-400">
                            Chưa có học sinh nào trong bộ lọc này.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CLASS STATISTICS */}
          {activeTab === 'STATS' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Holland Distribution */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs md:col-span-2">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-3">
                    Phân bố nhóm tính cách nghề nghiệp Holland đứng đầu (Top 1)
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {(['R', 'I', 'A', 'S', 'E', 'C'] as const).map((code) => {
                      const count = hollandDist[code] || 0;
                      const percent = studentRecords.length > 0 ? Math.round((count / studentRecords.length) * 100) : 0;
                      return (
                        <div
                          key={code}
                          className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-sm text-blue-600 dark:text-blue-400">
                              Nhóm {code}
                            </span>
                            <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                              {count} em
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-2.5 overflow-hidden">
                            <div className="bg-teal-500 h-full rounded-full" style={{ width: `${percent}%` }} />
                          </div>
                          <span className="text-[10px] text-slate-400 mt-1 block">{percent}% tổng số em</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Status overview */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-3">
                    Tình trạng tư vấn lớp
                  </h4>
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                      <span className="font-semibold text-emerald-800 dark:text-emerald-200">Đã tư vấn & xác nhận:</span>
                      <strong className="text-emerald-700 dark:text-emerald-300 font-mono">
                        {studentRecords.filter((r) => r.isConsulted).length}
                      </strong>
                    </div>
                    <div className="flex justify-between p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                      <span className="font-semibold text-amber-800 dark:text-amber-200">Chưa tư vấn:</span>
                      <strong className="text-amber-700 dark:text-amber-300 font-mono">
                        {studentRecords.filter((r) => !r.isConsulted).length}
                      </strong>
                    </div>
                    <div className="flex justify-between p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800">
                      <span className="font-semibold text-blue-800 dark:text-blue-200">Tổng số hồ sơ:</span>
                      <strong className="text-blue-700 dark:text-blue-300 font-mono">{studentRecords.length}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Majors & Top Schools */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-3">
                    Top 5 Ngành được học sinh quan tâm & xếp nhiều nhất
                  </h4>
                  <ul className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                    {topMajors.map(([majorName, count], i) => (
                      <li key={i} className="py-2.5 flex items-center justify-between">
                        <span className="font-medium text-slate-800 dark:text-slate-200">{i + 1}. {majorName}</span>
                        <span className="px-2 py-0.5 rounded font-mono font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200">
                          {count} lần
                        </span>
                      </li>
                    ))}
                    {topMajors.length === 0 && (
                      <p className="text-slate-400 py-3">Chưa có dữ liệu lựa chọn.</p>
                    )}
                  </ul>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-3">
                    Top 5 Trường đại học được lựa chọn nhiều nhất
                  </h4>
                  <ul className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                    {topSchools.map(([schoolName, count], i) => (
                      <li key={i} className="py-2.5 flex items-center justify-between">
                        <span className="font-medium text-slate-800 dark:text-slate-200">{i + 1}. {schoolName}</span>
                        <span className="px-2 py-0.5 rounded font-mono font-bold bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-200">
                          {count} lần
                        </span>
                      </li>
                    ))}
                    {topSchools.length === 0 && (
                      <p className="text-slate-400 py-3">Chưa có dữ liệu lựa chọn.</p>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DATABASE MANAGEMENT */}
          {activeTab === 'DATABASE' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    Quản lý Cơ sở dữ liệu Ngành – Trường
                  </h4>
                  <p className="text-xs text-slate-500">
                    Cập nhật điểm chuẩn, thêm trường mới hoặc nhập danh sách từ file Excel/CSV
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-bold transition cursor-pointer">
                    <Upload className="w-4 h-4" />
                    <span>Nhập từ Excel</span>
                    <input
                      type="file"
                      accept=".xlsx, .xls, .csv"
                      onChange={handleImportExcel}
                      className="hidden"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => exportSchoolDatabaseToExcel(schoolsDatabase)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold transition cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Xuất CSDL Excel</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsNewSchoolModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Thêm ngành/trường mới</span>
                  </button>
                </div>
              </div>

              {/* Database Table */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-xs">
                <div className="overflow-x-auto max-h-[500px]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800/80 sticky top-0 border-b border-slate-200 dark:border-slate-800 text-slate-500">
                      <tr>
                        <th className="py-2.5 px-3 font-bold">Mã trường</th>
                        <th className="py-2.5 px-3 font-bold">Tên trường</th>
                        <th className="py-2.5 px-3 font-bold">Mã ngành</th>
                        <th className="py-2.5 px-3 font-bold">Tên ngành</th>
                        <th className="py-2.5 px-2 text-center font-bold">Holland</th>
                        <th className="py-2.5 px-3 font-bold">Tổ hợp</th>
                        <th className="py-2.5 px-2 text-center font-bold">Điểm chuẩn</th>
                        <th className="py-2.5 px-2 text-center font-bold">Học phí</th>
                        <th className="py-2.5 px-2 text-center w-20 font-bold">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {schoolsDatabase.map((rec) => (
                        <tr key={rec.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                          <td className="py-2.5 px-3 font-mono font-bold text-blue-700 dark:text-blue-400">
                            {rec.schoolCode}
                          </td>
                          <td className="py-2.5 px-3 font-medium text-slate-800 dark:text-slate-200 max-w-[200px] truncate">
                            {rec.schoolName}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-slate-500">
                            {rec.majorCode}
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white max-w-[200px] truncate">
                            {rec.majorName}
                          </td>
                          <td className="py-2.5 px-2 text-center font-mono font-bold text-teal-600">
                            {rec.hollandPrimary}-{rec.hollandSecondary}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                            {rec.admissionCombinations}
                          </td>
                          <td className="py-2.5 px-2 text-center font-mono font-bold">
                            {rec.benchmarkScore !== null ? rec.benchmarkScore : '-'}
                          </td>
                          <td className="py-2.5 px-2 text-center text-slate-500">
                            {rec.tuitionFeeText || '-'}
                          </td>
                          <td className="py-2.5 px-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleDeleteSchoolRecord(rec.id)}
                              className="p-1 rounded text-slate-400 hover:text-red-500 transition cursor-pointer"
                              title="Xóa dòng này"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: THRESHOLD SETTINGS */}
          {activeTab === 'SETTINGS' && (
            <div className="max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
              <div>
                <h4 className="font-bold text-base text-slate-900 dark:text-white">
                  Cài đặt Ngưỡng Phân nhóm Nguyện vọng
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Độ lệch điểm giữa Điểm dự kiến của học sinh và Điểm chuẩn gần nhất (Delta = Dự kiến - Điểm chuẩn)
                </p>
              </div>

              <div className="space-y-4 text-xs sm:text-sm">
                <div>
                  <label className="block font-bold text-pink-700 dark:text-pink-400 mb-1">
                    Nhóm Chinh phục (Điểm dự kiến thấp hơn điểm chuẩn):
                  </label>
                  <p className="text-xs text-slate-500 mb-2">
                    Mặc định: Delta từ -2.0 đến -0.5 điểm
                  </p>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      step="0.1"
                      value={thresholds.conquestMaxDelta}
                      onChange={(e) =>
                        onUpdateThresholds({
                          ...thresholds,
                          conquestMaxDelta: parseFloat(e.target.value) || -0.5,
                        })
                      }
                      className="w-24 rounded-lg border border-slate-300 dark:border-slate-700 p-2 font-mono"
                    />
                    <span className="text-slate-500">Mức tối đa (thấp hơn khoảng)</span>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-teal-700 dark:text-teal-400 mb-1">
                    Nhóm An toàn (Điểm dự kiến cao hơn điểm chuẩn):
                  </label>
                  <p className="text-xs text-slate-500 mb-2">
                    Mặc định: Delta từ +1.5 đến +3.0 điểm
                  </p>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      step="0.1"
                      value={thresholds.safeMinDelta}
                      onChange={(e) =>
                        onUpdateThresholds({
                          ...thresholds,
                          safeMinDelta: parseFloat(e.target.value) || 1.5,
                        })
                      }
                      className="w-24 rounded-lg border border-slate-300 dark:border-slate-700 p-2 font-mono"
                    />
                    <span className="text-slate-500">Mức tối thiểu cao hơn</span>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-emerald-700 dark:text-emerald-400 mb-1">
                    Nhóm Bảo đảm (Chắc chắn đỗ):
                  </label>
                  <p className="text-xs text-slate-500 mb-2">
                    Mặc định: Delta cao hơn từ 3.0 điểm trở lên hoặc xét học bạ / ĐGNL
                  </p>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      step="0.1"
                      value={thresholds.guaranteedMinDelta}
                      onChange={(e) =>
                        onUpdateThresholds({
                          ...thresholds,
                          guaranteedMinDelta: parseFloat(e.target.value) || 3.0,
                        })
                      }
                      className="w-24 rounded-lg border border-slate-300 dark:border-slate-700 p-2 font-mono"
                    />
                    <span className="text-slate-500">Mức tối thiểu cao hơn</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => alert('Đã lưu thành công cấu hình ngưỡng phân nhóm!')}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-xs"
                >
                  Lưu cấu hình ngưỡng
                </button>
              </div>
            </div>
          )}
        </div>

        {/* MODAL: Student Detailed Inspection & Teacher Note (Section VIII in PDF) */}
        {selectedStudent && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-3xl max-h-[90vh] rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 flex flex-col overflow-hidden">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
                    Hồ sơ chi tiết: {selectedStudent.profile.fullName} ({selectedStudent.profile.className})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Trường: {selectedStudent.profile.schoolName} • Ngày sinh: {selectedStudent.profile.dob}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs sm:text-sm">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Mã Holland:</span>
                    <strong className="text-teal-600 font-mono text-base">
                      {selectedStudent.hollandResult?.hollandCodeString || '-'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Điểm thi thử:</span>
                    <strong className="text-blue-600 font-mono text-base">
                      {selectedStudent.profile.mockExamScore || 'Chưa nhập'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Số NV đã xếp:</span>
                    <strong className="font-mono text-base">{selectedStudent.wishes.length}/15</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Thái độ (C15):</span>
                    <strong className="text-slate-700 dark:text-slate-300">
                      {selectedStudent.answers.q15Attitude || 'B'}
                    </strong>
                  </div>
                </div>

                {/* Section VIII Teacher Notes */}
                <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 space-y-2">
                  <h4 className="font-bold text-xs sm:text-sm text-blue-900 dark:text-blue-200 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span>Nhận xét của Giáo viên tư vấn / GVCN (Mục VIII Phiếu đánh giá)</span>
                  </h4>
                  <textarea
                    rows={3}
                    value={teacherNoteInput}
                    onChange={(e) => setTeacherNoteInput(e.target.value)}
                    placeholder="Nhập nhận xét về mức độ phù hợp giữa mã nhóm nghề, năng lực và danh sách 15 nguyện vọng của em..."
                    className="w-full rounded-xl border border-blue-200 dark:border-blue-800 p-2.5 text-xs sm:text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => handleToggleConsulted(selectedStudent)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                        selectedStudent.isConsulted
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{selectedStudent.isConsulted ? 'Đã đánh dấu tư vấn' : 'Đánh dấu "Đã tư vấn"'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSaveTeacherNote}
                      className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                    >
                      Lưu nhận xét
                    </button>
                  </div>
                </div>

                {/* 15 Wishes Summary */}
                <div>
                  <h4 className="font-bold text-xs text-slate-700 dark:text-slate-300 mb-2">
                    Danh sách các nguyện vọng của học sinh:
                  </h4>
                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-800 text-slate-400">
                        <tr>
                          <th className="py-2 px-2 text-center w-8">NV</th>
                          <th className="py-2 px-2">Nhóm</th>
                          <th className="py-2 px-2">Trường</th>
                          <th className="py-2 px-2">Ngành</th>
                          <th className="py-2 px-2 text-center">Điểm chuẩn</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {selectedStudent.wishes.map((w) => (
                          <tr key={w.id}>
                            <td className="py-1.5 px-2 text-center font-bold text-blue-600">{w.rank}</td>
                            <td className="py-1.5 px-2 font-semibold text-[11px]">{w.category}</td>
                            <td className="py-1.5 px-2 text-slate-700 dark:text-slate-300 truncate max-w-[140px]">{w.schoolName}</td>
                            <td className="py-1.5 px-2 font-medium truncate max-w-[160px]">{w.majorName}</td>
                            <td className="py-1.5 px-2 text-center font-mono">{w.benchmarkScore ?? '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => exportResultToPDF(selectedStudent.profile, selectedStudent.wishes, selectedStudent.hollandResult)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold text-slate-700 dark:text-slate-200 transition"
                >
                  <Download className="w-4 h-4" />
                  <span>Xuất phiếu PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedStudent(null)}
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: Add New Major / School to Database */}
        {isNewSchoolModalOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
              <h3 className="font-bold text-base text-slate-900 dark:text-white mb-4">
                Thêm Ngành / Trường Mới vào CSDL
              </h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.target as HTMLFormElement;
                  const newRec: SchoolMajorRecord = {
                    id: `new-${Date.now()}`,
                    schoolCode: (form.schoolCode as any).value,
                    schoolName: (form.schoolName as any).value,
                    province: (form.province as any).value,
                    region: (form.region as any).value,
                    schoolType: (form.schoolType as any).value,
                    majorCode: (form.majorCode as any).value,
                    majorName: (form.majorName as any).value,
                    hollandPrimary: (form.hollandPrimary as any).value,
                    hollandSecondary: (form.hollandSecondary as any).value,
                    admissionCombinations: (form.combinations as any).value,
                    admissionMethod: 'Thi tốt nghiệp THPT',
                    benchmarkScore: (form.benchmarkScore as any).value ? parseFloat((form.benchmarkScore as any).value) : null,
                    benchmarkYear: 2024,
                    source: 'Giáo viên bổ sung',
                    tuitionFeeText: (form.tuition as any).value || '18.0',
                    updatedAt: new Date().toISOString().split('T')[0],
                    isSample: true,
                  };
                  onUpdateSchoolsDatabase([...schoolsDatabase, newRec]);
                  setIsNewSchoolModalOpen(false);
                }}
                className="space-y-3 text-xs"
              >
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Mã trường *</label>
                    <input name="schoolCode" required placeholder="DHK, BKA..." className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 uppercase" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tên trường *</label>
                    <input name="schoolName" required placeholder="ĐH Khoa học Huế..." className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Mã ngành *</label>
                    <input name="majorCode" required placeholder="7480201..." className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tên ngành *</label>
                    <input name="majorName" required placeholder="Công nghệ thông tin..." className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Vùng miền</label>
                    <select name="region" className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                      <option value="Huế">Huế</option>
                      <option value="Miền Trung">Miền Trung</option>
                      <option value="Hà Nội">Hà Nội</option>
                      <option value="TP.HCM">TP.HCM</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Loại hình</label>
                    <select name="schoolType" className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                      <option value="Công lập">Công lập</option>
                      <option value="Tư thục">Tư thục</option>
                      <option value="Quốc tế">Quốc tế</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Holland chính</label>
                    <select name="hollandPrimary" className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                      <option value="I">I - Nghiên cứu</option>
                      <option value="R">R - Kĩ thuật</option>
                      <option value="A">A - Nghệ thuật</option>
                      <option value="S">S - Xã hội</option>
                      <option value="E">E - Quản lí</option>
                      <option value="C">C - Nghiệp vụ</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Holland phụ</label>
                    <select name="hollandSecondary" className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                      <option value="R">R - Kĩ thuật</option>
                      <option value="I">I - Nghiên cứu</option>
                      <option value="A">A - Nghệ thuật</option>
                      <option value="S">S - Xã hội</option>
                      <option value="E">E - Quản lí</option>
                      <option value="C">C - Nghiệp vụ</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tổ hợp môn</label>
                    <input name="combinations" defaultValue="A00, A01" className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Điểm chuẩn</label>
                    <input name="benchmarkScore" type="number" step="0.1" placeholder="24.5" className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono" />
                  </div>
                </div>

                <input type="hidden" name="province" value="Huế" />
                <input type="hidden" name="tuition" value="18.0" />

                <div className="pt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsNewSchoolModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700"
                  >
                    Lưu vào CSDL
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Google Drive Modal for Teacher */}
        <GoogleDriveModal
          isOpen={isDriveModalOpen}
          onClose={() => setIsDriveModalOpen(false)}
          mode="teacher-class"
          studentRecords={filteredStudents}
          className={classFilter === 'ALL' ? 'ToanThayHung_2027' : classFilter}
        />
      </div>
    </div>
  );
};
