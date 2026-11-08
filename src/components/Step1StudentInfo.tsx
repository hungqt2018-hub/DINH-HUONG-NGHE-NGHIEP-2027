import React, { useState } from 'react';
import { StudentProfile, SubjectScores } from '../types';
import {
  User,
  Calendar,
  School,
  MapPin,
  BookOpen,
  ArrowRight,
  Shield,
  HelpCircle,
  FileCheck2,
} from 'lucide-react';

interface Step1Props {
  profile: StudentProfile;
  onChangeProfile: (profile: StudentProfile) => void;
  onNextStep: () => void;
  onOpenPrivacy: () => void;
}

const SUBJECT_KEYS: { key: keyof SubjectScores; label: string; placeholder: string }[] = [
  { key: 'math', label: 'Toán học', placeholder: '8.5' },
  { key: 'literature', label: 'Ngữ văn', placeholder: '7.8' },
  { key: 'foreignLang', label: 'Ngoại ngữ (Anh/..)', placeholder: '8.0' },
  { key: 'physics', label: 'Vật lí', placeholder: '8.2' },
  { key: 'chemistry', label: 'Hóa học', placeholder: '7.5' },
  { key: 'biology', label: 'Sinh học', placeholder: '7.0' },
  { key: 'history', label: 'Lịch sử', placeholder: '7.5' },
  { key: 'geography', label: 'Địa lí', placeholder: '8.0' },
  { key: 'informatics', label: 'Tin học', placeholder: '9.0' },
  { key: 'civicLaw', label: 'GDKT & PL', placeholder: '8.5' },
];

const ELECTIVE_EXAM_SUBJECTS = [
  'Vật lí',
  'Hóa học',
  'Sinh học',
  'Lịch sử',
  'Địa lí',
  'Tin học',
  'GDKT&PL',
  'Ngoại ngữ',
  'Công nghệ (Công nghiệp/Nông nghiệp)',
];

