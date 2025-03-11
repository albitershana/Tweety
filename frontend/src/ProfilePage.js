// ProfilePage.js
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import PostItem from "./PostItem";
import "./Posts.css";

const ProfilePage = ({ token, triggerToast }) => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [profileError, setProfileError] = useState("");
  const [userPosts, setUserPosts] = useState([]);
  const [friendRequestSent, setFriendRequestSent] = useState(false);

  useEffect(() => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    // Fetch Profile Info
    axios
      .get(`/profiles/${username}/`, { headers })
      .then((res) => setProfile(res.data))
      .catch(() => setProfileError("Error fetching profile."));

    axios
      .get(`/profiles/${username}/posts/`, { headers })
      .then((res) => {
        setUserPosts(res.data);
      })
      .catch(() => setProfileError("Error fetching user posts."));
  }, [username, token]);

  const handleSendFriendRequest = async () => {
    if (!profile) return;
    try {
      await axios.post(`/send_friend_request/${profile.user}/`);
      setFriendRequestSent(true);
      triggerToast("✅ Friend request sent!");
    } catch (error) {
      console.error("Error sending friend request:", error);
      triggerToast("❌ Failed to send friend request.");
    }
  };

  if (profileError) {
    return (
      <div className="alert alert-danger mt-3">
        {profileError}{" "}
        <button onClick={() => navigate("/")} className="btn btn-sm btn-secondary">
          Go Home
        </button>
      </div>
    );
  }

  if (!profile) {
    return <p className="mt-3 text-center">Loading profile...</p>;
  }

  return (
    <div className="container mt-4">
      <button className="btn btn-outline-secondary mb-3" onClick={() => navigate("/")}>
        ← Home
      </button>

      <div className="card p-4 mb-4 shadow">
        {profile.avatar && (
          <img
            src={`http://127.0.0.1:8000${profile.avatar}`}
            alt="avatar"
            style={{ width: "100px", height: "100px", objectFit: "cover", borderRadius: "50%" }}
            className="mb-3"
          />
        )}
        <h3 className="fw-bold">@{profile.username}</h3>
        <p className="text-muted mb-2">Email: {profile.email}</p>
        <p>{profile.bio || "No bio available."}</p>

        {!friendRequestSent && profile.user !== undefined && (
          <button className="btn btn-primary mt-2" onClick={handleSendFriendRequest}>
            Send Friend Request
          </button>
        )}
        {profile.user === undefined ? null : // fallback
          Number(profile.user) === Number(localStorage.getItem("user_id")) && (
            <button
              className="btn btn-outline-secondary mt-2 ms-2"
              onClick={() => navigate("/edit-profile")}
            >
              Edit Profile
            </button>
          )}
      </div>

      <h4 className="fw-bold mb-3">Posts by {profile.username}</h4>
      {userPosts.length === 0 ? (
        <div className="alert alert-info">No posts by this user.</div>
      ) : (
        userPosts.map((post) => (
          <PostItem key={post.id} post={post} token={token} triggerToast={triggerToast} />
        ))
      )}
    </div>
  );
};

export default ProfilePage;
