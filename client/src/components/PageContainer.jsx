export default function PageContainer({ children, className = "" }) {
  return (
    <div className={`container mt-4 ${className}`}>
      <div className="row">{children}</div>
    </div>
  );
}
