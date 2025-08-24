import { useState } from "react";
import { useNavigate, Navigate, Link } from "react-router";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { createPost } from "../redux/slices/postsSlice";
import PageContainer from "../components/PageContainer";
import Sidebar from "../components/Sidebar";

export default function CreatePostPage() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });

  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.posts);
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();

  // Navigation guard - redirect if not logged in
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Form validation
    if (!formData.title.trim() || !formData.description.trim()) {
      alert("Please fill in all fields");
      return;
    }

    if (formData.title.trim().length < 5) {
      alert("Title must be at least 5 characters long");
      return;
    }

    if (formData.description.trim().length < 20) {
      alert("Content must be at least 20 characters long");
      return;
    }

    try {
      const result = await dispatch(createPost(formData)).unwrap();
      alert("Post created successfully!");
      navigate("/");
    } catch (err) {
      console.error("Failed to create post:", err);
      // Error will be shown by the Redux error state
    }
  };

  return (
    <PageContainer>
      <div className="col-md-8">
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link to="/">Home</Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              Create Post
            </li>
          </ol>
        </nav>

        <div className="card">
          <div className="card-header">
            <h2 className="mb-0">Create New Post</h2>
          </div>
          <div className="card-body p-4">
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="title" className="form-label">
                  Title *{" "}
                  <small className="text-muted">
                    ({formData.title.length}/100)
                  </small>
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  placeholder="What's your tech news or insight?"
                  maxLength={100}
                />
                {formData.title.length > 0 && formData.title.length < 5 && (
                  <small className="text-warning">
                    Title should be at least 5 characters long
                  </small>
                )}
              </div>
              <div className="mb-3">
                <label htmlFor="description" className="form-label">
                  Content *{" "}
                  <small className="text-muted">
                    ({formData.description.length}/2000)
                  </small>
                </label>
                <textarea
                  className="form-control"
                  id="description"
                  name="description"
                  rows="10"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  placeholder="Share your thoughts, insights, or news about technology, AI, gadgets..."
                  maxLength={2000}
                />
                {formData.description.length > 0 &&
                  formData.description.length < 20 && (
                    <small className="text-warning">
                      Content should be at least 20 characters long
                    </small>
                  )}
              </div>
              <div className="d-flex gap-2">
                <button
                  type="submit"
                  className="btn btn-primary btn-lg w-100"
                  disabled={isLoading}
                >
                  {isLoading ? "Publishing..." : "Publish Post"}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => navigate("/")}
                  disabled={isLoading}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <Sidebar title="Posting Guidelines">
        <p>Make your post engaging by following these tips:</p>
        <ul>
          <li>Use a clear, descriptive title</li>
          <li>Focus on tech, AI, or gadgets</li>
          <li>Share insights or breaking news</li>
          <li>Be respectful and constructive</li>
          <li>Include sources when relevant</li>
        </ul>
        <div className="mt-3">
          <small className="text-muted">
            Your post will be visible to the entire WarTek community.
          </small>
        </div>
      </Sidebar>
    </PageContainer>
  );
}
