import { useCallback, useEffect, useRef, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import axios from "../axios";
import { useAuth } from "../Context/AuthContext";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const GOOGLE_SCRIPT_SELECTOR = "script[data-google-identity]";

const loadGoogleIdentity = (timeoutMs = 8000) => new Promise((resolve, reject) => {
  if (window.google?.accounts?.id) {
    resolve(window.google.accounts.id);
    return;
  }

  const existingScript = document.querySelector(GOOGLE_SCRIPT_SELECTOR);
  const script = existingScript || document.createElement("script");
  let intervalId;
  let timeoutId;
  let settled = false;
  const finish = (callback, value) => {
    if (settled) return;
    settled = true;
    window.clearInterval(intervalId);
    window.clearTimeout(timeoutId);
    script.removeEventListener("load", onLoad);
    script.removeEventListener("error", onError);
    callback(value);
  };
  const checkReady = () => {
    if (window.google?.accounts?.id) finish(resolve, window.google.accounts.id);
  };
  const onLoad = () => checkReady();
  const onError = () => finish(reject, new Error("Google Identity Services failed to load"));
  script.addEventListener("load", onLoad, { once: true });
  script.addEventListener("error", onError, { once: true });
  if (!existingScript) {
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.dataset.googleIdentity = "true";
    document.head.appendChild(script);
  }
  checkReady();
  intervalId = window.setInterval(checkReady, 50);
  timeoutId = window.setTimeout(() => finish(reject, new Error("Google Identity Services timed out")), timeoutMs);
});

const Login = () => {
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const buttonRef = useRef(null);
  const renderedRef = useRef(false);
  const mountedRef = useRef(false);
  const [error, setError] = useState("");
  const [scriptLoading, setScriptLoading] = useState(true);

  const renderGoogleButton = useCallback(async () => {
    if (!buttonRef.current || renderedRef.current || !GOOGLE_CLIENT_ID) {
      if (!GOOGLE_CLIENT_ID) {
        setError("Google Sign-In is not configured for this environment.");
        setScriptLoading(false);
      }
      return;
    }

    setScriptLoading(true);
    setError("");
    try {
      const googleId = await loadGoogleIdentity();
      if (!mountedRef.current || !buttonRef.current || renderedRef.current) return;
      buttonRef.current.replaceChildren();
      googleId.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response) => {
          setError("");
          try {
            const authResponse = await axios.post("/auth/google", { token: response.credential });
            await login(authResponse.data);
            navigate(location.state?.from?.pathname || "/", { replace: true });
          } catch (authError) {
            console.error("Google authentication failed:", authError);
            setError("Google sign-in failed. Please try again.");
          }
        },
      });
      googleId.renderButton(buttonRef.current, {
        theme: "outline",
        size: "large",
        text: "signin_with",
        shape: "rectangular",
        width: 280,
      });
      renderedRef.current = true;
      setScriptLoading(false);
    } catch (loadError) {
      console.error("Google Identity Services failed to load:", loadError);
      setError("Google Sign-In could not load. Check your connection and try again.");
    } finally {
      setScriptLoading(false);
    }
  }, [location.state, login, navigate]);

  useEffect(() => {
    if (loading || user) return undefined;
    mountedRef.current = true;
    renderedRef.current = false;
    renderGoogleButton();
    return () => {
      mountedRef.current = false;
      renderedRef.current = false;
    };
  }, [loading, renderGoogleButton, user]);

  if (loading) return <div className="min-vh-100 d-flex align-items-center justify-content-center">Loading...</div>;
  if (user) return <Navigate to="/" replace />;

  return (
    <main className="login-page">
      <section className="login-layout">
        <div className="login-brand-panel">
          <div className="login-brand-mark"><i className="bi bi-bag-heart-fill" /> <strong>SmartCart</strong></div>
          <div className="eyebrow mb-3">Warm, intelligent commerce</div>
          <h1 className="login-display-title">Find what fits your life.</h1>
          <p className="lead">Discover thoughtful products across electronics, gadgets, home, fashion, and more—with a little help from AI.</p>
          <div className="login-product-collage" aria-hidden="true">
            <div className="login-collage-card login-collage-main"><i className="bi bi-laptop" /><span>Tech that works for you</span></div>
            <div className="login-collage-card"><i className="bi bi-headphones" /><span>Everyday favorites</span></div>
            <div className="login-collage-card"><i className="bi bi-house-heart" /><span>Make home yours</span></div>
          </div>
          <div className="login-benefits">
            <span><i className="bi bi-stars" /> Discover intelligently</span>
            <span><i className="bi bi-grid" /> Shop every category</span>
            <span><i className="bi bi-chat-heart" /> Ask your AI companion</span>
          </div>
        </div>
        <section className="login-card" aria-labelledby="login-heading">
          <div className="login-card-icon"><i className="bi bi-person-heart" /></div>
          <div className="eyebrow mb-2">Welcome in</div>
          <h2 id="login-heading">Welcome to SmartCart</h2>
          <p>Continue with your Google account to start discovering products made for everyday life.</p>
          <div ref={buttonRef} className="google-login-button" aria-label="Continue with Google" />
          {scriptLoading && <p className="small text-muted mt-3 mb-0"><span className="spinner-border spinner-border-sm me-2" />Preparing secure sign-in...</p>}
          {error && <div className="alert alert-danger mt-3 mb-0" role="alert">{error}<button type="button" className="btn btn-link p-0 ms-2" onClick={() => { renderedRef.current = false; renderGoogleButton(); }}>Retry</button></div>}
          <p className="login-security"><i className="bi bi-shield-check me-1" /> Secure sign-in powered by Google. We never see your password.</p>
        </section>
      </section>
    </main>
  );
};

export default Login;
