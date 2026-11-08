import React, { useState } from 'react';
import {
  HOLLAND_QUESTIONS,
  QUESTION_11,
  QUESTION_12,
  QUESTION_13,
  QUESTION_14,
  QUESTION_15,
} from '../data/hollandQuestions';
import { StudentAnswers } from '../types';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  RotateCcw,
} from 'lucide-react';

interface Step2Props {
  answers: StudentAnswers;
  onChangeAnswers: (answers: StudentAnswers) => void;
  onFinishQuiz: () => void;
  onBackToStep1: () => void;
}

export const Step2Quiz: React.FC<Step2Props> = ({
  answers,
  onChangeAnswers,
  onFinishQuiz,
  onBackToStep1,
}) => {
  // Current question index 1 to 15
  const [currentQIndex, setCurrentQIndex] = useState<number>(1);

  // Check completion of a specific question
  const isQuestionAnswered = (qNum: number): boolean => {
    if (qNum >= 1 && qNum <= 10) {
      const choice = answers.hollandChoices[qNum];
      return Boolean(choice?.first && choice?.second && choice.first !== choice.second);
    }
    if (qNum === 11) return answers.q11Strengths.length > 0;
    if (qNum === 12) return Boolean(answers.q12ExpectedScore);
    if (qNum === 13) return Boolean(answers.q13Location);
    if (qNum === 14) return Boolean(answers.q14CareerGoal);
    if (qNum === 15) return Boolean(answers.q15Attitude);
    return false;
  };

  // Count answered questions
  const totalAnswered = Array.from({ length: 15 }, (_, i) => i + 1).filter(isQuestionAnswered).length;
  const progressPercent = Math.round((totalAnswered / 15) * 100);

  // Handlers for Holland Questions 1-10
  const handleSelectHolland = (
    qId: number,
    letter: 'A' | 'B' | 'C' | 'D' | 'E' | 'F',
    rank: 'first' | 'second'
  ) => {
    const current = answers.hollandChoices[qId] || {};
    let newFirst = current.first;
    let newSecond = current.second;

    if (rank === 'first') {
      if (newFirst === letter) {
        // Toggle off
        newFirst = undefined;
      } else {
        newFirst = letter;
        // If it was already chosen as second, clear second
        if (newSecond === letter) {
          newSecond = undefined;
        }
      }
    } else {
      if (newSecond === letter) {
        // Toggle off
        newSecond = undefined;
      } else {
        newSecond = letter;
        // If it was already chosen as first, clear first
        if (newFirst === letter) {
          newFirst = undefined;
        }
      }
    }

    const updatedChoices = {
      ...answers.hollandChoices,
      [qId]: { first: newFirst, second: newSecond },
    };

    onChangeAnswers({
      ...answers,
      hollandChoices: updatedChoices,
    });
  };

  // Handler for Q11 (Strengths - max 2)
  const handleToggleQ11 = (letter: string) => {
    const cur = answers.q11Strengths || [];
    let updated: string[];
    if (cur.includes(letter)) {
      updated = cur.filter((x) => x !== letter);
    } else {
      if (cur.length >= 2) {
        // Replace oldest or keep at 2
        updated = [cur[1], letter];
      } else {
        updated = [...cur, letter];
      }
    }
    onChangeAnswers({ ...answers, q11Strengths: updated });
  };

  // Navigation
  const handleNext = () => {
    if (currentQIndex < 15) {
      setCurrentQIndex(currentQIndex + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      onFinishQuiz();
    }
  };

  const handlePrev = () => {
    if (currentQIndex > 1) {
      setCurrentQIndex(currentQIndex - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      onBackToStep1();
    }
  };

  // Quick fill sample answers for testing
  const handleSampleFillQuiz = () => {
    const sampleChoices: StudentAnswers['hollandChoices'] = {
      1: { first: 'B', second: 'A' },
      2: { first: 'B', second: 'F' },
      3: { first: 'B', second: 'A' },
      4: { first: 'B', second: 'C' },
      5: { first: 'B', second: 'F' },
      6: { first: 'B', second: 'A' },
      7: { first: 'B', second: 'E' },
      8: { first: 'B', second: 'F' },
      9: { first: 'B', second: 'A' },
      10: { first: 'B', second: 'F' },
    };
    onChangeAnswers({
      ...answers,
      hollandChoices: sampleChoices,
      q11Strengths: ['A', 'D'],
      q12ExpectedScore: 'B', // 23 - <26
      q13Location: 'B', // Miền Trung
      q14CareerGoal: 'A', // Đi làm sớm
      q15Attitude: 'B', // Cân bằng (3-6-4-2)
    });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Quiz Header & Progress Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
              Câu {currentQIndex}/15
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {currentQIndex <= 10 ? 'Phần A: Xu hướng nghề nghiệp (Holland)' : 'Phần B: Năng lực & Điều kiện'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-teal-600 dark:text-teal-400">
              {totalAnswered}/15 câu ({progressPercent}%)
            </span>
            <button
              onClick={handleSampleFillQuiz}
              className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 underline cursor-pointer"
              title="Điền nhanh bộ đáp án mẫu (Hồ sơ I-R-C)"
            >
              Điền nhanh mẫu
            </button>
          </div>
        </div>

        {/* Progress bar line */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-600 via-teal-500 to-emerald-500 h-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Question Selector Dots/Pills */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
          {Array.from({ length: 15 }, (_, i) => i + 1).map((qNum) => {
            const isAnswered = isQuestionAnswered(qNum);
            const isCurrent = currentQIndex === qNum;

            return (
              <button
                key={qNum}
                onClick={() => {
                  setCurrentQIndex(qNum);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`w-7 h-7 rounded-lg text-xs font-semibold transition active:scale-95 cursor-pointer flex items-center justify-center ${
                  isCurrent
                    ? 'bg-blue-600 text-white shadow-xs ring-2 ring-blue-300 dark:ring-blue-700'
                    : isAnswered
                    ? 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border border-teal-300 dark:border-teal-800'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {qNum}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Question Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-md min-h-[440px] flex flex-col justify-between">
        <div>
          {/* Question 1 to 10: Holland Grouping */}
          {currentQIndex <= 10 && (
            <div>
              {(() => {
                const question = HOLLAND_QUESTIONS[currentQIndex - 1];
                const currentChoice = answers.hollandChoices[currentQIndex] || {};

                return (
                  <div>
                    <div className="mb-4">
                      <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
                        <span>Câu hỏi {question.id}</span>
                        <span>•</span>
                        <span>Trắc nghiệm sở thích nghề nghiệp</span>
                      </div>
                      <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-snug">
                        {question.title}
                      </h2>
                      <div className="mt-2.5 p-3 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 text-xs text-blue-900 dark:text-blue-200">
                        <strong>Hướng dẫn:</strong> Với mỗi câu, em chọn <strong>1 phương án phù hợp nhất</strong> (điểm 2) và <strong>1 phương án phù hợp thứ hai</strong> (điểm 1). Em bấm vào nút tương ứng bên cạnh phương án.
                      </div>
                    </div>

                    {/* Options list */}
                    <div className="space-y-3 mt-5">
                      {question.options.map((opt) => {
                        const isFirst = currentChoice.first === opt.letter;
                        const isSecond = currentChoice.second === opt.letter;

                        return (
                          <div
                            key={opt.letter}
                            className={`p-3.5 sm:p-4 rounded-2xl border transition ${
                              isFirst
                                ? 'bg-blue-50/90 dark:bg-blue-950/60 border-blue-400 dark:border-blue-600 shadow-xs ring-1 ring-blue-300 dark:ring-blue-700'
                                : isSecond
                                ? 'bg-teal-50/90 dark:bg-teal-950/60 border-teal-400 dark:border-teal-600 shadow-xs ring-1 ring-teal-300 dark:ring-teal-700'
                                : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:bg-slate-100/80 dark:hover:bg-slate-800/80'
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              {/* Option Letter & Text */}
                              <div className="flex items-start gap-3 flex-1">
                                <span
                                  className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center font-bold text-xs ${
                                    isFirst
                                      ? 'bg-blue-600 text-white'
                                      : isSecond
                                      ? 'bg-teal-600 text-white'
                                      : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600'
                                  }`}
                                >
                                  {opt.letter}
                                </span>
                                <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed pt-0.5">
                                  {opt.text}
                                </p>
                              </div>

                              {/* Action selection buttons */}
                              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                                {/* Phù hợp nhất (2đ) */}
                                <button
                                  type="button"
                                  onClick={() => handleSelectHolland(question.id, opt.letter as any, 'first')}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer ${
                                    isFirst
                                      ? 'bg-blue-600 text-white shadow-xs'
                                      : 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/50'
                                  }`}
                                >
                                  {isFirst ? '✓ Phù hợp nhất (2đ)' : 'Chọn nhất (2đ)'}
                                </button>

                                {/* Phù hợp thứ hai (1đ) */}
                                <button
                                  type="button"
                                  onClick={() => handleSelectHolland(question.id, opt.letter as any, 'second')}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer ${
                                    isSecond
                                      ? 'bg-teal-600 text-white shadow-xs'
                                      : 'bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-700 hover:bg-teal-50 dark:hover:bg-teal-950/50'
                                  }`}
                                >
                                  {isSecond ? '✓ Phù hợp thứ 2 (1đ)' : 'Chọn thứ 2 (1đ)'}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Question 11: Academic strengths */}
          {currentQIndex === 11 && (
            <div>
              <div className="mb-4">
                <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
                  Câu hỏi 11 • Năng lực học tập
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-snug mt-1">
                  {QUESTION_11.title}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {QUESTION_11.subtitle}
                </p>
              </div>

              <div className="space-y-3 mt-5">
                {QUESTION_11.options.map((opt) => {
                  const isChecked = answers.q11Strengths.includes(opt.letter);
                  return (
                    <button
                      key={opt.letter}
                      type="button"
                      onClick={() => handleToggleQ11(opt.letter)}
                      className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between gap-3 transition cursor-pointer active:scale-98 ${
                        isChecked
                          ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-500 dark:border-teal-600 shadow-xs'
                          : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                            isChecked
                              ? 'bg-teal-600 text-white'
                              : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600'
                          }`}
                        >
                          {opt.letter}
                        </span>
                        <span className="text-sm font-medium text-slate-800 dark:text-slate-100">
                          {opt.text}
                        </span>
                      </div>
                      {isChecked && <CheckCircle2 className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-3 italic">
                * Em đã chọn {answers.q11Strengths.length}/2 thế mạnh.
              </p>
            </div>
          )}

          {/* Question 12: Expected score range */}
          {currentQIndex === 12 && (
            <div>
              <div className="mb-4">
                <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
                  Câu hỏi 12 • Dự kiến điểm xét tuyển
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-snug mt-1">
                  {QUESTION_12.title}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {QUESTION_12.subtitle}
                </p>
              </div>

              <div className="space-y-3 mt-5">
                {QUESTION_12.options.map((opt) => {
                  const isChecked = answers.q12ExpectedScore === opt.letter;
                  return (
                    <button
                      key={opt.letter}
                      type="button"
                      onClick={() => onChangeAnswers({ ...answers, q12ExpectedScore: opt.letter as any })}
                      className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between gap-3 transition cursor-pointer active:scale-98 ${
                        isChecked
                          ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 dark:border-blue-600 shadow-xs'
                          : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                            isChecked
                              ? 'bg-blue-600 text-white'
                              : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600'
                          }`}
                        >
                          {opt.letter}
                        </span>
                        <span className="text-sm font-medium text-slate-800 dark:text-slate-100">
                          {opt.text}
                        </span>
                      </div>
                      {isChecked && <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Question 13: Location / condition */}
          {currentQIndex === 13 && (
            <div>
              <div className="mb-4">
                <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
                  Câu hỏi 13 • Điều kiện gia đình & Vùng học
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-snug mt-1">
                  {QUESTION_13.title}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {QUESTION_13.subtitle}
                </p>
              </div>

              <div className="space-y-3 mt-5">
                {QUESTION_13.options.map((opt) => {
                  const isChecked = answers.q13Location === opt.letter;
                  return (
                    <button
                      key={opt.letter}
                      type="button"
                      onClick={() => onChangeAnswers({ ...answers, q13Location: opt.letter as any })}
                      className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between gap-3 transition cursor-pointer active:scale-98 ${
                        isChecked
                          ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-500 dark:border-teal-600 shadow-xs'
                          : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                            isChecked
                              ? 'bg-teal-600 text-white'
                              : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600'
                          }`}
                        >
                          {opt.letter}
                        </span>
                        <span className="text-sm font-medium text-slate-800 dark:text-slate-100">
                          {opt.text}
                        </span>
                      </div>
                      {isChecked && <CheckCircle2 className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Question 14: Career goal */}
          {currentQIndex === 14 && (
            <div>
              <div className="mb-4">
                <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
                  Câu hỏi 14 • Mục tiêu sau khi tốt nghiệp
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-snug mt-1">
                  {QUESTION_14.title}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {QUESTION_14.subtitle}
                </p>
              </div>

              <div className="space-y-3 mt-5">
                {QUESTION_14.options.map((opt) => {
                  const isChecked = answers.q14CareerGoal === opt.letter;
                  return (
                    <button
                      key={opt.letter}
                      type="button"
                      onClick={() => onChangeAnswers({ ...answers, q14CareerGoal: opt.letter as any })}
                      className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between gap-3 transition cursor-pointer active:scale-98 ${
                        isChecked
                          ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 dark:border-blue-600 shadow-xs'
                          : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                            isChecked
                              ? 'bg-blue-600 text-white'
                              : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600'
                          }`}
                        >
                          {opt.letter}
                        </span>
                        <span className="text-sm font-medium text-slate-800 dark:text-slate-100">
                          {opt.text}
                        </span>
                      </div>
                      {isChecked && <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Question 15: Attitude & Target Structure */}
          {currentQIndex === 15 && (
            <div>
              <div className="mb-4">
                <span className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">
                  Câu hỏi 15 • Thái độ khi xét tuyển & Cơ cấu 15 nguyện vọng
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-snug mt-1">
                  {QUESTION_15.title}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {QUESTION_15.subtitle}
                </p>
              </div>

              <div className="space-y-3.5 mt-5">
                {QUESTION_15.options.map((opt) => {
                  const isChecked = answers.q15Attitude === opt.letter;
                  return (
                    <button
                      key={opt.letter}
                      type="button"
                      onClick={() => onChangeAnswers({ ...answers, q15Attitude: opt.letter as any })}
                      className={`w-full p-4 rounded-2xl border text-left transition cursor-pointer active:scale-98 ${
                        isChecked
                          ? 'bg-orange-50 dark:bg-orange-950/60 border-orange-500 dark:border-orange-600 shadow-md ring-1 ring-orange-300 dark:ring-orange-800'
                          : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <span
                            className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center font-bold text-xs mt-0.5 ${
                              isChecked
                                ? 'bg-orange-600 text-white'
                                : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600'
                            }`}
                          >
                            {opt.letter}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-slate-900 dark:text-white">
                                Phương án {opt.letter} ({opt.name})
                              </span>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 dark:bg-orange-900/60 text-orange-700 dark:text-orange-300">
                                {opt.structureText}
                              </span>
                            </div>
                            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
                              {opt.text}
                            </p>
                          </div>
                        </div>
                        {isChecked && (
                          <CheckCircle2 className="w-5 h-5 text-orange-600 dark:text-orange-400 shrink-0 mt-0.5" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Buttons */}
        <div className="mt-8 pt-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handlePrev}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{currentQIndex === 1 ? 'Quay lại thông tin' : 'Câu trước'}</span>
          </button>

          <div className="flex items-center gap-2">
            {currentQIndex < 15 ? (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm font-bold text-white shadow-md transition active:scale-95 cursor-pointer"
              >
                <span>Câu tiếp theo</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onFinishQuiz}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-xs sm:text-sm font-bold text-white shadow-lg transition active:scale-95 cursor-pointer animate-pulse"
              >
                <Sparkles className="w-4 h-4" />
                <span>Hoàn thành & Xem kết quả</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
