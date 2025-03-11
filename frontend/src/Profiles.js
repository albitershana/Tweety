
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

function Profiles({ token }) {
  const [profiles, setProfiles] = useState([]);
  const [friendRequests, setFriendRequests] = useState({});
  const [friends, setFriends] = useState([]);
  const navigate = useNavigate();

  const fetchAllProfiles = useCallback(async () => {
    if (!token) {
      console.error("🚨 No authentication token found.");
      return;
    }

    try {
      let allProfiles = [];
      let nextPage = "http://127.0.0.1:8000/api/profiles/?limit=100"; // Fetch first page

      while (nextPage) {
        const res = await axios.get(nextPage, {
          headers: { Authorization: `Bearer ${token}` },
        });
        allProfiles = [...allProfiles, ...res.data.results]; // Append profiles
        nextPage = res.data.next || null; // Get next page URL
      }

      setProfiles(allProfiles);
    } catch (err) {
      console.error("🚨 Error fetching profiles:", err);
    }
  }, [token]);

  const fetchFriends = useCallback(async () => {
    if (!token) {
      console.error("🚨 No authentication token found.");
      return;
    }

    try {
      const res = await axios.get("http://127.0.0.1:8000/api/friends/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFriends(res.data.results || res.data || []);
    } catch (err) {
      console.error("🚨 Error fetching friends:", err);
    }
  }, [token]);

  const fetchFriendRequests = useCallback(async () => {
    if (!token) {
      console.error("🚨 No authentication token found.");
      return;
    }

    try {
      const res = await axios.get("http://127.0.0.1:8000/api/friend-requests/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const requestStatus = {};
      (Array.isArray(res.data) ? res.data : []).forEach((req) => {
        requestStatus[req.receiver] = req.status;
      });

      setFriendRequests(requestStatus);
    } catch (err) {
      console.error("🚨 Error fetching friend requests:", err);
    }
  }, [token]);
  const sendFriendRequest = async (userId) => {
    if (!token) {
      console.error("🚨 No authentication token found.");
      return;
    }

    try {
      await axios.post(
        `http://127.0.0.1:8000/api/send_friend_request/${userId}/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFriendRequests((prev) => ({ ...prev, [userId]: "pending" }));
    } catch (error) {
      console.error("🚨 Error sending friend request:", error);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAllProfiles();
      fetchFriends();
      fetchFriendRequests();
    }
  }, [token, fetchAllProfiles, fetchFriends, fetchFriendRequests]);

  return (
    <div className="card p-3">
      <button className="btn btn-outline-secondary mb-3" onClick={() => navigate("/")}>
        ← Home
      </button>
      <h4 className="fw-bold mb-3 text-primary">Profiles</h4>

      <h5 className="fw-bold">Your Friends</h5>
      {friends.length === 0 ? (
        <div className="alert alert-warning">No friends yet.</div>
      ) : (
        <ul className="list-group mb-3">
          {friends.map((friend) => (
            <li
              key={friend.id}
              className="list-group-item d-flex justify-content-between align-items-center"
            >
              <Link to={`/profile/${friend.username}`} className="fw-bold text-decoration-none">
                @{friend.username}
              </Link>
              <span className="badge bg-success">Friend</span>
            </li>
          ))}
        </ul>
      )}

      <h5 className="fw-bold">All Users</h5>
      {profiles.length === 0 ? (
        <div className="alert alert-info">No profiles found.</div>
      ) : (
        <div className="d-flex flex-column gap-2">
          {profiles.map((profile) => (
            <div key={profile.id} className="card p-3 shadow-sm">
              <Link
                to={`/profile/${profile.username}`}
                className="fw-bold text-decoration-none text-primary"
              >
                @{profile.username}
              </Link>
              <p className="mb-2">{profile.bio || "No bio available."}</p>

              {friendRequests[profile.user] === "pending" ? (
                <button className="btn btn-sm btn-warning" disabled>
                  Pending
                </button>
              ) : friends.some((f) => f.id === profile.user) ? (
                <span className="badge bg-success">Friend</span>
              ) : (
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => sendFriendRequest(profile.user)}
                >
                  Add Friend
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Profiles;
