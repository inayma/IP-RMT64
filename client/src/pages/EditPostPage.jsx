import { useState, useEffect } from "react";
import { useParams, useNavigate, Navigate } from "react-router";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import {
  fetchPostById,
  updatePost,
  clearCurrentPost,
} from "../redux/slices/postsSlice";
import PageContainer from "../components/PageContainer";
import Sidebar from "../components/Sidebar";
import LoadingSpinner from "../components/LoadingSpinner";

export default function EditPostPage() {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });

  const dispatch = useAppDispatch();
  const {
    currentPost: post,
    isLoading,
    error,
  } = useAppSelector((state) => state.posts);
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();

  // Navigation guard - redirect if not logged in
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  useEffect(() => {
    dispatch(fetchPostById(id));

    return () => {
      dispatch(clearCurrentPost());
    };
  }, [id, dispatch]);

  useEffect(() => {
    if (post) {
      // Check if user owns this post
      if (post.userId !== user?.id) {
        alert("You can only edit your own posts");
        navigate("/");
        return;
      }

      setFormData({
        title: post.title,
        description: post.description,
      });
    }
  }, [post, user, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim()) {
      alert("Please fill in all fields");
      return;
    }

    try {
      await dispatch(
        updatePost({
          postId: post.id,
          postData: formData,
        })
      ).unwrap();

      alert("Post updated successfully!");
      navigate(`/posts/${post.id}`);
    } catch (error) {
      console.error("Update failed:", error);
      alert(error.message || "Failed to update post");
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading post..." />;
  }

  if (error || !post) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger" role="alert">
          {error || "Post not found"}
        </div>
      </div>
    );
  }

  return (
    <PageContainer>
      <div className="col-md-8">
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <a href="/">Home</a>
            </li>
            <li className="breadcrumb-item">
              <a href={`/posts/${post.id}`}>{post.title}</a>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              Edit
            </li>
          </ol>
        </nav>

        <div className="card">
          <div className="card-header">
            <h2>Edit Post</h2>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="title" className="form-label">
                  Title *
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter post title"
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="description" className="form-label">
                  Content *
                </label>
                <textarea
                  className="form-control"
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Share your tech news or insights..."
                  rows={10}
                  required
                />
              </div>

              <div className="d-flex gap-2">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? "Updating..." : "Update Post"}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => navigate(`/posts/${post.id}`)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <Sidebar title="Edit Guidelines">
        <ul>
          <li>Keep titles clear and descriptive</li>
          <li>Provide accurate tech information</li>
          <li>Include sources when possible</li>
          <li>Use proper formatting for readability</li>
        </ul>
      </Sidebar>
    </PageContainer>
  );
}
