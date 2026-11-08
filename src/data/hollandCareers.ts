import { HollandCode } from '../types';

export interface HollandGroupInfo {
  code: HollandCode;
  vietnameseName: string;
  englishName: string;
  summary: string;
  traits: string[];
  strengths: string[];
  typicalCareers: string[];
  suggestedMajors: string[];
  recommendedCombinations: string[];
  exampleSchools: string[];
  color: string;
  badgeBg: string;
}

export const HOLLAND_GROUPS: Record<HollandCode, HollandGroupInfo> = {
  R: {
    code: 'R',
    vietnameseName: 'Kĩ thuật – Thực hành (Realistic)',
    englishName: 'Realistic',
    summary: 'Thích làm việc với đồ vật, máy móc, công cụ, cây cối, con vật hoặc các hoạt động ngoài trời. Thích hành động thực tế hơn lý thuyết trừu tượng.',
    traits: ['Khéo tay, thực tế, kiên nhẫn', 'Thích sản phẩm hữu hình', 'Thích vận động, làm việc cụ thể', 'Thẳng thắn, giản dị'],
    strengths: ['Khả năng cơ khí, điện - điện tử', 'Tư duy không gian và vận hành kỹ thuật', 'Sức bền, sự dẻo dai và tính độc lập'],
    typicalCareers: ['Kỹ sư cơ khí/ô tô/chế tạo máy', 'Kỹ sư xây dựng/giao thông', 'Kỹ sư điện - điện tử', 'Kỹ sư nông lâm nghiệp công nghệ cao', 'Huấn luyện viên thể thao'],
    suggestedMajors: [
      'Kỹ thuật Cơ khí / Cơ điện tử',
      'Công nghệ Kỹ thuật Ô tô',
      'Kỹ thuật Xây dựng / Giao thông',
      'Kỹ thuật Điện – Điện tử',
      'Công nghệ Thực phẩm',
      'Nông học / Lâm nghiệp / Thủy sản',
      'Giáo dục Thể chất',
    ],
    recommendedCombinations: ['A00 (Toán, Lí, Hóa)', 'A01 (Toán, Lí, Anh)', 'B00 (Toán, Hóa, Sinh)'],
    exampleSchools: ['ĐH Bách khoa Hà Nội', 'ĐH Bách khoa – ĐH Đà Nẵng', 'ĐH Nông Lâm – ĐH Huế', 'ĐH Sư phạm Kỹ thuật TP.HCM', 'ĐH Giao thông vận tải'],
    color: '#0284c7', // Sky blue
    badgeBg: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800',
  },
  I: {
    code: 'I',
    vietnameseName: 'Nghiên cứu – Phân tích (Investigative)',
    englishName: 'Investigative',
    summary: 'Thích quan sát, tìm hiểu, phân tích, đánh giá và giải quyết vấn đề bằng trí tuệ, khoa học và tư duy logic sâu sắc.',
    traits: ['Tò mò khoa học, ham học hỏi', 'Tư duy logic, chặt chẽ', 'Thích đào sâu bản chất vấn đề', 'Độc lập, hướng nội, cẩn trọng'],
    strengths: ['Nghiên cứu học thuật, lập trình giải thuật', 'Phân tích số liệu, mô hình hóa', 'Khả năng tập trung cao độ'],
    typicalCareers: ['Nhà khoa học, nhà nghiên cứu', 'Bác sĩ y khoa, dược sĩ', 'Kỹ sư phần mềm / Trí tuệ nhân tạo (AI)', 'Chuyên gia khoa học dữ liệu', 'Chuyên gia công nghệ sinh học'],
    suggestedMajors: [
      'Công nghệ Thông tin / Khoa học Máy tính',
      'Trí tuệ Nhân tạo & Khoa học Dữ liệu',
      'Y khoa / Răng - Hàm - Mặt',
      'Dược học',
      'Công nghệ Sinh học',
      'Khoa học Môi trường / Vật lí / Hóa học',
    ],
    recommendedCombinations: ['A00 (Toán, Lí, Hóa)', 'A01 (Toán, Lí, Anh)', 'B00 (Toán, Hóa, Sinh)', 'D07 (Toán, Hóa, Anh)'],
    exampleSchools: ['ĐH Y – Dược, ĐH Huế', 'ĐH Khoa học – ĐH Huế', 'ĐH Bách khoa Hà Nội', 'ĐH Công nghệ – ĐHQG Hà Nội', 'ĐH Công nghệ Thông tin & Truyền thông Việt – Hàn (VKU)', 'ĐH FPT'],
    color: '#0d9488', // Teal
    badgeBg: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950 dark:text-teal-300 dark:border-teal-800',
  },
  A: {
    code: 'A',
    vietnameseName: 'Nghệ thuật – Sáng tạo (Artistic)',
    englishName: 'Artistic',
    summary: 'Có trí tưởng tượng phong phú, trực giác nhạy bén, thích thể hiện bản thân qua các hình thức nghệ thuật, thiết kế, ngôn ngữ và truyền thông.',
    traits: ['Giàu cảm xúc, thẩm mĩ cao', 'Thích tự do, không gò bó khuôn mẫu', 'Độc đáo, sáng tạo không giới hạn', 'Nhạy cảm và biểu cảm tốt'],
    strengths: ['Sáng tạo nội dung, thiết kế thị giác', 'Cảm thụ âm nhạc, hội họa, kiến trúc', 'Sử dụng ngôn từ giàu hình ảnh, giao tiếp đa văn hóa'],
    typicalCareers: ['Kiến trúc sư, nhà thiết kế nội thất', 'Nhà thiết kế đồ họa / Multimedia', 'Nhà báo, biên tập viên, đạo diễn', 'Biên - phiên dịch viên, chuyên gia ngôn ngữ', 'Chuyên viên quan hệ công chúng (PR)'],
    suggestedMajors: [
      'Kiến trúc / Quy hoạch Đô thị',
      'Thiết kế Đồ họa / Đa phương tiện',
      'Báo chí / Truyền thông Đa phương tiện',
      'Ngôn ngữ Anh / Nhật / Hàn / Trung',
      'Mĩ thuật Ứng dụng / Hội họa',
      'Du lịch Văn hóa / Việt Nam học',
    ],
    recommendedCombinations: ['D01 (Toán, Văn, Anh)', 'C00 (Văn, Sử, Địa)', 'V00/V01 (Toán, Lí/Văn, Vẽ)', 'H00 (Văn, Vẽ 1, Vẽ 2)'],
    exampleSchools: ['ĐH Nghệ thuật – ĐH Huế', 'ĐH Ngoại ngữ – ĐH Huế', 'ĐH Khoa học – ĐH Huế (Báo chí)', 'ĐH Kiến trúc Đà Nẵng / Hà Nội / TP.HCM', 'Học viện Báo chí & Tuyên truyền'],
    color: '#8b5cf6', // Purple
    badgeBg: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800',
  },
  S: {
    code: 'S',
    vietnameseName: 'Xã hội – Giúp đỡ (Social)',
    englishName: 'Social',
    summary: 'Thích giúp đỡ, đào tạo, chữa lành, chia sẻ và tương tác với con người. Luôn quan tâm đến sự phát triển và hạnh phúc của cộng đồng.',
    traits: ['Thấu hiểu, vị tha, biết lắng nghe', 'Nhiệt tình, hòa đồng, thân thiện', 'Kiên nhẫn và tận tụy', 'Trách nhiệm xã hội cao'],
    strengths: ['Kỹ năng giao tiếp và truyền đạt', 'Giải quyết mâu thuẫn, gắn kết tập thể', 'Chăm sóc sức khỏe, tư vấn tâm lý'],
    typicalCareers: ['Giáo viên mầm non/tiểu học/trung học', 'Điều dưỡng, kỹ thuật viên y tế', 'Chuyên viên tư vấn tâm lí', 'Nhân viên công tác xã hội', 'Chuyên viên nhân sự (HR)'],
    suggestedMajors: [
      'Sư phạm Toán / Lí / Văn / Anh / Tin...',
      'Giáo dục Tiểu học / Giáo dục Mầm non',
      'Điều dưỡng / Y tế Công cộng',
      'Tâm lí học / Tâm lí Giáo dục',
      'Công tác Xã hội / Giáo dục Đặc biệt',
    ],
    recommendedCombinations: ['C00 (Văn, Sử, Địa)', 'D01 (Toán, Văn, Anh)', 'B00 (Toán, Hóa, Sinh)', 'C19/C20 (Văn, Sử/Địa, GDKT&PL)'],
    exampleSchools: ['ĐH Sư phạm – ĐH Huế', 'ĐH Sư phạm – ĐH Đà Nẵng', 'ĐH Y – Dược, ĐH Huế', 'ĐH Sư phạm Hà Nội', 'ĐH Sư phạm TP.HCM', 'ĐH Giáo dục – ĐHQG Hà Nội'],
    color: '#10b981', // Emerald
    badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
  },
  E: {
    code: 'E',
    vietnameseName: 'Quản lí – Kinh doanh (Enterprising)',
    englishName: 'Enterprising',
    summary: 'Tự tin, quyết đoán, có năng khiếu lãnh đạo, thích thuyết phục người khác, đàm phán kinh doanh và hướng đến các mục tiêu lớn về thành tựu và vị thế.',
    traits: ['Quyết đoán, dám nghĩ dám làm', 'Năng động, có sức thuyết phục', 'Nhạy bén với cơ hội thị trường', 'Thích vai trò dẫn dắt, làm chủ'],
    strengths: ['Lãnh đạo đội ngũ, tổ chức sự kiện', 'Kỹ năng thương lượng, đàm phán', 'Tư duy chiến lược, quản trị rủi ro'],
    typicalCareers: ['Giám đốc điều hành (CEO), doanh nhân', 'Chuyên gia Marketing / Truyền thông thương hiệu', 'Luật sư doanh nghiệp / Cố vấn pháp lý', 'Nhà quản trị du lịch – khách sạn', 'Chuyên gia Logistics & Chuỗi cung ứng'],
    suggestedMajors: [
      'Quản trị Kinh doanh / Kinh doanh Quốc tế',
      'Marketing / Thương mại Điện tử',
      'Luật Kinh tế / Luật Quốc tế',
      'Logistics & Quản lý Chuỗi cung ứng',
      'Quản trị Dịch vụ Du lịch & Lữ hành',
      'Kinh tế Quốc tế / Ngoại thương',
    ],
    recommendedCombinations: ['A00 (Toán, Lí, Hóa)', 'A01 (Toán, Lí, Anh)', 'D01 (Toán, Văn, Anh)', 'D07 (Toán, Hóa, Anh)'],
    exampleSchools: ['ĐH Kinh tế – ĐH Huế', 'Khoa Luật / Khoa Du lịch – ĐH Huế', 'ĐH Kinh tế – ĐH Đà Nẵng', 'ĐH Ngoại thương', 'ĐH Kinh tế Quốc dân', 'ĐH Luật TP.HCM'],
    color: '#ea580c', // Orange
    badgeBg: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800',
  },
  C: {
    code: 'C',
    vietnameseName: 'Nghiệp vụ – Hành chính (Conventional)',
    englishName: 'Conventional',
    summary: 'Cẩn thận, chính xác, ngăn nắp, thích làm việc với các quy trình rõ ràng, hệ thống dữ liệu, bảng tính và hồ sơ chứng từ.',
    traits: ['Ngăn nắp, tỉ mỉ, kiên định', 'Đúng giờ, tuân thủ nguyên tắc', 'Coi trọng tính ổn định, bảo đảm', 'Đáng tin cậy trong quản lý dữ liệu'],
    strengths: ['Xử lý số liệu, bảng biểu, sổ sách kế toán', 'Xây dựng quy trình làm việc chuẩn hóa', 'Kiểm soát chất lượng và rà soát lỗi'],
    typicalCareers: ['Kế toán viên, kiểm toán viên', 'Chuyên viên ngân hàng, thẩm định tín dụng', 'Chuyên viên hệ thống thông tin quản lý', 'Chuyên viên phân tích tài chính', 'Quản trị văn phòng / Văn thư lưu trữ'],
    suggestedMajors: [
      'Kế toán / Kiểm toán',
      'Tài chính – Ngân hàng',
      'Hệ thống Thông tin Quản lý (MIS)',
      'Thống kê Kinh tế / Phân tích Dữ liệu Kinh doanh',
      'Quản trị Văn phòng / Quản lý Thông tin',
      'Bảo hiểm / Định phí Tài chính (Actuary)',
    ],
    recommendedCombinations: ['A00 (Toán, Lí, Hóa)', 'A01 (Toán, Lí, Anh)', 'D01 (Toán, Văn, Anh)', 'D07 (Toán, Hóa, Anh)'],
    exampleSchools: ['ĐH Kinh tế – ĐH Huế', 'ĐH Kinh tế – ĐH Đà Nẵng', 'Học viện Ngân hàng', 'Học viện Tài chính', 'ĐH Kinh tế TP.HCM (UEH)', 'ĐH Tài chính – Marketing'],
    color: '#4f46e5', // Indigo
    badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800',
  },
};
