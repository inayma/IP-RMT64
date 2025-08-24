import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { createPost } from "../redux/slices/postsSlice";
import NewsAPIService from "../services/newsApiService";

export default function NewsImportTool() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState({});

  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const articles = await NewsAPIService.searchNews(
        searchQuery,
        "relevancy",
        10
      );
      setSearchResults(articles);
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
      setSearchResults((prev) => prev.filter((_, i) => i !== index));
    } catch (error) {
      alert("Failed to import news. Please try again.");
    } finally {
      setImporting((prev) => ({ ...prev, [index]: false }));
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="card">
        <div className="card-body text-center">
          <i className="bi bi-lock fs-1 text-muted"></i>
          <p className="mt-2">Please login to import news articles</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="mb-0">
          <i className="bi bi-download me-2"></i>
          Import News from NewsAPI
        </h5>
      </div>
      <div className="card-body">
        <form onSubmit={handleSearch} className="mb-3">
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Search tech news..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              className="btn btn-primary"
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
        </form>

        {searchResults.length > 0 && (
          <div
            className="news-results"
            style={{ maxHeight: "400px", overflowY: "auto" }}
          >
            {searchResults.map((article, index) => (
              <div key={index} className="border rounded p-3 mb-3">
                <h6 className="mb-2">{article.title}</h6>
                <p className="small text-muted mb-2">
                  {article.description && article.description.length > 150
                    ? `${article.description.substring(0, 150)}...`
                    : article.description || "No description"}
                </p>
                <div className="d-flex justify-content-between align-items-center">
                  <small className="text-muted">
                    {article.source.name} •{" "}
                    {new Date(article.publishedAt).toLocaleDateString()}
                  </small>
                  <div>
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-outline-secondary me-2"
                    >
                      <i className="bi bi-eye"></i>
                    </a>
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => handleImportNews(article, index)}
                      disabled={importing[index]}
                    >
                      {importing[index] ? (
                        <span className="spinner-border spinner-border-sm" />
                      ) : (
                        <>
                          <i className="bi bi-plus me-1"></i>
                          Import
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {searchResults.length === 0 && searchQuery && !loading && (
          <div className="text-center text-muted">
            <i className="bi bi-search"></i>
            <p className="mt-2">No results found. Try different keywords.</p>
          </div>
        )}
      </div>
    </div>
  );
}
