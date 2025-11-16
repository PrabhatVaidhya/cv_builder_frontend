import { useRef } from 'react'
import './CVPreview.css'

function CVPreview({ cvData, similarity, onBack, onDownload }) {
  const previewRef = useRef(null)

  const getSimilarityColor = (score) => {
    if (score >= 0.7) return '#28a745' // Green
    if (score >= 0.5) return '#ffc107' // Yellow
    if (score >= 0.3) return '#fd7e14' // Orange
    return '#dc3545' // Red
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Present'
    const date = new Date(dateString + '-01')
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }

  const handleDownload = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/profile/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cvData)
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${cvData.personalInfo.fullName.replace(/\s+/g, '_')}_CV.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        alert('Failed to generate PDF')
      }
    } catch (error) {
      console.error('Error downloading PDF:', error)
      alert('Error downloading PDF. Make sure the backend is running.')
    }
  }

  const renderSkills = (skillData) => {
    if (Array.isArray(skillData)) {
      return skillData.join(', ')
    }
    return skillData || ''
  }

  return (
    <div className="cv-preview-container">
      <div className="preview-actions">
        <button onClick={onBack} className="back-btn">← Edit CV</button>
        <button onClick={handleDownload} className="download-btn">📥 Download PDF</button>
      </div>

      {similarity && (
        <div className="similarity-score" style={{
          background: '#f8f9fa',
          border: `2px solid ${getSimilarityColor(similarity.score)}`,
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>🎯 Job Match Score</h3>
          <div style={{
            fontSize: '48px',
            fontWeight: 'bold',
            color: getSimilarityColor(similarity.score),
            margin: '10px 0'
          }}>
            {similarity.percentage}%
          </div>
          <div style={{
            fontSize: '18px',
            color: getSimilarityColor(similarity.score),
            fontWeight: '600',
            marginBottom: '10px'
          }}>
            {similarity.interpretation} Match
          </div>
          <p style={{ margin: '10px 0 0 0', fontSize: '14px', color: '#666' }}>
            Cosine similarity between your CV and the job description
          </p>
          <div style={{
            width: '100%',
            height: '10px',
            backgroundColor: '#e9ecef',
            borderRadius: '5px',
            marginTop: '15px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: similarity.percentage + '%',
              height: '100%',
              backgroundColor: getSimilarityColor(similarity.score),
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>
      )}

      <div className="cv-preview" ref={previewRef}>
        {/* Header */}
        <header className="cv-header">
          <h1>{cvData.personalInfo.fullName}</h1>
          <div className="contact-info">
            {cvData.personalInfo.email && <span>✉ {cvData.personalInfo.email}</span>}
            {cvData.personalInfo.phone && <span>📱 {cvData.personalInfo.phone}</span>}
            {cvData.personalInfo.address && <span>📍 {cvData.personalInfo.address}</span>}
          </div>
          <div className="contact-links">
            {cvData.personalInfo.linkedin && (
              <a href={cvData.personalInfo.linkedin} target="_blank" rel="noopener noreferrer">
                LinkedIn
              </a>
            )}
            {cvData.personalInfo.website && (
              <a href={cvData.personalInfo.website} target="_blank" rel="noopener noreferrer">
                Website
              </a>
            )}
          </div>
        </header>

        {/* Professional Summary */}
        {cvData.summary && (
          <section className="cv-section">
            <h2>Professional Summary</h2>
            <p>{cvData.summary}</p>
          </section>
        )}

        {/* Education */}
        {cvData.education.some(edu => edu.institution) && (
          <section className="cv-section">
            <h2>Education</h2>
            {cvData.education.map((edu, index) => (
              edu.institution && (
                <div key={index} className="cv-item">
                  <div className="item-header">
                    <div>
                      <h3>{edu.degree} {edu.field && `in ${edu.field}`}</h3>
                      <p className="institution">{edu.institution}</p>
                    </div>
                    <div className="date-range">
                      {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                    </div>
                  </div>
                  {edu.gpa && <p className="gpa">GPA: {edu.gpa}</p>}
                </div>
              )
            ))}
          </section>
        )}

        {/* Work Experience */}
        {cvData.experience.some(exp => exp.company) && (
          <section className="cv-section">
            <h2>Work Experience</h2>
            {cvData.experience.map((exp, index) => (
              exp.company && (
                <div key={index} className="cv-item">
                  <div className="item-header">
                    <div>
                      <h3>{exp.position}</h3>
                      <p className="company">{exp.company} {exp.location && `• ${exp.location}`}</p>
                    </div>
                    <div className="date-range">
                      {formatDate(exp.startDate)} - {formatDate(exp.endDate)}
                    </div>
                  </div>
                  {exp.description && (
                    <div className="description">
                      {exp.description.split('\n').map((line, i) => (
                        <p key={i}>{line}</p>
                      ))}
                    </div>
                  )}
                </div>
              )
            ))}
          </section>
        )}

        {/* Projects */}
        {cvData.projects.some(proj => proj.name) && (
          <section className="cv-section">
            <h2>Projects</h2>
            {cvData.projects.map((project, index) => (
              project.name && (
                <div key={index} className="cv-item">
                  <div className="item-header">
                    <div>
                      <h3>{project.name}</h3>
                      {project.technologies && <p className="technologies">{project.technologies}</p>}
                    </div>
                    {project.link && (
                      <a href={project.link} target="_blank" rel="noopener noreferrer" className="project-link">
                        View Project
                      </a>
                    )}
                  </div>
                  {project.description && <p className="description">{project.description}</p>}
                </div>
              )
            ))}
          </section>
        )}

        {/* Skills */}
        {(cvData.skills.technical || cvData.skills.soft || cvData.skills.languages) && (
          <section className="cv-section">
            <h2>Skills</h2>
            <div className="skills-grid">
              {cvData.skills.technical && (
                <div className="skill-category">
                  <h4>Technical Skills</h4>
                  <p>{renderSkills(cvData.skills.technical)}</p>
                </div>
              )}
              {cvData.skills.soft && (
                <div className="skill-category">
                  <h4>Soft Skills</h4>
                  <p>{renderSkills(cvData.skills.soft)}</p>
                </div>
              )}
              {cvData.skills.languages && (
                <div className="skill-category">
                  <h4>Languages</h4>
                  <p>{renderSkills(cvData.skills.languages)}</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Certifications */}
        {cvData.certifications && cvData.certifications.length > 0 && (
          <section className="cv-section">
            <h2>Certifications</h2>
            <div className="certifications">
              {(Array.isArray(cvData.certifications) 
                ? cvData.certifications 
                : cvData.certifications.split('\n')
              ).map((cert, index) => (
                cert.trim() && <p key={index}>• {cert.trim()}</p>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

export default CVPreview
