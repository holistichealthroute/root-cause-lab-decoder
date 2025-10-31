import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";

import Logo from "../../assets/images/logo.png";
import Background from "../../assets/images/background.png";
import { AuthAPI } from "../../api/AuthService";

type ForgotResponse = {
  ok?: boolean;
  message?: string;
  detail?: string;
};

const ForgetPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = email.trim();
    if (!value) {
      toast.error("Please enter your email.");
      return;
    }

    setLoading(true);
    try {
      const res = (await AuthAPI.forgotPassword(value)) as
        | ForgotResponse
        | undefined;

      if (res?.ok) {
        navigate("/login", {
          state: {
            type: "success",
            toastMessage: `Reset link sent to ${value}. Check your inbox & spam.`,
          },
        });
      } else {
        const msg =
          res?.message ||
          res?.detail ||
          "Could not send reset link. Please try again.";
        toast.error(msg);
      }
    } catch (err: any) {
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
            <h2>Forgot Password</h2>
            <p>Enter your registered email to get a reset password link</p>
          </div>

          <form onSubmit={onSubmit}>
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />

            <button
              type="submit"
              className="signup-btn"
              disabled={loading || !email.trim()}
            >
              {loading ? "Sending..." : "Continue"}
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

export default ForgetPassword;
