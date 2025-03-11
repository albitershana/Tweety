
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";

function FriendsList({ token }) {
  const [friends, setFriends] = useState([]);
  const [errorMsg, setErrorMsg] = useState(""); 

  const fetchFriends = useCallback(async () => {
    if (!token) {
      console.error("🚨 No authentication token found.");
      setErrorMsg("User not authenticated. Please log in.");
      return;
    }

    try {
      const res = await axios.get("http://127.0.0.1:8000/api/friends/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setFriends(Array.isArray(res.data) ? res.data : []);
      setErrorMsg(""); 
    } catch (err) {
      console.error("🚨 Error fetching friends:", err);
      setErrorMsg("Error fetching friends. Please try again later.");
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchFriends();
    }
  }, [token, fetchFriends]);

  return (
    <div className="container my-4">
      <h2 className="mb-4 text-primary">Your Friends</h2>

      {errorMsg && (
        <div className="alert alert-danger">
          {errorMsg}
        </div>
      )}

      {friends.length === 0 && !errorMsg ? (
        <div className="alert alert-info">You have no friends yet.</div>
      ) : (
        <div className="row row-cols-1 row-cols-md-2 g-3">
          {friends.map((friend) => (
            <div key={friend.id} className="col">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">@{friend.username}</h5>
                  <p className="card-text text-muted">This user is on your friend list!</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FriendsList;
