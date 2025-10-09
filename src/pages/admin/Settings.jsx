export default function Settings() {
  return (
    <div className="panel">
      <h3>Configurações</h3>
      <div className="grid-2">
        <div>
          <label>Nome do workspace</label>
          <input className="inp" placeholder="ex: QueryFlow - Prod" />
        </div>
        <div>
          <label>Chave da API</label>
          <input className="inp" placeholder="sk-..." />
        </div>
      </div>
      <button className="btn-primary mt-12">Salvar</button>
    </div>
  )
}
