import '../styles/chat.css'

function Code({ lang = 'txt', value }) {
  return (
    <pre className="code">
      <code>{value}</code>
    </pre>
  )
}

function Table({ columns, rows }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>{columns.map((c) => <th key={c}>{c}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {columns.map((c) => <td key={c}>{String(r[c] ?? '')}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ImageB64({ data }) {
  return <img alt="chart" src={`data:image/png;base64,${data}`} style={{maxWidth:'100%'}} />
}

export default function MessageBubble({ role, type = 'text', content, lang }) {
  const isUser = role === 'user'
  return (
    <div className={`msg-row ${isUser ? 'end' : 'start'}`}>
      <div className={`msg-bubble ${isUser ? 'user' : 'bot'}`}>
        {type === 'text' && content}
        {type === 'code' && <Code lang={lang} value={content} />}
        {type === 'table' && <Table columns={content.columns} rows={content.rows} />}
        {type === 'image_base64' && <ImageB64 data={content} />}
      </div>
    </div>
  )
}
