import { HollandCode, HollandScoreResult, StudentAnswers, WishCategory, ThresholdSettings } from '../types';

// Mapping letter option in questions 1-10 to Holland Code
export const OPTION_TO_HOLLAND: Record<'A' | 'B' | 'C' | 'D' | 'E' | 'F', HollandCode> = {
  A: 'R', // Kĩ thuật, thực hành
  B: 'I', // Nghiên cứu, phân tích
  C: 'A', // Nghệ thuật, sáng tạo
  D: 'S', // Xã hội, giúp đỡ
  E: 'E', // Quản lí, kinh doanh
  F: 'C', // Nghiệp vụ, hành chính
};

export const HOLLAND_TO_OPTION: Record<HollandCode, 'A' | 'B' | 'C' | 'D' | 'E' | 'F'> = {
  R: 'A',
  I: 'B',
  A: 'C',
  S: 'D',
  E: 'E',
  C: 'F',
};

export const ALL_HOLLAND_CODES: HollandCode[] = ['R', 'I', 'A', 'S', 'E', 'C'];

export const DEFAULT_THRESHOLDS: ThresholdSettings = {
  conquestMaxDelta: -0.5,
  conquestMinDelta: -2.0,
  safeMinDelta: 1.5,
  safeMaxDelta: 3.0,
  guaranteedMinDelta: 3.0,
};

/**
 * Calculates Holland score and determines the 3-letter Holland code deterministically.
 * 
 * Rules:
 * 1. For each question 1-10, option chosen as "1st" earns 2 points; option chosen as "2nd" earns 1 point.
 * 2. Sum of all 6 codes is always 30 (when all 10 questions are answered).
 * 3. Tie-breaker rule (Page 5 of document):
 *    If two or more groups have identical points, prioritize the group selected in Questions 6, 8, and 10
 *    (the specific questions regarding career preference and occupational values).
 *    If still tied, prioritize Q6 > Q8 > Q10 > Q9 > Q7 > Q5 > Q4 > Q3 > Q2 > Q1.
 */
export function calculateHollandScore(
  choices: StudentAnswers['hollandChoices']
): HollandScoreResult {
  const scores: Record<HollandCode, number> = {
    R: 0,
    I: 0,
    A: 0,
    S: 0,
    E: 0,
    C: 0,
  };

  // Keep track of points earned in each individual question for tie-breaking
  // questionBreakdown[code][questionId] = points earned in that question (0, 1, or 2)
  const questionBreakdown: Record<HollandCode, Record<number, number>> = {
    R: {},
    I: {},
    A: {},
    S: {},
    E: {},
    C: {},
  };

  // Initialize breakdown
  for (const code of ALL_HOLLAND_CODES) {
    for (let q = 1; q <= 10; q++) {
      questionBreakdown[code][q] = 0;
    }
  }

  // Iterate over questions 1 to 10
  for (let qId = 1; qId <= 10; qId++) {
    const qChoice = choices?.[qId];
    if (!qChoice) continue;

    const { first, second } = qChoice;

    if (first && OPTION_TO_HOLLAND[first]) {
      const code1 = OPTION_TO_HOLLAND[first];
      scores[code1] += 2;
      questionBreakdown[code1][qId] += 2;
    }

    if (second && OPTION_TO_HOLLAND[second] && second !== first) {
      const code2 = OPTION_TO_HOLLAND[second];
      scores[code2] += 1;
      questionBreakdown[code2][qId] += 1;
    }
  }

  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);

  // Sorting with tie-breaker
  let tieBreakerApplied = false;
  const tieBreakerDetails: string[] = [];

  // Helper to compute total points in Q6, Q8, Q10
  const getCareerQuestionsScore = (code: HollandCode) => {
    return (
      (questionBreakdown[code][6] || 0) +
      (questionBreakdown[code][8] || 0) +
      (questionBreakdown[code][10] || 0)
    );
  };

  // Sort Holland codes deterministically
  const sortedCodes = [...ALL_HOLLAND_CODES].sort((codeA, codeB) => {
    const scoreDiff = scores[codeB] - scores[codeA];
    if (scoreDiff !== 0) {
      return scoreDiff;
    }

    // Tie encountered!
    tieBreakerApplied = true;

    // 1. Check sum of points in questions 6, 8, 10
    const careerScoreA = getCareerQuestionsScore(codeA);
    const careerScoreB = getCareerQuestionsScore(codeB);
    if (careerScoreB !== careerScoreA) {
      tieBreakerDetails.push(
        `Nhóm ${codeA} và ${codeB} hòa điểm (${scores[codeA]}đ): Ưu tiên nhóm có điểm cao hơn ở các câu nghề nghiệp 6, 8, 10 (${careerScoreA}đ so với ${careerScoreB}đ).`
      );
      return careerScoreB - careerScoreA;
    }

    // 2. Check Question 6 specifically (Nghề nghiệp tưởng tượng)
    const q6A = questionBreakdown[codeA][6] || 0;
    const q6B = questionBreakdown[codeB][6] || 0;
    if (q6B !== q6A) {
      tieBreakerDetails.push(
        `Nhóm ${codeA} và ${codeB} tiếp tục hòa ở các câu 6, 8, 10: Ưu tiên theo Câu 6 (${q6A}đ so với ${q6B}đ).`
      );
      return q6B - q6A;
    }

    // 3. Check Question 8 (Giá trị nghề)
    const q8A = questionBreakdown[codeA][8] || 0;
    const q8B = questionBreakdown[codeB][8] || 0;
    if (q8B !== q8A) {
      tieBreakerDetails.push(
        `Nhóm ${codeA} và ${codeB} hòa: Ưu tiên theo Câu 8 (${q8A}đ so với ${q8B}đ).`
      );
      return q8B - q8A;
    }

    // 4. Check Question 10 (Hình ảnh 10 năm tới)
    const q10A = questionBreakdown[codeA][10] || 0;
    const q10B = questionBreakdown[codeB][10] || 0;
    if (q10B !== q10A) {
      tieBreakerDetails.push(
        `Nhóm ${codeA} và ${codeB} hòa: Ưu tiên theo Câu 10 (${q10A}đ so với ${q10B}đ).`
      );
      return q10B - q10A;
    }

    // 5. Fallback sequence: Q9, Q7, Q5, Q4, Q3, Q2, Q1
    const fallbackQuestions = [9, 7, 5, 4, 3, 2, 1];
    for (const q of fallbackQuestions) {
      const qA = questionBreakdown[codeA][q] || 0;
      const qB = questionBreakdown[codeB][q] || 0;
      if (qB !== qA) {
        return qB - qA;
      }
    }

    // Final canonical order R, I, A, S, E, C
    return ALL_HOLLAND_CODES.indexOf(codeA) - ALL_HOLLAND_CODES.indexOf(codeB);
  });

  // Top 3 groups
  const top3: [HollandCode, HollandCode, HollandCode] = [
    sortedCodes[0],
    sortedCodes[1],
    sortedCodes[2],
  ];

  const hollandCodeString = top3.join('-');

  // Filter unique tieBreakerDetails messages
  const uniqueDetails = Array.from(new Set(tieBreakerDetails));

  return {
    scores,
    top3,
    rankedAll: sortedCodes,
    hollandCodeString,
    tieBreakerApplied,
    tieBreakerDetails: uniqueDetails,
    totalScore,
  };
}

