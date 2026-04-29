import { useState, useEffect, useRef } from 'react'
import HomePage from './components/HomePage'
import QuickGenerator from './components/QuickGenerator'
import AuthPage from './components/AuthPage'
import ProfileForm from './components/ProfileForm'
import CVGenerator from './components/CVGenerator'
import './App.css'

function App() {
  const [view, setView] = useState('home') // 'home', 'quick', 'pro'
  const [userEmail, setUserEmail] = useState('')
  const [loggedIn, setLoggedIn] = useState(false)
  const [profileCompleted, setProfileCompleted] = useState(false)
  const [loading, setLoading] = useState(true)
  const fileInputRef = useRef(null)

  const apiEndpoint = import.meta.env.VITE_API_URL || 'https://cv-builder-frontend-1v0e.onrender.com';

  useEffect(() => {
    const email = localStorage.getItem('userEmail')
    if (email) {
      setUserEmail(email)
      setLoggedIn(true)
      // Automatically go to 'pro' view if they are logged in and revisit
      setView('pro')
      checkProfileStatus(email)
    } else {
      setLoading(false)
    }
  }, [])

  const checkProfileStatus = async (email) => {
    try {
      const response = await fetch(`${apiEndpoint}/api/auth/profile/${email}`)
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
    setView('home')
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

  if (view === 'home') {
    return (
      <div className="App">
        <HomePage 
          onSelectQuick={() => setView('quick')} 
          onSelectPro={() => setView('pro')} 
        />
      </div>
    )
  }

  if (view === 'quick') {
    return (
      <div className="App">
        <QuickGenerator onBack={() => setView('home')} />
      </div>
    )
  }

  // PRO FLOW -----------------------------------------------------------------

  if (!loggedIn) {
    return (
      <div className="App">
        <header className="app-header">
          <button onClick={() => setView('home')} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', float: 'left' }}>← Back</button>
          <h1>💼 Pro Setup</h1>
          <p className="subtitle">Create your account and build a reusable professional profile</p>
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
          <h1>💼 Pro Setup</h1>
          <p className="subtitle">Welcome! Let's set up your master profile first</p>
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

  const handleExportProfile = async () => {
    try {
      const response = await fetch(`${apiEndpoint}/api/auth/profile/${userEmail}`);
      const data = await response.json();
      if (data.success) {
        const jsonString = JSON.stringify(data.data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${data.data.fullName ? data.data.fullName.replace(/\\s+/g, '_') : 'profile'}_data.json`;
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Failed to export profile');
      }
    } catch (err) {
      console.error('Export error:', err);
      alert('Error exporting profile');
    }
  };

  const handleImportProfile = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const jsonData = JSON.parse(e.target.result);
        delete jsonData._id;
        delete jsonData.id;
        delete jsonData.passwordHash;
        jsonData.profileCompleted = true;

        const response = await fetch(`${apiEndpoint}/api/auth/profile`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: userEmail, profileData: jsonData })
        });
        
        const data = await response.json();
        if (data.success) {
          alert('Profile imported successfully!');
          setProfileCompleted(true);
        } else {
          alert('Failed to import profile: ' + data.message);
        }
      } catch (err) {
        console.error('Import error:', err);
        alert('Invalid JSON file');
      }
    };
    reader.readAsText(file);
    event.target.value = null;
  };

  const handleViewProfile = async () => {
    try {
      const response = await fetch(`${apiEndpoint}/api/auth/profile/${userEmail}`);
      const data = await response.json();
      if (data.success) {
        alert('Opening profile view...');
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
              </div>
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
          <button onClick={() => setView('home')} style={{ padding: '8px 16px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Home</button>
          <button onClick={handleViewProfile} style={{ padding: '8px 16px', backgroundColor: '#17a2b8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>View Profile</button>
          <button onClick={handleEditProfile} style={{ padding: '8px 16px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Edit Profile</button>
          <button onClick={handleExportProfile} style={{ padding: '8px 16px', backgroundColor: '#6f42c1', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Export JSON</button>
          <input type="file" ref={fileInputRef} onChange={handleImportProfile} accept=".json" style={{ display: 'none' }} />
          <button onClick={() => fileInputRef.current.click()} style={{ padding: '8px 16px', backgroundColor: '#fd7e14', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Import JSON</button>
          <button onClick={handleLogout} style={{ padding: '8px 16px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Logout</button>
        </div>
      </header>
      
      <main className="app-main">
        <CVGenerator userEmail={userEmail} />
      </main>
    </div>
  )
}

export default App
