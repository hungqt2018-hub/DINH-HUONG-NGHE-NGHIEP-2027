/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  StudentProfile,
  StudentAnswers,
  WishItem,
  SchoolMajorRecord,
  StudentRecord,
  ThresholdSettings,
  HollandScoreResult,
} from './types';
import { INITIAL_SCHOOL_MAJORS } from './data/initialSchools';
import { calculateHollandScore, DEFAULT_THRESHOLDS } from './scoring/hollandScoring';
import { Header } from './components/Header';
import { StepProgressBar } from './components/StepProgressBar';
import { Step1StudentInfo } from './components/Step1StudentInfo';
import { Step2Quiz } from './components/Step2Quiz';
import { Step3Results } from './components/Step3Results';
import { Step4Wishes } from './components/Step4Wishes';
import { TeacherPortal } from './components/TeacherPortal';
import { PrivacyModal } from './components/PrivacyModal';
import { OfflineIndicator } from './components/OfflineIndicator';

const INITIAL_PROFILE: StudentProfile = {
  id: `std-${Date.now()}`,
  fullName: '',
  dob: '2009-05-10',
  gender: '',
  className: '12A1',
  classCode: 'LTH2027',
  schoolName: 'THPT Quốc Học Huế',
  phone: '',
  province: 'Thừa Thiên Huế',
  scoresGrade10: {
    math: 8.5,
    literature: 7.8,
    foreignLang: 8.0,
    physics: 8.2,
    chemistry: 7.5,
    biology: 7.0,
    history: 7.5,
    geography: 7.8,
    informatics: 9.0,
    civicLaw: 8.5,
  },
  scoresGrade11Sem1: {
    math: 8.8,
    literature: 8.0,
    foreignLang: 8.2,
    physics: 8.5,
    chemistry: 7.8,
    biology: 7.2,
    history: 7.8,
    geography: 8.0,
    informatics: 9.2,
    civicLaw: 8.8,
  },
  scoresGrade12Sem1: {
    math: 9.0,
    literature: 8.2,
    foreignLang: 8.5,
    physics: 8.8,
    chemistry: 8.0,
    biology: 7.5,
    history: 8.0,
    geography: 8.2,
    informatics: 9.5,
    civicLaw: 9.0,
  },
  examSubjects: ['Toán', 'Ngữ văn', 'Vật lí', 'Tin học'],
  mockExamScore: 24.5,
  budgetPreference: 'Trung bình (15 - 25 triệu/năm)',
  studyDistancePreference: 'Huế hoặc Đà Nẵng',
  preferredRegion: 'Huế',
  postGradGoal: 'Đi làm sớm, đúng chuyên môn',
  certificatesTalents: '',
  interests: 'Khoa học máy tính, công nghệ, toán học',
  targetCareerThought: 'Kỹ sư phần mềm / Khoa học dữ liệu',
  privacyAccepted: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const INITIAL_ANSWERS: StudentAnswers = {
  hollandChoices: {},
  q11Strengths: ['A'], // Toán - Lí - Tin
  q12ExpectedScore: 'B', // 23 - <26
  q13Location: 'B', // Miền Trung
  q14CareerGoal: 'A', // Đi làm sớm
  q15Attitude: 'B', // Cân bằng (3-6-4-2)
};

export default function App() {
  // Theme Dark / Light
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('lth_dark_mode') === 'true';
  });

  // Current Step 1..4
  const [currentStep, setCurrentStep] = useState<number>(() => {
    const saved = localStorage.getItem('lth_current_step');
    return saved ? parseInt(saved, 10) : 1;
  });

  // Student Profile
  const [profile, setProfile] = useState<StudentProfile>(() => {
    const saved = localStorage.getItem('lth_student_profile');
    return saved ? JSON.parse(saved) : INITIAL_PROFILE;
  });

  // Questionnaire Answers
  const [answers, setAnswers] = useState<StudentAnswers>(() => {
    const saved = localStorage.getItem('lth_student_answers');
    return saved ? JSON.parse(saved) : INITIAL_ANSWERS;
  });

  // 15 Wishes
  const [wishes, setWishes] = useState<WishItem[]>(() => {
    const saved = localStorage.getItem('lth_student_wishes');
    return saved ? JSON.parse(saved) : [];
  });

  // School Database
  const [schoolsDatabase, setSchoolsDatabase] = useState<SchoolMajorRecord[]>(() => {
    const saved = localStorage.getItem('lth_schools_db');
    return saved ? JSON.parse(saved) : INITIAL_SCHOOL_MAJORS;
  });

  // Class Student Records (for Teacher view)
  const [studentRecords, setStudentRecords] = useState<StudentRecord[]>(() => {
    const saved = localStorage.getItem('lth_student_records');
    if (saved) {
      return JSON.parse(saved);
    }
    // Seed initial demo student record
    return [
      {
        profile: {
          ...INITIAL_PROFILE,
          id: 'demo-1',
          fullName: 'Nguyễn Trần Minh Đức',
          className: '12 Toán',
        },
        answers: {
          ...INITIAL_ANSWERS,
          hollandChoices: {
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
          },
        },
        hollandResult: calculateHollandScore({
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
        }),
        wishes: [],
        isConsulted: true,
        teacherNotes: 'Học sinh có tư duy toán tin rất sắc sảo, định hướng ngành CNTT tại ĐH Khoa học Huế và ĐH Bách khoa ĐN rất chuẩn xác.',
      },
    ];
  });

  // Threshold Settings
  const [thresholds, setThresholds] = useState<ThresholdSettings>(() => {
    const saved = localStorage.getItem('lth_thresholds');
    return saved ? JSON.parse(saved) : DEFAULT_THRESHOLDS;
  });

  // Teacher Portal & Privacy modal state
  const [isTeacherPortalOpen, setIsTeacherPortalOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  // Sync Dark mode to document element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('lth_dark_mode', String(darkMode));
  }, [darkMode]);

  // Persist Profile
  useEffect(() => {
    localStorage.setItem('lth_student_profile', JSON.stringify(profile));
  }, [profile]);

  // Persist Answers
  useEffect(() => {
    localStorage.setItem('lth_student_answers', JSON.stringify(answers));
  }, [answers]);

  // Persist Wishes
  useEffect(() => {
    localStorage.setItem('lth_student_wishes', JSON.stringify(wishes));
  }, [wishes]);

  // Persist Schools DB
  useEffect(() => {
    localStorage.setItem('lth_schools_db', JSON.stringify(schoolsDatabase));
  }, [schoolsDatabase]);

  // Persist Student Records
  useEffect(() => {
    localStorage.setItem('lth_student_records', JSON.stringify(studentRecords));
  }, [studentRecords]);

  // Persist Thresholds
  useEffect(() => {
    localStorage.setItem('lth_thresholds', JSON.stringify(thresholds));
  }, [thresholds]);

  // Persist Step
  useEffect(() => {
    localStorage.setItem('lth_current_step', String(currentStep));
  }, [currentStep]);

  // Calculate Holland Score deterministically
  const hollandResult: HollandScoreResult = calculateHollandScore(answers.hollandChoices);

  // Sync current student into studentRecords list
  useEffect(() => {
    if (!profile.fullName) return;

    setStudentRecords((prev) => {
      const idx = prev.findIndex((r) => r.profile.id === profile.id);
      const currentRecord: StudentRecord = {
        profile,
        answers,
        hollandResult,
        wishes,
        teacherNotes: idx >= 0 ? prev[idx].teacherNotes : '',
        isConsulted: idx >= 0 ? prev[idx].isConsulted : false,
      };

      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = currentRecord;
        return copy;
      } else {
        return [currentRecord, ...prev];
      }
    });
  }, [profile, answers, wishes]);

  // Status checks
  const isStep1Valid = Boolean(profile.fullName && profile.dob && profile.className && profile.privacyAccepted);
  const isStep2Completed = Object.keys(answers.hollandChoices).length >= 10 && Boolean(answers.q15Attitude);
  const hasResults = hollandResult.totalScore > 0;

  // Add Wish from Step 3
  const handleAddWishFromStep3 = (major: SchoolMajorRecord) => {
    if (wishes.length >= 15) {
      alert('Em đã có đủ 15 nguyện vọng! Em có thể vào Bước 4 để điều chỉnh thứ tự.');
      return;
    }

    const defaultScore = profile.mockExamScore || 24.5;
    const isSpecialMethod =
      major.admissionMethod.includes('học bạ') ||
      major.admissionMethod.includes('đánh giá năng lực');

    let cat: any = 'Vững';
    if (major.benchmarkScore !== null) {
      const delta = defaultScore - major.benchmarkScore;
      if (isSpecialMethod && delta >= -1.0) cat = 'Bảo đảm';
      else if (delta >= 3.0) cat = 'Bảo đảm';
      else if (delta >= 1.5) cat = 'An toàn';
      else if (delta >= -0.5) cat = 'Vững';
      else cat = 'Chinh phục';
    }

    const newWish: WishItem = {
      id: `w-${Date.now()}-${major.id}`,
      rank: wishes.length + 1,
      category: cat,
      schoolCode: major.schoolCode,
      schoolName: major.schoolName,
      majorCode: major.majorCode,
      majorName: major.majorName,
      admissionMethod: major.admissionMethod,
      combination: major.admissionCombinations,
      benchmarkScore: major.benchmarkScore,
      benchmarkYear: major.benchmarkYear,
      expectedScore: defaultScore,
      delta: major.benchmarkScore !== null ? Number((defaultScore - major.benchmarkScore).toFixed(2)) : 0,
      notes: major.isSample ? 'Dữ liệu mẫu, cần xác minh' : '',
    };

    setWishes((prev) => [...prev, newWish]);

    // Little confetti burst on adding wish
    confetti({
      particleCount: 25,
      spread: 40,
      origin: { y: 0.8 },
    });
  };

  // Reset all student data
  const handleResetData = () => {
    localStorage.removeItem('lth_student_profile');
    localStorage.removeItem('lth_student_answers');
    localStorage.removeItem('lth_student_wishes');
    localStorage.removeItem('lth_current_step');
    setProfile(INITIAL_PROFILE);
    setAnswers(INITIAL_ANSWERS);
    setWishes([]);
    setCurrentStep(1);
  };

  // Step 2 finish trigger
  const handleFinishQuiz = () => {
    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Confetti celebration
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100 transition-colors">
      {/* Header */}
      <Header
        currentStudentName={profile.fullName}
        className={profile.className}
        onOpenTeacherPortal={() => setIsTeacherPortalOpen(true)}
        onResetData={handleResetData}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        step={currentStep}
        onSelectStep={(s) => setCurrentStep(s)}
      />

      {/* 4 Steps Navigation Bar */}
      <StepProgressBar
        currentStep={currentStep}
        onSelectStep={(s) => {
          setCurrentStep(s);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        isStep1Valid={isStep1Valid}
        isStep2Completed={isStep2Completed}
        hasResults={hasResults}
        wishCount={wishes.length}
      />

      {/* Main View Router */}
      <main className="flex-1 pb-16 sm:pb-8">
        {currentStep === 1 && (
          <Step1StudentInfo
            profile={profile}
            onChangeProfile={setProfile}
            onNextStep={() => {
              setCurrentStep(2);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenPrivacy={() => setIsPrivacyOpen(true)}
          />
        )}

        {currentStep === 2 && (
          <Step2Quiz
            answers={answers}
            onChangeAnswers={setAnswers}
            onFinishQuiz={handleFinishQuiz}
            onBackToStep1={() => {
              setCurrentStep(1);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentStep === 3 && (
          <Step3Results
            profile={profile}
            answers={answers}
            hollandResult={hollandResult}
            schoolsDatabase={schoolsDatabase}
            wishes={wishes}
            onAddWish={handleAddWishFromStep3}
            onNextToStep4={() => {
              setCurrentStep(4);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onBackToStep2={() => {
              setCurrentStep(2);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentStep === 4 && (
          <Step4Wishes
            profile={profile}
            answers={answers}
            hollandResult={hollandResult}
            schoolsDatabase={schoolsDatabase}
            wishes={wishes}
            onChangeWishes={setWishes}
            onBackToStep3={() => {
              setCurrentStep(3);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}
      </main>

      {/* Footer Branding */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800 py-6 bg-white dark:bg-slate-900 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-medium">
            © 2026 – 2027 <strong>Lớp Toán Thầy Hùng</strong> • Định hướng nghề nghiệp & Xếp 15 nguyện vọng cho học sinh 2009.
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsPrivacyOpen(true)}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer"
            >
              Chính sách quyền riêng tư
            </button>
            <span>•</span>
            <button
              onClick={() => setIsTeacherPortalOpen(true)}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer font-semibold text-blue-600 dark:text-blue-400"
            >
              Khu vực Giáo viên
            </button>
          </div>
        </div>
      </footer>

      {/* Teacher Portal Modal */}
      <TeacherPortal
        isOpen={isTeacherPortalOpen}
        onClose={() => setIsTeacherPortalOpen(false)}
        studentRecords={studentRecords}
        onUpdateStudentRecord={(updated) => {
          setStudentRecords((prev) =>
            prev.map((r) => (r.profile.id === updated.profile.id ? updated : r))
          );
        }}
        schoolsDatabase={schoolsDatabase}
        onUpdateSchoolsDatabase={setSchoolsDatabase}
        thresholds={thresholds}
        onUpdateThresholds={setThresholds}
      />

      {/* Privacy Policy Modal */}
      <PrivacyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
        accepted={profile.privacyAccepted}
        onAccept={() => setProfile((p) => ({ ...p, privacyAccepted: true }))}
      />

      {/* Offline Status Toast */}
      <OfflineIndicator />
    </div>
  );
}
