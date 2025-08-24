import { Link, useNavigate } from "react-router";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { setAuthFromStorage, logoutUser } from "../redux/slices/authSlice";
import { GoogleOAuth } from "../services/googleAuth";

export default function Navbar() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    const checkLoginState = () => {
      dispatch(setAuthFromStorage());
    };

    checkLoginState();

    // Listen for storage changes (when user logs in/out in another tab)
    window.addEventListener("storage", checkLoginState);

    // Listen for custom events when login state changes in same tab
    window.addEventListener("authChange", checkLoginState);

    return () => {
      window.removeEventListener("storage", checkLoginState);
      window.removeEventListener("authChange", checkLoginState);
    };
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logoutUser());
    GoogleOAuth.signOut();
    navigate("/");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">
          WarTek
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/">
                <i className="bi bi-house me-1"></i>
                Home
              </Link>
            </li>
            {isAuthenticated && (
              <li className="nav-item">
                <Link className="nav-link" to="/create-post">
                  <i className="bi bi-plus-circle me-1"></i>
                  Create Post
                </Link>
              </li>
            )}
          </ul>

          <ul className="navbar-nav">
            {isAuthenticated ? (
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle d-flex align-items-center"
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
                >
                  {user?.picture && (
                    <img
                      src={user.picture}
                      alt="Profile"
                      className="rounded-circle me-2"
                      width="30"
                      height="30"
                    />
                  )}
                  {user?.name || "User"}
                </a>
                <ul className="dropdown-menu">
                  <li>
                    <button className="dropdown-item" onClick={handleLogout}>
                      Logout
                    </button>
                  </li>
                </ul>
              </li>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">
                    Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/register">
                    Register
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
