import React from 'react';

export default function HomePage({ onSelectPro, onSelectQuick }) {
  return (
    <div className="glass-panel" style={{ maxWidth: '900px', margin: '40px auto', padding: '60px 40px', textAlign: 'center' }}>
      <h1 style={{ fontSize: '3rem', margin: '0 0 20px 0', background: 'linear-gradient(90deg, #60a5fa, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        SmartCV Tailoring Platform
      </h1>
      <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '50px' }}>
        Generate hyper-tailored, ATS-optimized, IIT-style CVs in seconds.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        
        {/* Fast-Track Option */}
        <div 
          onClick={onSelectQuick}
          style={{
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '40px 30px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            background: 'rgba(99, 102, 241, 0.05)'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 10px 30px rgba(99, 102, 241, 0.2)';
            e.currentTarget.style.border = '1px solid var(--accent-primary)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.border = '1px solid var(--border-color)';
          }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '15px' }}>⚡</div>
          <h2 style={{ margin: '0 0 15px 0', color: 'var(--text-primary)' }}>Fast-Track CV</h2>
          <p style={{ color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5' }}>
            Instantly generate a tailored CV. Just upload your PDF and paste a job description. No account required.
          </p>
        </div>

        {/* Pro Setup Option */}
        <div 
          onClick={onSelectPro}
          style={{
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '40px 30px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            background: 'rgba(255, 255, 255, 0.02)'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 10px 30px rgba(255, 255, 255, 0.05)';
            e.currentTarget.style.border = '1px solid #94a3b8';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.border = '1px solid var(--border-color)';
          }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '15px' }}>💼</div>
          <h2 style={{ margin: '0 0 15px 0', color: 'var(--text-primary)' }}>Pro Setup</h2>
          <p style={{ color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5' }}>
            Create an account, build a reusable master profile, and easily manage multiple CV variations over time.
          </p>
        </div>

      </div>
    </div>
  );
}
