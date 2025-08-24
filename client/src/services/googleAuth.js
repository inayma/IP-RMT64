// Google OAuth 2.0 configuration
const GOOGLE_CLIENT_ID =
  "584929634825-8j870f1f1dsv9cd2g8fj6g265b1r3b14.apps.googleusercontent.com";

// Handle different environments
const getRedirectUri = () => {
  const origin = window.location.origin;
  // For development, ensure we're using the correct localhost port
  if (origin.includes("localhost:5174") || origin.includes("127.0.0.1:5174")) {
    return `${origin}/auth/callback`;
  }
  return `${origin}/auth/callback`;
};

const REDIRECT_URI = getRedirectUri();

export class GoogleOAuth {
  static initializeGoogleSignIn() {
    console.log("GoogleOAuth: Initializing Google Sign-In");

    // Load Google API script if not already loaded
    if (!window.google) {
      console.log("GoogleOAuth: Loading Google API script");
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);

      return new Promise((resolve, reject) => {
        script.onload = () => {
          console.log("GoogleOAuth: Google API script loaded");
          GoogleOAuth.setupGoogleSignIn();
          resolve();
        };
        script.onerror = (error) => {
          console.error("GoogleOAuth: Failed to load Google API script", error);
          reject(error);
        };
      });
    } else {
      console.log("GoogleOAuth: Google API already available");
      GoogleOAuth.setupGoogleSignIn();
      return Promise.resolve();
    }
  }

  static setupGoogleSignIn() {
    console.log("GoogleOAuth: Setting up Google Sign-In");
    if (window.google && window.google.accounts) {
      console.log(
        "GoogleOAuth: Initializing with client ID:",
        GOOGLE_CLIENT_ID
      );
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: GoogleOAuth.handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });
      console.log("GoogleOAuth: Google Sign-In initialized successfully");
    } else {
      console.error("GoogleOAuth: Google API not available");
    }
  }

  static handleCredentialResponse(response) {
    // This will be called when user successfully signs in
    const credential = response.credential;

    // Decode the JWT token to get user info
    const userInfo = GoogleOAuth.parseJwt(credential);

    console.log("Google Sign-In Success:", userInfo);

    // Dispatch custom event with user data
    window.dispatchEvent(
      new CustomEvent("googleAuthSuccess", {
        detail: { credential, userInfo },
      })
    );
  }

  static parseJwt(token) {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map(function (c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error("Error parsing JWT:", error);
      return null;
    }
  }

  static renderSignInButton(elementId) {
    console.log(
      "GoogleOAuth: Rendering sign-in button for element:",
      elementId
    );
    if (window.google && window.google.accounts) {
      const element = document.getElementById(elementId);
      if (element) {
        window.google.accounts.id.renderButton(element, {
          theme: "outline",
          size: "large",
          width: "100%",
          text: "signin_with",
          shape: "rectangular",
        });
        console.log("GoogleOAuth: Sign-in button rendered successfully");
      } else {
        console.error("GoogleOAuth: Element not found:", elementId);
      }
    } else {
      console.error(
        "GoogleOAuth: Google API not available for rendering button"
      );
    }
  }

  static signOut() {
    if (window.google) {
      window.google.accounts.id.disableAutoSelect();
    }
    localStorage.removeItem("access_token");
    localStorage.removeItem("google_user");
  }

  // Alternative OAuth 2.0 flow (if you prefer the traditional approach)
  static oauthSignIn() {
    const oauth2Endpoint = "https://accounts.google.com/o/oauth2/v2/auth";

    const form = document.createElement("form");
    form.setAttribute("method", "GET");
    form.setAttribute("action", oauth2Endpoint);

    const params = {
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      response_type: "token",
      scope: "openid email profile",
      include_granted_scopes: "true",
      state: "wartek_auth_" + Math.random().toString(36).substring(2, 15),
    };

    for (const p in params) {
      const input = document.createElement("input");
      input.setAttribute("type", "hidden");
      input.setAttribute("name", p);
      input.setAttribute("value", params[p]);
      form.appendChild(input);
    }

    document.body.appendChild(form);
    form.submit();
  }
}
