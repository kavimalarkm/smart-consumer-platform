export default function CompareModal({ products, onClose }) {
  if (products.length < 2) return null;
  const [a, b] = products;

  const rows = [
    { label: "Price", a: a.price, b: b.price },
    { label: "Platform", a: a.platform, b: b.platform },
    { label: "Rating", a: `⭐ ${a.rating}`, b: `⭐ ${b.rating}` },
    { label: "Reviews", a: a.reviewCount, b: b.reviewCount },
    { label: "Sentiment", a: `${a.sentiment}%`, b: `${b.sentiment}%` },
    { label: "Trust Score", a: `${a.trustScore}%`, b: `${b.trustScore}%` },
    { label: "Image Auth.", a: `${a.imageAuth}%`, b: `${b.imageAuth}%` },
  ];

  function better(va, vb) {
    const na = parseFloat(String(va).replace(/[^0-9.]/g, "")) || 0;
    const nb = parseFloat(String(vb).replace(/[^0-9.]/g, "")) || 0;
    return na >= nb ? "a" : "b";
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Product Comparison</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="compare-header">
          <div className="compare-product">
            <img
              src={`https://smart-consumer-backend.onrender.com/image-proxy?url=${encodeURIComponent(a.image)}`}
              alt={a.name}
              className="compare-img"
            />
            <p className="compare-name">{a.name}</p>
            <span className={`platform-badge ${a.platform === "Amazon" ? "platform-amazon" : "platform-flipkart"}`}>
              {a.platform}
            </span>
          </div>
          <div className="compare-vs">VS</div>
          <div className="compare-product">
            <img
              src={`https://smart-consumer-backend.onrender.com/image-proxy?url=${encodeURIComponent(b.image)}`}
              alt={b.name}
              className="compare-img"
            />
            <p className="compare-name">{b.name}</p>
            <span className={`platform-badge ${b.platform === "Amazon" ? "platform-amazon" : "platform-flipkart"}`}>
              {b.platform}
            </span>
          </div>
        </div>

        <table className="compare-table">
          <tbody>
            {rows.map((row) => {
              const win = better(row.a, row.b);
              return (
                <tr key={row.label}>
                  <td className={`compare-cell ${win === "a" ? "compare-win" : ""}`}>{row.a}</td>
                  <td className="compare-label">{row.label}</td>
                  <td className={`compare-cell ${win === "b" ? "compare-win" : ""}`}>{row.b}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}