// src/App.jsx
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Login from "./pages/Login.jsx";
import RegisterOrg from "./pages/RegisterOrg.jsx";
import Chat from "./pages/Chat.jsx";
import UploadDocument from "./pages/UploadDocument.jsx";
import AdminOrg from "./pages/AdminOrg.jsx";
import Conversations from "./pages/Conversations.jsx";



function RequireAuth({ children }) {
  const token = localStorage.getItem("access_token");
  const location = useLocation();
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<RegisterOrg />} />
      <Route
        path="/chat"
        element={
          <RequireAuth>
            <Chat />
          </RequireAuth>
        }
      />
      <Route
        path="/chat/:conversationId"
        element={
          <RequireAuth>
            <Chat />
          </RequireAuth>
        }
      />
      <Route
        path="/conversations"
        element={
          <RequireAuth>
            <Conversations />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/chat" replace />} />

      <Route
        path="/arquivo"
        element={
          <RequireAuth>
            <UploadDocument />
          </RequireAuth>
        }
      />
      {/* AQUI: página de admin na rota /org */}
      <Route
        path="/admin"
        element={
          <RequireAuth>
            <AdminOrg />
          </RequireAuth>
        }
      />

    </Routes>
  );
}
