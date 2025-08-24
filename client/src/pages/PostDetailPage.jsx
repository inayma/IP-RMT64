import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import {
  fetchPostById,
  votePost,
  clearCurrentPost,
  deletePost,
} from "../redux/slices/postsSlice";
import PageContainer from "../components/PageContainer";
import LoadingSpinner from "../components/LoadingSpinner";
import AIAnalysisTabs from "../components/AIAnalysisTabs";
import CommentsCard from "../components/CommentsCard";

export default function PostDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [commentCount, setCommentCount] = useState(0);

  const dispatch = useAppDispatch();
  const {
    currentPost: post,
    isLoading,
    error,
  } = useAppSelector((state) => state.posts);
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchPostById(id));

    // Clean up when component unmounts
    return () => {
      dispatch(clearCurrentPost());
    };
  }, [id, dispatch]);

  const handleVote = async (voteType) => {
    if (!isAuthenticated) {
      alert("Please login to vote");
      return;
    }

    try {
      await dispatch(votePost({ postId: id, voteType }));
    } catch (error) {
      console.error("Vote failed:", error);
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete this post? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await dispatch(deletePost(id)).unwrap();
      alert("Post deleted successfully!");
      navigate("/");
    } catch (error) {
      console.error("Delete failed:", error);
      alert(error.message || "Failed to delete post");
    }
  };

  // Check if current user owns this post
  const isOwner = user && post && post.userId === user.id;

  if (isLoading) {
    return <LoadingSpinner message="Loading post..." />;
  }

  if (error || !post) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger" role="alert">
          {error || "Post not found"}
        </div>
        <Link to="/" className="btn btn-primary">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <PageContainer>
      <div className="col-lg-12">
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link to="/">Home</Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              {post.title}
            </li>
          </ol>
        </nav>

        <div className="card">
          <div className="card-body">
            {/* Post Header */}
            <div className="mb-4">
              <h1 className="h2 mb-3">{post.title}</h1>

              {/* Post Meta Information */}
              <div className="d-flex align-items-center text-muted mb-3">
                <div className="me-4">
                  <i className="bi bi-person-circle me-1"></i>
                  <strong>{post.User?.username || "Anonymous"}</strong>
                </div>
                <div className="me-4">
                  <i className="bi bi-calendar me-1"></i>
                  {new Date(post.createdAt).toLocaleDateString()}
                </div>
                <div>
                  <i className="bi bi-chat-dots me-1"></i>
                  {commentCount} comments
                </div>
              </div>

              {/* Voting Section - Positioned logically after title */}
              <div className="d-flex align-items-center mb-4">
                <div className="me-3">
                  <button
                    className={`btn btn-sm me-2 ${
                      post.userVote === "up"
                        ? "btn-success"
                        : "btn-outline-success"
                    }`}
                    onClick={() => handleVote("up")}
                    disabled={!isAuthenticated}
                    title="Thumbs up - Like this post"
                    style={{ fontSize: "1.1rem" }}
                  >
                    👍
                  </button>

                  <button
                    className={`btn btn-sm ${
                      post.userVote === "down"
                        ? "btn-danger"
                        : "btn-outline-danger"
                    }`}
                    onClick={() => handleVote("down")}
                    disabled={!isAuthenticated}
                    title="Thumbs down - Dislike this post"
                    style={{ fontSize: "1.1rem" }}
                  >
                    👎
                  </button>
                </div>

                <div className="text-muted">
                  <span
                    className="fw-bold me-2"
                    style={{ color: post.votes >= 0 ? "#198754" : "#dc3545" }}
                  >
                    {post.votes >= 0 ? "+" : ""}
                    {post.votes || 0} votes
                  </span>
                  <span className="small">
                    (👍 {post.upvotes || 0}, 👎 {post.downvotes || 0})
                  </span>
                </div>
              </div>

              {/* Post URL if it exists */}
              {post.url && (
                <div className="mb-3">
                  <a
                    href={post.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline-primary btn-sm"
                  >
                    <i className="bi bi-link-45deg me-1"></i>
                    Visit Source
                  </a>
                </div>
              )}

              {/* Owner Actions */}
              {isAuthenticated && user && user.id === post.userId && (
                <div className="d-flex gap-2 mb-3">
                  <Link
                    to={`/posts/${post.id}/edit`}
                    className="btn btn-sm btn-outline-primary"
                  >
                    <i className="bi bi-pencil me-1"></i>
                    Edit
                  </Link>
                  <button
                    onClick={handleDelete}
                    className="btn btn-sm btn-outline-danger"
                  >
                    <i className="bi bi-trash me-1"></i>
                    Delete
                  </button>
                </div>
              )}
            </div>

            {/* Post Content */}
            <div className="mb-4">
              {post.summary && (
                <div className="alert alert-info mb-3">
                  <strong>AI Summary:</strong> {post.summary}
                </div>
              )}

              {/* AI Analysis Section - Before article content */}
              <div className="mb-4">
                <AIAnalysisTabs
                  postId={post.id}
                  postTitle={post.title}
                  postContent={post.description}
                />
              </div>

              <div
                className="post-content"
                style={{ whiteSpace: "pre-wrap", lineHeight: "1.6" }}
              >
                {post.description
                  ? post.description
                      .split("\n")
                      .map((paragraph, index) => <p key={index}>{paragraph}</p>)
                  : post.content}
              </div>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <CommentsCard postId={post.id} onCommentCountChange={setCommentCount} />
      </div>
    </PageContainer>
  );
}