export const Step1StudentInfo: React.FC<Step1Props> = ({
  profile,
  onChangeProfile,
  onNextStep,
  onOpenPrivacy,
}) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Helper to handle simple text/select inputs
  const handleChange = (field: keyof StudentProfile, value: unknown) => {
    onChangeProfile({
      ...profile,
      [field]: value,
      updatedAt: new Date().toISOString(),
    });
    // Clear error
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // Helper for nested subject scores
  const handleScoreChange = (
    target: 'scoresGrade10' | 'scoresGrade11Sem1' | 'scoresGrade12Sem1',
    subjectKey: keyof SubjectScores,
    valStr: string
  ) => {
    const errorKey = `${target}_${subjectKey}`;
    if (valStr.trim() === '') {
      onChangeProfile({
        ...profile,
        [target]: { ...(profile[target] || {}), [subjectKey]: '' },
      });
      setErrors((prev) => {
        const next = { ...prev };
        delete next[errorKey];
        return next;
      });
      return;
    }

    const val = parseFloat(valStr);
    if (isNaN(val) || val < 0 || val > 10) {
      setErrors((prev) => ({
        ...prev,
        [errorKey]: 'Điểm phải từ 0.0 đến 10.0',
      }));
    } else {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[errorKey];
        return next;
      });
    }

    onChangeProfile({
      ...profile,
      [target]: { ...(profile[target] || {}), [subjectKey]: valStr === '' ? '' : val },
    });
  };

  // Toggle elective exam subjects
  const toggleElective = (subject: string) => {
    const current = profile.examSubjects || ['Toán', 'Ngữ văn'];
    let updated: string[];
    if (current.includes(subject)) {
      updated = current.filter((s) => s !== subject);
    } else {
      updated = [...current, subject];
    }
    handleChange('examSubjects', updated);
  };

  // Validation function
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!profile.fullName || profile.fullName.trim() === '') {
      newErrors.fullName = 'Vui lòng nhập họ và tên của em.';
    }

    if (!profile.dob) {
      newErrors.dob = 'Vui lòng nhập ngày tháng năm sinh.';
    } else {
      const year = new Date(profile.dob).getFullYear();
      if (year !== 2009) {
        newErrors.dob = `Năm sinh phải là 2009 (em đang chọn năm ${year}). Chương trình này dành riêng cho học sinh sinh năm 2009 (Lớp 12, thi THPT 2027).`;
      }
    }

    if (!profile.className || profile.className.trim() === '') {
      newErrors.className = 'Vui lòng nhập lớp học (ví dụ: 12A1, 12 Toán...).';
    }

    if (!profile.schoolName || profile.schoolName.trim() === '') {
      newErrors.schoolName = 'Vui lòng nhập tên trường THPT.';
    }

    if (!profile.privacyAccepted) {
      newErrors.privacy = 'Em và phụ huynh cần đọc và đồng ý với điều khoản quyền riêng tư.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onNextStep();
    } else {
      // Scroll to top error
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Quick fill sample data for fast testing
  const handleFillSample = () => {
    const sample: StudentProfile = {
      ...profile,
      fullName: 'Nguyễn Trần Minh Đức',
      dob: '2009-04-15',
      gender: 'Nam',
      className: '12 Toán',
      classCode: 'LTH2027',
      schoolName: 'THPT Chuyên Quốc Học Huế',
      phone: '0912345678',
      province: 'Thừa Thiên Huế',
      scoresGrade10: {
        math: 9.2,
        literature: 7.8,
        foreignLang: 8.5,
        physics: 9.0,
        chemistry: 8.2,
        biology: 7.5,
        history: 7.8,
        geography: 8.0,
        informatics: 9.5,
        civicLaw: 8.6,
      },
      scoresGrade11Sem1: {
        math: 9.4,
        literature: 8.0,
        foreignLang: 8.8,
        physics: 9.2,
        chemistry: 8.4,
        biology: 7.6,
        history: 8.0,
        geography: 8.2,
        informatics: 9.6,
        civicLaw: 8.8,
      },
      scoresGrade12Sem1: {
        math: 9.6,
        literature: 8.2,
        foreignLang: 9.0,
        physics: 9.4,
        chemistry: 8.5,
        biology: 7.8,
        history: 8.2,
        geography: 8.4,
        informatics: 9.8,
        civicLaw: 9.0,
      },
      examSubjects: ['Toán', 'Ngữ văn', 'Vật lí', 'Tin học'],
      mockExamScore: 26.5,
      budgetPreference: 'Kinh tế gia đình ở mức vừa phải (khoảng 15-25 triệu/năm)',
      studyDistancePreference: 'Ưu tiên học tại Huế hoặc các tỉnh miền Trung (Đà Nẵng)',
      preferredRegion: 'Huế & Đà Nẵng',
      postGradGoal: 'Muốn đi làm sớm và phát triển trong các công ty công nghệ',
      certificatesTalents: 'IELTS 6.5, Giải Ba HSG cấp Tỉnh môn Toán',
      interests: 'Lập trình ứng dụng, lắp ráp máy tính, chơi cờ vua, làm video',
      targetCareerThought: 'Kỹ sư phần mềm / Trí tuệ nhân tạo (AI)',
      privacyAccepted: true,
      updatedAt: new Date().toISOString(),
    };
    onChangeProfile(sample);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Intro Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-teal-900 p-6 sm:p-8 text-white shadow-xl mb-8">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 backdrop-blur-md border border-blue-400/30 text-teal-300 text-xs font-semibold mb-3">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Kỳ thi Tốt nghiệp THPT & Xét tuyển ĐH 2027</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Chào mừng em đến với Lớp Toán Thầy Hùng!
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-200 max-w-2xl leading-relaxed">
            Hệ thống hỗ trợ học sinh sinh năm <strong>2009</strong> khám phá nhóm tính cách nghề nghiệp Holland, nhận tư vấn thông minh từ Trợ lý AI và sắp xếp chiến lược <strong>15 nguyện vọng</strong> vào đại học, cao đẳng.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleFillSample}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-600 text-slate-950 text-xs font-bold shadow-md transition active:scale-95 cursor-pointer"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>Điền mẫu nhanh (HS Minh họa Huế)</span>
            </button>
            <button
              type="button"
              onClick={onOpenPrivacy}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-medium text-slate-200 transition cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Cam kết bảo mật & quyền riêng tư</span>
            </button>
          </div>
        </div>

        {/* Decorative background shapes */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-72 h-72 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Card 1: Thông tin cá nhân cơ bản */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-7 border border-slate-200/90 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                1. Thông tin cá nhân của học sinh
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Chỉ dành riêng cho học sinh sinh năm 2009 (học sinh lớp 12, thi tốt nghiệp THPT 2027)
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Họ và tên */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Họ và tên của em <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={profile.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                placeholder="Ví dụ: Nguyễn Văn An"
                className={`w-full rounded-xl border px-3.5 py-2.5 text-sm bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 transition ${
                  errors.fullName
                    ? 'border-red-400 focus:ring-red-300'
                    : 'border-slate-300 dark:border-slate-700 focus:ring-blue-500'
                }`}
              />
              {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>}
            </div>

            {/* Ngày tháng năm sinh */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Ngày sinh (Bắt buộc năm 2009) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={profile.dob}
                  min="2009-01-01"
                  max="2009-12-31"
                  onChange={(e) => handleChange('dob', e.target.value)}
                  className={`w-full rounded-xl border px-3.5 py-2.5 text-sm bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 transition ${
                    errors.dob
                      ? 'border-red-400 focus:ring-red-300'
                      : 'border-slate-300 dark:border-slate-700 focus:ring-blue-500'
                  }`}
                />
              </div>
              {errors.dob ? (
                <p className="text-xs text-red-500 mt-1">{errors.dob}</p>
              ) : (
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                  Định dạng: Ngày / Tháng / 2009
                </p>
              )}
            </div>

            {/* Giới tính */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Giới tính (không bắt buộc)
              </label>
              <select
                value={profile.gender}
                onChange={(e) => handleChange('gender', e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 px-3.5 py-2.5 text-sm bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              >
                <option value="">-- Chọn giới tính --</option>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác / Không muốn tiết lộ</option>
              </select>
            </div>

            {/* Lớp & Mã lớp */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Lớp <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={profile.className}
                  onChange={(e) => handleChange('className', e.target.value)}
                  placeholder="12A1, 12 Toán, 12 Lí..."
                  className={`w-full rounded-xl border px-3.5 py-2.5 text-sm bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 transition ${
                    errors.className
                      ? 'border-red-400 focus:ring-red-300'
                      : 'border-slate-300 dark:border-slate-700 focus:ring-blue-500'
                  }`}
                />
                {errors.className && <p className="text-xs text-red-500 mt-1">{errors.className}</p>}
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Mã lớp (thầy cấp)
                </label>
                <input
                  type="text"
                  value={profile.classCode}
                  onChange={(e) => handleChange('classCode', e.target.value)}
                  placeholder="LTH2027"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 px-3.5 py-2.5 text-sm bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white uppercase font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>
            </div>

            {/* Trường THPT */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Trường THPT đang học <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={profile.schoolName}
                onChange={(e) => handleChange('schoolName', e.target.value)}
                placeholder="Ví dụ: THPT Quốc Học Huế, THPT Phan Châu Trinh..."
                className={`w-full rounded-xl border px-3.5 py-2.5 text-sm bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 transition ${
                  errors.schoolName
                    ? 'border-red-400 focus:ring-red-300'
                    : 'border-slate-300 dark:border-slate-700 focus:ring-blue-500'
                }`}
              />
              {errors.schoolName && <p className="text-xs text-red-500 mt-1">{errors.schoolName}</p>}
            </div>

            {/* Tỉnh / thành */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Tỉnh / Thành phố đang ở
              </label>
              <input
                type="text"
                value={profile.province}
                onChange={(e) => handleChange('province', e.target.value)}
                placeholder="Thừa Thiên Huế, Đà Nẵng, Quảng Trị, Hà Nội..."
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 px-3.5 py-2.5 text-sm bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>

            {/* Số điện thoại / Zalo */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Số điện thoại / Zalo (không bắt buộc - để thầy gửi nhận xét chi tiết)
              </label>
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="09xx xxx xxx"
                className="w-full max-w-sm rounded-xl border border-slate-300 dark:border-slate-700 px-3.5 py-2.5 text-sm bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Điểm trung bình các môn */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-7 border border-slate-200/90 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="w-9 h-9 rounded-xl bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center text-teal-600 dark:text-teal-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                2. Điểm học tập các môn (Thang điểm 10)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Nhập điểm trung bình các năm học THPT (Lớp 10, Lớp 11 và Học kì Lớp 12 từ 0.0 đến 10.0)
              </p>
            </div>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                  <th className="pb-3 font-semibold">Môn học</th>
                  <th className="pb-3 font-semibold text-center w-32">Điểm TB Lớp 10</th>
                  <th className="pb-3 font-semibold text-center w-32">Điểm TB Lớp 11</th>
                  <th className="pb-3 font-semibold text-center w-32">Điểm TB HK Lớp 12</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {SUBJECT_KEYS.map((sub) => {
                  const val10 = profile.scoresGrade10?.[sub.key];
                  const val11 = profile.scoresGrade11Sem1?.[sub.key];
                  const val12 = profile.scoresGrade12Sem1?.[sub.key];
                  const err10 = errors[`scoresGrade10_${sub.key}`];
                  const err11 = errors[`scoresGrade11Sem1_${sub.key}`];
                  const err12 = errors[`scoresGrade12Sem1_${sub.key}`];

                  return (
                    <tr key={sub.key} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                      <td className="py-2.5 font-medium text-slate-700 dark:text-slate-200">
                        {sub.label}
                      </td>
                      <td className="py-2 text-center">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="10"
                          value={val10 ?? ''}
                          onChange={(e) =>
                            handleScoreChange('scoresGrade10', sub.key, e.target.value)
                          }
                          placeholder={sub.placeholder}
                          className={`w-20 sm:w-24 text-center rounded-lg border py-1.5 text-xs sm:text-sm bg-slate-50/50 dark:bg-slate-800/50 font-mono font-semibold focus:outline-none focus:ring-1 ${
                            err10
                              ? 'border-red-400 text-red-500'
                              : 'border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:ring-teal-500'
                          }`}
                        />
                      </td>
                      <td className="py-2 text-center">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="10"
                          value={val11 ?? ''}
                          onChange={(e) =>
                            handleScoreChange('scoresGrade11Sem1', sub.key, e.target.value)
                          }
                          placeholder={sub.placeholder}
                          className={`w-20 sm:w-24 text-center rounded-lg border py-1.5 text-xs sm:text-sm bg-slate-50/50 dark:bg-slate-800/50 font-mono font-semibold focus:outline-none focus:ring-1 ${
                            err11
                              ? 'border-red-400 text-red-500'
                              : 'border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:ring-teal-500'
                          }`}
                        />
                      </td>
                      <td className="py-2 text-center">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="10"
                          value={val12 ?? ''}
                          onChange={(e) =>
                            handleScoreChange('scoresGrade12Sem1', sub.key, e.target.value)
                          }
                          placeholder={sub.placeholder}
                          className={`w-20 sm:w-24 text-center rounded-lg border py-1.5 text-xs sm:text-sm bg-slate-50/50 dark:bg-slate-800/50 font-mono font-semibold focus:outline-none focus:ring-1 ${
                            err12
                              ? 'border-red-400 text-red-500'
                              : 'border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:ring-teal-500'
                          }`}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Card 3: Dự kiến thi tốt nghiệp 2027 & Điều kiện gia đình */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-7 border border-slate-200/90 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="w-9 h-9 rounded-xl bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center text-orange-600 dark:text-orange-400">
              <School className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                3. Định hướng thi tốt nghiệp THPT 2027 & Điều kiện
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Toán, Ngữ văn là 2 môn bắt buộc theo chương trình GDPT mới + môn tự chọn của em
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-6">
            {/* Exam Subjects */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Các môn em dự kiến thi tốt nghiệp THPT 2027:
              </label>
              <div className="flex flex-wrap gap-2">
                {/* Fixed subjects */}
                <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-700">
                  ✓ Toán (Bắt buộc)
                </span>
                <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-700">
                  ✓ Ngữ văn (Bắt buộc)
                </span>

                {/* Elective buttons */}
                {ELECTIVE_EXAM_SUBJECTS.map((sub) => {
                  const isSelected = profile.examSubjects?.includes(sub);
                  return (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => toggleElective(sub)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                        isSelected
                          ? 'bg-teal-600 text-white shadow-xs font-bold'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {isSelected ? `✓ ${sub}` : `+ ${sub}`}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mock exam score if any */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Điểm thi thử tổ hợp gần nhất (nếu có, thang 30)
                </label>
                <input
                  type="number"
                  step="0.25"
                  min="0"
                  max="30"
                  value={profile.mockExamScore ?? ''}
                  onChange={(e) =>
                    handleChange('mockExamScore', e.target.value === '' ? '' : parseFloat(e.target.value))
                  }
                  placeholder="Ví dụ: 24.5"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 px-3.5 py-2.5 text-sm bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Nghề / lĩnh vực em đang nghĩ đến nhất
                </label>
                <input
                  type="text"
                  value={profile.targetCareerThought}
                  onChange={(e) => handleChange('targetCareerThought', e.target.value)}
                  placeholder="Ví dụ: Lập trình viên AI, Bác sĩ, Kinh doanh..."
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 px-3.5 py-2.5 text-sm bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>
            </div>

            {/* Talents & Certificates */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Chứng chỉ, giải thưởng hoặc năng khiếu đặc biệt (nếu có)
              </label>
              <input
                type="text"
                value={profile.certificatesTalents}
                onChange={(e) => handleChange('certificatesTalents', e.target.value)}
                placeholder="IELTS 6.5, SAT 1200, Giải HSG cấp Tỉnh, ĐGNL ĐHQG, Vẽ, Chơi đàn..."
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 px-3.5 py-2.5 text-sm bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>

            {/* Preferences (Budget, distance) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Vùng muốn học đại học
                </label>
                <select
                  value={profile.preferredRegion}
                  onChange={(e) => handleChange('preferredRegion', e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 px-3.5 py-2.5 text-sm bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                >
                  <option value="">-- Chọn khu vực --</option>
                  <option value="Huế">Chỉ học tại Huế (Đại học Huế)</option>
                  <option value="Miền Trung">Khu vực Miền Trung (Huế, Đà Nẵng, Quy Nhơn...)</option>
                  <option value="Hà Nội">Hà Nội & các tỉnh phía Bắc</option>
                  <option value="TP.HCM">TP. Hồ Chí Minh & miền Nam</option>
                  <option value="Toàn quốc">Bất kỳ trường nào trên toàn quốc</option>
                  <option value="Quốc tế / Du học">Chương trình quốc tế / Du học</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Sở thích cá nhân
                </label>
                <input
                  type="text"
                  value={profile.interests}
                  onChange={(e) => handleChange('interests', e.target.value)}
                  placeholder="Đọc sách, chơi cờ, thể thao, thiết kế, công nghệ..."
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 px-3.5 py-2.5 text-sm bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Privacy Consent Checkbox */}
        <div className="rounded-2xl bg-teal-50/70 dark:bg-teal-950/30 p-5 border border-teal-200/80 dark:border-teal-900/60 flex items-start gap-3">
          <input
            id="privacyConsent"
            type="checkbox"
            checked={profile.privacyAccepted}
            onChange={(e) => handleChange('privacyAccepted', e.target.checked)}
            className="mt-1 h-4 w-4 rounded-sm border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
          />
          <label htmlFor="privacyConsent" className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed cursor-pointer">
            <span className="font-bold text-teal-900 dark:text-teal-200">Cam kết & Đồng ý bảo mật:</span> Em và gia đình xác nhận các thông tin trên là chính xác và đồng ý để ứng dụng tính toán định hướng nghề nghiệp, hỗ trợ xếp 15 nguyện vọng cho kỳ thi 2027.{' '}
            <button
              type="button"
              onClick={onOpenPrivacy}
              className="text-teal-700 dark:text-teal-400 underline font-semibold hover:text-teal-900 dark:hover:text-teal-200"
            >
              Xem chi tiết chính sách riêng tư
            </button>
            .
          </label>
        </div>
        {errors.privacy && <p className="text-xs text-red-500">{errors.privacy}</p>}

        {/* Submit Button */}
        <div className="flex justify-end pt-2 pb-8">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-700 via-blue-600 to-teal-600 px-8 py-3.5 text-sm sm:text-base font-bold text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:from-blue-800 hover:to-teal-700 transition active:scale-98 cursor-pointer"
          >
            <span>Tiếp tục: Làm trắc nghiệm 15 câu</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};
