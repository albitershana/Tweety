// EditProfile.js
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function EditProfile({ token, triggerToast }) {
  const navigate = useNavigate();

  const [bio, setBio] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setErrorMsg("User not authenticated!");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    if (bio) formData.append("bio", bio);
    if (avatarFile) formData.append("avatar", avatarFile);

    try {
      await axios.patch("/profiles/update/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (triggerToast) triggerToast("✅ Profile updated!");
      navigate(`/profile/${localStorage.getItem("username")}`);
    } catch (err) {
      console.error("Error updating profile:", err);
      setErrorMsg("❌ Could not update profile.");
    }
    setLoading(false);
  };

  return (
    <div className="container mt-4">
      <button className="btn btn-outline-secondary mb-3" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className="card p-4 shadow" style={{ maxWidth: "500px", margin: "0 auto" }}>
        <h2>Edit Your Profile</h2>
        {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-semibold">Bio</label>
            <textarea
              className="form-control"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself"
            />
          </div>
          <div className="mb-3">
            <label className="form-label fw-semibold">Profile Picture</label>
            <input
              type="file"
              className="form-control"
              onChange={(e) => setAvatarFile(e.target.files[0])}
            />
          </div>

          <button className="btn btn-primary w-100" type="submit" disabled={loading}>
            {loading ? "Updating..." : "Update Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditProfile;
