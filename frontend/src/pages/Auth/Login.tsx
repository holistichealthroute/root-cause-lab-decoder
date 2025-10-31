import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Logo from "../../assets/images/logo.png";
import Background from "../../assets/images/background.png";
import googleIcon from "../../assets/icons/google.svg";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../auth/AuthContext";
import { toast } from "react-toastify";
import { config } from "../../utils/config";
import { getToken } from "../../api/HttpService";

const Login = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const togglePassword = () => setShowPassword((prev) => !prev);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (getToken()) {
      navigate("/dashboard");
    }
    if (user) {
      if (user.is_admin === 1) {
        navigate("/admin/dashboard");
      } else {
        navigate("/dashboard");
      }
    }
  }, [navigate, user]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      var response = await login(email.trim(), password);
      if (response.user?.is_admin === 1) {
        navigate("/admin/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-left">
        <img src={Background} alt="Background" />
      </div>

      <div className="auth-right">
        <div className="form-box">
          <div className="text-align-center">
            <img src={Logo} alt="Logo" className="logo" />
            <h2>Welcome Back 👋</h2>
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

            <label htmlFor="password">Password</label>
            <div className="password-input-wrapper">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                className="password-input"
                placeholder="Enter your password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
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

            <div className="form-link text-right">
              <Link to="/forgot-password" className="text-red">
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              className="signup-btn"
              disabled={loading || !email || !password}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
            {err && <p className="error">{err}</p>}
          </form>

          <p>
            Don't have an account?{" "}
            <a href="/signup" className="bold">
              Sign Up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
