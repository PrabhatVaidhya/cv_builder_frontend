import React, { useState } from 'react';

export default function ProfileForm({ userEmail, onComplete }) {
  const [rawSummary, setRawSummary] = useState('');
  const [loading, setLoading] = useState(false);

  const loadDemoData = () => {
    const demoSummary = `Sarthak Sharma
sarthaksharma@example.com | +91-9876543210 | LinkedIn: linkedin.com/in/sarthaksharma

Computer Science Student at IIT Kharagpur with strong foundation in AI/ML and Full-Stack Development. Passionate about building scalable systems and solving complex problems.

EDUCATION:
- B.Tech in Computer Science, IIT Kharagpur (2021-2025), CGPA: 8.5/10
- Class 12th, Delhi Public School (2021), 95%

EXPERIENCE:
- Software Engineering Intern at Google (May 2024 - Jul 2024)
  • Developed microservices for Google Cloud Platform using Go and Kubernetes
  • Improved API response time by 40% through caching optimization
  • Collaborated with team of 8 engineers on distributed systems

- Backend Developer Intern at Flipkart (Jan 2024 - Apr 2024)
  • Built REST APIs using Node.js and MongoDB for e-commerce platform
  • Reduced database query time by 30% using indexing strategies
  • Implemented JWT authentication and role-based access control

PROJECTS:
- AI Resume Analyzer (Python, TensorFlow, React) [Jan 2024 - Mar 2024]
  • Built ML model to analyze resumes and match with job descriptions
  • Achieved 92% accuracy in skill extraction using NLP techniques
  • Deployed on AWS with 1000+ active users

- Real-time Chat Application (Node.js, Socket.io, React) [Sep 2023 - Nov 2023]
  • Developed real-time messaging platform with WebSocket support
  • Implemented end-to-end encryption for secure communication
  • Scaled to support 500+ concurrent users

SKILLS:
Programming Languages: Python, JavaScript, C++, Java, Go
Frameworks: React, Node.js, Express, Django, TensorFlow, PyTorch
Tools: Git, Docker, Kubernetes, AWS, MongoDB, PostgreSQL
Languages: English (Fluent), Hindi (Native)

ACHIEVEMENTS:
- Winner, Smart India Hackathon 2023 (Team of 6, built healthcare monitoring system)
- ACM ICPC Regionalist 2023 (Ranked in top 100 teams)
- Google Summer of Code 2023 Contributor (Open source ML project)

CERTIFICATIONS:
- AWS Certified Solutions Architect - Associate (2024)
- Deep Learning Specialization - Coursera (2023)`;
    setRawSummary(demoSummary);
  };

  const handleSubmit = async () => {
    if (!rawSummary.trim()) {
      alert('Please enter your professional summary');
      return;
    }

    setLoading(true);
    try {
      // Parse the unstructured summary using AI
      const parseResponse = await fetch('http://localhost:5000/api/profile/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ summary: rawSummary })
      });

      const parseData = await parseResponse.json();
      if (!parseData.success) {
        alert('Error parsing profile: ' + parseData.message);
        setLoading(false);
        return;
      }

      // Save the parsed profile to the user account
      const saveResponse = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: userEmail, 
          profileData: parseData.data 
        })
      });

      const saveData = await saveResponse.json();
      if (saveData.success) {
        alert('Profile parsed and saved successfully!');
        onComplete();
      } else {
        alert('Error saving profile: ' + saveData.message);
      }
    } catch (err) {
      console.error('Profile submit error:', err);
      alert('Failed to parse and save profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h2>📝 Share Your Professional Summary</h2>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        Paste your professional summary, CV, resume, or any text about your background. 
        Our AI will parse and structure it automatically.
      </p>

      <textarea
        placeholder="Paste your professional summary here...&#10;&#10;Example:&#10;John Doe&#10;john@example.com | +1-234-567-8900&#10;&#10;Software Engineer with 5 years of experience in full-stack development...&#10;&#10;Education:&#10;- BS Computer Science, MIT, 2018-2022, GPA: 3.8&#10;&#10;Experience:&#10;- Software Engineer at Google (2022-Present)&#10;  • Built scalable APIs...&#10;&#10;Skills: Python, JavaScript, React, Node.js, AWS..."
        value={rawSummary}
        onChange={(e) => setRawSummary(e.target.value)}
        rows={20}
        style={{ 
          width: '100%', 
          padding: '15px', 
          border: '1px solid #ddd', 
          borderRadius: '4px', 
          fontFamily: 'monospace',
          fontSize: '14px',
          lineHeight: '1.6'
        }}
      />

      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
        <button
          onClick={loadDemoData}
          style={{
            padding: '12px 30px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '16px'
          }}
        >
          📄 Load Demo Profile
        </button>
        
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            padding: '12px 30px',
            backgroundColor: loading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            fontSize: '16px'
          }}
        >
          {loading ? '🤖 Parsing with AI...' : '✨ Parse & Save Profile'}
        </button>
      </div>

      {loading && (
        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#e7f3ff', borderRadius: '4px', textAlign: 'center' }}>
          <p style={{ margin: 0, color: '#0066cc' }}>
            🤖 Our AI is analyzing your professional summary and extracting structured data...
          </p>
        </div>
      )}
    </div>
  );
}
