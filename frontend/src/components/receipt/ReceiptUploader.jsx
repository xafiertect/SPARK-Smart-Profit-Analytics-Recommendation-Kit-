import { useState, useRef } from 'react';
import { Camera, Upload, X, Image } from 'lucide-react';
import Button from '../ui/Button';
import './ReceiptUploader.css';

export default function ReceiptUploader({ onScan, isScanning }) {
  const [preview, setPreview] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileRef = useRef(null);

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleChange = (e) => {
    handleFile(e.target.files[0]);
  };

  const clearPreview = () => {
    setPreview(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  if (isScanning) {
    return (
      <div className="receipt-uploader__scanning">
        <div className="receipt-uploader__scanner" />
        <p className="receipt-uploader__scanning-text">
          AI sedang membaca nota kamu...<br />
          Tunggu sebentar ya
        </p>
      </div>
    );
  }

  return (
    <div className="receipt-uploader">
      {!preview ? (
        <>
          <div
            className={`receipt-uploader__dropzone ${isDragOver ? 'receipt-uploader__dropzone--active' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            id="receipt-dropzone"
          >
            <div className="receipt-uploader__icon">
              <Image size={28} />
            </div>
            <div className="receipt-uploader__text">
              <h3>Upload Foto Nota</h3>
              <p>Seret foto ke sini atau klik untuk pilih file</p>
            </div>
          </div>

          <Button
            variant="cta"
            fullWidth
            onClick={() => fileRef.current?.click()}
            id="btn-scan-receipt"
          >
            <Camera size={22} />
            Scan Nota
          </Button>

          <div className="receipt-uploader__hint">
            <span>📸 Gunakan pencahayaan yang baik</span>
            <span>📄 Pastikan nota rata dan tidak terlipat</span>
            <span>🖼️ Masukkan seluruh nota dalam frame</span>
          </div>
        </>
      ) : (
        <>
          <div className="receipt-uploader__preview">
            <img src={preview} alt="Preview nota" />
            <button className="receipt-uploader__preview-remove" onClick={clearPreview} aria-label="Hapus foto">
              <X size={16} />
            </button>
          </div>

          <Button
            variant="cta"
            fullWidth
            onClick={() => onScan?.(preview)}
            id="btn-process-receipt"
          >
            <Upload size={20} />
            Proses Nota Ini
          </Button>
          <Button variant="ghost" fullWidth onClick={clearPreview}>
            Ganti Foto
          </Button>
        </>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleChange}
        style={{ display: 'none' }}
        id="receipt-file-input"
      />
    </div>
  );
}
