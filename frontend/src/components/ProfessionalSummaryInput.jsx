import { useState } from 'react'
import './ProfessionalSummaryInput.css'

function ProfessionalSummaryInput({ onParsed }) {
  const [summary, setSummary] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const apiEndpoint = import.meta.env.VITE_API_URL || 'https://cv-builder-frontend-1v0e.onrender.com';

  const exampleText = `I am John Doe, a Senior Software Engineer with 5 years of experience in full-stack development. 
  
I graduated from MIT with a BS in Computer Science in 2018, GPA 3.8. 

I currently work at Google as a Senior Software Engineer in Mountain View, CA from Jan 2021 to present, where I led the development of cloud-based microservices serving 10M+ users. Previously, I worked at Microsoft as a Software Engineer from June 2018 to Dec 2020 in Seattle, WA.

My technical skills include JavaScript, Python, React, Node.js, AWS, Docker, Kubernetes. I'm fluent in English and Spanish.

I've built several projects including a real-time chat application using WebSockets and React, and an AI-powered recommendation system using Python and TensorFlow.

I'm certified in AWS Solutions Architect and Google Cloud Professional.

Contact: john.doe@email.com, +1-555-0123, LinkedIn: linkedin.com/in/johndoe`

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!summary.trim()) {
      setError('Please enter your professional summary')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${apiEndpoint}/api/profile/parse-summary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ professionalSummary: summary })
      })

      const result = await response.json()

      if (result.success) {
        // Show structured output in console
        console.log('✅ AI Parsing Successful!');
        console.log('📊 Structured Output:', JSON.stringify(result.data, null, 2));
        alert('✅ Parsing Successful! Check the browser console (F12) to see the structured output.');
        onParsed(result.data, summary)
      } else {
        setError(result.message || 'Failed to parse summary')
        if (result.data) {
          console.log('⚠️ AI Parsing Failed - Using Fallback');
          console.log('📊 Fallback Output:', JSON.stringify(result.data, null, 2));
          onParsed(result.data, summary) // Still show the fallback data
        }
      }
    } catch (error) {
      console.error('Error:', error)
      setError('Failed to connect to server. Make sure the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  const loadExample = () => {
    setSummary(exampleText)
  }

  return (
    <div className="summary-input-container">
      <div className="summary-header">
        <h2>📝 Tell Us About Yourself</h2>
        <p className="subtitle">
          Paste your professional information below. Include your name, contact, education, 
          work experience, skills, projects, and certifications. Our AI will structure it for you.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="summary-form">
        <div className="form-group">
          <label htmlFor="summary">Professional Summary</label>
          <textarea
            id="summary"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Enter your professional information here...

Example:
I am [Your Name], a [Your Title] with [X] years of experience...

Education: [Degree] from [University], [Year]...

Work Experience: Currently at [Company] as [Position]...

Skills: [List your skills]...

Projects: [Describe your projects]...

Contact: [Email], [Phone], [LinkedIn]..."
            rows="15"
            className="summary-textarea"
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="button-group">
          <button type="button" onClick={loadExample} className="example-btn">
            📋 Load Example
          </button>
          <button type="submit" disabled={loading} className="parse-btn">
            {loading ? '🤖 AI is Parsing...' : '🚀 Parse with AI'}
          </button>
        </div>
      </form>

      <div className="info-box">
        <h4>💡 Tips for better results:</h4>
        <ul>
          <li>Include your full name and contact information</li>
          <li>Mention education with institution, degree, and dates</li>
          <li>List work experience with company, role, and achievements</li>
          <li>Specify technical and soft skills</li>
          <li>Describe notable projects</li>
          <li>Add certifications if any</li>
        </ul>
      </div>
    </div>
  )
}

export default ProfessionalSummaryInput
