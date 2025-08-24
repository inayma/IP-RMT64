import { useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { GoogleOAuth } from "../services/googleAuth";
import { instance } from "../libs/http";

export default function GoogleSignInButton({ onSuccess, onError }) {
  const googleButtonRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("GoogleSignInButton: Initializing...");

    // Initialize Google Sign-In
    GoogleOAuth.initializeGoogleSignIn()
      .then(() => {
        console.log("GoogleSignInButton: Google API loaded successfully");
        if (googleButtonRef.current) {
          GoogleOAuth.renderSignInButton("google-signin-button");
          console.log("GoogleSignInButton: Button rendered");
        }
      })
      .catch((error) => {
        console.error(
          "GoogleSignInButton: Failed to initialize Google API",
          error
        );
      });

    // Listen for Google auth success
    const handleGoogleAuthSuccess = async (event) => {
      console.log(
        "GoogleSignInButton: Received googleAuthSuccess event",
        event.detail
      );
      const { credential, userInfo } = event.detail;

      try {
        console.log("Processing Google authentication...", userInfo);

        // Send credential to backend for verification
        const response = await instance.post("/users/google-auth", {
          credential: credential,
        });

        // Store the real token and user info
        localStorage.setItem("access_token", response.data.access_token);
        localStorage.setItem("google_user", JSON.stringify(response.data.user));

        // Dispatch auth change event
        window.dispatchEvent(new Event("authChange"));

        console.log("Google authentication successful!");

        if (onSuccess) {
          onSuccess(response.data);
        } else {
          navigate("/");
        }
      } catch (error) {
        console.error("Google authentication failed:", error);
        if (onError) {
          onError(
            error.response?.data?.message || "Google authentication failed"
          );
        }
      }
    };

    window.addEventListener("googleAuthSuccess", handleGoogleAuthSuccess);

    return () => {
      window.removeEventListener("googleAuthSuccess", handleGoogleAuthSuccess);
    };
  }, [navigate, onSuccess, onError]);

  return (
    <div>
      <div className="text-center mb-3">
        <div id="google-signin-button" ref={googleButtonRef}></div>
      </div>
      <div className="text-center mb-3">
        <small className="text-muted">- OR -</small>
      </div>
    </div>
  );
}
