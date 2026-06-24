import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content max-w-sm" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-surface-100 mb-2">ยืนยันการดำเนินการ</h3>
          <p className="text-sm text-surface-400 mb-6">{message}</p>
          <div className="flex gap-3 justify-center">
            <button onClick={onCancel} className="btn-secondary">
              ยกเลิก
            </button>
            <button onClick={onConfirm} className="bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 px-6 rounded-xl transition-all duration-300 active:scale-[0.97]">
              ยืนยันลบ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
