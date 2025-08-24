import TechNewsSection from "./TechNewsSection";

export default function Sidebar({
  title,
  children,
  className = "",
  showNews = true,
}) {
  return (
    <div className={`col-md-4 ${className}`}>
      {title && children && (
        <div className="card mb-4">
          <div className="card-header">
            <h5 className="mb-0">{title}</h5>
          </div>
          <div className="card-body">{children}</div>
        </div>
      )}

      {showNews && <TechNewsSection />}
    </div>
  );
}
