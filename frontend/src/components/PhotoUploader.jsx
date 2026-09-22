import React, { useRef } from 'react';
import { Image as ImageIcon, X } from 'lucide-react';

export const PhotoUploader = ({ selectedFile, onFileSelect, previewUrl }) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onFileSelect(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div style={{ marginTop: '10px' }}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/gif,image/webp"
        style={{ display: 'none' }}
      />

      {previewUrl ? (
        <div className="image-preview-box">
          <img src={previewUrl} alt="Selected upload" className="image-preview-img" />
          <button
            type="button"
            onClick={handleClear}
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              background: 'rgba(0,0,0,0.7)',
              color: '#fff',
              borderRadius: '50%',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Remove photo"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="btn btn-secondary btn-sm"
          style={{ gap: '6px' }}
        >
          <ImageIcon size={16} style={{ color: 'var(--color-brand-yellow)' }} />
          <span>Attach Photo</span>
        </button>
      )}
    </div>
  );
};
