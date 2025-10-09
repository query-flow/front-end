// src/pages/Login.jsx
import { useState } from 'react'
import { login } from '../services/auth.js'
import '../styles/login.css'
import logo from '../assets/logo.png' // garanta que o arquivo exista

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function submit(e) {
    e.preventDefault()
    setError('')
    const ok = await login(email, password)
    if (ok.ok) {
      window.location.href = '/'
    } else {
      setError('Credenciais inválidas')
    }
  }

  return (
    <div className="login-wrap">
      <form className="login-card" onSubmit={submit}>
        {/* Logo + título */}
        <img src={logo} alt="Logo QueryFlow" className="logo-img" />
        <div className="logo-text">QueryFlow</div>
        <p className="subtitle">Converse com sua plataforma e acelere seus fluxos.</p>

        {/* E-mail */}
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          placeholder="voce@empresa.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />

        {/* Senha */}
        <label htmlFor="password">Senha</label>
        <input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />

        {/* Erro */}
        {error && <div className="error" role="alert">{error}</div>}

        {/* Ações */}
        <button className="btn-primary" type="submit">Entrar</button>
        <button
          type="button"
          className="link"
          onClick={() => (window.location.href = '/forgot')}
        >
          Esqueceu a senha?
        </button>
      </form>
    </div>
  )
}
