export default function AdminHome() {
  return (
    <>
      <div className="dash-grid">
        <div className="dash-card">
          <h3>Mensagens hoje</h3>
          <p className="kpi">482</p>
          <span className="muted">+12% vs ontem</span>
        </div>
        <div className="dash-card">
          <h3>Usuários ativos</h3>
          <p className="kpi">127</p>
          <span className="muted">+4 novos</span>
        </div>
        <div className="dash-card">
          <h3>Tempo médio de resposta</h3>
          <p className="kpi">1.2s</p>
          <span className="muted">-0.2s</span>
        </div>
      </div>

      <div className="panel">
        <h3>Informações</h3>
        <p className="muted">
          Substitua por gráficos reais (Recharts/Chart.js) e tabelas conforme sua necessidade.
        </p>
      </div>
    </>
  )
}
