// Trending.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import PostItem from "./PostItem";

function Trending({ token, triggerToast }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    axios
      .get("/posts/trending/")
      .then((res) => setPosts(res.data))
      .catch((err) => console.error("Error fetching trending posts:", err))
      .finally(() => setLoading(false));
  }, [token]);

  if (!token) {
    return <p className="mt-3">Please log in to view trending posts.</p>;
  }

  return (
    <div className="container mt-4">
      <h2>Trending Posts (Last 24 Hours)</h2>
      {loading ? (
        <div className="loading-screen">
          <div className="spinner-border text-primary"></div>
          <p>Loading trending posts...</p>
        </div>
      ) : posts.length === 0 ? (
        <p>No trending posts right now.</p>
      ) : (
        posts.map((post) => (
          <PostItem key={post.id} post={post} token={token} triggerToast={triggerToast} />
        ))
      )}
    </div>
  );
}

export default Trending;
