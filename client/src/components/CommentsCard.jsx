import { useState, useEffect } from "react";
import { useAppSelector } from "../redux/hooks";

export default function CommentsCard({ postId, onCommentCountChange }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Notify parent component about comment count changes
    if (onCommentCountChange) {
      onCommentCountChange(comments.length);
    }
  }, [comments.length, onCommentCountChange]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsLoading(true);
    try {
      // For now, we'll add comments locally since we don't have backend comments yet
      const comment = {
        id: Date.now(),
        content: newComment,
        author: user?.username || "Anonymous",
        createdAt: new Date().toISOString(),
        userId: user?.id,
      };

      setComments([...comments, comment]);
      setNewComment("");
    } catch (error) {
      console.error("Failed to add comment:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card mt-4">
      <div className="card-header">
        <h5 className="mb-0">
          <i className="bi bi-chat-dots me-2"></i>
          Comments ({comments.length})
        </h5>
      </div>
      <div className="card-body">
        {/* Comment Form */}
        {isAuthenticated ? (
          <form onSubmit={handleSubmitComment} className="mb-4">
            <div className="mb-3">
              <label htmlFor="comment" className="form-label">
                Add a comment
              </label>
              <textarea
                className="form-control"
                id="comment"
                rows="3"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts..."
                disabled={isLoading}
              />
            </div>
            <div className="d-flex justify-content-end">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isLoading || !newComment.trim()}
              >
                {isLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Posting...
                  </>
                ) : (
                  <>
                    <i className="bi bi-send me-2"></i>
                    Post Comment
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="alert alert-info mb-4">
            <i className="bi bi-info-circle me-2"></i>
            <a href="/login" className="alert-link">
              Login
            </a>{" "}
            to join the discussion
          </div>
        )}

        {/* Comments List */}
        {comments.length === 0 ? (
          <div className="text-center text-muted py-4">
            <i className="bi bi-chat-dots fs-1 opacity-25"></i>
            <p className="mt-3 mb-0">
              No comments yet. Be the first to share your thoughts!
            </p>
          </div>
        ) : (
          <div className="comments-list">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="comment-item border-bottom pb-3 mb-3"
              >
                <div className="d-flex align-items-start">
                  <div className="flex-shrink-0">
                    <div
                      className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center"
                      style={{ width: "40px", height: "40px" }}
                    >
                      {comment.author.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div className="flex-grow-1 ms-3">
                    <div className="d-flex align-items-center mb-1">
                      <strong className="me-2">{comment.author}</strong>
                      <small className="text-muted">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </small>
                    </div>
                    <p className="mb-0">{comment.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
