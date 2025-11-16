import { useState } from 'react'

export default function AuthPage({ onLogin }) {
  const [mode, setMode] = useState('login') // or 'register'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)

  const api = (path, body) => fetch(`http://localhost:5000/api/auth/${path}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
  }).then(r => r.json())

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (mode === 'register') {
        const res = await api('register', { fullName, email, password })
        if (!res.success) throw new Error(res.message || 'Register failed')
        localStorage.setItem('userEmail', res.data.email)
        localStorage.setItem('userFullName', res.data.fullName || '')
        onLogin(res.data.email)
      } else {
        const res = await api('login', { email, password })
        if (!res.success) throw new Error(res.message || 'Login failed')
        localStorage.setItem('userEmail', res.data.email)
        localStorage.setItem('userFullName', res.data.fullName || '')
        onLogin(res.data.email)
      }
    } catch (err) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 520, margin: '20px auto', padding: 20, border: '1px solid #eee', borderRadius: 6 }}>
      <h2>{mode === 'login' ? 'Sign In' : 'Create Account'}</h2>
      <form onSubmit={handleSubmit}>
        {mode === 'register' && (
          <div style={{ marginBottom: 8 }}>
            <input placeholder="Full name" value={fullName} onChange={e => setFullName(e.target.value)} style={{width: '100%'}} />
          </div>
        )}
        <div style={{ marginBottom: 8 }}>
          <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={{width: '100%'}} />
        </div>
        <div style={{ marginBottom: 8 }}>
          <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} style={{width: '100%'}} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit" disabled={loading}>{loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Register'}</button>
          <button type="button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>{mode === 'login' ? 'Create account' : 'Have an account? Sign in'}</button>
        </div>
      </form>
    </div>
  )
}
