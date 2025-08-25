import React from "react";

export default function NewsCard({ article }) {
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "Recent";
    }
  };

  const handleReadMore = () => {
    if (article.url && article.url !== "#") {
      window.open(article.url, "_blank", "noopener,noreferrer");
    }
  };

  const getCategoryBadgeColor = (category) => {
    const colors = {
      "AI & Machine Learning": "bg-purple-100 text-purple-800",
      "Mobile Technology": "bg-blue-100 text-blue-800",
      "Web Development": "bg-green-100 text-green-800",
      Cybersecurity: "bg-red-100 text-red-800",
      "Cloud Computing": "bg-cyan-100 text-cyan-800",
      "Blockchain & Crypto": "bg-yellow-100 text-yellow-800",
      "Hardware & Gadgets": "bg-gray-100 text-gray-800",
      "Software Development": "bg-indigo-100 text-indigo-800",
      "Latest Tech News": "bg-slate-100 text-slate-800",
    };
    return colors[category] || "bg-slate-100 text-slate-800";
  };

  return (
    <div className="card mb-3">
      <div className="card-body">
        {/* Header with badges */}
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div className="d-flex gap-2">
            <span className="badge bg-info text-dark">📰 News</span>
            <span
              className={`badge ${getCategoryBadgeColor(article.category)
                .replace("bg-", "bg-")
                .replace("text-", "text-dark")}`}
            >
              {article.category}
            </span>
          </div>
          <small className="text-muted">
            {formatDate(article.publishedAt)}
          </small>
        </div>

        {/* Article Image */}
        {article.urlToImage && (
          <div className="mb-3">
            <img
              src={article.urlToImage}
              alt={article.title}
              className="img-fluid rounded"
              style={{ maxHeight: "200px", width: "100%", objectFit: "cover" }}
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          </div>
        )}

        {/* Article Title */}
        <h5 className="card-title mb-3">{article.title}</h5>

        {/* Article Description */}
        {article.description && (
          <p className="card-text text-muted mb-3">{article.description}</p>
        )}

        {/* Footer with source and actions */}
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <i className="bi bi-building me-2"></i>
            <small className="text-muted">
              <strong>{article.source}</strong>
              {article.author && (
                <>
                  <span className="mx-1">•</span>
                  <span>{article.author}</span>
                </>
              )}
            </small>
          </div>

          <div className="d-flex gap-2">
            {article.url && article.url !== "#" && (
              <button
                onClick={handleReadMore}
                className="btn btn-sm btn-outline-primary"
              >
                <i className="bi bi-box-arrow-up-right me-1"></i>
                Read More
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
