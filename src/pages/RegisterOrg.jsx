import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";

export default function RegisterOrg() {
  // Campos do admin
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  // Campos da organização
  const [orgName, setOrgName] = useState("Empresa de Teste");
  const [dbHost, setDbHost] = useState("127.0.0.1");
  const [dbPort, setDbPort] = useState(3306);
  const [dbName, setDbName] = useState("sakila");
  const [dbUser, setDbUser] = useState("root");
  const [dbPassword, setDbPassword] = useState("senha");
  const [allowedSchemas, setAllowedSchemas] = useState("sakila");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const handleCreate = async (e) => {
    e.preventDefault();
    setMsg("");

    try {
      const res = await api.post("/auth/register", {
        name: adminName,
        email: adminEmail,
        password: adminPassword,
        org_name: orgName,
        db_host: dbHost,
        db_port: Number(dbPort),
        db_name: dbName,
        db_user: dbUser,
        db_password: dbPassword,
        allowed_schemas: allowedSchemas.split(",").map((s) => s.trim()),
      });

      // Salva dados de autenticação
      const { access_token, refresh_token, org_id, org_name, user_id } = res.data;
      if (access_token) localStorage.setItem("access_token", access_token);
      if (refresh_token) localStorage.setItem("refresh_token", refresh_token);
      if (org_id) localStorage.setItem("org_id", org_id);
      if (org_name) localStorage.setItem("org_name", org_name);
      if (user_id) localStorage.setItem("user_id", user_id);
      localStorage.setItem("user_name", adminName);
      localStorage.setItem("role_in_org", "admin");

      setMsg("Organização criada com sucesso!");
      setTimeout(() => navigate("/chat"), 1200);
    } catch (err) {
      console.error(err);
      setMsg(err?.response?.data?.detail || "Erro ao criar organização. Veja o console.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-2">Criar Conta e Organização</h1>
        <p className="text-slate-400 text-sm mb-6">
          Crie sua conta de administrador e configure sua organização
        </p>
        <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <h2 className="text-lg font-semibold mb-2">Dados do Administrador</h2>
          </div>
          <div className="col-span-2">
            <label className="text-sm">Nome do Admin</label>
            <input
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 mt-1"
              value={adminName}
              onChange={(e) => setAdminName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm">Email do Admin</label>
            <input
              type="email"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 mt-1"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm">Senha do Admin</label>
            <input
              type="password"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 mt-1"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              minLength={8}
              required
            />
          </div>

          <div className="col-span-2 mt-4">
            <h2 className="text-lg font-semibold mb-2">Dados da Organização</h2>
          </div>
          <div className="col-span-2">
            <label className="text-sm">Nome da organização</label>
            <input
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 mt-1"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-sm">DB Host</label>
            <input
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 mt-1"
              value={dbHost}
              onChange={(e) => setDbHost(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm">DB Port</label>
            <input
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 mt-1"
              type="number"
              value={dbPort}
              onChange={(e) => setDbPort(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm">DB Name</label>
            <input
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 mt-1"
              value={dbName}
              onChange={(e) => setDbName(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm">DB User</label>
            <input
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 mt-1"
              value={dbUser}
              onChange={(e) => setDbUser(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm">DB Password</label>
            <input
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 mt-1"
              type="password"
              value={dbPassword}
              onChange={(e) => setDbPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm">Schemas permitidos</label>
            <input
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 mt-1"
              value={allowedSchemas}
              onChange={(e) => setAllowedSchemas(e.target.value)}
            />
          </div>

          <div className="col-span-2 flex gap-3 mt-2">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 transition text-white px-4 py-2 rounded-lg flex-1"
            >
              Criar conta e organização
            </button>
          </div>
        </form>
        {msg && <p className="mt-4 text-sm text-center">{msg}</p>}

        <div className="mt-6 text-center text-sm text-slate-400">
          Já tem uma conta?{" "}
          <span
            onClick={() => navigate("/login")}
            style={{ color: "#3b82f6", cursor: "pointer", fontWeight: "600" }}
          >
            Fazer login
          </span>
        </div>
      </div>
    </div>
  );
}
