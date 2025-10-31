import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProfileIcon from "../assets/icons/profile.png";
import { post } from "../api/HttpService";
import { AuthAPI } from "../api/AuthService";
import { useAuth } from "../auth/AuthContext";
import { toast } from "react-toastify";

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  const [profilePic, setProfilePic] = useState<string | null>(
    user?.profile_pic || null
  );
  const [name, setName] = useState(user?.name || "");
  const [gender, setGender] = useState(user?.gender || "");
  const email = user?.email || "";
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setProfilePic(user?.profile_pic || null);
    setName(user?.name || "");
    setGender(user?.gender || "");
  }, [user]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target) {
          setProfilePic(event.target.result as string);
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await post("/auth/update-profile", {
        name,
        gender,
        profile_pic: profilePic,
      });
      toast.success("Profile updated successfully!");
      const updatedUser = await AuthAPI.user();
      if (updatedUser) setUser(updatedUser);
    } catch (err) {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-16">
      <section className="card profile-card text-align-center">
        {/* Icon */}
        <div className="mb-4 text-align-center">
          {/* Upload Section */}
          <div className="upload-section">
            <div className="upload-container">
              <img
                src={profilePic || ProfileIcon}
                alt="Profile"
                className="profile-image"
              />
              <label className="upload-btn">
                Upload
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  hidden
                />
              </label>
            </div>
          </div>
        </div>

        {/* Title */}
        <h2 className="card-title">My Profile</h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="form-layout">
          {/* Name Field */}
          <div className="form-row">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              placeholder="Enter Full Name"
              className="form-input max-width"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Email Field (non-editable) */}
          <div className="form-row">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input max-width"
              value={email}
              readOnly
            />
          </div>

          {/* Gender Dropdown */}
          <div className="form-row">
            <label className="form-label">Gender</label>
            <select
              className="form-select full-width"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
            >
              <option value="">Select</option>
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Update Button */}
          <div className="button-container">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Profile"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default Profile;
