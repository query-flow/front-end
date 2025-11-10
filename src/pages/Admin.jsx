// src/pages/admin/Admin.jsx
import { useState } from 'react'
import AdminSidebar from '../components/AdminSidebar.jsx'
import '../styles/admin.css'
import '../styles/dashboard.css'

// Seções (arquivos na mesma pasta /pages/admin)
import AdminHome from './admin/AdminHome.jsx'
import Settings from './admin/Settings.jsx'
import Dependents from './admin/Dependents.jsx'
import RegisterUser from './admin/RegisterUser.jsx'
import Plan from './admin/Plan.jsx'
import Users from './admin/Users.jsx'

export default function Admin() {
  const [section, setSection] = useState('home')

  const renderSection = () => {
    switch (section) {
      case 'home':        return <AdminHome />
      case 'config':      return <Settings />
      case 'dependentes': return <Dependents />
      case 'cadastrar':   return <RegisterUser />
      case 'plano':       return <Plan />
      case 'usuarios':    return <Users />
      default:            return <AdminHome />
    }
  }

  return (
    <div className="layout">
      <AdminSidebar active={section} onNavigate={setSection} />
      <main className="main">
        <header className="admin-header">
          <h2>Administração — {section}</h2>
        </header>
        <div className="admin-content">
          {renderSection()}
        </div>
      </main>
    </div>
  )
}
