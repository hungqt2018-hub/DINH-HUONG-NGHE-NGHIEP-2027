import React from 'react';
import { User, ClipboardCheck, Award, ListOrdered, CheckCircle2 } from 'lucide-react';

interface StepProgressBarProps {
  currentStep: number;
  onSelectStep: (step: number) => void;
  isStep1Valid: boolean;
  isStep2Completed: boolean;
  hasResults: boolean;
  wishCount: number;
}

export const StepProgressBar: React.FC<StepProgressBarProps> = ({
  currentStep,
  onSelectStep,
  isStep1Valid,
  isStep2Completed,
  hasResults,
  wishCount,
}) => {
  const steps = [
    {
      id: 1,
      title: '1. Nhập thông tin',
      shortTitle: 'Thông tin',
      desc: 'Hồ sơ cá nhân & điểm',
      icon: User,
      isCompleted: isStep1Valid,
    },
    {
      id: 2,
      title: '2. Làm trắc nghiệm',
      shortTitle: 'Trắc nghiệm',
      desc: '15 câu Holland & năng lực',
      icon: ClipboardCheck,
      isCompleted: isStep2Completed,
    },
    {
      id: 3,
      title: '3. Kết quả & Tư vấn AI',
      shortTitle: 'Kết quả & AI',
      desc: 'Biểu đồ radar & ngành hợp',
      icon: Award,
      isCompleted: hasResults,
    },
    {
      id: 4,
      title: '4. Xếp 15 nguyện vọng',
      shortTitle: '15 Nguyện vọng',
      desc: `${wishCount}/15 nguyện vọng`,
      icon: ListOrdered,
      isCompleted: wishCount >= 15,
    },
  ];

  return (
    <>
      {/* Desktop & Tablet Top Sticky Bar */}
      <div className="w-full bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 py-3 px-4 shadow-2xs">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-4 gap-2 sm:gap-4">
            {steps.map((st) => {
              const Icon = st.icon;
              const isActive = currentStep === st.id;
              const isPast = currentStep > st.id || st.isCompleted;

              return (
                <button
                  key={st.id}
                  onClick={() => onSelectStep(st.id)}
                  className={`group relative flex items-center gap-2.5 p-2 sm:p-2.5 rounded-xl transition text-left cursor-pointer ${
                    isActive
                      ? 'bg-blue-50/90 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  {/* Step Icon Badge */}
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold transition ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-xs'
                        : isPast
                        ? 'bg-teal-500 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {isPast && !isActive ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                  </div>

                  {/* Step Text */}
                  <div className="hidden sm:block min-w-0">
                    <p
                      className={`text-xs font-semibold truncate ${
                        isActive
                          ? 'text-blue-700 dark:text-blue-400 font-bold'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {st.title}
                    </p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                      {st.desc}
                    </p>
                  </div>

                  {/* Mobile mini title */}
                  <div className="sm:hidden min-w-0">
                    <p
                      className={`text-[11px] font-bold truncate ${
                        isActive
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {st.shortTitle}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile Floating Bottom Navigation Bar */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 shadow-lg flex justify-around">
        {steps.map((st) => {
          const Icon = st.icon;
          const isActive = currentStep === st.id;

          return (
            <button
              key={`mob-${st.id}`}
              onClick={() => onSelectStep(st.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition min-w-[64px] min-h-[44px] cursor-pointer ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'scale-110 text-blue-600 dark:text-blue-400' : ''}`} />
                {st.isCompleted && (
                  <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-teal-500" />
                )}
              </div>
              <span className="text-[10px] mt-0.5 leading-tight">{st.shortTitle}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
