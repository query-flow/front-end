// src/components/MessageBubble.jsx
export default function MessageBubble({ role, content, table }) {
  const isUser = role === "user";

  return (
    <div
      className={
        "message-row " +
        (isUser ? "message-row--user" : "message-row--assistant")
      }
    >
      <div
        className={
          "message-bubble " +
          (isUser ? "message-bubble--user" : "message-bubble--assistant")
        }
      >
        {content && <div>{content}</div>}

        {table && table.columns && table.rows && (
          <div className="message-bubble-table">
            <table>
              <thead>
                <tr>
                  {table.columns.map((col) => (
                    <th key={col}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.rows.map((row, idx) => (
                  <tr key={idx}>
                    {table.columns.map((col, colIdx) => (
                      <td key={col}>{row[colIdx]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
