import React, { useState } from 'react';
import { StudentProfile, StudentAnswers, HollandScoreResult, SchoolMajorRecord, WishItem } from '../types';
import { HOLLAND_GROUPS } from '../data/hollandCareers';
import { RadarChart } from './RadarChart';
import { AIChatPanel } from './AIChatPanel';
import { exportResultToPDF } from '../utils/exportPdf';
import { calculateMajorMatchPercentage } from '../scoring/hollandScoring';
import { GoogleDriveModal } from './GoogleDriveModal';
import {
  Award,
  Download,
  ArrowRight,
  PlusCircle,
  Check,
  Sparkles,
  Info,
  BookOpen,
  Compass,
  FileSpreadsheet,
  UploadCloud,
} from 'lucide-react';

interface Step3Props {
  profile: StudentProfile;
  answers: StudentAnswers;
  hollandResult: HollandScoreResult;
  schoolsDatabase: SchoolMajorRecord[];
  wishes: WishItem[];
  onAddWish: (major: SchoolMajorRecord) => void;
  onNextToStep4: () => void;
  onBackToStep2: () => void;
}

export const Step3Results: React.FC<Step3Props> = ({
  profile,
  answers,
  hollandResult,
  schoolsDatabase,
  wishes,
  onAddWish,
  onNextToStep4,
  onBackToStep2,
}) => {
  const [selectedMajorGroup, setSelectedMajorGroup] = useState<string>('ALL');
  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false);

  const top3 = hollandResult.top3;
  const primaryGroup = HOLLAND_GROUPS[top3[0]];
  const secondaryGroup = HOLLAND_GROUPS[top3[1]];
  const tertiaryGroup = HOLLAND_GROUPS[top3[2]];

  // Calculate matching majors
  const matchedMajors = schoolsDatabase
    .map((sch) => {
      const match = calculateMajorMatchPercentage(top3, sch.hollandPrimary, sch.hollandSecondary);
      return {
        ...sch,
        matchPercent: match.percent,
        matchReason: match.reason,
      };
    })
    .sort((a, b) => b.matchPercent - a.matchPercent);

  // Filter based on selected tab
  const filteredMajors = selectedMajorGroup === 'ALL'
    ? matchedMajors.slice(0, 16)
    : matchedMajors.filter((m) => m.hollandPrimary === selectedMajorGroup).slice(0, 16);

  // Check if a major is already added to wishes
  const isWishAdded = (schoolCode: string, majorCode: string) => {
    return wishes.some((w) => w.schoolCode === schoolCode && w.majorCode === majorCode);
  };

  const handleExportPDF = () => {
    exportResultToPDF(profile, wishes, hollandResult);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Hero Result Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-950 via-indigo-900 to-teal-900 p-6 sm:p-9 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-bold mb-3">
              <Award className="w-3.5 h-3.5" />
              <span>Kết quả Định hướng nghề nghiệp 2027</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Học sinh: {profile.fullName || 'Em'} ({profile.className || 'Lớp 12'})
            </h1>
            <p className="mt-2 text-sm text-slate-200 max-w-xl leading-relaxed">
              Dựa trên kết quả trả lời 10 câu hỏi xu hướng và 5 câu năng lực, nhóm tính cách nghề nghiệp nổi trội nhất của em là:
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <div className="px-5 py-2.5 rounded-2xl bg-white text-slate-900 font-extrabold text-2xl sm:text-3xl tracking-widest shadow-lg flex items-center gap-2">
                <span className="text-teal-600">{hollandResult.hollandCodeString}</span>
              </div>
              <span className="text-xs sm:text-sm text-teal-200 font-medium max-w-xs">
                (Gồm 3 nhóm có điểm số cao nhất theo thứ tự ưu tiên)
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <button
              onClick={() => setIsDriveModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-xs sm:text-sm font-bold text-emerald-100 transition cursor-pointer active:scale-95 shadow-sm"
            >
              <UploadCloud className="w-4 h-4 text-emerald-300" />
              <span>Lưu vào Google Drive</span>
            </button>
            <button
              onClick={handleExportPDF}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs sm:text-sm font-bold text-white transition cursor-pointer active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Xuất PDF</span>
            </button>
            <button
              onClick={onNextToStep4}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-xs sm:text-sm font-bold text-slate-950 shadow-lg transition cursor-pointer active:scale-95"
            >
              <span>Xếp 15 nguyện vọng</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Ambient background blur */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* Tie Breaker Details Alert (if applied) */}
      {hollandResult.tieBreakerApplied && hollandResult.tieBreakerDetails.length > 0 && (
        <div className="rounded-2xl bg-blue-50 dark:bg-blue-950/40 p-4 border border-blue-200 dark:border-blue-900 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-3">
          <Info className="w-4 h-4 shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
          <div>
            <span className="font-bold">Quy tắc hòa điểm (Theo tài liệu của Thầy Hùng):</span>
            <ul className="list-disc list-inside mt-1 space-y-0.5">
              {hollandResult.tieBreakerDetails.map((detail, idx) => (
                <li key={idx}>{detail}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Grid: Radar Chart + 6 Group Scores */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Radar Chart Card (col 5) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col justify-between items-center">
          <div className="w-full text-center pb-2">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Biểu đồ Radar 6 nhóm Holland
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Tổng điểm chuẩn mực luôn bằng 30 điểm
            </p>
          </div>

          <div className="py-4">
            <RadarChart scores={hollandResult.scores} top3={top3} />
          </div>

          <div className="w-full pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Nhóm đứng đầu: <strong className="text-teal-600 dark:text-teal-400">{primaryGroup.vietnameseName}</strong>
            </p>
          </div>
        </div>

        {/* Detailed Score Breakdown Card (col 7) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Bảng điểm chi tiết 6 nhóm nghề
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Quy đổi từ số lần chọn nhất (×2đ) và chọn thứ hai (×1đ)
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                Tổng: {hollandResult.totalScore}/30 điểm
              </span>
            </div>

            <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
              {(['R', 'I', 'A', 'S', 'E', 'C'] as const).map((code) => {
                const group = HOLLAND_GROUPS[code];
                const score = hollandResult.scores[code] || 0;
                const percent = Math.round((score / 30) * 100);
                const isTop = top3.includes(code);
                const rankIdx = top3.indexOf(code);

                return (
                  <div key={code} className="py-2.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 ${
                          isTop
                            ? 'bg-teal-600 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {code}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
                            {group.vietnameseName}
                          </p>
                          {isTop && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-700 dark:bg-teal-900/60 dark:text-teal-300">
                              Top {rankIdx + 1}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                          {group.typicalCareers.slice(0, 3).join(', ')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {/* Bar */}
                      <div className="hidden sm:block w-24 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${isTop ? 'bg-teal-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                          style={{ width: `${Math.min(100, (score / 15) * 100)}%` }}
                        />
                      </div>
                      <span className="font-mono font-bold text-xs sm:text-sm w-10 text-right text-slate-900 dark:text-white">
                        {score}đ
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>Tổ hợp môn thế mạnh (Câu 11): <strong>{answers.q11Strengths.join(', ') || 'Chưa chọn'}</strong></span>
            <span>Mức điểm dự kiến (Câu 12): <strong>Phương án {answers.q12ExpectedScore || 'B'}</strong></span>
          </div>
        </div>
      </div>

      {/* Trait & Strength Profiles of Top 3 Groups */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Compass className="w-5 h-5 text-teal-600" />
          <span>Đặc điểm tính cách & Tố chất nghề nghiệp của em</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[primaryGroup, secondaryGroup, tertiaryGroup].map((grp, idx) => (
            <div
              key={grp.code}
              className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                    Nhóm #{idx + 1} ({grp.code})
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-400">
                    {hollandResult.scores[grp.code]} điểm
                  </span>
                </div>
                <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white mb-2">
                  {grp.vietnameseName}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                  {grp.summary}
                </p>

                <div className="space-y-2 mb-4">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Điểm mạnh nổi bật:
                  </span>
                  <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1">
                    {grp.strengths.map((str, sIdx) => (
                      <li key={sIdx} className="flex items-start gap-1.5">
                        <span className="text-teal-500 font-bold">•</span>
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Tổ hợp xét tuyển gợi ý:
                </span>
                <p className="text-xs font-semibold text-teal-700 dark:text-teal-400">
                  {grp.recommendedCombinations.join(', ')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Majors from Database */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200/90 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <span>Danh sách các ngành & trường phù hợp nhất</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Tra cứu từ Cơ sở dữ liệu tuyển sinh của ứng dụng theo độ phù hợp tính cách & năng lực
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setSelectedMajorGroup('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                selectedMajorGroup === 'ALL'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              Tất cả ({matchedMajors.length})
            </button>
            {top3.map((code) => (
              <button
                key={code}
                onClick={() => setSelectedMajorGroup(code)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  selectedMajorGroup === code
                    ? 'bg-teal-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                Nhóm {code}
              </button>
            ))}
          </div>
        </div>

        {/* Major Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {filteredMajors.map((major) => {
            const added = isWishAdded(major.schoolCode, major.majorCode);

            return (
              <div
                key={major.id}
                className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 font-mono">
                      {major.schoolCode} • {major.region}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        major.matchPercent >= 90
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                      }`}
                    >
                      {major.matchPercent}% Phù hợp
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                    {major.majorName}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {major.schoolName}
                  </p>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded-lg bg-white dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-700/60">
                      <span className="text-[10px] text-slate-400 block">Tổ hợp môn:</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-200">
                        {major.admissionCombinations}
                      </span>
                    </div>
                    <div className="p-2 rounded-lg bg-white dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-700/60">
                      <span className="text-[10px] text-slate-400 block">Điểm chuẩn gần nhất:</span>
                      <span className="font-bold text-blue-600 dark:text-blue-400">
                        {major.benchmarkScore !== null ? `${major.benchmarkScore} điểm` : 'Chưa cập nhật'}
                      </span>
                    </div>
                  </div>

                  <p className="mt-2.5 text-[11px] text-slate-500 dark:text-slate-400 italic">
                    "{major.matchReason}"
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-400">
                    HP: ~{major.tuitionFeeText || 'Tiêu chuẩn'} tr/năm
                  </span>

                  <button
                    type="button"
                    onClick={() => onAddWish(major)}
                    disabled={added}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer ${
                      added
                        ? 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 cursor-default'
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                    }`}
                  >
                    {added ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Đã có trong NV</span>
                      </>
                    ) : (
                      <>
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>Thêm vào 15 NV</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Counselor Assistant */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-teal-600" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Hỏi đáp trực tiếp cùng Trợ lý AI Hướng nghiệp
            </h3>
          </div>
          <span className="text-xs text-slate-400">Được lập trình theo tôn chỉ Thầy Hùng</span>
        </div>

        <AIChatPanel
          profile={profile}
          answers={answers}
          hollandResult={hollandResult}
          schoolsDatabase={schoolsDatabase}
          currentWishes={wishes}
        />
      </div>

      {/* Bottom Navigation */}
      <div className="pt-4 pb-8 flex items-center justify-between">
        <button
          type="button"
          onClick={onBackToStep2}
          className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
        >
          Xem lại 15 câu trắc nghiệm
        </button>

        <button
          type="button"
          onClick={onNextToStep4}
          className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-700 via-blue-600 to-teal-600 px-8 py-3.5 text-sm sm:text-base font-bold text-white shadow-lg hover:shadow-xl transition active:scale-98 cursor-pointer"
        >
          <span>Tiếp tục: Xếp 15 nguyện vọng ({wishes.length}/15)</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      {/* Google Drive Modal */}
      <GoogleDriveModal
        isOpen={isDriveModalOpen}
        onClose={() => setIsDriveModalOpen(false)}
        mode="student-results"
        profile={profile}
        wishes={wishes}
        hollandResult={hollandResult}
      />
    </div>
  );
};
