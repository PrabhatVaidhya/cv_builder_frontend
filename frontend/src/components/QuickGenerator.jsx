import React, { useState, useRef } from 'react';

export default function QuickGenerator({ onBack }) {
  const [loading, setLoading] = useState(false);
  const [pdfFile, setPdfFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [rawSummary, setRawSummary] = useState('');
  const fileInputRef = useRef(null);

  const apiEndpoint = import.meta.env.VITE_API_URL || 'https://cv-builder-frontend-1v0e.onrender.com';

  const handleGenerate = async () => {
    if (!jobDescription.trim()) {
      alert('Job Description is required!');
      return;
    }

    if (!pdfFile && !rawSummary.trim()) {
      alert('Please either upload a PDF resume or paste a text summary.');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('jobDescription', jobDescription);
      if (pdfFile) {
        formData.append('resume', pdfFile);
      } else {
        formData.append('rawSummary', rawSummary);
      }

      const response = await fetch(`${apiEndpoint}/api/profile/quick-generate`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (data.success) {
        // Download the PDF
        const pdfResponse = await fetch(`${apiEndpoint}/api/profile/generate-pdf`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data.data) // Sending the tailored CV data to convert to PDF
        });
        
        if (pdfResponse.ok) {
          const blob = await pdfResponse.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `FastTrack_CV.pdf`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          window.URL.revokeObjectURL(url);
          alert('CV generated and downloaded successfully!');
        } else {
          alert('Failed to compile PDF.');
        }
      } else {
        alert('Error: ' + data.message);
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred during generation.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '15px',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
    background: 'rgba(15, 23, 42, 0.4)',
    color: 'var(--text-primary)',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    marginBottom: '20px'
  };

  return (
    <div className="glass-panel" style={{ maxWidth: '800px', margin: '40px auto', padding: '40px', textAlign: 'left' }}>
      <button 
        onClick={onBack}
        style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', marginBottom: '20px', padding: 0 }}
      >
        ← Back to Home
      </button>

      <h2 style={{ margin: '0 0 10px 0', color: 'var(--accent-primary)' }}>⚡ Fast-Track Generator</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>
        Skip the profile setup. Upload your info and paste a job description for an instant CV.
      </p>

      <div style={{ marginBottom: '40px' }}>
        <h3 style={{ marginBottom: '15px' }}>Step 1: Your Information</h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Either upload an existing PDF resume OR paste a text summary.</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '15px' }}>
          <div 
            onClick={() => fileInputRef.current.click()}
            style={{ 
              border: '2px dashed var(--accent-primary)', 
              borderRadius: '12px', 
              padding: '20px', 
              textAlign: 'center', 
              cursor: 'pointer',
              background: pdfFile ? 'rgba(99, 102, 241, 0.1)' : 'transparent'
            }}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={(e) => setPdfFile(e.target.files[0])} 
              accept=".pdf" 
              style={{ display: 'none' }} 
            />
            {pdfFile ? (
              <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>📄 {pdfFile.name} (Uploaded)</span>
            ) : (
              <span style={{ color: 'var(--text-primary)' }}>📄 Click to Upload PDF</span>
            )}
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
            <span style={{ padding: '10px' }}>— OR —</span>
          </div>
        </div>

        {!pdfFile && (
          <textarea 
            style={{...inputStyle, height: '120px'}} 
            placeholder="Paste your details here (experience, skills, projects, etc.)"
            value={rawSummary}
            onChange={(e) => setRawSummary(e.target.value)}
          />
        )}
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ marginBottom: '15px' }}>Step 2: Job Description</h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Paste the description of the job you are applying for.</p>
        <textarea 
          style={{...inputStyle, height: '150px'}} 
          placeholder="Paste Job Description here..."
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
        />
      </div>

      <button 
        onClick={handleGenerate}
        disabled={loading}
        style={{ 
          width: '100%', 
          padding: '15px', 
          background: 'var(--accent-primary)', 
          border: 'none', 
          borderRadius: '8px', 
          color: 'white', 
          fontWeight: 'bold', 
          fontSize: '1.1rem',
          cursor: loading ? 'wait' : 'pointer',
          opacity: loading ? 0.7 : 1
        }}
      >
        {loading ? '⚡ Generating CV (This takes ~30 seconds)...' : '✨ Generate Tailored CV Now'}
      </button>
    </div>
  );
}
