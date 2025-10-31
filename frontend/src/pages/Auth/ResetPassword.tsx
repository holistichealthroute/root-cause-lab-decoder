import React, { useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { toast } from "react-toastify";

import Logo from "../../assets/images/logo.png";
import Background from "../../assets/images/background.png";
import { AuthAPI } from "../../api/AuthService";

const ResetPassword = () => {
  const navigate = useNavigate();

  const token = useMemo(
    () => new URLSearchParams(window.location.search).get("token") || "",
    []
  );

  const [showPassword, setShowPassword] = useState(false);
  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");
  const [loading, setLoading] = useState(false);
  const confirmRef = useRef<HTMLInputElement>(null);

  const togglePassword = () => setShowPassword((prev) => !prev);

  const tooShort = pw1.length > 0 && pw1.length < 6;
  const mismatch = pw2.length > 0 && pw1 !== pw2;

  const validateMatch = (a: string, b: string) => {
    const el = confirmRef.current;
    if (!el) return;
    if (!b) el.setCustomValidity("");
    else if (a !== b) el.setCustomValidity("Passwords do not match.");
    else el.setCustomValidity("");
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) return toast.error("Invalid or missing reset token.");
    if (pw1.length < 6)
      return toast.error("Password must be at least 6 characters.");
    if (pw1 !== pw2) {
      toast.error("Passwords do not match.");
      confirmRef.current?.focus();
      return;
    }

    setLoading(true);
    try {
      const res = await AuthAPI.resetPassword({ token, new_password: pw1 });
      if (res?.ok) {
        toast.success("Password updated. Please log in.");
        navigate("/login");
      } else {
        const msg =
          (res as any)?.message ||
          (res as any)?.detail ||
          "Could not reset password. Please try again.";
        toast.error(msg);
      }
    } catch (err: any) {
      const msg =
        err?.data?.detail ||
        err?.data?.message ||
        err?.message ||
        "Reset failed. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const disabled =
    loading || !token || !pw1 || !pw2 || pw1.length < 6 || pw1 !== pw2;

  const wrapperStyle: React.CSSProperties = { position: "relative" };
  const errorIconWrapStyle: React.CSSProperties = {
    position: "absolute",
    right: 42,
    top: "50%",
    transform: "translateY(-50%)",
    pointerEvents: "none",
  };
  const errorInputStyle = (isError: boolean): React.CSSProperties =>
    isError ? { borderColor: "#DC2626", outlineColor: "#DC2626" } : {};

  return (
    <div className="auth-wrapper">
      <div className="auth-left">
        <img src={Background} alt="Background" />
      </div>

      <div className="auth-right">
        <div className="form-box">
          <div className="text-align-center">
            <img src={Logo} alt="Logo" className="logo" />
            <h2>Reset Password</h2>
          </div>

          <form onSubmit={onSubmit}>
            <label htmlFor="pw1">Enter new Password</label>
            <div className="password-input-wrapper" style={wrapperStyle}>
              <input
                id="pw1"
                name="pw1"
                type={showPassword ? "text" : "password"}
                className="password-input"
                placeholder="Enter new password"
                autoComplete="new-password"
                value={pw1}
                onChange={(e) => {
                  const v = e.target.value;
                  setPw1(v);
                  validateMatch(v, pw2);
                }}
                required
                minLength={6}
                aria-invalid={tooShort}
                style={errorInputStyle(tooShort)}
              />
              {tooShort && (
                <span
                  style={errorIconWrapStyle}
                  title="Password must be at least 6 characters."
                >
                  <AlertCircle
                    size={18}
                    aria-hidden="true"
                    style={{ color: "#DC2626" }}
                  />
                </span>
              )}
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

            <label htmlFor="pw2">Confirm Password</label>
            <div className="password-input-wrapper" style={wrapperStyle}>
              <input
                id="pw2"
                name="pw2"
                type={showPassword ? "text" : "password"}
                className="password-input"
                placeholder="Re-enter password"
                autoComplete="new-password"
                value={pw2}
                onChange={(e) => {
                  const v = e.target.value;
                  setPw2(v);
                  validateMatch(pw1, v);
                }}
                required
                minLength={6}
                aria-invalid={mismatch}
                style={errorInputStyle(mismatch)}
                ref={confirmRef}
              />
              {mismatch && (
                <span
                  style={errorIconWrapStyle}
                  title="Passwords do not match."
                >
                  <AlertCircle
                    size={18}
                    aria-hidden="true"
                    style={{ color: "#DC2626" }}
                  />
                </span>
              )}
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

            {mismatch && (
              <div style={{ color: "#DC2626", fontSize: 12, marginTop: 6 }}>
                Passwords do not match.
              </div>
            )}

            <button type="submit" className="signup-btn" disabled={disabled}>
              {loading ? "Saving..." : "Reset Password"}
            </button>
          </form>

          <p>
            Back to{" "}
            <Link to="/login" className="bold">
              LogIn
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
