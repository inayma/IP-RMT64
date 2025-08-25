import { useState, useEffect } from "react";
import NewsAPIService from "../services/newsApiService";

export default function TechNewsSection() {
  const [headlines, setHeadlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTechNews = async () => {
      try {
        setLoading(true);
        const response = await NewsAPIService.getTechHeadlines({ limit: 6 });
        // Handle the response structure from server: { status, totalResults, articles }
        const articles = response.articles || response || [];
        setHeadlines(articles);
      } catch (err) {
        console.error("Error fetching tech news:", err);
        setError(err.message);
        // Fallback to mock data when news API fails
        const mockHeadlines = [
          {
            id: "mock-1",
            title:
              "Meta just hired Apple's AI guru even during the hiring freeze",
            description:
              "Plot twist: Meta's paused most hiring, but AI teams are still growing—they just hired Frank Chu from Apple to help run their Superintelligence Labs. Future-proofing much?",
            publishedAt: new Date().toISOString(),
            source: { name: "Tech News" },
            url: "#",
            urlToImage: "https://via.placeholder.com/300x200?text=AI+News",
          },
          {
            id: "mock-2",
            title: "Google's Gemini 2.0 Flash Shows Promise in Early Tests",
            description:
              "Early benchmarks suggest Google's latest AI model could compete with GPT-4 in several key areas while offering faster response times.",
            publishedAt: new Date().toISOString(),
            source: { name: "AI Weekly" },
            url: "#",
            urlToImage: "https://via.placeholder.com/300x200?text=Google+AI",
          },
          {
            id: "mock-3",
            title: "Apple Vision Pro Gets Major Software Update",
            description:
              "New features include improved hand tracking, better app compatibility, and enhanced productivity tools for enterprise users.",
            publishedAt: new Date().toISOString(),
            source: { name: "Apple News" },
            url: "#",
            urlToImage: "https://via.placeholder.com/300x200?text=Vision+Pro",
          },
        ];
        setHeadlines(mockHeadlines);
        setError(null); // Clear error since we have fallback data
        console.info("Using fallback tech news data due to API issues");
      } finally {
        setLoading(false);
      }
    };

    fetchTechNews();
  }, []);

  if (loading) {
    return (
      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">
            <i className="bi bi-newspaper me-2"></i>
            Latest Tech News
          </h5>
        </div>
        <div className="card-body text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2 text-muted">Fetching latest tech headlines...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">
            <i className="bi bi-newspaper me-2"></i>
            Latest Tech News
          </h5>
        </div>
        <div className="card-body">
          <div className="alert alert-warning">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="mb-0">
          <i className="bi bi-newspaper me-2"></i>
          Latest Tech News
          <small className="text-muted ms-2">via NewsAPI</small>
        </h5>
      </div>
      <div className="card-body">
        {error && (
          <div
            className="alert alert-warning alert-dismissible fade show"
            role="alert"
          >
            <i className="bi bi-exclamation-triangle me-2"></i>
            Unable to fetch latest news. Showing sample content.
            <button
              type="button"
              className="btn-close"
              onClick={() => setError(null)}
            ></button>
          </div>
        )}
        <div className="row">
          {Array.isArray(headlines) &&
            headlines.map((article, index) => (
              <div key={index} className="col-md-6 mb-3">
                <div className="card h-100 border-0 shadow-sm">
                  {article.urlToImage && (
                    <img
                      src={article.urlToImage}
                      className="card-img-top"
                      alt={article.title}
                      style={{ height: "150px", objectFit: "cover" }}
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  )}
                  <div className="card-body p-3">
                    <h6 className="card-title">
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-decoration-none"
                      >
                        {article.title.length > 80
                          ? `${article.title.substring(0, 80)}...`
                          : article.title}
                      </a>
                    </h6>
                    <p className="card-text small text-muted">
                      {article.description && article.description.length > 100
                        ? `${article.description.substring(0, 100)}...`
                        : article.description || "No description available"}
                    </p>
                    <div className="d-flex justify-content-between align-items-center">
                      <small className="text-muted">
                        <i className="bi bi-person me-1"></i>
                        NewsAPI
                      </small>
                      <small className="text-muted">
                        <i className="bi bi-clock me-1"></i>
                        {new Date(article.publishedAt).toLocaleDateString()}
                      </small>
                    </div>
                    <div className="mt-1">
                      <small className="text-muted">
                        <i className="bi bi-building me-1"></i>
                        Source: {article.source.name}
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
        <div className="text-center mt-3">
          <small className="text-muted">
            <i className="bi bi-info-circle me-1"></i>
            News powered by NewsAPI.org
          </small>
        </div>
      </div>
    </div>
  );
}
