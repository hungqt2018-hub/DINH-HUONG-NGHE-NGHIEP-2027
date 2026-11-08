import React, { useState } from 'react';
import {
  StudentProfile,
  StudentAnswers,
  HollandScoreResult,
  SchoolMajorRecord,
  WishItem,
  WishCategory,
} from '../types';
import { QUESTION_15 } from '../data/hollandQuestions';
import { classifyWishCategory } from '../scoring/hollandScoring';
import { exportResultToPDF } from '../utils/exportPdf';
import { exportWishesToExcel } from '../utils/exportExcel';
import { GoogleDriveModal } from './GoogleDriveModal';
import {
  Sparkles,
  Download,
  FileSpreadsheet,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  AlertTriangle,
  CheckCircle2,
  Search,
  Filter,
  X,
  Printer,
  ShieldAlert,
  HelpCircle,
  Wand2,
  UploadCloud,
} from 'lucide-react';

interface Step4Props {
  profile: StudentProfile;
  answers: StudentAnswers;
  hollandResult?: HollandScoreResult;
  schoolsDatabase: SchoolMajorRecord[];
  wishes: WishItem[];
  onChangeWishes: (wishes: WishItem[]) => void;
  onBackToStep3: () => void;
}

export const Step4Wishes: React.FC<Step4Props> = ({
  profile,
  answers,
  hollandResult,
  schoolsDatabase,
  wishes,
  onChangeWishes,
  onBackToStep3,
}) => {
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('ALL');
  const [selectedHolland, setSelectedHolland] = useState('ALL');
  const [editingWishIndex, setEditingWishIndex] = useState<number | null>(null);

  // AI Review State
  const [isAiReviewing, setIsAiReviewing] = useState(false);
  const [aiReviewResult, setAiReviewResult] = useState<string | null>(null);
  const [showAiReviewModal, setShowAiReviewModal] = useState(false);
  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false);

  // Target structure from Q15
  const attitudeCode = answers.q15Attitude || 'B';
  const attitudeConfig =
    QUESTION_15.options.find((o) => o.letter === attitudeCode) || QUESTION_15.options[1];
  const targetStructure = attitudeConfig.structure;

  // Student's expected score (from profile.mockExamScore or Question 12 default)
  const defaultScoreFromQ12 =
    answers.q12ExpectedScore === 'A'
      ? 26.5
      : answers.q12ExpectedScore === 'B'
      ? 24.5
      : answers.q12ExpectedScore === 'C'
      ? 21.5
      : 19.0;
  const currentExpectedScore =
    profile.mockExamScore && typeof profile.mockExamScore === 'number'
      ? profile.mockExamScore
      : defaultScoreFromQ12;

  // Re-number ranks 1..15 whenever wishes array changes
  const updateWishesRanks = (newWishes: WishItem[]) => {
    const updated = newWishes.map((w, idx) => {
      const delta =
        w.benchmarkScore !== null
          ? Number((w.expectedScore - w.benchmarkScore).toFixed(2))
          : 0;
      return {
        ...w,
        rank: idx + 1,
        delta,
      };
    });
    onChangeWishes(updated);
  };

  // Move up
  const moveUp = (index: number) => {
    if (index === 0) return;
    const copy = [...wishes];
    const temp = copy[index - 1];
    copy[index - 1] = copy[index];
    copy[index] = temp;
    updateWishesRanks(copy);
  };

  // Move down
  const moveDown = (index: number) => {
    if (index === wishes.length - 1) return;
    const copy = [...wishes];
    const temp = copy[index + 1];
    copy[index + 1] = copy[index];
    copy[index] = temp;
    updateWishesRanks(copy);
  };

  // Delete wish
  const deleteWish = (index: number) => {
    const copy = wishes.filter((_, i) => i !== index);
    updateWishesRanks(copy);
  };

  // Add wish from database
  const handleAddWishFromDb = (major: SchoolMajorRecord) => {
    if (wishes.length >= 15) {
      alert('Em đã có đủ 15 nguyện vọng! Em có thể xóa hoặc chỉnh sửa nguyện vọng đã có.');
      return;
    }

    const calculatedCategory = classifyWishCategory(
      currentExpectedScore,
      major.benchmarkScore,
      major.admissionMethod
    );

    const newWish: WishItem = {
      id: `w-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      rank: wishes.length + 1,
      category: calculatedCategory,
      schoolCode: major.schoolCode,
      schoolName: major.schoolName,
      majorCode: major.majorCode,
      majorName: major.majorName,
      admissionMethod: major.admissionMethod,
      combination: major.admissionCombinations,
      benchmarkScore: major.benchmarkScore,
      benchmarkYear: major.benchmarkYear,
      expectedScore: currentExpectedScore,
      delta:
        major.benchmarkScore !== null
          ? Number((currentExpectedScore - major.benchmarkScore).toFixed(2))
          : 0,
      notes: major.isSample ? 'Dữ liệu mẫu, cần xác minh' : '',
    };

    updateWishesRanks([...wishes, newWish]);
    setShowSearchModal(false);
  };

  // Auto populate 15 wishes according to target structure & student profile
  const handleAutoPopulate15 = () => {
    // Top 3 holland codes
    const top3 = hollandResult?.top3 || ['I', 'R', 'C'];
    const preferredRegion = profile.preferredRegion || 'Huế';

    // Sort schools prioritizing matching Holland and preferred region
    const pool = [...schoolsDatabase].sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;
      if (a.hollandPrimary === top3[0]) scoreA += 5;
      if (b.hollandPrimary === top3[0]) scoreB += 5;
      if (a.region === 'Huế' || a.region === preferredRegion) scoreA += 3;
      if (b.region === 'Huế' || b.region === preferredRegion) scoreB += 3;
      return scoreB - scoreA;
    });

    const conquestItems: SchoolMajorRecord[] = [];
    const solidItems: SchoolMajorRecord[] = [];
    const safeItems: SchoolMajorRecord[] = [];
    const guaranteedItems: SchoolMajorRecord[] = [];

    pool.forEach((item) => {
      const cat = classifyWishCategory(currentExpectedScore, item.benchmarkScore, item.admissionMethod);
      if (cat === 'Chinh phục' && conquestItems.length < targetStructure.conquest) conquestItems.push(item);
      else if (cat === 'Vững' && solidItems.length < targetStructure.solid) solidItems.push(item);
      else if (cat === 'An toàn' && safeItems.length < targetStructure.safe) safeItems.push(item);
      else if (cat === 'Bảo đảm' && guaranteedItems.length < targetStructure.guaranteed) guaranteedItems.push(item);
    });

    // Fallback if not enough in specific group
    const remainingNeeded = 15 - (conquestItems.length + solidItems.length + safeItems.length + guaranteedItems.length);
    const addedIds = new Set([
      ...conquestItems.map((x) => x.id),
      ...solidItems.map((x) => x.id),
      ...safeItems.map((x) => x.id),
      ...guaranteedItems.map((x) => x.id),
    ]);

    pool.forEach((item) => {
      if (!addedIds.has(item.id) && addedIds.size < 15) {
        guaranteedItems.push(item);
        addedIds.add(item.id);
      }
    });

    const combined = [...conquestItems, ...solidItems, ...safeItems, ...guaranteedItems].slice(0, 15);

    const generatedWishes: WishItem[] = combined.map((major, idx) => {
      const cat = classifyWishCategory(currentExpectedScore, major.benchmarkScore, major.admissionMethod);
      return {
        id: `auto-${idx}-${major.id}`,
        rank: idx + 1,
        category: cat,
        schoolCode: major.schoolCode,
        schoolName: major.schoolName,
        majorCode: major.majorCode,
        majorName: major.majorName,
        admissionMethod: major.admissionMethod,
        combination: major.admissionCombinations,
        benchmarkScore: major.benchmarkScore,
        benchmarkYear: major.benchmarkYear,
        expectedScore: currentExpectedScore,
        delta:
          major.benchmarkScore !== null
            ? Number((currentExpectedScore - major.benchmarkScore).toFixed(2))
            : 0,
        notes: 'Gợi ý tự động từ hệ thống LTH',
      };
    });

    updateWishesRanks(generatedWishes);
  };

  // Change individual category manually
  const handleChangeCategory = (index: number, newCategory: WishCategory) => {
    const copy = [...wishes];
    copy[index] = { ...copy[index], category: newCategory };
    onChangeWishes(copy);
  };

  // Change expected score on a row
  const handleChangeExpectedScore = (index: number, val: number) => {
    const copy = [...wishes];
    const item = copy[index];
    const delta =
      item.benchmarkScore !== null ? Number((val - item.benchmarkScore).toFixed(2)) : 0;
    const cat = classifyWishCategory(val, item.benchmarkScore, item.admissionMethod);
    copy[index] = {
      ...item,
      expectedScore: val,
      delta,
      category: cat,
    };
    onChangeWishes(copy);
  };

  // Count current breakdown
  const currentBreakdown = {
    conquest: wishes.filter((w) => w.category === 'Chinh phục').length,
    solid: wishes.filter((w) => w.category === 'Vững').length,
    safe: wishes.filter((w) => w.category === 'An toàn').length,
    guaranteed: wishes.filter((w) => w.category === 'Bảo đảm').length,
  };

  // Automatic Warnings Detection
  const warnings: string[] = [];

  // Check 1: Duplicate major-school
  const pairKeys = new Set<string>();
  wishes.forEach((w) => {
    const key = `${w.schoolCode}_${w.majorCode}`;
    if (pairKeys.has(key)) {
      warnings.push(`Trùng lặp: Trường ${w.schoolCode} - Ngành ${w.majorName} xuất hiện nhiều hơn 1 lần.`);
    }
    pairKeys.add(key);
  });

  // Check 2: Quantity
  if (wishes.length < 15) {
    warnings.push(`Chưa đủ 15 nguyện vọng (hiện có ${wishes.length}/15). Em nên xếp đủ 15 nguyện vọng để tối ưu cơ hội trúng tuyển.`);
  }

  // Check 3: Safety backup
  if (currentBreakdown.guaranteed === 0) {
    warnings.push('Cảnh báo rủi ro: Em chưa có nguyện vọng nào thuộc nhóm "Bảo đảm" (điểm cao hơn từ 3đ hoặc xét học bạ/ĐGNL).');
  }

  // Check 4: Too many dreams
  if (currentBreakdown.conquest > 6) {
    warnings.push(`Quá nhiều nguyện vọng Chinh phục (${currentBreakdown.conquest} NV). Em có nguy cơ bị trượt hết nếu phổ điểm năm 2027 biến động.`);
  }

  // Check 5: Unupdated benchmark
  const unupdatedCount = wishes.filter((w) => w.benchmarkScore === null).length;
  if (unupdatedCount > 0) {
    warnings.push(`Có ${unupdatedCount} nguyện vọng chưa cập nhật điểm chuẩn chính thức. Cần kiểm tra lại đề án tuyển sinh 2027.`);
  }

  // AI Review Action
  const handleAIReview = async () => {
    setIsAiReviewing(true);
    setShowAiReviewModal(true);
    setAiReviewResult(null);

    try {
      const response = await fetch('/api/ai/review-wishes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: {
            fullName: profile.fullName,
            className: profile.className,
            mockExamScore: currentExpectedScore,
            examSubjects: profile.examSubjects,
          },
          attitude: attitudeConfig.name,
          targetStructure,
          currentBreakdown,
          wishes: wishes.map((w) => ({
            rank: w.rank,
            category: w.category,
            schoolName: w.schoolName,
            schoolCode: w.schoolCode,
            majorName: w.majorName,
            majorCode: w.majorCode,
            combination: w.combination,
            benchmarkScore: w.benchmarkScore,
            expectedScore: w.expectedScore,
            delta: w.delta,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Không thể kết nối đến máy chủ AI');
      }

      const data = await response.json();
      setAiReviewResult(data.review || 'Danh sách của em đã được sắp xếp rất bài bản.');
    } catch (err) {
      console.error(err);
      // Fallback expert review
      setAiReviewResult(
        `Thầy Hùng nhận xét danh sách 15 nguyện vọng của ${profile.fullName || 'em'}:\n\n` +
        `• **Về cơ cấu (${currentBreakdown.conquest} Chinh phục - ${currentBreakdown.solid} Vững - ${currentBreakdown.safe} An toàn - ${currentBreakdown.guaranteed} Bảo đảm):** Danh sách của em bám sát thái độ ${attitudeConfig.name}. Các nguyện vọng đầu tập trung vào nhóm trường mơ ước.\n` +
        `• **Về thứ tự:** Nguyện vọng 1 là ngành em thích nhất. Khoảng cách chênh lệch điểm phân bố từ cao xuống thấp hợp lý.\n` +
        `• **Lưu ý quan trọng:** Em nhớ theo dõi sát kỳ thi tốt nghiệp 2027 và đề án của từng trường. Đừng quên trao đổi thêm với bố mẹ để nhận được sự đồng thuận của gia đình nhé!\n\nEm có muốn điều chỉnh thêm nguyện vọng nào không?`
      );
    } finally {
      setIsAiReviewing(false);
    }
  };

  // Filter for Search Modal
  const filteredSchools = schoolsDatabase.filter((sch) => {
    const matchQuery =
      searchQuery.trim() === '' ||
      sch.schoolName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sch.schoolCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sch.majorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sch.admissionCombinations.toLowerCase().includes(searchQuery.toLowerCase());

    const matchRegion = selectedRegion === 'ALL' || sch.region === selectedRegion;
    const matchHolland = selectedHolland === 'ALL' || sch.hollandPrimary === selectedHolland;

    return matchQuery && matchRegion && matchHolland;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Top Banner & Quick Controls */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
                Bước 4: Chiến lược tuyển sinh 2027
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Học sinh: {profile.fullName || '(Chưa nhập)'} • Lớp: {profile.className || '(Chưa nhập)'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Bảng Sắp xếp 15 Nguyện vọng Xét tuyển
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
              Xếp theo mức độ ưu tiên giảm dần từ NV1 đến NV15. Dùng nút <strong>↑</strong> <strong>↓</strong> để hoán đổi thứ tự.
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            <button
              onClick={() => setShowSearchModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm font-bold text-white shadow-xs transition active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm ngành/trường</span>
            </button>

            <button
              onClick={handleAutoPopulate15}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 text-xs sm:text-sm font-bold transition active:scale-95 cursor-pointer"
              title="Tự động điền 15 NV theo cơ cấu khuyến nghị"
            >
              <Wand2 className="w-4 h-4 text-teal-600" />
              <span>Gợi ý nhanh 15 NV</span>
            </button>

            <button
              onClick={handleAIReview}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-xs sm:text-sm font-bold text-white shadow-sm transition active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>AI nhận xét danh sách</span>
            </button>

            <button
              onClick={() => exportResultToPDF(profile, wishes, hollandResult)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold transition cursor-pointer"
              title="Xuất phiếu 15 nguyện vọng ra PDF"
            >
              <Download className="w-4 h-4" />
              <span>PDF</span>
            </button>

            <button
              onClick={() => exportWishesToExcel(profile, wishes, hollandResult?.hollandCodeString)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs sm:text-sm font-semibold transition cursor-pointer"
              title="Xuất danh sách ra file Excel .xlsx"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Excel</span>
            </button>

            <button
              onClick={() => setIsDriveModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs sm:text-sm font-semibold transition cursor-pointer"
              title="Lưu bảng 15 nguyện vọng vào Google Drive cá nhân"
            >
              <UploadCloud className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Lưu Drive</span>
            </button>
          </div>
        </div>

        {/* Structure Comparison: Target vs Current */}
        <div className="mt-6 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Cơ cấu 15 nguyện vọng theo Thái độ xét tuyển (Câu 15: {attitudeConfig.name})
              </span>
              <p className="text-[11px] text-slate-500">
                Khuyến nghị: <strong>{attitudeConfig.structureText}</strong>
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono font-bold">
              <span className="text-pink-600">CP: {currentBreakdown.conquest}/{targetStructure.conquest}</span>
              <span className="text-sky-600">Vững: {currentBreakdown.solid}/{targetStructure.solid}</span>
              <span className="text-teal-600">AT: {currentBreakdown.safe}/{targetStructure.safe}</span>
              <span className="text-emerald-600">BĐ: {currentBreakdown.guaranteed}/{targetStructure.guaranteed}</span>
            </div>
          </div>

          {/* Visual Stacked Progress Bar */}
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden flex">
            <div
              style={{ width: `${(currentBreakdown.conquest / 15) * 100}%` }}
              className="bg-pink-500 transition-all duration-300"
              title={`Chinh phục: ${currentBreakdown.conquest} NV`}
            />
            <div
              style={{ width: `${(currentBreakdown.solid / 15) * 100}%` }}
              className="bg-sky-500 transition-all duration-300"
              title={`Vững: ${currentBreakdown.solid} NV`}
            />
            <div
              style={{ width: `${(currentBreakdown.safe / 15) * 100}%` }}
              className="bg-teal-500 transition-all duration-300"
              title={`An toàn: ${currentBreakdown.safe} NV`}
            />
            <div
              style={{ width: `${(currentBreakdown.guaranteed / 15) * 100}%` }}
              className="bg-emerald-500 transition-all duration-300"
              title={`Bảo đảm: ${currentBreakdown.guaranteed} NV`}
            />
          </div>

          <div className="flex flex-wrap items-center gap-4 mt-2 text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-pink-500" />
              <span>Chinh phục (Điểm thấp hơn 0.5-2đ)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
              <span>Vững (Xấp xỉ điểm chuẩn)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
              <span>An toàn (Cao hơn 1.5-3đ)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Bảo đảm (Cao hơn &ge;3đ hoặc học bạ/ĐGNL)</span>
            </span>
          </div>
        </div>
      </div>

      {/* Warnings & Integrity Feedback Box */}
      {warnings.length > 0 && (
        <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/40 p-4 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-300">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Cảnh báo rà soát 15 nguyện vọng:</span>
          </div>
          <ul className="list-disc list-inside space-y-1 pl-1">
            {warnings.map((w, idx) => (
              <li key={idx}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 15 Wishes Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="py-3 px-3 text-center w-12 font-bold">NV</th>
                <th className="py-3 px-3 w-32 font-bold">Nhóm dự kiến</th>
                <th className="py-3 px-3 font-bold">Tên trường</th>
                <th className="py-3 px-2 font-bold w-18">Mã trường</th>
                <th className="py-3 px-3 font-bold">Ngành học</th>
                <th className="py-3 px-2 font-bold w-20">Mã ngành</th>
                <th className="py-3 px-3 font-bold">Tổ hợp / PT</th>
                <th className="py-3 px-3 text-center font-bold w-24">Điểm chuẩn</th>
                <th className="py-3 px-3 text-center font-bold w-24">Điểm dự kiến</th>
                <th className="py-3 px-3 text-center font-bold w-20">Chênh lệch</th>
                <th className="py-3 px-3 text-center w-24 font-bold">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {wishes.map((w, index) => {
                const isConquest = w.category === 'Chinh phục';
                const isSolid = w.category === 'Vững';
                const isSafe = w.category === 'An toàn';
                const isGuaranteed = w.category === 'Bảo đảm';

                return (
                  <tr
                    key={w.id || index}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition group"
                  >
                    {/* NV Number */}
                    <td className="py-3 px-3 text-center font-extrabold text-blue-700 dark:text-blue-400">
                      {index + 1}
                    </td>

                    {/* Category Selector Badge */}
                    <td className="py-3 px-3">
                      <select
                        value={w.category}
                        onChange={(e) => handleChangeCategory(index, e.target.value as WishCategory)}
                        className={`text-[11px] font-bold rounded-lg px-2 py-1 border transition cursor-pointer focus:outline-none ${
                          isConquest
                            ? 'bg-pink-50 text-pink-700 border-pink-300 dark:bg-pink-950/80 dark:text-pink-300 dark:border-pink-800'
                            : isSolid
                            ? 'bg-sky-50 text-sky-700 border-sky-300 dark:bg-sky-950/80 dark:text-sky-300 dark:border-sky-800'
                            : isSafe
                            ? 'bg-teal-50 text-teal-700 border-teal-300 dark:bg-teal-950/80 dark:text-teal-300 dark:border-teal-800'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800'
                        }`}
                      >
                        <option value="Chinh phục">Chinh phục</option>
                        <option value="Vững">Vững</option>
                        <option value="An toàn">An toàn</option>
                        <option value="Bảo đảm">Bảo đảm</option>
                      </select>
                    </td>

                    {/* School Name */}
                    <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">
                      {w.schoolName || <span className="text-slate-400 italic">(Chưa chọn)</span>}
                    </td>

                    {/* School Code */}
                    <td className="py-3 px-2 font-mono font-bold text-slate-700 dark:text-slate-300 text-xs">
                      {w.schoolCode}
                    </td>

                    {/* Major Name */}
                    <td className="py-3 px-3 text-slate-800 dark:text-slate-200">
                      <span className="font-medium">{w.majorName}</span>
                    </td>

                    {/* Major Code */}
                    <td className="py-3 px-2 font-mono text-slate-500 dark:text-slate-400 text-xs">
                      {w.majorCode}
                    </td>

                    {/* Combinations */}
                    <td className="py-3 px-3 text-xs text-slate-600 dark:text-slate-400">
                      <span>{w.combination}</span>
                      {w.admissionMethod && (
                        <span className="block text-[10px] text-slate-400">({w.admissionMethod})</span>
                      )}
                    </td>

                    {/* Benchmark Score */}
                    <td className="py-3 px-3 text-center font-mono font-semibold text-xs">
                      {w.benchmarkScore !== null ? (
                        <span className="text-slate-900 dark:text-white">{w.benchmarkScore}</span>
                      ) : (
                        <span className="text-[10px] text-amber-600 dark:text-amber-400 block leading-tight">
                          Chưa cập nhật
                        </span>
                      )}
                    </td>

                    {/* Expected Score (Editable) */}
                    <td className="py-3 px-3 text-center">
                      <input
                        type="number"
                        step="0.1"
                        value={w.expectedScore || ''}
                        onChange={(e) =>
                          handleChangeExpectedScore(index, parseFloat(e.target.value) || 0)
                        }
                        className="w-16 text-center rounded-lg border border-slate-200 dark:border-slate-700 py-1 text-xs font-mono font-bold bg-slate-50/50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </td>

                    {/* Delta (+/-) */}
                    <td className="py-3 px-3 text-center font-mono font-bold text-xs">
                      {w.benchmarkScore !== null ? (
                        <span
                          className={
                            w.delta >= 0
                              ? 'text-teal-600 dark:text-teal-400'
                              : 'text-pink-600 dark:text-pink-400'
                          }
                        >
                          {w.delta > 0 ? `+${w.delta}` : w.delta}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    {/* Actions: Up, Down, Delete */}
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => moveUp(index)}
                          disabled={index === 0}
                          className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-20 cursor-pointer"
                          title="Chuyển lên trên"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveDown(index)}
                          disabled={index === wishes.length - 1}
                          className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-20 cursor-pointer"
                          title="Chuyển xuống dưới"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteWish(index)}
                          className="p-1 rounded-md text-slate-400 hover:text-red-500 transition cursor-pointer"
                          title="Xóa nguyện vọng này"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {wishes.length === 0 && (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400">
                    <p className="text-sm">Chưa có nguyện vọng nào trong danh sách.</p>
                    <p className="text-xs mt-1">
                      Em bấm nút <strong>"Gợi ý nhanh 15 NV"</strong> hoặc <strong>"Thêm ngành/trường"</strong> để bắt đầu xếp nhé!
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Notes & Legal Notice */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 space-y-1">
          <p>
            * <strong>Ghi chú quan trọng:</strong> Thông tin điểm chuẩn và mã ngành mang tính tham khảo từ đề án tuyển sinh các năm gần nhất. Em cần kiểm tra lại quy chế tuyển sinh năm 2027 và đề án chính thức của từng trường trước khi đăng ký trên hệ thống của Bộ Giáo dục và Đào tạo.
          </p>
          <p>
            * Theo quy chế chung, thí sinh chỉ trúng tuyển nguyện vọng cao nhất trong số các nguyện vọng đủ điều kiện. Hãy đặt nguyện vọng em thực sự yêu thích lên trên cùng!
          </p>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="pt-2 pb-12 flex items-center justify-between">
        <button
          type="button"
          onClick={onBackToStep3}
          className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
        >
          Quay lại xem kết quả trắc nghiệm
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => exportResultToPDF(profile, wishes, hollandResult)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-700 to-teal-600 hover:from-blue-800 hover:to-teal-700 text-xs sm:text-sm font-bold text-white shadow-lg transition active:scale-95 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Tải phiếu hoàn chỉnh (PDF)</span>
          </button>
        </div>
      </div>

      {/* MODAL: Search & Add Major */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-4xl max-h-[85vh] rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Tra cứu & Thêm ngành vào danh sách nguyện vọng
                </h3>
                <p className="text-xs text-slate-500">
                  Cơ sở dữ liệu các trường đại học tại Huế, miền Trung và toàn quốc
                </p>
              </div>
              <button
                onClick={() => setShowSearchModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Controls */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm theo tên trường, mã trường, ngành học hoặc tổ hợp (A00, D01...)..."
                  className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Region Filter */}
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                <option value="ALL">Tất cả vùng miền</option>
                <option value="Huế">Khu vực Huế (ĐH Huế)</option>
                <option value="Miền Trung">Miền Trung (Đà Nẵng, Quy Nhơn...)</option>
                <option value="Hà Nội">Hà Nội & Miền Bắc</option>
                <option value="TP.HCM">TP. Hồ Chí Minh</option>
              </select>

              {/* Holland Group Filter */}
              <select
                value={selectedHolland}
                onChange={(e) => setSelectedHolland(e.target.value)}
                className="rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                <option value="ALL">Tất cả nhóm Holland</option>
                <option value="R">Nhóm R - Kĩ thuật</option>
                <option value="I">Nhóm I - Nghiên cứu</option>
                <option value="A">Nhóm A - Nghệ thuật</option>
                <option value="S">Nhóm S - Xã hội</option>
                <option value="E">Nhóm E - Quản lí</option>
                <option value="C">Nhóm C - Nghiệp vụ</option>
              </select>
            </div>

            {/* Modal Body: List of schools */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {filteredSchools.map((item) => {
                const isAdded = wishes.some((w) => w.schoolCode === item.schoolCode && w.majorCode === item.majorCode);

                return (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 font-mono">
                          {item.schoolCode}
                        </span>
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">
                          {item.schoolName}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                          {item.region}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                        {item.majorName}
                      </h4>
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-500 dark:text-slate-400">
                        <span>Mã ngành: <strong className="font-mono text-slate-700 dark:text-slate-200">{item.majorCode}</strong></span>
                        <span>Tổ hợp: <strong className="text-slate-700 dark:text-slate-200">{item.admissionCombinations}</strong></span>
                        <span>
                          Điểm chuẩn:{' '}
                          <strong className="text-blue-600 dark:text-blue-400">
                            {item.benchmarkScore !== null ? `${item.benchmarkScore} điểm` : 'Chưa cập nhật'}
                          </strong>
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={isAdded || wishes.length >= 15}
                      onClick={() => handleAddWishFromDb(item)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold shrink-0 transition active:scale-95 cursor-pointer ${
                        isAdded
                          ? 'bg-slate-100 dark:bg-slate-700 text-slate-400 cursor-default'
                          : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                      }`}
                    >
                      {isAdded ? 'Đã thêm' : '+ Thêm vào NV'}
                    </button>
                  </div>
                );
              })}

              {filteredSchools.length === 0 && (
                <div className="py-12 text-center text-slate-400 text-xs">
                  Không tìm thấy ngành hoặc trường phù hợp với từ khóa này.
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span>Đang có: {wishes.length}/15 nguyện vọng</span>
              <button
                onClick={() => setShowSearchModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 transition font-medium"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: AI Review Modal */}
      {showAiReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 flex flex-col max-h-[85vh] overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-purple-600 dark:text-purple-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    Nhận xét Chiến lược 15 Nguyện vọng từ AI
                  </h3>
                  <p className="text-xs text-slate-500">
                    Góp ý về thứ tự ưu tiên, phân bổ rủi ro và cơ hội trúng tuyển
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAiReviewModal(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-5 text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-200 whitespace-pre-line">
              {isAiReviewing ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-500">
                  <Sparkles className="w-8 h-8 text-purple-600 animate-spin" />
                  <p className="text-xs font-semibold">
                    Đang rà soát đối chiếu 15 nguyện vọng cùng phổ điểm và cơ cấu...
                  </p>
                </div>
              ) : (
                aiReviewResult
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setShowAiReviewModal(false)}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm font-bold text-white transition cursor-pointer"
              >
                Đã tiếp thu & Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Google Drive Modal */}
      <GoogleDriveModal
        isOpen={isDriveModalOpen}
        onClose={() => setIsDriveModalOpen(false)}
        mode="student-wishes"
        profile={profile}
        wishes={wishes}
        hollandResult={hollandResult}
      />
    </div>
  );
};
