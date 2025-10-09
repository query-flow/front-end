import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Admin from './pages/Admin.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'  
import Settings from './pages/Settings.jsx'  




// Simples “guard” de admin (troque depois por validação real)
const isLoggedIn = () => !!localStorage.getItem('demo_token')
const isAdmin = () => localStorage.getItem('demo_role') === 'admin'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={isLoggedIn() ? <Home /> : <Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot" element={<ForgotPassword />} />   {/* <-- novo */}

      <Route path="/settings" element={<Settings />} />
{/*       <Route path="/settings" element={isLoggedIn() ? <Settings /> : <Navigate to="/login" />} />
 */}

      {/* >>> SEM VERIFICAÇÃO, SEMPRE ENTRA NO ADMIN <<< */}
      <Route path="/admin" element={<Admin />} />
      {/* <Route
        path="/admin"
        element={isLoggedIn() && isAdmin() ? <Admin /> : <Navigate to="/login" />}
      /> */}

      
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}
