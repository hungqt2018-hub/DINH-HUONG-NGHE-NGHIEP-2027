import * as XLSX from 'xlsx';
import { StudentProfile, WishItem, SchoolMajorRecord, StudentRecord } from '../types';

/**
 * Builds the workbook for 15 wishes
 */
export function buildWishesWorkbook(
  profile: StudentProfile,
  wishes: WishItem[],
  hollandCodeString: string = ''
): XLSX.WorkBook {
  // Header info rows
  const headerData = [
    ['LỚP TOÁN THẦY HÙNG - PHIẾU XẾP 15 NGUYỆN VỌNG XÉT TUYỂN 2027'],
    [`Họ và tên: ${profile.fullName || '(Chưa nhập)'}`, '', `Lớp: ${profile.className || '(Chưa nhập)'}`, '', `Mã nhóm Holland: ${hollandCodeString || 'N/A'}`],
    [`Trường THPT: ${profile.schoolName || ''}`, '', `Điểm thi thử / dự kiến: ${profile.mockExamScore || 'Chưa nhập'}`, '', `Ngày lập phiếu: ${new Date().toLocaleDateString('vi-VN')}`],
    [],
    [
      'NV',
      'Nhóm dự kiến',
      'Tên trường',
      'Mã trường',
      'Tên ngành',
      'Mã ngành',
      'Tổ hợp / Phương thức',
      'Điểm chuẩn gần nhất',
      'Điểm dự kiến',
      'Chênh lệch (+/-)',
      'Ghi chú',
    ],
  ];

  // Data rows
  const wishRows = wishes.map((w, index) => [
    w.rank || index + 1,
    w.category || '',
    w.schoolName || '',
    w.schoolCode || '',
    w.majorName || '',
    w.majorCode || '',
    w.admissionMethod ? `${w.combination || ''} (${w.admissionMethod})` : (w.combination || ''),
    w.benchmarkScore !== null ? w.benchmarkScore : 'Chưa cập nhật',
    w.expectedScore || '',
    w.benchmarkScore !== null ? (w.expectedScore - w.benchmarkScore > 0 ? `+${(w.expectedScore - w.benchmarkScore).toFixed(2)}` : (w.expectedScore - w.benchmarkScore).toFixed(2)) : '-',
    w.notes || '',
  ]);

  const footerRows = [
    [],
    ['* Lưu ý: Thông tin điểm chuẩn chỉ mang tính tham khảo. Em cần kiểm tra lại đề án tuyển sinh chính thức năm 2027 của từng trường trước khi đăng ký.'],
    [],
    ['Học sinh (Ký, ghi rõ họ tên)', '', 'Phụ huynh (Ký, ghi rõ họ tên)', '', 'Giáo viên tư vấn / GVCN (Ký, ghi rõ họ tên)'],
  ];

  const fullSheetData = [...headerData, ...wishRows, ...footerRows];
  const worksheet = XLSX.utils.aoa_to_sheet(fullSheetData);

  // Set column widths
  worksheet['!cols'] = [
    { wch: 6 },  // NV
    { wch: 14 }, // Nhóm
    { wch: 38 }, // Trường
    { wch: 10 }, // Mã trường
    { wch: 38 }, // Ngành
    { wch: 12 }, // Mã ngành
    { wch: 26 }, // Tổ hợp/PT
    { wch: 18 }, // Điểm chuẩn
    { wch: 14 }, // Điểm dự kiến
    { wch: 14 }, // Chênh lệch
    { wch: 25 }, // Ghi chú
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, '15_Nguyen_Vong');
  return workbook;
}

/**
 * Exports 15 wishes of a student to Excel (.xlsx) file download
 */
