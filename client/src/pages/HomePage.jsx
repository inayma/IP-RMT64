import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { fetchPosts, votePost } from "../redux/slices/postsSlice";
import PageContainer from "../components/PageContainer";
import PostCard from "../components/PostCard";
import NewsCard from "../components/NewsCard";
import LoadingSpinner from "../components/LoadingSpinner";
import clientNewsService from "../services/clientNewsService";

export default function HomePage() {
  const dispatch = useAppDispatch();
  const {
    posts,
    isLoading: postsLoading,
    error: postsError,
  } = useAppSelector((state) => state.posts);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  // Local state for news
  const [news, setNews] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsError, setNewsError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All News");

  // Available categories
  const categories = [
    "All News",
    "AI & Machine Learning",
    "Mobile Technology",
    "Web Development",
    "Cybersecurity",
    "Cloud Computing",
    "Blockchain & Crypto",
    "Hardware & Gadgets",
    "Software Development",
  ];

  // Fetch posts on component mount
  useEffect(() => {
    console.log("🏠 HomePage: Dispatching fetchPosts");
    const loadPosts = async () => {
      try {
        await dispatch(fetchPosts()).unwrap();
        console.log("✅ Posts fetched successfully");
      } catch (error) {
        console.error("❌ Failed to fetch posts:", error);
      }
    };

    loadPosts();
  }, [dispatch]);

  // Fetch news when component mounts or category changes
  useEffect(() => {
    const fetchNews = async () => {
      try {
        setNewsLoading(true);
        setNewsError(null);
        console.log(
          `🏠 HomePage: Fetching news for category: ${selectedCategory}`
        );

        let newsData;
        if (selectedCategory === "All News") {
          newsData = await clientNewsService.getTechHeadlines();
        } else {
          newsData = await clientNewsService.getArticlesByCategory(
            selectedCategory
          );
        }

        console.log("✅ News fetched successfully:", newsData);
        setNews(newsData || []);
      } catch (error) {
        console.error("❌ Failed to fetch news:", error);
        setNewsError(error.message);
      } finally {
        setNewsLoading(false);
      }
    };

    fetchNews();
  }, [selectedCategory]);

  // Combine posts and news for the timeline
  const combinedItems = useMemo(() => {
    // Ensure posts is always an array
    const postsArray = Array.isArray(posts) ? posts : [];
    const newsArray = Array.isArray(news) ? news : [];

    const allItems = [
      ...postsArray.map((post) => ({ ...post, type: "post" })),
      ...newsArray.map((article) => ({ ...article, type: "news" })),
    ];

    // Sort by date (newest first)
    allItems.sort((a, b) => {
      const dateA = new Date(a.createdAt || a.publishedAt || 0);
      const dateB = new Date(b.createdAt || b.publishedAt || 0);
      return dateB - dateA;
    });

    return allItems;
  }, [posts, news]);

  // Handle voting
  const handleVote = async (postId, voteType) => {
    if (!isAuthenticated) {
      alert("Please login to vote");
      return;
    }

    try {
      await dispatch(votePost({ postId, voteType })).unwrap();
      console.log("✅ Vote successful");
    } catch (error) {
      console.error("❌ Vote failed:", error);
      alert("Failed to vote. Please try again.");
    }
  };

  // Handle category selection
  const handleCategorySelect = (category) => {
    console.log(`🏠 HomePage: Category selected: ${category}`);
    setSelectedCategory(category);
  };

  // Handle refresh
  const handleRefresh = async () => {
    console.log("🏠 HomePage: Refreshing data");
    try {
      await dispatch(fetchPosts()).unwrap();
      console.log("✅ Posts refreshed successfully");
    } catch (error) {
      console.error("❌ Failed to refresh posts:", error);
    }
    setSelectedCategory("All News"); // This will trigger news refetch
  };

  // Debug logging
  console.log("🏠 HomePage Debug:", {
    postsCount: Array.isArray(posts) ? posts.length : "Not array",
    postsLoading,
    postsError,
    newsCount: news.length,
    combinedItemsCount: combinedItems.length,
  });

  // Loading state
  if (postsLoading && newsLoading) {
    return <LoadingSpinner message="Loading tech community..." />;
  }

  return (
    <PageContainer>
      <div className="col-md-8">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1>Warung Teknologi</h1>
          <div className="d-flex gap-2">
            <button
              className="btn btn-outline-secondary"
              onClick={handleRefresh}
              disabled={postsLoading || newsLoading}
            >
              <i className="bi bi-arrow-clockwise me-1"></i>
              {postsLoading || newsLoading ? "Loading..." : "Refresh"}
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

        {/* Categories */}
        <div className="card mb-4">
          <div className="card-header">
            <h6 className="mb-0">
              <i className="bi bi-tags me-2"></i>
              Tech Categories
              {newsLoading && (
                <span className="spinner-border spinner-border-sm ms-2" />
              )}
            </h6>
          </div>
          <div className="card-body">
            <div className="d-flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  className={`btn btn-sm ${
                    selectedCategory === category
                      ? "btn-primary"
                      : "btn-outline-primary"
                  }`}
                  onClick={() => handleCategorySelect(category)}
                  disabled={newsLoading}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Error Messages */}
        {postsError && (
          <div className="alert alert-danger" role="alert">
            <i className="bi bi-exclamation-triangle me-2"></i>
            Failed to load posts: {postsError}
            <button
              className="btn btn-sm btn-outline-danger ms-2"
              onClick={handleRefresh}
              disabled={postsLoading}
            >
              {postsLoading ? "Retrying..." : "Retry"}
            </button>
          </div>
        )}

        {newsError && (
          <div className="alert alert-warning" role="alert">
            <i className="bi bi-exclamation-triangle me-2"></i>
            Failed to load news: {newsError}
          </div>
        )}

        {/* Combined Timeline */}
        {combinedItems.length === 0 ? (
          <div className="text-center py-5">
            <h4>No content available</h4>
            <p className="text-muted">
              {postsLoading || newsLoading
                ? "Loading content..."
                : "Be the first to share tech news, or wait for latest news to load!"}
            </p>
            {postsError && (
              <button
                className="btn btn-primary mt-3"
                onClick={handleRefresh}
                disabled={postsLoading}
              >
                {postsLoading ? "Loading..." : "Try Loading Posts Again"}
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {combinedItems.map((item) => (
              <div key={`${item.type}-${item.id}`} className="mb-3">
                {item.type === "post" ? (
                  <PostCard post={item} onVote={handleVote} />
                ) : (
                  <NewsCard article={item} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div className="col-md-4">
        <div className="card">
          <div className="card-header">
            <h6 className="mb-0">About WarTek</h6>
          </div>
          <div className="card-body">
            <p className="text-muted small">
              A unified tech community combining:
            </p>
            <ul className="list-unstyled small">
              <li>🤖 AI & Machine Learning</li>
              <li>📱 Gadgets & Hardware</li>
              <li>💻 Software Development</li>
              <li>📰 Latest Tech News</li>
              <li>🚀 Startup Updates</li>
            </ul>
          </div>
        </div>

        <div className="card mt-3">
          <div className="card-header">
            <h6 className="mb-0">Latest Tech News</h6>
          </div>
          <div className="card-body">
            <p className="text-muted small">
              News articles from NewsAPI.ai are automatically mixed with
              community posts. Import interesting articles to start discussions!
            </p>
            <p className="text-muted small">
              <strong>via NewsAPI.ai</strong>
            </p>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
