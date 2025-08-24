import { useEffect } from "react";
import { useNavigate } from "react-router";
import LoadingSpinner from "../components/LoadingSpinner";

export default function AuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Handle OAuth 2.0 callback (if using the alternative flow)
    const handleCallback = () => {
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);

      const accessToken = params.get("access_token");
      const error = params.get("error");

      if (error) {
        console.error("OAuth error:", error);
        navigate("/login?error=oauth_failed");
        return;
      }

      if (accessToken) {
        // Store the Google access token
        localStorage.setItem("google_access_token", accessToken);

        // You can now use this token to get user info from Google API
        fetchGoogleUserInfo(accessToken);
      } else {
        navigate("/login");
      }
    };

    const fetchGoogleUserInfo = async (token) => {
      try {
        const response = await fetch(
          `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${token}`
        );
        const userInfo = await response.json();

        // Send user info to your backend for registration/login
        const backendResponse = await fetch("/api/users/google-auth", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            googleToken: token,
            email: userInfo.email,
            username: userInfo.name,
            picture: userInfo.picture,
          }),
        });

        const data = await backendResponse.json();

        if (data.access_token) {
          localStorage.setItem("access_token", data.access_token);
          localStorage.setItem("google_user", JSON.stringify(userInfo));
          navigate("/");
        } else {
          navigate("/login?error=auth_failed");
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
        navigate("/login?error=auth_failed");
      }
    };

    handleCallback();
  }, [navigate]);

  return <LoadingSpinner message="Completing authentication..." />;
}
