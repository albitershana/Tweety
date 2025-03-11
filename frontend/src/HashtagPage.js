import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import PostItem from "./PostItem";

function HashtagPage({ token, triggerToast }) {
  const { tag } = useParams();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tag) return;
    setLoading(true);
    axios
      .get(`/hashtags/${tag}/`)
      .then((res) => {
        setPosts(res.data);
      })
      .catch((err) => {
        console.error("Error fetching hashtag posts:", err);
      })
      .finally(() => setLoading(false));
  }, [tag]);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner-border text-primary"></div>
        <p>Loading #{tag}...</p>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h2>Posts with #{tag}</h2>
      {posts.length === 0 ? (
        <p>No posts found for #{tag}</p>
      ) : (
        posts.map((post) => (
          <PostItem key={post.id} post={post} token={token} triggerToast={triggerToast} />
        ))
      )}
    </div>
  );
}

export default HashtagPage;
