export default function LoadingSpinner({ message = "Loading..." }) {
  return (
    <div className="container mt-4">
      <div className="text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">{message}</span>
        </div>
        <p className="mt-2 text-muted">{message}</p>
      </div>
    </div>
  );
}
