import { useState, useEffect } from "react";
import { Link, useNavigate, Navigate } from "react-router";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { registerUser, clearError } from "../redux/slices/authSlice";
import GoogleSignInButton from "../components/GoogleSignInButton";
import PageContainer from "../components/PageContainer";
import Sidebar from "../components/Sidebar";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useAppDispatch();
  const { isLoading, error, isAuthenticated } = useAppSelector(
    (state) => state.auth
  );
  const navigate = useNavigate();

  // Navigation guard - redirect if already logged in
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  async function handleRegister(event) {
    event.preventDefault();

    try {
      const result = await dispatch(registerUser(formData));
      if (registerUser.fulfilled.match(result)) {
        navigate("/login");
      }
    } catch (err) {
      // Error is handled by Redux
      console.error("Registration error:", err);
    }
  }

  return (
    <PageContainer>
      <div className="col-lg-9">
        <div className="d-flex justify-content-center">
          <div
            className="card shadow"
            style={{ maxWidth: "400px", width: "100%" }}
          >
            <div className="card-body p-4">
              <h2 className="card-title text-center mb-4">Join WarTek</h2>

              {error && (
                <div
                  className="alert alert-danger alert-dismissible fade show"
                  role="alert"
                >
                  {error}
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Close"
                    onClick={() => dispatch(clearError())}
                  ></button>
                </div>
              )}

              <div className="mb-3">
                <GoogleSignInButton
                  onSuccess={() => navigate("/")}
                  onError={(err) => console.error("Google auth error:", err)}
                />
              </div>

              <div className="text-center mb-3">
                <span className="text-muted">or create account with email</span>
              </div>

              <form onSubmit={handleRegister}>
                <div className="mb-3">
                  <label htmlFor="username" className="form-label">
                    Username
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Email
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <div className="input-group">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="form-control"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      minLength="6"
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                <div className="d-grid mb-3">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Creating account...
                      </>
                    ) : (
                      "Register"
                    )}
                  </button>
                </div>
              </form>

              <div className="text-center mt-3">
                <span className="text-muted">Already have an account? </span>
                <Link to="/login" className="text-decoration-none">
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
