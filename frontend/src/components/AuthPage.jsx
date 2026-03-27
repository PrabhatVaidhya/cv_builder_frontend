import { useState } from 'react'
import './AuthPage.css'

export default function AuthPage({ onLogin }) {
  const [mode, setMode] = useState('login') // or 'register'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)

  const apiEndpoint = import.meta.env.VITE_API_URL || 'https://cv-builder-frontend-1v0e.onrender.com';

  const api = (path, body) => fetch(`${apiEndpoint}/api/auth/${path}`, {
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
    <div className="auth-container">
      <h2>{mode === 'login' ? 'Sign In' : 'Create Account'}</h2>
      <form onSubmit={handleSubmit}>
        {mode === 'register' && (
          <div className="auth-field">
            <input placeholder="Full name" value={fullName} onChange={e => setFullName(e.target.value)} />
          </div>
        )}
        <div className="auth-field">
          <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div className="auth-field">
          <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        <div className="auth-btns">
          <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Register'}</button>
          <button className="btn btn-secondary" type="button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>{mode === 'login' ? 'Create account' : 'Have an account? Sign in'}</button>
        </div>
      </form>
    </div>
  )
}
