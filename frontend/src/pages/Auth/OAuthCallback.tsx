import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { config } from "../../utils/config";

const OAuthCallback = () => {
  const navigate = useNavigate();
  const { setAuthData } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");
    const token_type = params.get("token_type");
    const email = params.get("email");
    const name = params.get("name");
    const id = params.get("id");
    const is_admin = params.get("is_admin");

    if (!access_token || !email || !name || !id) {
      navigate("/login");
      return;
    }

    const user = {
      email,
      name,
      id,
      is_admin: Number(is_admin) || 0,
      gender: "", // default value for required field
    };

    setAuthData({
      access_token: access_token || "",
      refresh_token: refresh_token || "",
      token_type: token_type || "bearer",
      user,
    });

    if (user.is_admin === 1) {
      navigate("/admin/dashboard");
    } else {
      navigate("/dashboard");
    }
  }, [navigate, setAuthData]);

  return <div>Logging you in...</div>;
};

export default OAuthCallback;
