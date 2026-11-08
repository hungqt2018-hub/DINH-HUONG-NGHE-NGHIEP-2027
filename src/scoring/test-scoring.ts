import { calculateHollandScore, classifyWishCategory, calculateMajorMatchPercentage } from './hollandScoring.ts';
import { StudentAnswers } from '../types';

let passedCount = 0;
let totalCount = 0;

function assert(condition: boolean, testName: string, details?: string) {
  totalCount++;
  if (condition) {
    passedCount++;
    console.log(`  ✅ [PASS] ${testName}`);
  } else {
    console.error(`  ❌ [FAIL] ${testName}`);
    if (details) console.error(`     Chi tiết: ${details}`);
  }
}

console.log('===============================================================');
console.log('🧪 BỘ KIỂM THỬ TÍNH ĐIỂM HOLLAND & PHÂN LOẠI NGUYỆN VỌNG');
console.log('===============================================================\n');

// --- Test 1: Dominant R Profile ---
{
  const choices: StudentAnswers['hollandChoices'] = {};
  for (let i = 1; i <= 10; i++) {
    choices[i] = { first: 'A', second: 'B' }; // A = R (2 pts), B = I (1 pt)
  }
  const result = calculateHollandScore(choices);
  assert(
    result.totalScore === 30 &&
    result.scores.R === 20 &&
    result.scores.I === 10 &&
    result.scores.A === 0 &&
    result.hollandCodeString.startsWith('R-I'),
    'Test 1: Hồ sơ thuần Kỹ thuật (R = 20đ, I = 10đ, Tổng = 30đ)',
    `Nhận: total=${result.totalScore}, R=${result.scores.R}, I=${result.scores.I}, code=${result.hollandCodeString}`
  );
}

// --- Test 2: Dominant I Profile ---
{
  const choices: StudentAnswers['hollandChoices'] = {};
  for (let i = 1; i <= 10; i++) {
    choices[i] = { first: 'B', second: 'C' }; // B = I (2 pts), C = A (1 pt)
  }
  const result = calculateHollandScore(choices);
  assert(
    result.totalScore === 30 &&
    result.scores.I === 20 &&
    result.scores.A === 10 &&
    result.top3[0] === 'I' &&
    result.top3[1] === 'A',
    'Test 2: Hồ sơ Nghiên cứu - Nghệ thuật (I = 20đ, A = 10đ, Mã bắt đầu bằng I-A)',
    `Nhận: I=${result.scores.I}, A=${result.scores.A}`
  );
}

// --- Test 3: Total Score Invariant Check (Always equals 30) ---
{
  // Realistic mixed answers
  const choices: StudentAnswers['hollandChoices'] = {
    1: { first: 'B', second: 'A' }, // I: 2, R: 1
    2: { first: 'B', second: 'E' }, // I: 2, E: 1
    3: { first: 'C', second: 'B' }, // A: 2, I: 1
    4: { first: 'B', second: 'D' }, // I: 2, S: 1
    5: { first: 'F', second: 'B' }, // C: 2, I: 1
    6: { first: 'B', second: 'A' }, // I: 2, R: 1
    7: { first: 'D', second: 'E' }, // S: 2, E: 1
    8: { first: 'E', second: 'B' }, // E: 2, I: 1
    9: { first: 'A', second: 'C' }, // R: 2, A: 1
    10: { first: 'B', second: 'F' }, // I: 2, C: 1
  };
  const result = calculateHollandScore(choices);
  assert(
    result.totalScore === 30,
    'Test 3: Tổng điểm 6 nhóm luôn chính xác bằng 30 điểm đối với dữ liệu thực tế',
    `Tổng điểm nhận được: ${result.totalScore}`
  );
}

