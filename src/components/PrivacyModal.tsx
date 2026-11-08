import React from 'react';
import { ShieldCheck, X } from 'lucide-react';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept?: () => void;
  accepted?: boolean;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({
  isOpen,
  onClose,
  onAccept,
  accepted,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center text-teal-600 dark:text-teal-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Chính sách Quyền riêng tư & Bảo mật</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Lớp Toán Thầy Hùng • Tuyển sinh 2027</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-3.5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-100 dark:border-blue-900/50 text-blue-900 dark:text-blue-200 text-xs">
            <strong>Cam kết bảo mật:</strong> Ứng dụng được thiết kế phục vụ chuyên biệt cho hoạt động định hướng nghề nghiệp và sắp xếp 15 nguyện vọng cho học sinh 2009. Chúng tôi tôn trọng tuyệt đối quyền riêng tư của học sinh và phụ huynh.
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-1">1. Dữ liệu thu thập</h4>
            <p className="text-xs">
              - Chỉ thu thập thông tin cơ bản: Họ tên, năm sinh (2009), lớp, trường THPT, điểm học tập và câu trả lời trắc nghiệm.<br />
              - <strong>Tuyệt đối KHÔNG</strong> thu thập số Căn cước công dân (CCCD), tài khoản ngân hàng, mật khẩu cá nhân hay địa chỉ nhà ở.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-1">2. Mục đích sử dụng</h4>
            <p className="text-xs">
              - Phân tích xu hướng tính cách nghề nghiệp theo mô hình John Holland.<br />
              - Tính toán độ lệch điểm và sắp xếp 15 nguyện vọng đại học, cao đẳng tối ưu.<br />
              - Cung cấp dữ liệu để Trợ lý AI và Thầy Hùng tư vấn cụ thể cho từng em.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-1">3. Quyền hạn của học sinh & phụ huynh</h4>
            <p className="text-xs">
              - Học sinh có quyền xem, chỉnh sửa thông tin bất cứ lúc nào.<br />
              - Bạn có toàn quyền sử dụng nút <strong>"Xóa toàn bộ dữ liệu của tôi"</strong> trong phần cài đặt để xóa sạch mọi thông tin khỏi hệ thống ngay lập tức.
            </p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-3">
          {onAccept && !accepted && (
            <button
              onClick={() => {
                onAccept();
                onClose();
              }}
              className="flex-1 rounded-xl bg-teal-600 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 transition"
            >
              Tôi đồng ý & Tiếp tục
            </button>
          )}
          <button
            onClick={onClose}
            className={`rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition ${
              !onAccept || accepted ? 'w-full' : ''
            }`}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
