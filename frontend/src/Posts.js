// Posts.js
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import PostItem from "./PostItem";
import "./Posts.css";

function Posts({ token, triggerToast }) {
  // States
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [postSearchQuery, setPostSearchQuery] = useState("");
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [profiles, setProfiles] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get("/posts/");
      setPosts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching posts:", err);
      setPosts([]);
    }
    setLoading(false);
  }, []);

  // Fetch All Profiles
  const fetchAllProfiles = useCallback(async () => {
    try {
      const res = await axios.get("/profiles/");
      const results = res.data.results || res.data;
      setProfiles(Array.isArray(results) ? results : []);
      setFilteredUsers(Array.isArray(results) ? results : []);
    } catch (err) {
      console.error("Error fetching profiles:", err);
      setProfiles([]);
      setFilteredUsers([]);
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchPosts();
      fetchAllProfiles();
    }
  }, [fetchPosts, fetchAllProfiles, token]);

  // Create Post
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return console.error("🚨 User not authenticated!");

    setSubmitting(true);
    const formData = new FormData();
    formData.append("content", content);
    if (selectedFile) formData.append("image", selectedFile);

    try {
      const res = await axios.post("/posts/create/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setContent("");
      setSelectedFile(null);
      setPosts((prev) => [res.data, ...prev]);
      triggerToast("✅ Post created successfully!");
    } catch (error) {
      console.error("🚨 Post Creation Error:", error.response?.data || error.message);
    }
    setSubmitting(false);
  };

  // Search Posts
  const handlePostSearch = async (e) => {
    e.preventDefault();
    if (!postSearchQuery.trim()) {
      fetchPosts();
      return;
    }
    try {
      const res = await axios.get(`/posts/search/?q=${postSearchQuery}`);
      setPosts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error searching posts:", err);
    }
  };

  const resetPostSearch = () => {
    setPostSearchQuery("");
    fetchPosts();
  };

  // Search Users
  const handleUserSearch = (e) => {
    e.preventDefault();
    if (!userSearchQuery.trim()) {
      setFilteredUsers(profiles);
      return;
    }

    const filter = userSearchQuery.toLowerCase();
    const matched = profiles.filter(
      (profile) =>
        profile.username.toLowerCase().includes(filter) ||
        (profile.bio && profile.bio.toLowerCase().includes(filter))
    );
    setFilteredUsers(matched);
  };

  const resetUserSearch = () => {
    setUserSearchQuery("");
    setFilteredUsers(profiles);
  };

  return (
    <div className="posts-container">
      <div className="posts-sidebar">
        <div className="card search-card mb-3">
          <h4>🔍 Search Posts</h4>
          <form onSubmit={handlePostSearch} className="search-form">
            <input
              className="form-control search-input"
              type="text"
              placeholder="Search posts..."
              value={postSearchQuery}
              onChange={(e) => setPostSearchQuery(e.target.value)}
            />
            <button className="btn search-btn" type="submit">
              Search
            </button>
            {postSearchQuery && (
              <button className="btn reset-btn" type="button" onClick={resetPostSearch}>
                Reset
              </button>
            )}
          </form>
        </div>

        {/* Create Post */}
        <div className="card create-post-card">
          <h4>✏️ Create a Post</h4>
          <form onSubmit={handleSubmit}>
            <textarea
              className="form-control"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write something..."
              required
            />
            <input
              type="file"
              onChange={(e) => setSelectedFile(e.target.files[0])}
              className="form-control"
            />
            <button
              type="submit"
              className="btn submit-btn w-100"
              disabled={submitting}
            >
              {submitting ? (
                <span className="spinner-border spinner-border-sm me-2"></span>
              ) : (
                "Submit Post"
              )}
            </button>
          </form>
        </div>
      </div>

      <div className="posts-content container">
        <h3 className="section-title">📢 All Posts</h3>
        {posts.length === 0 && !loading && <p className="no-posts">No posts available.</p>}
        {Array.isArray(posts) &&
          posts.map((post) => (
            <PostItem key={post.id} post={post} token={token} triggerToast={triggerToast} />
          ))}
        {loading && (
          <div className="loading-spinner">
            <div className="spinner-border text-primary"></div>
            <p>Loading posts...</p>
          </div>
        )}

        <div className="card mt-4 p-3">
          <h4>🔍 Search Users</h4>
          <form onSubmit={handleUserSearch} className="search-form">
            <input
              className="form-control search-input"
              type="text"
              placeholder="Search users by name or bio..."
              value={userSearchQuery}
              onChange={(e) => setUserSearchQuery(e.target.value)}
            />
            <button className="btn search-btn" type="submit">
              Search
            </button>
            {userSearchQuery && (
              <button className="btn reset-btn" type="button" onClick={resetUserSearch}>
                Reset
              </button>
            )}
          </form>

          <div className="mt-3">
            {filteredUsers.length === 0 ? (
              <p className="no-posts">No matching users found.</p>
            ) : (
              filteredUsers.map((u) => (
                <div key={u.id} className="card p-2 mb-2">
                  <strong>@{u.username}</strong>
                  <p className="mb-0">{u.bio || "No bio available."}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Posts;
