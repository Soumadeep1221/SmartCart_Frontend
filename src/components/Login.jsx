import { useEffect, useRef, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import axios from "../axios";
import { useAuth } from "../Context/AuthContext";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const Login = () => {
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const buttonRef = useRef(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user || !buttonRef.current) return undefined;

    const handleCredential = async (response) => {
      setError("");
      try {
        const authResponse = await axios.post("/auth/google", { token: response.credential });
        login(authResponse.data);
        navigate(location.state?.from?.pathname || "/", { replace: true });
      } catch {
        setError("Google sign-in failed. Please try again.");
      }
    };

    const renderButton = () => {
      if (!window.google?.accounts?.id || !buttonRef.current) return;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredential,
      });
      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: "outline",
        size: "large",
        text: "signin_with",
        shape: "rectangular",
        width: 280,
      });
    };

    if (window.google?.accounts?.id) {
      renderButton();
      return undefined;
    }

    const existingScript = document.querySelector("script[data-google-identity]");
    const script = existingScript || document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.dataset.googleIdentity = "true";
    script.addEventListener("load", renderButton);
    if (!existingScript) document.head.appendChild(script);

    return () => script.removeEventListener("load", renderButton);
  }, [location.state, login, navigate, user]);

  if (loading) {
    return <div className="min-vh-100 d-flex align-items-center justify-content-center">Loading...</div>;
  }

  if (user) return <Navigate to="/" replace />;

  return (
    <main className="login-page">
      <section className="login-card">
        <h1>Welcome back</h1>
        <p>Sign in to continue to Soumadeep&apos;s Corner.</p>
        <div ref={buttonRef} className="google-login-button" />
        {error && <div className="alert alert-danger mt-3 mb-0">{error}</div>}
      </section>
    </main>
  );
};

export default Login;
