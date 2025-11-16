import { useState, useEffect } from 'react'
import AuthPage from './components/AuthPage'
import ProfileForm from './components/ProfileForm'
import CVGenerator from './components/CVGenerator'
import './App.css'

function App() {
  const [userEmail, setUserEmail] = useState('')
  const [loggedIn, setLoggedIn] = useState(false)
  const [profileCompleted, setProfileCompleted] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const email = localStorage.getItem('userEmail')
    if (email) {
      setUserEmail(email)
      setLoggedIn(true)
      checkProfileStatus(email)
    } else {
      setLoading(false)
    }
  }, [])

  const checkProfileStatus = async (email) => {
    try {
      const response = await fetch(`http://localhost:5000/api/auth/profile/${email}`)
      const data = await response.json()
      if (data.success && data.data.profileCompleted) {
        setProfileCompleted(true)
      }
    } catch (err) {
      console.error('Error checking profile:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (email) => {
    setUserEmail(email)
    setLoggedIn(true)
    localStorage.setItem('userEmail', email)
    await checkProfileStatus(email)
  }

  const handleProfileComplete = () => {
    setProfileCompleted(true)
  }

  const handleLogout = () => {
    setLoggedIn(false)
    setProfileCompleted(false)
    setUserEmail('')
    localStorage.removeItem('userEmail')
    localStorage.removeItem('userFullName')
  }

  if (loading) {
    return (
      <div className="App">
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <h2>Loading...</h2>
        </div>
      </div>
    )
  }

  if (!loggedIn) {
    return (
      <div className="App">
        <header className="app-header">
          <h1>🤖 AI-Powered CV Generator</h1>
          <p className="subtitle">Create your account and build professional CVs tailored to any job</p>
        </header>
        <main className="app-main">
          <AuthPage onLogin={handleLogin} />
        </main>
      </div>
    )
  }

  if (!profileCompleted) {
    return (
      <div className="App">
        <header className="app-header">
          <h1>🤖 AI-Powered CV Generator</h1>
          <p className="subtitle">Welcome! Let's set up your profile first</p>
          <button
            onClick={handleLogout}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              padding: '8px 16px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </header>
        <main className="app-main">
          <ProfileForm userEmail={userEmail} onComplete={handleProfileComplete} />
        </main>
      </div>
    )
  }

  const handleEditProfile = () => {
    setProfileCompleted(false);
  };

  const handleViewProfile = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/auth/profile/${userEmail}`);
      const data = await response.json();
      if (data.success) {
        alert('Opening profile view...');
        // Store profile data to show in modal or new component
        const profileWindow = window.open('', 'Profile', 'width=800,height=600');
        profileWindow.document.write(`
          <html>
          <head>
            <title>My Profile - ${data.data.fullName}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 40px; background: #f5f5f5; }
              .container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
              h1 { color: #007bff; border-bottom: 2px solid #007bff; padding-bottom: 10px; }
              h2 { color: #333; margin-top: 25px; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
              .info-item { margin: 10px 0; }
              .info-item strong { color: #555; }
              ul { margin: 5px 0; padding-left: 20px; }
              li { margin: 5px 0; }
              .section { margin-bottom: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>📋 My Profile</h1>
              
              <div class="section">
                <h2>Personal Information</h2>
                <div class="info-item"><strong>Full Name:</strong> ${data.data.fullName || 'Not provided'}</div>
                <div class="info-item"><strong>Email:</strong> ${data.data.email || 'Not provided'}</div>
                <div class="info-item"><strong>Phone:</strong> ${data.data.personalInfo?.phone || 'Not provided'}</div>
                <div class="info-item"><strong>LinkedIn:</strong> ${data.data.personalInfo?.linkedin || 'Not provided'}</div>
              </div>
              
              ${data.data.summary ? `
              <div class="section">
                <h2>Professional Summary</h2>
                <p>${data.data.summary}</p>
              </div>
              ` : ''}
              
              ${data.data.education && data.data.education.length > 0 ? `
              <div class="section">
                <h2>Education</h2>
                ${data.data.education.map(edu => `
                  <div style="margin-bottom: 15px;">
                    <strong>${edu.degree} in ${edu.field}</strong><br>
                    <em>${edu.institution}</em><br>
                    ${edu.startDate} - ${edu.endDate}
                    ${edu.gpa ? `<br>GPA: ${edu.gpa}` : ''}
                  </div>
                `).join('')}
              </div>
              ` : ''}
              
              ${data.data.experience && data.data.experience.length > 0 ? `
              <div class="section">
                <h2>Experience</h2>
                ${data.data.experience.map(exp => `
                  <div style="margin-bottom: 15px;">
                    <strong>${exp.position}</strong> at ${exp.company}<br>
                    <em>${exp.location}</em><br>
                    ${exp.startDate} - ${exp.endDate}
                    ${exp.achievements && exp.achievements.length > 0 ? `
                      <ul>${exp.achievements.map(a => `<li>${a}</li>`).join('')}</ul>
                    ` : ''}
                  </div>
                `).join('')}
              </div>
              ` : ''}
              
              ${data.data.projects && data.data.projects.length > 0 ? `
              <div class="section">
                <h2>Projects</h2>
                ${data.data.projects.map(proj => `
                  <div style="margin-bottom: 15px;">
                    <strong>${proj.name}</strong><br>
                    ${proj.summary ? `<p>${proj.summary}</p>` : ''}
                    ${proj.description && proj.description.length > 0 ? `
                      <ul>${proj.description.map(d => `<li>${d}</li>`).join('')}</ul>
                    ` : ''}
                    ${proj.technologies && proj.technologies.length > 0 ? `
                      <div><strong>Technologies:</strong> ${proj.technologies.join(', ')}</div>
                    ` : ''}
                  </div>
                `).join('')}
              </div>
              ` : ''}
              
              ${data.data.skills ? `
              <div class="section">
                <h2>Skills</h2>
                ${data.data.skills.technical && data.data.skills.technical.length > 0 ? `
                  <div class="info-item"><strong>Technical:</strong> ${data.data.skills.technical.join(', ')}</div>
                ` : ''}
                ${data.data.skills.frameworks && data.data.skills.frameworks.length > 0 ? `
                  <div class="info-item"><strong>Frameworks:</strong> ${data.data.skills.frameworks.join(', ')}</div>
                ` : ''}
                ${data.data.skills.tools && data.data.skills.tools.length > 0 ? `
                  <div class="info-item"><strong>Tools:</strong> ${data.data.skills.tools.join(', ')}</div>
                ` : ''}
              </div>
              ` : ''}
              
              ${data.data.certifications && data.data.certifications.length > 0 ? `
              <div class="section">
                <h2>Certifications</h2>
                <ul>${data.data.certifications.map(c => `<li>${c}</li>`).join('')}</ul>
              </div>
              ` : ''}
              
              ${data.data.awards && data.data.awards.length > 0 ? `
              <div class="section">
                <h2>Awards & Achievements</h2>
                <ul>${data.data.awards.map(a => `<li>${a}</li>`).join('')}</ul>
              </div>
              ` : ''}
              
              <button onclick="window.print()" style="margin-top: 20px; padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px;">Print Profile</button>
              <button onclick="window.close()" style="margin-top: 20px; margin-left: 10px; padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px;">Close</button>
            </div>
          </body>
          </html>
        `);
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      alert('Failed to load profile');
    }
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>🤖 AI-Powered CV Generator</h1>
        <p className="subtitle">Generate tailored CVs for different jobs using your saved profile</p>
        <div style={{ position: 'absolute', top: '20px', right: '20px', display: 'flex', gap: '10px' }}>
          <button
            onClick={handleViewProfile}
            style={{
              padding: '8px 16px',
              backgroundColor: '#17a2b8',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            View My Profile
          </button>
          <button
            onClick={handleEditProfile}
            style={{
              padding: '8px 16px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Edit Profile
          </button>
          <button
            onClick={handleLogout}
            style={{
              padding: '8px 16px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>
      </header>
      
      <main className="app-main">
        <CVGenerator userEmail={userEmail} />
      </main>
    </div>
  )
}

export default App
