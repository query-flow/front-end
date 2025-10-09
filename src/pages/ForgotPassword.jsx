import { useState } from 'react'
import '../styles/login.css' // reaproveita o mesmo visual do login
import logo from '../assets/logo.png'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function submit(e) {
    e.preventDefault()
    setError('')
    try {
      // TODO: troque pelo endpoint real (ex: POST /auth/forgot)
      // const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/forgot`, { ... })
      // if (!res.ok) throw new Error('Falha ao enviar email')
      setSent(true)
    } catch (err) {
      setError('Não foi possível processar sua solicitação no momento.')
    }
  }

  return (
    <div className="login-wrap">
      <form className="login-card" onSubmit={submit}>
        <img src={logo} alt="QueryFlow" className="logo-img" />
        <div className="logo-text">QueryFlow</div>
        <p className="subtitle">Recupere o acesso à sua conta.</p>

        {!sent ? (
          <>
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

            {error && <div className="error" role="alert">{error}</div>}

            <button className="btn-primary" type="submit">Enviar link de recuperação</button>
            <button
              type="button"
              className="link"
              onClick={() => (window.location.href = '/login')}
            >
              Voltar ao login
            </button>
          </>
        ) : (
          <>
            <p>Se existir uma conta para <b>{email}</b>, um link de recuperação foi enviado.</p>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => (window.location.href = '/login')}
            >
              Voltar ao login
            </button>
          </>
        )}
      </form>
    </div>
  )
}
