import { useState, useEffect } from "react";
import PageContainer from "../components/PageContainer";
import Sidebar from "../components/Sidebar";
import NewsAPIService from "../services/newsApiService";
import { Link } from "react-router";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { createPost } from "../redux/slices/postsSlice";

export default function NewsPage() {
  const [headlines, setHeadlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const articles = await NewsAPIService.getTechHeadlines("us", 30);
        setHeadlines(articles);
      } catch (error) {
        console.error("Error fetching news:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const articles = await NewsAPIService.searchNews(
        searchQuery,
        "relevancy",
        20
      );
      setHeadlines(articles);
    } catch (error) {
      alert("Failed to search news. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleImportNews = async (article, index) => {
    if (!isAuthenticated) {
      alert("Please login to import news");
      return;
    }

    setImporting((prev) => ({ ...prev, [index]: true }));

    try {
      const postData = {
        title: article.title,
        description:
          article.description || article.content || "No description available",
        url: article.url,
        content: `${article.description || ""}\n\nSource: ${
          article.source.name
        }\nPublished: ${new Date(article.publishedAt).toLocaleDateString()}`,
      };

      await dispatch(createPost(postData)).unwrap();
      alert("News imported successfully!");

      // Remove imported article from results
      setHeadlines((prev) => prev.filter((_, i) => i !== index));
    } catch (error) {
      alert("Failed to import news. Please try again.");
    } finally {
      setImporting((prev) => ({ ...prev, [index]: false }));
    }
  };

  const resetToHeadlines = async () => {
    setSearchQuery("");
    setLoading(true);
    try {
      const articles = await NewsAPIService.getTechHeadlines("us", 30);
      setHeadlines(articles);
    } catch (error) {
      console.error("Error fetching news:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <div className="col-lg-8">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>
            <i className="bi bi-newspaper me-2"></i>
            Tech News Timeline
          </h2>
          <Link to="/" className="btn btn-outline-primary">
            <i className="bi bi-house me-1"></i>
            Back to Home
          </Link>
        </div>

        {/* Search and Reset Controls */}
        <div className="card mb-4">
          <div className="card-body">
            <form onSubmit={handleSearch} className="row g-3">
              <div className="col-md-8">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search tech news (AI, gadgets, smartphones, etc.)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="col-md-2">
                <button
                  className="btn btn-primary w-100"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="spinner-border spinner-border-sm" />
                  ) : (
                    <i className="bi bi-search"></i>
                  )}
                </button>
              </div>
              <div className="col-md-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary w-100"
                  onClick={resetToHeadlines}
                  disabled={loading}
                >
                  <i className="bi bi-arrow-clockwise"></i>
                </button>
              </div>
            </form>
            <small className="text-muted">
              <i className="bi bi-info-circle me-1"></i>
              Search for tech, gadgets, AI, and technology news. Click refresh
              to see latest headlines.
            </small>
          </div>
        </div>

        {/* News Timeline */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-muted">Loading latest tech news...</p>
          </div>
        ) : (
          <div className="news-timeline">
            {headlines.map((article, index) => (
              <div key={index} className="card mb-4">
                <div className="row g-0">
                  {article.urlToImage && (
                    <div className="col-md-4">
                      <img
                        src={article.urlToImage}
                        className="img-fluid rounded-start h-100"
                        alt={article.title}
                        style={{ objectFit: "cover", minHeight: "200px" }}
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    </div>
                  )}
                  <div className={article.urlToImage ? "col-md-8" : "col-12"}>
                    <div className="card-body">
                      <h5 className="card-title">{article.title}</h5>
                      <p className="card-text">
                        {article.description || "No description available"}
                      </p>
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <small className="text-muted">
                          <i className="bi bi-building me-1"></i>
                          {article.source.name}
                          <span className="mx-2">•</span>
                          <i className="bi bi-clock me-1"></i>
                          {new Date(article.publishedAt).toLocaleDateString()}
                          <span className="mx-2">•</span>
                          <span className="badge bg-secondary">NewsAPI</span>
                        </small>
                      </div>
                      <div className="d-flex gap-2">
                        <a
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm btn-outline-primary"
                        >
                          <i className="bi bi-box-arrow-up-right me-1"></i>
                          Read Original
                        </a>
                        {isAuthenticated && (
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() => handleImportNews(article, index)}
                            disabled={importing[index]}
                          >
                            {importing[index] ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-1" />
                                Importing...
                              </>
                            ) : (
                              <>
                                <i className="bi bi-plus-circle me-1"></i>
                                Import to WarTek
                              </>
                            )}
                          </button>
                        )}
                      </div>
                      {!isAuthenticated && (
                        <small className="text-muted d-block mt-2">
                          <i className="bi bi-info-circle me-1"></i>
                          <Link to="/login">Login</Link> to import articles to
                          WarTek
                        </small>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {headlines.length === 0 && !loading && (
              <div className="text-center py-5">
                <i className="bi bi-newspaper fs-1 text-muted"></i>
                <p className="mt-3 text-muted">
                  {searchQuery
                    ? "No news found for your search. Try different keywords."
                    : "No tech news available right now. Please try again later."}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <Sidebar showNews={false}>
        <div className="card">
          <div className="card-header">
            <h6 className="mb-0">
              <i className="bi bi-info-circle me-2"></i>
              About Tech News Timeline
            </h6>
          </div>
          <div className="card-body">
            <p className="small mb-3">
              Discover the latest tech, gadgets, and AI news from around the
              world.
            </p>
            <ul className="small mb-3">
              <li>🔍 Search for specific tech topics</li>
              <li>📰 Browse latest headlines</li>
              <li>⬇️ Import articles to WarTek</li>
              <li>💬 Discuss with community</li>
            </ul>
            <div className="alert alert-info small">
              <i className="bi bi-lightbulb me-1"></i>
              <strong>Tip:</strong> Articles imported from NewsAPI are
              attributed to "NewsAPI" as the author.
            </div>
          </div>
        </div>
      </Sidebar>
    </PageContainer>
  );
}