/**
 * Classifies a wish into one of 4 categories:
 * - Chinh phục (Conquest / Dream)
 * - Vững (Solid / Target)
 * - An toàn (Safe)
 * - Bảo đảm (Guaranteed)
 */
export function classifyWishCategory(
  expectedScore: number,
  benchmarkScore: number | null,
  admissionMethod: string = 'Thi tốt nghiệp THPT',
  customThresholds?: Partial<ThresholdSettings>
): WishCategory {
  const isSpecialMethod =
    admissionMethod.includes('học bạ') ||
    admissionMethod.includes('đánh giá năng lực') ||
    admissionMethod.includes('ĐGNL') ||
    admissionMethod.includes('xét tuyển thẳng') ||
    admissionMethod.includes('tài năng');

  if (benchmarkScore === null || isNaN(benchmarkScore)) {
    // If benchmark score not available yet
    return isSpecialMethod ? 'Bảo đảm' : 'Vững';
  }

  const delta = Number((expectedScore - benchmarkScore).toFixed(2));
  const safeMin = customThresholds?.safeMinDelta ?? DEFAULT_THRESHOLDS.safeMinDelta;
  const guaranteedMin = customThresholds?.guaranteedMinDelta ?? DEFAULT_THRESHOLDS.guaranteedMinDelta;
  const conquestMax = customThresholds?.conquestMaxDelta ?? DEFAULT_THRESHOLDS.conquestMaxDelta;

  // If method is academic transcript (học bạ) or competency exam (ĐGNL) with reasonable score
  if (isSpecialMethod && delta >= -1.0) {
    return 'Bảo đảm';
  }

  if (delta >= guaranteedMin) {
    return 'Bảo đảm';
  } else if (delta >= safeMin) {
    return 'An toàn';
  } else if (delta >= conquestMax) {
    return 'Vững';
  } else {
    return 'Chinh phục';
  }
}

/**
 * Computes match percentage between student Holland code and school major primary/secondary code.
 */
export function calculateMajorMatchPercentage(
  studentTop3: [HollandCode, HollandCode, HollandCode],
  majorPrimary: HollandCode,
  majorSecondary: HollandCode
): { percent: number; reason: string } {
  const [first, second, third] = studentTop3;

  if (first === majorPrimary) {
    if (second === majorSecondary) {
      return {
        percent: 98,
        reason: `Trùng khớp tuyệt đối: Nhóm nổi trội nhất (${first}) và nhóm thứ hai (${second}) hoàn toàn trùng khớp với định hướng ngành (${majorPrimary}-${majorSecondary}).`,
      };
    } else if (third === majorSecondary) {
      return {
        percent: 92,
        reason: `Trùng khớp rất cao: Nhóm đứng đầu (${first}) trùng nhóm chính, nhóm thứ ba (${third}) trùng nhóm phụ của ngành.`,
      };
    } else {
      return {
        percent: 88,
        reason: `Phù hợp cao: Nhóm tính cách số 1 của em (${first}) là nhóm cốt lõi của ngành này.`,
      };
    }
  }

  if (second === majorPrimary) {
    if (first === majorSecondary) {
      return {
        percent: 90,
        reason: `Phù hợp rất cao: Cả 2 nhóm tính cách hàng đầu của em (${second} và ${first}) đều nằm trong cơ cấu ngành.`,
      };
    } else {
      return {
        percent: 82,
        reason: `Phù hợp tốt: Nhóm thứ hai của em (${second}) trùng với nhóm trọng tâm của ngành.`,
      };
    }
  }

  if (third === majorPrimary) {
    return {
      percent: 74,
      reason: `Khả quan: Nhóm thứ ba (${third}) có trong các tố chất cơ bản của ngành.`,
    };
  }

  if (first === majorSecondary || second === majorSecondary) {
    return {
      percent: 70,
      reason: `Có tiềm năng: Ngành có yêu cầu nhóm phụ (${majorSecondary}) phù hợp với tố chất sẵn có của em.`,
    };
  }

  return {
    percent: 55,
    reason: `Có thể thử sức nếu em có đam mê riêng hoặc định hướng chuyên biệt.`,
  };
}
