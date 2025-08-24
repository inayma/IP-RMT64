import { useState, useEffect } from "react";
import { Link, useNavigate, Navigate } from "react-router";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { loginUser, clearError } from "../redux/slices/authSlice";
import GoogleSignInButton from "../components/GoogleSignInButton";
import PageContainer from "../components/PageContainer";
import Sidebar from "../components/Sidebar";

export default function LoginPage() {
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
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

  async function handleLogin(event) {
    event.preventDefault();

    try {
      const result = await dispatch(loginUser({ emailOrUsername, password }));
      if (loginUser.fulfilled.match(result)) {
        navigate("/");
      }
    } catch (err) {
      // Error is handled by Redux
      console.error("Login error:", err);
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
              <h2 className="card-title text-center mb-4">Sign In</h2>

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
                <span className="text-muted">
                  or sign in with email/username
                </span>
              </div>

              <form onSubmit={handleLogin}>
                <div className="mb-3">
                  <label htmlFor="emailOrUsername" className="form-label">
                    Email or Username
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="emailOrUsername"
                    name="emailOrUsername"
                    value={emailOrUsername}
                    onChange={(event) => setEmailOrUsername(event.target.value)}
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
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      required
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
                        Signing in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </button>
                </div>
              </form>

              <div className="text-center mt-3">
                <span className="text-muted">Don't have an account? </span>
                <Link to="/register" className="text-decoration-none">
                  Create one
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