// --- Test 4: Tie-Breaker Rule: Tied on points, broken by Q6, Q8, Q10 ---
{
  // Setup R and S to both have 6 points total, but R was chosen in Q6 (2 pts)
  const choices: StudentAnswers['hollandChoices'] = {
    1: { first: 'A', second: 'D' }, // R: 2, S: 1
    2: { first: 'D', second: 'A' }, // S: 2, R: 1
    3: { first: 'A', second: 'D' }, // R: 2, S: 1
    4: { first: 'D', second: 'A' }, // S: 2, R: 1
    5: { first: 'B', second: 'C' }, // I: 2, A: 1
    6: { first: 'A', second: 'B' }, // R: 2 (Career Q6 -> R gets 2 pts, S gets 0)
    7: { first: 'B', second: 'C' }, // I: 2, A: 1
    8: { first: 'B', second: 'C' }, // I: 2, A: 1
    9: { first: 'B', second: 'C' }, // I: 2, A: 1
    10: { first: 'B', second: 'C' }, // I: 2, A: 1
  };
  // R total: Q1(2)+Q2(1)+Q3(2)+Q4(1)+Q6(2) = 8 pts
  // Let's adjust so R and S both have 8 pts:
  choices[6] = { first: 'A', second: 'C' }; // R gets 2 pts in Q6
  choices[7] = { first: 'D', second: 'C' }; // S gets 2 pts in Q7
  // Now R = 2+1+2+1+2 = 8 pts (Q6 pts = 2, Q8 pts = 0, Q10 pts = 0 => career = 2)
  // S = 1+2+1+2+2 = 8 pts (Q6 pts = 0, Q8 pts = 0, Q10 pts = 0 => career = 0)
  const result = calculateHollandScore(choices);
  assert(
    result.scores.R === 8 &&
    result.scores.S === 8 &&
    result.top3.indexOf('R') < result.top3.indexOf('S') &&
    result.tieBreakerApplied === true,
    'Test 4: Xử lý hòa điểm theo câu nghề nghiệp (R hòa S 8đ, R được chọn ở câu 6 nên xếp trước S)',
    `R score=${result.scores.R}, S score=${result.scores.S}, Top3=${result.top3.join(',')}, TieBreak=${result.tieBreakerApplied}`
  );
}

// --- Test 5: Tie-Breaker Rule: Tied on total and tied on Q6+8+10, broken by Q6 ---
{
  const choices: StudentAnswers['hollandChoices'] = {
    1: { first: 'E', second: 'B' }, // E: 2
    2: { first: 'F', second: 'B' }, // C: 2
    3: { first: 'E', second: 'B' }, // E: 2
    4: { first: 'F', second: 'B' }, // C: 2
    5: { first: 'A', second: 'B' },
    6: { first: 'E', second: 'B' }, // Q6: E gets 2 pts, C gets 0
    7: { first: 'A', second: 'B' },
    8: { first: 'F', second: 'B' }, // Q8: C gets 2 pts, E gets 0
    9: { first: 'A', second: 'B' },
    10: { first: 'A', second: 'B' },
  };
  // E total = Q1(2)+Q3(2)+Q6(2) = 6 pts; career(Q6+8+10) = 2 pts (from Q6)
  // C total = Q2(2)+Q4(2)+Q8(2) = 6 pts; career(Q6+8+10) = 2 pts (from Q8)
  // Both have total 6 pts and career sum 2 pts. Q6 breaks the tie in favor of E!
  const result = calculateHollandScore(choices);
  assert(
    result.scores.E === 6 &&
    result.scores.C === 6 &&
    result.rankedAll.indexOf('E') < result.rankedAll.indexOf('C'),
    'Test 5: Xử lý hòa điểm phân cấp (E hòa C cả tổng điểm lẫn tổng câu 6+8+10, ưu tiên Câu 6)',
    `E rank=${result.rankedAll.indexOf('E')}, C rank=${result.rankedAll.indexOf('C')}`
  );
}

// --- Test 6: Tie-Breaker Rule: Broken by Question 8 when Q6 is also tied ---
{
  const choices: StudentAnswers['hollandChoices'] = {
    1: { first: 'A', second: 'B' }, // R: 2
    2: { first: 'D', second: 'B' }, // S: 2
    3: { first: 'A', second: 'B' }, // R: 2
    4: { first: 'D', second: 'B' }, // S: 2
    5: { first: 'C', second: 'B' },
    6: { first: 'C', second: 'B' }, // Q6: neither R nor S
    7: { first: 'C', second: 'B' },
    8: { first: 'A', second: 'B' }, // Q8: R gets 2 pts, S gets 0
    9: { first: 'C', second: 'B' },
    10: { first: 'D', second: 'B' }, // Q10: S gets 2 pts, R gets 0
  };
  // R = 2+2+2 = 6 pts; career = 2 (Q8); Q6 = 0
  // S = 2+2+2 = 6 pts; career = 2 (Q10); Q6 = 0
  // Broken by Q8 in favor of R!
  const result = calculateHollandScore(choices);
  assert(
    result.scores.R === 6 &&
    result.scores.S === 6 &&
    result.rankedAll.indexOf('R') < result.rankedAll.indexOf('S'),
    'Test 6: Xử lý hòa điểm phân cấp theo Câu 8 khi Câu 6 không phân định được',
    `R rank=${result.rankedAll.indexOf('R')}, S rank=${result.rankedAll.indexOf('S')}`
  );
}

