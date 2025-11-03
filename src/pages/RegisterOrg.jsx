import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";

export default function RegisterOrg() {
  const [name, setName] = useState("Empresa de Teste");
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
      const res = await api.post("/admin/orgs", {
        name,
        db_host: dbHost,
        db_port: Number(dbPort),
        db_name: dbName,
        db_user: dbUser,
        db_password: dbPassword,
        allowed_schemas: allowedSchemas.split(",").map((s) => s.trim()),
      });

      const { org_id, id } = res.data;
      if (org_id) {
        localStorage.setItem("org_id", org_id);
      } else if (id) {
        localStorage.setItem("org_id", id);
      }
      setMsg("Organização criada com sucesso!");
      setTimeout(() => navigate("/chat"), 1200);
    } catch (err) {
      console.error(err);
      setMsg("Erro ao criar organização. Veja o console.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-6">Criar Organização</h1>
        <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="text-sm">Nome da organização</label>
            <input
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 mt-1"
              value={name}
              onChange={(e) => setName(e.target.value)}
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
              className="bg-blue-500 hover:bg-blue-600 transition text-white px-4 py-2 rounded-lg"
            >
              Criar organização
            </button>
            <button
              type="button"
              onClick={() => navigate("/chat")}
              className="border border-slate-600 px-4 py-2 rounded-lg"
            >
              Voltar
            </button>
          </div>
        </form>
        {msg && <p className="mt-4 text-sm">{msg}</p>}
      </div>
    </div>
  );
}
