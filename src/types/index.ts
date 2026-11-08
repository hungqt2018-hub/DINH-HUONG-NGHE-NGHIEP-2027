/**
 * Types & Interfaces for "Lớp Toán Thầy Hùng - Định hướng nghề nghiệp & Xếp 15 nguyện vọng 2027"
 */

export type HollandCode = 'R' | 'I' | 'A' | 'S' | 'E' | 'C';

export interface HollandScoreResult {
  scores: Record<HollandCode, number>; // Total points for each (R, I, A, S, E, C)
  top3: [HollandCode, HollandCode, HollandCode]; // Top 3 letters e.g. ['I', 'R', 'C']
  rankedAll: HollandCode[]; // All 6 letters ranked in order 1 to 6
  hollandCodeString: string; // e.g. "I-R-C"
  tieBreakerApplied: boolean;
  tieBreakerDetails: string[];
  totalScore: number; // Always 30
}

export interface QuestionOption {
  code: HollandCode | string;
  letter: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  text: string;
}

export interface HollandQuestion {
  id: number;
  title: string;
  options: QuestionOption[];
}

export interface StudentAnswers {
  // Q1 - Q10: 1st choice (2 pts) and 2nd choice (1 pt)
  hollandChoices: Record<number, { first?: 'A' | 'B' | 'C' | 'D' | 'E' | 'F'; second?: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' }>;
  // Q11: Academic strengths (up to 2: 'A'|'B'|'C'|'D'|'E')
  q11Strengths: string[];
  // Q12: Expected 3-subject score range ('A'|'B'|'C'|'D')
  q12ExpectedScore: 'A' | 'B' | 'C' | 'D' | '';
  // Q13: Family condition and study distance ('A'|'B'|'C'|'D')
  q13Location: 'A' | 'B' | 'C' | 'D' | '';
  // Q14: Career goal after graduation ('A'|'B'|'C'|'D'|'E')
  q14CareerGoal: 'A' | 'B' | 'C' | 'D' | 'E' | '';
  // Q15: Admission attitude ('A'|'B'|'C')
  q15Attitude: 'A' | 'B' | 'C' | '';
}

export interface SubjectScores {
  math: number | ''; // Toán
  literature: number | ''; // Ngữ văn
  foreignLang: number | ''; // Ngoại ngữ
  physics: number | ''; // Vật lí
  chemistry: number | ''; // Hóa học
  biology: number | ''; // Sinh học
  history: number | ''; // Lịch sử
  geography: number | ''; // Địa lí
  informatics: number | ''; // Tin học
  civicLaw: number | ''; // GDKT&PL
}

export interface StudentProfile {
  id: string;
  fullName: string;
  dob: string; // YYYY-MM-DD, must be in 2009
  gender: 'Nam' | 'Nữ' | 'Khác' | '';
  className: string; // e.g. "12A1", "12 Toán"
  classCode: string; // Teacher class code, e.g. "LTH2027"
  schoolName: string; // Trường THPT
  phone: string; // optional
  province: string; // Tỉnh/thành đang ở
  
  // Academic marks
  scoresGrade10: SubjectScores;
  scoresGrade11Sem1: SubjectScores; // Điểm TB Lớp 11
  scoresGrade12Sem1?: SubjectScores; // Điểm TB HK gần nhất Lớp 12
  
  // Graduation 2027 planned subjects
  examSubjects: string[]; // ['Toán', 'Ngữ văn', ...]
  mockExamScore?: number | ''; // Điểm thi thử tổ hợp gần nhất (nếu có)
  
  // Conditions & Dreams
  budgetPreference: string;
  studyDistancePreference: string;
  preferredRegion: string; // Huế, Miền Trung, Hà Nội, TP.HCM, Toàn quốc, Quốc tế
  postGradGoal: string;
  certificatesTalents: string; // IELTS, SAT, HSG, ĐGNL...
  interests: string;
  targetCareerThought: string; // Nghề em đang nghĩ đến
  
  privacyAccepted: boolean;
  createdAt: string;
  updatedAt: string;
}

export type WishCategory = 'Chinh phục' | 'Vững' | 'An toàn' | 'Bảo đảm';

export interface WishItem {
  id: string;
  rank: number; // 1 to 15
  category: WishCategory;
  schoolCode: string; // e.g. "DHK", "BKA"
  schoolName: string;
  majorCode: string; // e.g. "7480201"
  majorName: string;
  admissionMethod: string; // e.g. "Thi tốt nghiệp THPT", "Xét học bạ", "ĐGNL"
  combination: string; // e.g. "A00, A01"
  benchmarkScore: number | null; // Điểm chuẩn năm gần nhất
  benchmarkYear?: number;
  expectedScore: number; // Điểm dự kiến của em
  delta: number; // expectedScore - benchmarkScore
  notes?: string;
}

export interface SchoolMajorRecord {
  id: string;
  schoolCode: string;
  schoolName: string;
  province: string;
  region: 'Huế' | 'Miền Trung' | 'Hà Nội' | 'TP.HCM' | 'Khác';
  schoolType: 'Công lập' | 'Tư thục' | 'Quốc tế';
  majorCode: string;
  majorName: string;
  hollandPrimary: HollandCode;
  hollandSecondary: HollandCode;
  admissionCombinations: string; // e.g. "A00, A01, D01"
  admissionMethod: string; // "Thi tốt nghiệp THPT" / "Xét học bạ" / "ĐGNL"
  benchmarkScore: number | null; // Điểm chuẩn gần nhất, null nếu chưa cập nhật
  benchmarkYear?: number;
  source?: string;
  tuitionFeeText?: string; // Học phí tham khảo (triệu VNĐ/năm)
  updatedAt: string;
  isSample: boolean;
}

export interface StudentRecord {
  profile: StudentProfile;
  answers: StudentAnswers;
  hollandResult?: HollandScoreResult;
  wishes: WishItem[];
  teacherNotes?: string;
  isConsulted?: boolean;
}

export interface ThresholdSettings {
  conquestMaxDelta: number; // e.g. -0.5
  conquestMinDelta: number; // e.g. -2.0
  safeMinDelta: number; // e.g. 1.5
  safeMaxDelta: number; // e.g. 3.0
  guaranteedMinDelta: number; // e.g. 3.0
}
