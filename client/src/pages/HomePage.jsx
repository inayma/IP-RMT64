import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { fetchPosts, votePost, createPost } from "../redux/slices/postsSlice";
import PageContainer from "../components/PageContainer";
import PostCard from "../components/PostCard";
import Sidebar from "../components/Sidebar";
import LoadingSpinner from "../components/LoadingSpinner";
import NewsAPIService from "../services/newsApiService";

export default function HomePage() {
  const dispatch = useAppDispatch();
  const { posts, isLoading, error } = useAppSelector((state) => state.posts);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const [newsArticles, setNewsArticles] = useState([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [combinedItems, setCombinedItems] = useState([]);
  const [trendingCategories, setTrendingCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Scroll to top state
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    dispatch(fetchPosts());
    fetchNewsArticles();
    fetchTrendingCategories();
  }, [dispatch]);

  // Scroll to top button visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.pageYOffset > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Combine posts and news articles, sort by creation/publication date
    const combined = [
      ...posts.map((post) => ({ ...post, type: "post" })),
      ...newsArticles.map((article) => ({ ...article, type: "news" })),
    ].sort((a, b) => {
      const dateA = new Date(a.createdAt || a.publishedAt);
      const dateB = new Date(b.createdAt || b.publishedAt);
      return dateB - dateA; // Most recent first
    });
    setCombinedItems(combined);
    setCurrentPage(1); // Reset to first page when items change
  }, [posts, newsArticles]);

  const fetchNewsArticles = async () => {
    setNewsLoading(true);
    try {
      const articles = await NewsAPIService.getTechHeadlines("us", 10);
      // Convert to a format compatible with posts
      const formattedArticles = articles.map((article, index) => ({
        id: `news-${index}-${Date.now()}`,
        title: article.title,
        description: article.description || "No description available",
        content: article.content || article.description || "",
        url: article.url,
        imageUrl: article.urlToImage,
        author: "NewsAPI",
        source: article.source.name,
        publishedAt: article.publishedAt,
        upvotes: 0,
        downvotes: 0,
        commentsCount: 0,
      }));
      setNewsArticles(formattedArticles);
    } catch (error) {
      console.error("Error fetching news:", error);
    } finally {
      setNewsLoading(false);
    }
  };

  const fetchTrendingCategories = async () => {
    setCategoriesLoading(true);
    try {
      const categories = await NewsAPIService.getTrendingCategories();
      setTrendingCategories(categories);
    } catch (error) {
      console.error("Error fetching trending categories:", error);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const handleCategorySelect = async (category) => {
    setSelectedCategory(category);
    setNewsLoading(true);
    try {
      const articles = await NewsAPIService.getNewsByCategory(category, 15);
      const formattedArticles = articles.map((article, index) => ({
        id: `news-${category.name}-${index}-${Date.now()}`,
        title: article.title,
        description: article.description || "No description available",
        content: article.content || article.description || "",
        url: article.url,
        imageUrl: article.urlToImage,
        author: "NewsAPI",
        source: article.source.name,
        publishedAt: article.publishedAt,
        upvotes: 0,
        downvotes: 0,
        commentsCount: 0,
        category: category.name,
      }));
      setNewsArticles(formattedArticles);
    } catch (error) {
      console.error("Error fetching category news:", error);
    } finally {
      setNewsLoading(false);
    }
  };

  const handleShowAllNews = () => {
    setSelectedCategory(null);
    fetchNewsArticles();
  };

  const handleImportNews = async (article) => {
    if (!isAuthenticated) {
      alert("Please login to import news");
      return;
    }

    try {
      const postData = {
        title: article.title,
        description: article.description,
        url: article.url,
        content: `${article.description}\n\nSource: ${
          article.source
        }\nPublished: ${new Date(article.publishedAt).toLocaleDateString()}`,
      };

      await dispatch(createPost(postData)).unwrap();
      alert("News imported successfully!");

      // Remove imported article from news articles
      setNewsArticles((prev) => prev.filter((a) => a.id !== article.id));
    } catch (error) {
      alert("Failed to import news. Please try again.");
    }
  };

  const handleVote = async (postId, voteType) => {
    if (!isAuthenticated) {
      alert("Please login to vote");
      return;
    }

    try {
      await dispatch(votePost({ postId, voteType }));
    } catch (error) {
      console.error("Vote failed:", error);
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(combinedItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = combinedItems.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (isLoading || newsLoading) {
    return <LoadingSpinner message="Loading tech community..." />;
  }

  return (
    <PageContainer>
      <div className="col-md-8">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1>Warung Teknologi</h1>
          <div className="d-flex gap-2">
            <button
              className="btn btn-outline-secondary"
              onClick={selectedCategory ? handleShowAllNews : fetchNewsArticles}
              disabled={newsLoading}
            >
              <i className="bi bi-arrow-clockwise me-1"></i>
              {selectedCategory ? "Show All News" : "Refresh News"}
            </button>
            {isAuthenticated ? (
              <Link to="/create-post" className="btn btn-primary">
                Create Post
              </Link>
            ) : (
              <Link to="/login" className="btn btn-outline-primary">
                Login to Create Post
              </Link>
            )}
          </div>
        </div>

        {/* Trending Categories */}
        <div className="card mb-4">
          <div className="card-header">
            <h6 className="mb-0">
              <i className="bi bi-fire me-2"></i>
              Trending Tech Categories
              {categoriesLoading && (
                <span className="spinner-border spinner-border-sm ms-2" />
              )}
            </h6>
          </div>
          <div className="card-body">
            <div className="d-flex flex-wrap gap-2">
              <button
                className={`btn ${
                  !selectedCategory ? "btn-primary" : "btn-outline-primary"
                } btn-sm`}
                onClick={handleShowAllNews}
                disabled={newsLoading}
              >
                <i className="bi bi-grid me-1"></i>
                All News
              </button>
              {trendingCategories.map((category, index) => (
                <button
                  key={index}
                  className={`btn ${
                    selectedCategory?.name === category.name
                      ? "btn-success"
                      : "btn-outline-success"
                  } btn-sm position-relative`}
                  onClick={() => handleCategorySelect(category)}
                  disabled={newsLoading}
                >
                  <span className="me-1">{category.icon}</span>
                  {category.name}
                  {category.popularity > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                      {category.popularity > 999 ? "999+" : category.popularity}
                    </span>
                  )}
                </button>
              ))}
            </div>
            {selectedCategory && (
              <div className="mt-2">
                <small className="text-muted">
                  <i className="bi bi-info-circle me-1"></i>
                  Showing articles for: <strong>{selectedCategory.name}</strong>
                  {selectedCategory.popularity > 0 && (
                    <span className="ms-2">
                      ({selectedCategory.popularity} articles found)
                    </span>
                  )}
                </small>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {combinedItems.length === 0 ? (
          <div className="text-center">
            <h4>No posts yet</h4>
            <p>
              Be the first to share tech news, or wait for latest news to load!
            </p>
          </div>
        ) : (
          <>
            {/* Posts/News Items */}
            {currentItems.map((item) => (
              <div key={item.id} className="mb-3">
                {item.type === "news" ? (
                  <div className="card">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h5 className="card-title">{item.title}</h5>
                        <span className="badge bg-info text-dark">NewsAPI</span>
                      </div>
                      <p className="card-text">{item.description}</p>
                      <div className="d-flex justify-content-between align-items-center">
                        <small className="text-muted">
                          <i className="bi bi-building me-1"></i>
                          {item.source} •{" "}
                          {new Date(item.publishedAt).toLocaleDateString()}
                        </small>
                        <div className="d-flex gap-2">
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm btn-outline-primary"
                          >
                            <i className="bi bi-box-arrow-up-right me-1"></i>
                            Read
                          </a>
                          {isAuthenticated && (
                            <button
                              className="btn btn-sm btn-success"
                              onClick={() => handleImportNews(item)}
                            >
                              <i className="bi bi-plus-circle me-1"></i>
                              Import
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <PostCard key={item.id} post={item} onVote={handleVote} />
                )}
              </div>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <nav aria-label="Page navigation" className="mt-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="text-muted">
                    Showing {startIndex + 1}-
                    {Math.min(endIndex, combinedItems.length)} of{" "}
                    {combinedItems.length} items
                  </span>
                </div>
                <ul className="pagination justify-content-center">
                  <li
                    className={`page-item ${
                      currentPage === 1 ? "disabled" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <i className="bi bi-chevron-left"></i> Previous
                    </button>
                  </li>

                  {/* Page numbers */}
                  {[...Array(totalPages)].map((_, index) => {
                    const page = index + 1;
                    const isVisible =
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 2 && page <= currentPage + 2);

                    if (!isVisible) {
                      // Show ellipsis
                      if (
                        page === currentPage - 3 ||
                        page === currentPage + 3
                      ) {
                        return (
                          <li key={page} className="page-item disabled">
                            <span className="page-link">...</span>
                          </li>
                        );
                      }
                      return null;
                    }

                    return (
                      <li
                        key={page}
                        className={`page-item ${
                          currentPage === page ? "active" : ""
                        }`}
                      >
                        <button
                          className="page-link"
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </button>
                      </li>
                    );
                  })}

                  <li
                    className={`page-item ${
                      currentPage === totalPages ? "disabled" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next <i className="bi bi-chevron-right"></i>
                    </button>
                  </li>
                </ul>
              </nav>
            )}
          </>
        )}
      </div>

      <Sidebar title="About WarTek">
        <p>A unified tech community combining:</p>
        <ul>
          <li>🤖 AI & Machine Learning</li>
          <li>📱 Gadgets & Hardware</li>
          <li>💻 Software Development</li>
          <li>📰 Latest Tech News</li>
          <li>🚀 Startup Updates</li>
        </ul>
        <hr />
        <div className="alert alert-info small">
          <i className="bi bi-info-circle me-1"></i>
          <strong>
            News articles from NewsAPI are automatically mixed with community
            posts. Import interesting articles to start discussions!
          </strong>
        </div>
      </Sidebar>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          className="btn btn-primary position-fixed"
          style={{
            bottom: "20px",
            right: "20px",
            zIndex: 1000,
            borderRadius: "50%",
            width: "50px",
            height: "50px",
            boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
            fontSize: "18px",
          }}
          onClick={scrollToTop}
          title="Scroll to top"
        >
          ⬆️
        </button>
      )}
    </PageContainer>
  );
}
