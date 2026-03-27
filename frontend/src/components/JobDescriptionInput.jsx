import { useState } from 'react'
import './JobDescriptionInput.css'

function JobDescriptionInput({ userEmail, parsedProfile, onCVGenerated }) {
  const [jobDescription, setJobDescription] = useState('')
  const [email, setEmail] = useState(userEmail || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const apiEndpoint = import.meta.env.VITE_API_URL || 'https://cv-builder-frontend-1v0e.onrender.com';

  const exampleJob = `Senior Full Stack Developer
  

We are seeking a talented Full Stack Developer to join our team.

Requirements:
- 5+ years of experience in web development
- Strong proficiency in JavaScript, React, and Node.js
- Experience with cloud platforms (AWS, Google Cloud)
- Knowledge of microservices architecture
- Experience with Docker and Kubernetes
- Strong problem-solving skills
- Excellent communication and teamwork

Responsibilities:
- Design and develop scalable web applications
- Collaborate with cross-functional teams
- Write clean, maintainable code
- Mentor junior developers

Nice to have:
- Python experience
- Machine learning knowledge
- Open source contributions`

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!email.trim()) {
      setError('Please enter your email address')
      return
    }

    if (!jobDescription.trim()) {
      setError('Please enter a job description')
      return
    }

    setLoading(true)
    setError('')

    try {
      // If parsedProfile exists and email changed, update profile first
      if (parsedProfile && email !== userEmail) {
        const updatedProfile = {
          ...parsedProfile,
          personalInfo: {
            ...parsedProfile.personalInfo,
            email: email
          }
        }
        
        await fetch(`${apiEndpoint}/api/profile/save-profile`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedProfile)
        })
      }

      const response = await fetch(`${apiEndpoint}/api/profile/generate-tailored-cv`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          jobDescription: jobDescription
        })
      })

      const result = await response.json()

      if (result.success) {
        console.log('\n=== TAILORED CV GENERATED ===')
        console.log(JSON.stringify(result.data, null, 2))
        if (result.similarity) {
          console.log('\n=== SIMILARITY SCORE ===')
          console.log(`Cosine Similarity: ${result.similarity.percentage}%`)
          console.log(`Match Quality: ${result.similarity.interpretation}`)
          console.log('=== END SIMILARITY ===\n')
        }
        console.log('=== END TAILORED CV ===\n')
        onCVGenerated(result.data, result.similarity)
      } else {
        setError(result.error || 'Failed to generate CV')
        if (result.data) {
          onCVGenerated(result.data)
        }
      }
    } catch (error) {
      console.error('Error:', error)
      setError('Failed to connect to server')
    } finally {
      setLoading(false)
    }
  }

  const loadExample = () => {
    setJobDescription(exampleJob)
  }

  return (
    <div className="job-input-container">
      <div className="job-header">
        <h2>🎯 Enter Job Description</h2>
        <p className="subtitle">
          Paste the job description you're applying for. Our AI will tailor your CV to highlight
          the most relevant experience and skills.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="job-form">
        <div className="form-group">
          <label htmlFor="email">Your Email (for profile lookup)</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your.email@example.com"
            className="email-input"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="jobDesc">Job Description</label>
          <textarea
            id="jobDesc"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the job description here..."
            rows="15"
            className="job-textarea"
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="button-group">
          <button type="button" onClick={loadExample} className="example-btn">
            📋 Load Example Job
          </button>
          <button type="submit" disabled={loading} className="generate-btn">
            {loading ? '🤖 AI is Tailoring...' : '✨ Generate Tailored CV'}
          </button>
        </div>
      </form>

      <div className="info-box">
        <h4>🎯 How it works:</h4>
        <ul>
          <li>Rewrites your summary to match job requirements</li>
          <li>Highlights relevant experience and achievements</li>
          <li>Prioritizes matching skills</li>
          <li>Emphasizes relevant projects</li>
        </ul>
      </div>
    </div>
  )
}

export default JobDescriptionInput
