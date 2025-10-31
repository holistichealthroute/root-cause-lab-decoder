import React, { useState } from "react";
import Logo from "../../assets/images/logo.png";
import Background from "../../assets/images/background.png";
import googleIcon from "../../assets/icons/google.svg";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import { config } from "../../utils/config";

const Signup = () => {
  const { signup } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const togglePassword = () => setShowPassword((prev) => !prev);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      await signup(name.trim(), email.trim(), password);
      navigate("/login", {
        state: {
          type: "success",
          toastMessage: "Account created successfully! Please log in.",
        },
      });
    } catch (e: any) {
      // If you centralized error toasts in http.ts, a toast already shows.
      // This inline error is just an extra visual.
      setErr(e.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = name.trim() && email.trim() && password.length >= 6;

  return (
    <div className="auth-wrapper">
      <div className="auth-left">
        <img src={Background} alt="Background" />
      </div>

      <div className="auth-right">
        <div className="form-box">
          <div className="text-align-center">
            <img src={Logo} alt="Logo" className="logo" />
            <h2>Create an account</h2>
            <button
              className="google-btn"
              onClick={() => {
                const next = "/oauth/callback";
                window.location.href = `${
                  config.API_URL
                }/auth/google/login?next=${encodeURIComponent(next)}`;
              }}
            >
              Create account with Google{" "}
              <img
                src={googleIcon}
                alt="Google"
                style={{ width: 20, marginLeft: 8, verticalAlign: "middle" }}
              />
            </button>
            <div className="divider">Or</div>
          </div>

          <form onSubmit={onSubmit}>
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email address"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Enter your full name"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <label htmlFor="password">Password</label>
            <div className="password-input-wrapper">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                className="password-input"
                placeholder="Create your password (min 6 chars)"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <span
                className="eye-icon"
                role="button"
                tabIndex={0}
                onClick={togglePassword}
                onKeyDown={(e) =>
                  (e.key === "Enter" || e.key === " ") && togglePassword()
                }
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
            </div>

            <button
              type="submit"
              className="signup-btn"
              disabled={loading || !canSubmit}
            >
              {loading ? "Creating..." : "Create an account"}
            </button>

            {err && <p className="error">{err}</p>}
          </form>

          <p>
            Already have an account?{" "}
            <a href="/login" className="bold">
              Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
