import { useState, useRef } from 'react';
import { UploadCloud, File, Loader2 } from 'lucide-react';
import axios from 'axios';

export default function ReceiptUploader({ onExtractComplete }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileInput = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  const processFile = async (file) => {
    if (!file.type.startsWith('image/')) {
      setError('Mohon unggah file berupa gambar (JPG, PNG).');
      return;
    }

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:8000/api/v1/receipts/process', formData);
      onExtractComplete(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Gagal memproses gambar');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="glass-panel uploader-container" 
         onDragOver={handleDragOver}
         onDragLeave={handleDragLeave}
         onDrop={handleDrop}
         onClick={() => fileInputRef.current?.click()}
         style={{ borderColor: isDragging ? 'var(--primary)' : 'var(--border-color)' }}>
      
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileInput} 
        accept="image/*" 
        style={{ display: 'none' }} 
      />

      {isUploading ? (
        <>
          <Loader2 className="icon-large spinner" size={48} />
          <h3>Mengekstrak Data...</h3>
          <p>AI sedang membaca nota dan mencocokkan dengan produk Anda.</p>
        </>
      ) : (
        <>
          <UploadCloud className="icon-large" size={48} />
          <h3>Unggah Nota / Struk</h3>
          <p>Tarik & lepas file gambar di sini, atau klik untuk memilih file</p>
        </>
      )}

      {error && <p style={{ color: 'var(--danger)' }}>{error}</p>}
    </div>
  );
}