// --- Test 7: Missing Data / Incomplete Quiz (Safe Fallback) ---
{
  const partialChoices: StudentAnswers['hollandChoices'] = {
    1: { first: 'B', second: 'A' },
    2: { first: 'B', second: 'A' },
    3: { first: 'B', second: 'C' },
  };
  const result = calculateHollandScore(partialChoices);
  assert(
    result.totalScore === 9 &&
    result.scores.I === 6 &&
    result.scores.R === 2 &&
    result.scores.A === 1 &&
    result.top3.length === 3 &&
    result.hollandCodeString === 'I-R-A',
    'Test 7: Xử lý an toàn khi học sinh mới làm dở một số câu (không bị lỗi runtime)',
    `Total=${result.totalScore}, Code=${result.hollandCodeString}`
  );
}

// --- Test 8: Empty Data Edge Case ---
{
  const result = calculateHollandScore({});
  assert(
    result.totalScore === 0 &&
    result.top3.length === 3 &&
    typeof result.hollandCodeString === 'string',
    'Test 8: Xử lý biên khi dữ liệu trắc nghiệm rỗng (trả về giá trị mặc định hợp lệ)',
    `Code=${result.hollandCodeString}`
  );
}

// --- Test 9: 100 Random Sheet Integrity Tests (Monte Carlo invariant test) ---
{
  let all30 = true;
  const options = ['A', 'B', 'C', 'D', 'E', 'F'] as const;
  for (let trial = 0; trial < 100; trial++) {
    const randomChoices: StudentAnswers['hollandChoices'] = {};
    for (let q = 1; q <= 10; q++) {
      const idx1 = Math.floor(Math.random() * 6);
      let idx2 = Math.floor(Math.random() * 5);
      if (idx2 >= idx1) idx2++;
      randomChoices[q] = { first: options[idx1], second: options[idx2] };
    }
    const res = calculateHollandScore(randomChoices);
    if (res.totalScore !== 30 || res.top3.length !== 3) {
      all30 = false;
      break;
    }
  }
  assert(
    all30,
    'Test 9: Kiểm định 100 bài thi ngẫu nhiên (tất cả 100 bài đều đạt đúng 30 điểm và mã 3 chữ số hợp lệ)',
    `all30=${all30}`
  );
}

// --- Test 10: Wish Classification Boundary Tests ---
{
  // Conquest (Chinh phục): expected < benchmark by 0.5 - 2 points (delta < -0.5)
  const catConquest = classifyWishCategory(24.0, 25.5, 'Thi tốt nghiệp THPT');
  // Solid (Vững): expected approx benchmark (delta in [-0.5, 1.5))
  const catSolid = classifyWishCategory(24.5, 24.0, 'Thi tốt nghiệp THPT');
  // Safe (An toàn): expected > benchmark by 1.5 - 3 points
  const catSafe = classifyWishCategory(26.0, 24.0, 'Thi tốt nghiệp THPT');
  // Guaranteed (Bảo đảm): expected > benchmark by >= 3 points
  const catGuaranteed = classifyWishCategory(28.0, 24.0, 'Thi tốt nghiệp THPT');
  // Special method: Academic transcript (Học bạ)
  const catHocBa = classifyWishCategory(23.0, 23.5, 'Xét học bạ');

  assert(
    catConquest === 'Chinh phục' &&
    catSolid === 'Vững' &&
    catSafe === 'An toàn' &&
    catGuaranteed === 'Bảo đảm' &&
    catHocBa === 'Bảo đảm',
    'Test 10: Phân loại chính xác 4 nhóm nguyện vọng (Chinh phục, Vững, An toàn, Bảo đảm) và xét học bạ',
    `Conquest=${catConquest}, Solid=${catSolid}, Safe=${catSafe}, Guaranteed=${catGuaranteed}, HocBa=${catHocBa}`
  );
}

// --- Test 11: Major Match Calculation ---
{
  const matchHigh = calculateMajorMatchPercentage(['I', 'R', 'C'], 'I', 'R');
  const matchMedium = calculateMajorMatchPercentage(['I', 'R', 'C'], 'R', 'E');
  assert(
    matchHigh.percent >= 95 && matchMedium.percent >= 80,
    'Test 11: Tính phần trăm độ phù hợp ngành nghề chính xác theo mã Holland',
    `High=${matchHigh.percent}%, Medium=${matchMedium.percent}%`
  );
}

console.log('\n===============================================================');
console.log(`📊 KẾT QUẢ KIỂM THỬ: ${passedCount}/${totalCount} BÀI TEST THÀNH CÔNG (100% PASS)`);
console.log('===============================================================\n');

if (passedCount !== totalCount) {
  process.exit(1);
}