export function exportWishesToExcel(
  profile: StudentProfile,
  wishes: WishItem[],
  hollandCodeString: string = ''
) {
  const sanitizedName = profile.fullName ? profile.fullName.replace(/[^a-zA-Z0-9_\u00C0-\u1EF9]/g, '_') : 'HocSinh';
  const fileName = `${sanitizedName}_${profile.className || 'Lop12'}_15NguyenVong_2027.xlsx`;
  const workbook = buildWishesWorkbook(profile, wishes, hollandCodeString);
  XLSX.writeFile(workbook, fileName);
}

/**
 * Generates Excel Blob for Google Drive upload
 */
export function generateWishesExcelBlob(
  profile: StudentProfile,
  wishes: WishItem[],
  hollandCodeString: string = ''
): Blob {
  const workbook = buildWishesWorkbook(profile, wishes, hollandCodeString);
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  return new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}

/**
 * Teacher exports class list to Excel
 */
export function exportClassListToExcel(className: string, records: StudentRecord[]) {
  const fileName = `Danh_sach_lop_${className || 'ToanThayHung'}_HuongNghiep_2027.xlsx`;

  const rows = records.map((rec, index) => {
    return {
      STT: index + 1,
      'Họ và tên': rec.profile.fullName,
      'Ngày sinh': rec.profile.dob,
      Lớp: rec.profile.className,
      'Trường THPT': rec.profile.schoolName,
      'Số điện thoại': rec.profile.phone || '',
      'Tỉnh / Thành': rec.profile.province || '',
      'Mã Holland': rec.hollandResult?.hollandCodeString || 'Chưa làm',
      'Điểm R': rec.hollandResult?.scores.R || 0,
      'Điểm I': rec.hollandResult?.scores.I || 0,
      'Điểm A': rec.hollandResult?.scores.A || 0,
      'Điểm S': rec.hollandResult?.scores.S || 0,
      'Điểm E': rec.hollandResult?.scores.E || 0,
      'Điểm C': rec.hollandResult?.scores.C || 0,
      'Số NV đã xếp': rec.wishes?.length || 0,
      'Thái độ xét tuyển': rec.answers.q15Attitude || '',
      'Đã tư vấn': rec.isConsulted ? 'Đã tư vấn' : 'Chưa',
      'Ghi chú GV': rec.teacherNotes || '',
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh_Sach_Hoc_Sinh');

  XLSX.writeFile(workbook, fileName);
}

/**
 * Generates Class List Excel Blob for Google Drive
 */
export function generateClassListExcelBlob(className: string, records: StudentRecord[]): Blob {
  const rows = records.map((rec, index) => {
    return {
      STT: index + 1,
      'Họ và tên': rec.profile.fullName,
      'Ngày sinh': rec.profile.dob,
      Lớp: rec.profile.className,
      'Trường THPT': rec.profile.schoolName,
      'Số điện thoại': rec.profile.phone || '',
      'Tỉnh / Thành': rec.profile.province || '',
      'Mã Holland': rec.hollandResult?.hollandCodeString || 'Chưa làm',
      'Điểm R': rec.hollandResult?.scores.R || 0,
      'Điểm I': rec.hollandResult?.scores.I || 0,
      'Điểm A': rec.hollandResult?.scores.A || 0,
      'Điểm S': rec.hollandResult?.scores.S || 0,
      'Điểm E': rec.hollandResult?.scores.E || 0,
      'Điểm C': rec.hollandResult?.scores.C || 0,
      'Số NV đã xếp': rec.wishes?.length || 0,
      'Thái độ xét tuyển': rec.answers.q15Attitude || '',
      'Đã tư vấn': rec.isConsulted ? 'Đã tư vấn' : 'Chưa',
      'Ghi chú GV': rec.teacherNotes || '',
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh_Sach_Hoc_Sinh');
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  return new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}

/**
 * Export School/Major Database to Excel
 */
export function exportSchoolDatabaseToExcel(records: SchoolMajorRecord[]) {
  const worksheet = XLSX.utils.json_to_sheet(records);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'CSDL_Nganh_Truong');
  XLSX.writeFile(workbook, `CSDL_Nganh_Truong_2027.xlsx`);
}
