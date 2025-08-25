import { Link } from "react-router";
import AIBriefSummary from "./AIBriefSummary";

export default function PostCard({ post, onVote }) {
  const handleUpvote = () => onVote(post.id, "up");
  const handleDownvote = () => onVote(post.id, "down");

  return (
    <div className="card mb-3">
      <div className="card-body">
        <div className="row">
          <div className="col-2 text-center">
            {/* Thumbs Up Button */}
            <button
              className="btn btn-outline-success w-100 mb-2 py-2"
              onClick={handleUpvote}
              title="Thumbs up - Like this post"
              style={{ fontSize: "1.2rem" }}
            >
              👍
            </button>

            {/* Vote Score Display */}
            <div className="my-3 p-2 bg-light rounded">
              <div
                className="fw-bold fs-4 text-center"
                style={{ color: post.votes >= 0 ? "#198754" : "#dc3545" }}
              >
                {post.votes >= 0 ? "+" : ""}
                {post.votes || 0}
              </div>
              <div className="small text-muted text-center">votes</div>
            </div>

            {/* Thumbs Down Button */}
            <button
              className="btn btn-outline-danger w-100 py-2"
              onClick={handleDownvote}
              title="Thumbs down - Dislike this post"
              style={{ fontSize: "1.2rem" }}
            >
              👎
            </button>

            {/* Vote Breakdown */}
            <div className="mt-3 small">
              <div className="text-success">👍 {post.upvotes || 0}</div>
              <div className="text-danger">👎 {post.downvotes || 0}</div>
            </div>
          </div>

          <div className="col-10">
            <h5 className="card-title">
              <Link to={`/posts/${post.id}`} className="text-decoration-none">
                {post.title}
              </Link>
            </h5>
            {post.summary && (
              <AIBriefSummary summary={post.summary} isDetailView={false} />
            )}
            <p className="card-text">
              {post.description.length > 200
                ? `${post.description.substring(0, 200)}...`
                : post.description}
            </p>
            <div className="d-flex justify-content-between align-items-center">
              <small className="text-muted">
                by <strong>{post.User?.username || "Anonymous"}</strong> •{" "}
                {new Date(post.createdAt).toLocaleDateString()}
              </small>
              <Link
                to={`/posts/${post.id}`}
                className="btn btn-sm btn-outline-primary"
              >
                Read More <i className="bi bi-arrow-right"></i>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
