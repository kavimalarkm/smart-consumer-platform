export default function SkeletonCard() {
  return (
    <div className="product-card skeleton-card">
      <div className="skeleton skeleton-image" />
      <div style={{ display: "flex", gap: "6px", marginBottom: "10px" }}>
        <div className="skeleton skeleton-badge" />
        <div className="skeleton skeleton-badge" />
      </div>
      <div className="skeleton skeleton-title" />
      <div className="skeleton skeleton-title-short" />
      <div style={{ display: "flex", gap: "8px", marginBottom: "12px", alignItems: "center" }}>
        <div className="skeleton skeleton-price" />
        <div className="skeleton skeleton-trend" />
      </div>
      <div className="skeleton skeleton-rating" />
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", margin: "12px 0" }}>
        <div className="skeleton skeleton-bar" />
        <div className="skeleton skeleton-bar" />
        <div className="skeleton skeleton-bar" />
      </div>
      <div style={{ display: "flex", gap: "6px", marginTop: "4px" }}>
        <div className="skeleton skeleton-tag" />
        <div className="skeleton skeleton-tag" />
        <div className="skeleton skeleton-tag" />
      </div>
      <div style={{ display: "flex", gap: "6px", marginTop: "14px" }}>
        <div className="skeleton skeleton-btn" />
        <div className="skeleton skeleton-btn-sm" />
        <div className="skeleton skeleton-btn-sm" />
      </div>
    </div>
  );
}