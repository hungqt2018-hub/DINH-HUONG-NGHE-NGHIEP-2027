import { jsPDF } from 'jspdf';
import { StudentProfile, WishItem, HollandScoreResult } from '../types';

/**
 * Removes Vietnamese diacritics for standard ascii rendering in default jsPDF fonts
 */
export function removeDiacritics(str: string): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

/**
 * Helper to build the PDF document
 */
export function buildResultPdfDoc(
  profile: StudentProfile,
  wishes: WishItem[],
  hollandResult?: HollandScoreResult
): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 14;

  // Header Banner
  doc.setFillColor(15, 61, 104); // #0f3d68
  doc.rect(0, 0, pageWidth, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('LOP TOAN THAY HUNG - DINH HUONG NGHE NGHIEP & 15 NGUYEN VONG 2027', pageWidth / 2, 10, { align: 'center' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Danh cho hoc sinh sinh nam 2009 (Lop 12) - Xet tuyen Dai hoc, Cao dang 2027', pageWidth / 2, 16, { align: 'center' });

  y = 30;
  doc.setTextColor(30, 41, 59);

  // Student Info Box
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(12, y, pageWidth - 24, 28, 2, 2, 'FD');

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`Ho va ten: ${removeDiacritics(profile.fullName || '(Chua nhap)')}`, 16, y + 7);
  doc.text(`Lop: ${removeDiacritics(profile.className || '12')}`, 110, y + 7);
  doc.text(`Ngay sinh: ${profile.dob || ''}`, 150, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.text(`Truong THPT: ${removeDiacritics(profile.schoolName || '')}`, 16, y + 14);
  doc.text(`Tinh/Thanh: ${removeDiacritics(profile.province || '')}`, 110, y + 14);
  doc.text(`Diem du kien to hop: ${profile.mockExamScore || 'Chua nhap'}/30`, 150, y + 14);

  doc.setFont('helvetica', 'bold');
  const codeStr = hollandResult ? hollandResult.hollandCodeString : 'Chua co';
  doc.text(`Ma nhom Holland: ${codeStr}`, 16, y + 21);
  if (hollandResult) {
    const s = hollandResult.scores;
    doc.setFont('helvetica', 'normal');
    doc.text(`Diem chi tiet: R:${s.R} | I:${s.I} | A:${s.A} | S:${s.S} | E:${s.E} | C:${s.C} (Tong: 30d)`, 70, y + 21);
  }

  y += 34;

  // Table Title
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 61, 104);
  doc.text('DANH SACH 15 NGUYEN VONG XET TUYEN DAI HOC / CAO DANG 2027', 12, y);

  y += 5;

  // Table Header
  const colX = [12, 20, 36, 80, 94, 138, 154, 168, 180];
  const colW = [8, 16, 44, 14, 44, 16, 14, 12, 18];

  doc.setFillColor(241, 245, 249);
  doc.rect(12, y, pageWidth - 24, 7, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.line(12, y + 7, pageWidth - 12, y + 7);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 65, 85);

  doc.text('NV', 16, y + 4.8, { align: 'center' });
  doc.text('Nhom', 28, y + 4.8, { align: 'center' });
  doc.text('Truong dai hoc / cao dang', 38, y + 4.8);
  doc.text('Ma tr.', 87, y + 4.8, { align: 'center' });
  doc.text('Nganh xet tuyen', 96, y + 4.8);
  doc.text('To hop', 146, y + 4.8, { align: 'center' });
  doc.text('D.Chuan', 161, y + 4.8, { align: 'center' });
  doc.text('D.Kien', 174, y + 4.8, { align: 'center' });
  doc.text('+/-', 188, y + 4.8, { align: 'center' });

  y += 7;

  // Render 15 rows
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);

  for (let i = 0; i < 15; i++) {
    const w = wishes[i];
    const rowY = y + i * 8.2;

    if (i % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(12, rowY, pageWidth - 24, 8.2, 'F');
    }

    doc.setDrawColor(226, 232, 240);
    doc.line(12, rowY + 8.2, pageWidth - 12, rowY + 8.2);

    if (w) {
      doc.setTextColor(15, 23, 42);
      doc.text(`${w.rank || i + 1}`, 16, rowY + 5.5, { align: 'center' });

      // Category badge
      const cat = w.category;
      if (cat === 'Chinh phục') {
        doc.setTextColor(220, 38, 38);
      } else if (cat === 'Vững') {
        doc.setTextColor(37, 99, 235);
      } else if (cat === 'An toàn') {
        doc.setTextColor(16, 185, 129);
      } else {
        doc.setTextColor(147, 51, 234);
      }
      doc.text(removeDiacritics(cat || '').substring(0, 11), 22, rowY + 5.5);

      doc.setTextColor(15, 23, 42);
      // School Name
      const sName = removeDiacritics(w.schoolName || '').substring(0, 26);
      doc.text(sName, 38, rowY + 5.5);

      // School Code
      doc.text(w.schoolCode || '', 87, rowY + 5.5, { align: 'center' });

      // Major Name
      const mName = removeDiacritics(w.majorName || '').substring(0, 24);
      doc.text(mName, 96, rowY + 5.5);

      // Combination
      const comb = (w.combination || '').split(',')[0].trim().substring(0, 8);
      doc.text(comb, 146, rowY + 5.5, { align: 'center' });

      // Benchmark
      const bench = w.benchmarkScore !== null ? `${w.benchmarkScore}` : '-';
      doc.text(bench, 161, rowY + 5.5, { align: 'center' });

      // Expected
      doc.text(`${w.expectedScore || '-'}`, 174, rowY + 5.5, { align: 'center' });

      // Delta
      if (w.benchmarkScore !== null) {
        const deltaVal = w.expectedScore - w.benchmarkScore;
        const deltaText = deltaVal > 0 ? `+${deltaVal.toFixed(1)}` : `${deltaVal.toFixed(1)}`;
        if (deltaVal >= 0) {
          doc.setTextColor(16, 185, 129);
        } else {
          doc.setTextColor(220, 38, 38);
        }
        doc.text(deltaText, 188, rowY + 5.5, { align: 'center' });
      } else {
        doc.setTextColor(100, 116, 139);
        doc.text('-', 188, rowY + 5.5, { align: 'center' });
      }
    } else {
      // Empty slot
      doc.setTextColor(148, 163, 184);
      doc.text(`${i + 1}`, 16, rowY + 5.5, { align: 'center' });
      doc.text('(Trong)', 38, rowY + 5.5);
    }
  }

  y += 15 * 8.2 + 8;

  // Notes and Guidelines
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('* Nguyen tac xep nguyen vong Lop Toan Thay Hung: NV1-NV3 (Chinh phuc) | NV4-NV8 (Vung) | NV9-NV13 (An toan) | NV14-NV15 (Bao dam).', 12, y);
  y += 4;
  doc.text('* Quy tac xet tuyen: Thi sinh chi trung tuyen 1 nguyen vong cao nhat. Can uu tien nganh va truong yeu thich nhat len tren.', 12, y);

  y += 18;

  // Signature Block
  const sigCol1 = 30;
  const sigCol2 = pageWidth / 2;
  const sigCol3 = pageWidth - 35;

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);

  doc.text('Hoc sinh', sigCol1, y, { align: 'center' });
  doc.text('Phu huynh', sigCol2, y, { align: 'center' });
  doc.text('Giao vien tu van / GVCN', sigCol3, y, { align: 'center' });

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100, 116, 139);
  doc.text('(Ky, ghi ro ho ten)', sigCol1, y + 4, { align: 'center' });
  doc.text('(Ky, ghi ro ho ten)', sigCol2, y + 4, { align: 'center' });
  doc.text('(Ky, ghi ro ho ten)', sigCol3, y + 4, { align: 'center' });

  return doc;
}

export function exportResultToPDF(
  profile: StudentProfile,
  wishes: WishItem[],
  hollandResult?: HollandScoreResult
) {
  const doc = buildResultPdfDoc(profile, wishes, hollandResult);
  const sanitizedName = profile.fullName ? removeDiacritics(profile.fullName).replace(/\s+/g, '_') : 'HocSinh';
  doc.save(`${sanitizedName}_15NguyenVong_2027.pdf`);
}

export function generateResultPDFBlob(
  profile: StudentProfile,
  wishes: WishItem[],
  hollandResult?: HollandScoreResult
): Blob {
  const doc = buildResultPdfDoc(profile, wishes, hollandResult);
  return doc.output('blob');
}
