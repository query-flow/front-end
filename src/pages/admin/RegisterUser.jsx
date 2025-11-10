export default function RegisterUser() {
  return (
    <div className="panel">
      <h3>Cadastrar usuário</h3>
      <div className="grid-2">
        <div>
          <label>Nome</label>
          <input className="inp" placeholder="Ex.: Maria" />
        </div>
        <div>
          <label>Email</label>
          <input className="inp" placeholder="maria@empresa.com" />
        </div>
      </div>
      <button className="btn-primary mt-12">Cadastrar</button>
    </div>
  )
}
