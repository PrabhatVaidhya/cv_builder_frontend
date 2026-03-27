import React, { useState, useEffect } from 'react';

export default function CVGenerator({ userEmail }) {
  const [jobDescription, setJobDescription] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [positionTitle, setPositionTitle] = useState('');
  const [generatedCVs, setGeneratedCVs] = useState([]);
  const [currentCV, setCurrentCV] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiEndpoint = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchGeneratedCVs();
  }, [userEmail]);

  const fetchGeneratedCVs = async () => {
    try {
      setError(null);
      const response = await fetch(`${apiEndpoint}/api/auth/cvs/${userEmail}`);
      const data = await response.json();
      if (data.success) {
        setGeneratedCVs(data.data || []);
      } else {
        console.error('Failed to fetch CVs:', data.message);
      }
    } catch (err) {
      console.error('Fetch CVs error:', err);
      setError('Failed to load your CVs. Please refresh the page.');
    }
  };

  const generateCV = async () => {
    if (!jobDescription.trim()) {
      alert('Please enter a job description');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('${apiEndpoint}/api/auth/generate-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          jobDescription,
          companyName,
          positionTitle
        })
      });

      const data = await response.json();
      if (data.success) {
        setCurrentCV(data.data);
        fetchGeneratedCVs(); // Refresh the list
        alert('CV generated successfully!');
      } else {
        alert('Error: ' + data.message);
      }
    } catch (err) {
      console.error('Generate CV error:', err);
      alert('Failed to generate CV');
    } finally {
      setLoading(false);
    }
  };

  const downloadCV = async (cvId) => {
    try {
      const response = await fetch('${apiEndpoint}/api/auth/download-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cvId })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `CV_${positionTitle || 'Generated'}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Failed to download CV');
      }
    } catch (err) {
      console.error('Download error:', err);
      alert('Failed to download CV');
    }
  };

  const viewCV = async (cvId) => {
    console.log('View CV clicked, cvId:', cvId);
    try {
      const response = await fetch(`${apiEndpoint}/api/auth/cv/${cvId}`);
      console.log('View CV response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('View CV error response:', errorText);
        alert('Failed to load CV: Server error');
        return;
      }
      
      const data = await response.json();
      console.log('View CV data:', data);
      
      if (data.success) {
        const similarityScore = typeof data.data.similarityScore === 'number' 
          ? data.data.similarityScore 
          : (data.data.similarityScore?.percentage || data.data.similarityScore || 0);
        
        console.log('Setting currentCV with similarity:', similarityScore);
        setCurrentCV({
          cvId: cvId,
          tailoredCV: data.data.tailoredContent,
          similarityScore: similarityScore
        });
        setJobDescription(data.data.jobDescription || '');
        setCompanyName(data.data.companyName || '');
        setPositionTitle(data.data.positionTitle || '');
        
        console.log('CV loaded successfully, similarity:', similarityScore);
        
        // Scroll to preview section
        setTimeout(() => {
          const preview = document.getElementById('cv-preview');
          if (preview) {
            preview.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      } else {
        alert('Error: ' + (data.message || 'Unknown error'));
      }
    } catch (err) {
      console.error('View CV error:', err);
      alert('Failed to load CV: ' + err.message);
      setError('Failed to load CV: ' + err.message);
    }
  };

  const clearForm = () => {
    setJobDescription('');
    setCompanyName('');
    setPositionTitle('');
    setCurrentCV(null);
  };

  const deleteCV = async (cvId) => {
    if (!window.confirm('Are you sure you want to delete this CV?')) {
      return;
    }

    try {
      const response = await fetch(`${apiEndpoint}/api/auth/cv/${cvId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Delete CV error response:', errorText);
        alert('Failed to delete CV: Server error');
        return;
      }

      const data = await response.json();
      console.log('Delete CV response:', data);
      
      if (data.success) {
        alert('CV deleted successfully!');
        fetchGeneratedCVs(); // Refresh the list
        // Clear current CV if it's the one being deleted
        if (currentCV && currentCV.cvId === cvId) {
          setCurrentCV(null);
          setJobDescription('');
          setCompanyName('');
          setPositionTitle('');
        }
      } else {
        alert('Error: ' + (data.message || 'Unknown error'));
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete CV: ' + err.message);
    }
  };

  const loadDemoJob = () => {
    setCompanyName('Google');
    setPositionTitle('Software Engineer Intern');
    setJobDescription(`Software Engineer Intern - Google Cloud Platform
Location: Bangalore, India
Duration: May 2025 - July 2025

About the Role:
Join Google Cloud Platform team to work on cutting-edge distributed systems and cloud infrastructure. You'll collaborate with experienced engineers to build scalable microservices that power Google's cloud offerings.

Responsibilities:
- Design and implement microservices using Go, Python, or Java
- Work with Kubernetes and Docker for containerization and orchestration
- Optimize API performance and reduce latency in distributed systems
- Collaborate with cross-functional teams on cloud infrastructure projects
- Write clean, maintainable code following Google's engineering standards
- Participate in code reviews and contribute to technical documentation

Required Qualifications:
- Currently pursuing B.Tech/M.Tech in Computer Science or related field
- Strong foundation in data structures, algorithms, and system design
- Proficiency in at least one programming language (Go, Python, Java, C++)
- Understanding of RESTful APIs and microservices architecture
- Experience with version control systems (Git)

Preferred Qualifications:
- Experience with cloud platforms (GCP, AWS, or Azure)
- Knowledge of containerization technologies (Docker, Kubernetes)
- Familiarity with databases (SQL and NoSQL)
- Previous internship experience in software development
- Open source contributions or personal projects demonstrating technical skills
- Strong problem-solving abilities and competitive programming experience

Technologies:
Go, Kubernetes, Docker, gRPC, Google Cloud Platform, Microservices, Distributed Systems, REST APIs, Git, Linux`);
  };

  if (error) {
    return (
      <div style={{ padding: '20px', backgroundColor: '#f8d7da', border: '1px solid #f5c6cb', borderRadius: '4px' }}>
        <h3 style={{ color: '#721c24' }}>Error</h3>
        <p style={{ color: '#721c24' }}>{error}</p>
        <button onClick={() => setError(null)} style={{ padding: '8px 16px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Dismiss
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <h2>Generate Tailored CV</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        <div>
          <h3>New Job Application</h3>
          <input
            type="text"
            placeholder="Company Name (optional)"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
          />
          <input
            type="text"
            placeholder="Position Title (optional)"
            value={positionTitle}
            onChange={(e) => setPositionTitle(e.target.value)}
            style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
          />
          <textarea
            placeholder="Paste the job description here..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={12}
            style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '4px', fontFamily: 'inherit' }}
          />
          <div style={{ marginBottom: '10px' }}>
            <button
              onClick={loadDemoJob}
              style={{
                width: '100%',
                padding: '8px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              📋 Load Demo Job Description
            </button>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={generateCV}
              disabled={loading}
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: loading ? '#ccc' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: 'bold'
              }}
            >
              {loading ? 'Generating...' : 'Generate CV'}
            </button>
            <button
              onClick={clearForm}
              style={{
                padding: '12px 20px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Clear
            </button>
          </div>

          {currentCV && currentCV.similarityScore !== undefined && (
            <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#d4edda', border: '2px solid #28a745', borderRadius: '8px' }}>
              <h3 style={{ margin: '0 0 15px 0', color: '#155724' }}>✅ CV Generated Successfully!</h3>
              <h4 style={{ margin: '0 0 15px 0', color: '#155724', fontSize: '18px' }}>Similarity Score: {currentCV.similarityScore}%</h4>
              <button
                onClick={() => downloadCV(currentCV.cvId)}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
              >
                📥 Download PDF
              </button>
            </div>
          )}
        </div>

        <div>
          <h3>Previously Generated CVs</h3>
          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
            {generatedCVs.length === 0 ? (
              <p style={{ color: '#666' }}>No CVs generated yet. Create your first one!</p>
            ) : (
              generatedCVs.map((cv) => (
                <div
                  key={cv._id || cv.id}
                  style={{
                    padding: '15px',
                    marginBottom: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    backgroundColor: '#f8f9fa'
                  }}
                >
                  <h4 style={{ margin: '0 0 5px 0' }}>
                    {cv.positionTitle || 'Untitled Position'}
                    {cv.companyName && ` at ${cv.companyName}`}
                  </h4>
                  <p style={{ fontSize: '12px', color: '#666', margin: '5px 0' }}>
                    Created: {new Date(cv.createdAt).toLocaleDateString()}
                  </p>
                  <p style={{ fontSize: '14px', margin: '5px 0' }}>
                    Similarity: {cv.similarityScore}%
                  </p>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button
                      onClick={() => viewCV(cv._id || cv.id)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      View
                    </button>
                    <button
                      onClick={() => downloadCV(cv._id || cv.id)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Download
                    </button>
                    <button
                      onClick={() => deleteCV(cv._id || cv.id)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {currentCV && currentCV.tailoredCV && (
        <div 
          id="cv-preview"
          style={{ 
            marginTop: '30px', 
            padding: '40px', 
            border: '3px solid #007bff', 
            borderRadius: '8px', 
            backgroundColor: '#ffffff',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            maxWidth: '900px',
            margin: '30px auto'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, color: '#007bff' }}>📄 CV Preview</h3>
            <button
              onClick={() => setCurrentCV(null)}
              style={{
                padding: '8px 16px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Close Preview
            </button>
          </div>
          <div style={{ 
            backgroundColor: '#ffffff', 
            padding: '40px',
            border: '1px solid #dee2e6',
            fontFamily: 'Arial, sans-serif',
            lineHeight: '1.6',
            color: '#000'
          }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '20px', borderBottom: '2px solid #000', paddingBottom: '10px' }}>
              <h1 style={{ fontSize: '24px', margin: '0 0 5px 0', textTransform: 'uppercase', letterSpacing: '1px' }}>
                {currentCV.tailoredCV.personalInfo?.fullName || 'Your Name'}
              </h1>
              <div style={{ fontSize: '10px', color: '#333' }}>
                {currentCV.tailoredCV.personalInfo?.email && <span>{currentCV.tailoredCV.personalInfo.email}</span>}
                {currentCV.tailoredCV.personalInfo?.phone && <span> • {currentCV.tailoredCV.personalInfo.phone}</span>}
                {currentCV.tailoredCV.personalInfo?.linkedin && <span> • {currentCV.tailoredCV.personalInfo.linkedin}</span>}
              </div>
            </div>

            {/* Summary */}
            {currentCV.tailoredCV.summary && (
              <div style={{ marginBottom: '15px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 'bold', margin: '0 0 8px 0', textTransform: 'uppercase', borderBottom: '1px solid #000' }}>Summary</h3>
                <p style={{ fontSize: '11px', margin: 0, textAlign: 'justify' }}>{currentCV.tailoredCV.summary}</p>
              </div>
            )}

            {/* Education */}
            {currentCV.tailoredCV.education && currentCV.tailoredCV.education.length > 0 && (
              <div style={{ marginBottom: '15px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 'bold', margin: '0 0 8px 0', textTransform: 'uppercase', borderBottom: '1px solid #000' }}>Education</h3>
                {currentCV.tailoredCV.education.map((edu, idx) => (
                  <div key={idx} style={{ marginBottom: '10px', fontSize: '11px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <strong>{edu.degree} in {edu.field}</strong>
                      <span style={{ fontStyle: 'italic', fontSize: '10px' }}>{edu.startDate} - {edu.endDate}</span>
                    </div>
                    <div style={{ fontStyle: 'italic' }}>{edu.institution}</div>
                    {edu.gpa && <div>GPA: {edu.gpa}</div>}
                  </div>
                ))}
              </div>
            )}

            {/* Experience */}
            {currentCV.tailoredCV.experience && currentCV.tailoredCV.experience.length > 0 && (
              <div style={{ marginBottom: '15px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 'bold', margin: '0 0 8px 0', textTransform: 'uppercase', borderBottom: '1px solid #000' }}>Experience</h3>
                {currentCV.tailoredCV.experience.map((exp, idx) => (
                  <div key={idx} style={{ marginBottom: '10px', fontSize: '11px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <strong>{exp.position}</strong>
                      <span style={{ fontStyle: 'italic', fontSize: '10px' }}>{exp.startDate} - {exp.endDate}</span>
                    </div>
                    <div style={{ fontStyle: 'italic' }}>{exp.company}, {exp.location}</div>
                    {exp.achievements && exp.achievements.length > 0 && (
                      <ul style={{ margin: '5px 0 0 0', paddingLeft: '20px' }}>
                        {exp.achievements.map((ach, i) => <li key={i} style={{ fontSize: '10px' }}>{ach}</li>)}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Projects */}
            {currentCV.tailoredCV.projects && currentCV.tailoredCV.projects.length > 0 && (
              <div style={{ marginBottom: '15px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 'bold', margin: '0 0 8px 0', textTransform: 'uppercase', borderBottom: '1px solid #000' }}>Projects</h3>
                {currentCV.tailoredCV.projects.map((proj, idx) => (
                  <div key={idx} style={{ marginBottom: '10px', fontSize: '11px' }}>
                    <strong>{proj.name}</strong>
                    {proj.summary && <div style={{ fontSize: '10px', fontStyle: 'italic' }}>{proj.summary}</div>}
                    {proj.description && Array.isArray(proj.description) && (
                      <ul style={{ margin: '5px 0 0 0', paddingLeft: '20px' }}>
                        {proj.description.map((desc, i) => <li key={i} style={{ fontSize: '10px' }}>{desc}</li>)}
                      </ul>
                    )}
                    {proj.technologies && proj.technologies.length > 0 && (
                      <div style={{ fontSize: '10px', marginTop: '3px' }}>
                        <strong>Technologies:</strong> {proj.technologies.join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Skills */}
            {currentCV.tailoredCV.skills && (
              <div style={{ marginBottom: '15px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 'bold', margin: '0 0 8px 0', textTransform: 'uppercase', borderBottom: '1px solid #000' }}>Skills</h3>
                <div style={{ fontSize: '10px' }}>
                  {currentCV.tailoredCV.skills.technical && currentCV.tailoredCV.skills.technical.length > 0 && (
                    <div style={{ marginBottom: '5px' }}>
                      <strong>Technical:</strong> {currentCV.tailoredCV.skills.technical.join(', ')}
                    </div>
                  )}
                  {currentCV.tailoredCV.skills.frameworks && currentCV.tailoredCV.skills.frameworks.length > 0 && (
                    <div style={{ marginBottom: '5px' }}>
                      <strong>Frameworks:</strong> {currentCV.tailoredCV.skills.frameworks.join(', ')}
                    </div>
                  )}
                  {currentCV.tailoredCV.skills.tools && currentCV.tailoredCV.skills.tools.length > 0 && (
                    <div style={{ marginBottom: '5px' }}>
                      <strong>Tools:</strong> {currentCV.tailoredCV.skills.tools.join(', ')}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Certifications */}
            {currentCV.tailoredCV.certifications && currentCV.tailoredCV.certifications.length > 0 && (
              <div style={{ marginBottom: '15px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 'bold', margin: '0 0 8px 0', textTransform: 'uppercase', borderBottom: '1px solid #000' }}>Certifications</h3>
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '10px' }}>
                  {currentCV.tailoredCV.certifications.map((cert, idx) => <li key={idx}>{cert}</li>)}
                </ul>
              </div>
            )}

            {/* Awards */}
            {currentCV.tailoredCV.awards && currentCV.tailoredCV.awards.length > 0 && (
              <div style={{ marginBottom: '15px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 'bold', margin: '0 0 8px 0', textTransform: 'uppercase', borderBottom: '1px solid #000' }}>Awards & Achievements</h3>
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '10px' }}>
                  {currentCV.tailoredCV.awards.map((award, idx) => <li key={idx}>{award}</li>)}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
