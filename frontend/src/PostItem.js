// PostItem.js
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Posts.css";

// NEW CODE: simple function to highlight hashtags & mentions
function highlightText(text) {
  if (!text) return "";
  // Replace #tag or @username with clickable spans
  const hashtagRegex = /(#\w+)/g;
  const mentionRegex = /(@\w+)/g;
  let replaced = text
    .replace(hashtagRegex, '<span class="hashtag">$1</span>')
    .replace(mentionRegex, '<span class="mention">$1</span>');
  return replaced;
}

const PostItem = ({ post, token, triggerToast }) => {
  const navigate = useNavigate();

  const [likeCount, setLikeCount] = useState(post.like_count || 0);
  const [commentCount, setCommentCount] = useState(post.comment_count || 0);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [userHasLiked, setUserHasLiked] = useState(false);

  // NEW CODE: track local pinned state
  const [isPinned, setIsPinned] = useState(post.pinned || false);

  // NEW CODE: track advanced reaction
  const [showReactions, setShowReactions] = useState(false);

  const fetchComments = async () => {
    try {
      const res = await axios.get(`/posts/${post.id}/comments/`);
      setComments(res.data);
    } catch (err) {
      console.error("Error fetching comments:", err);
    }
  };

  const handleToggleComments = () => {
    if (!showComments) {
      fetchComments();
    }
    setShowComments(!showComments);
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const res = await axios.post(`/posts/${post.id}/comment/`, { content: newComment });
      setComments((prev) => [...prev, res.data]);
      setNewComment("");
      setCommentCount((prev) => prev + 1);
      triggerToast("✅ Comment added!");
    } catch (err) {
      console.error("Error adding comment:", err);
      triggerToast("❌ Could not add comment.");
    }
  };

  // Like the post
  const handleLike = async () => {
    try {
      await axios.post(`/posts/${post.id}/like/`);
      setUserHasLiked(true);
      setLikeCount((prev) => prev + 1);
      triggerToast("❤️ You liked this post!");
    } catch (err) {
      if (err.response && err.response.status === 400) {
        triggerToast("❗You already liked this post.");
      } else {
        console.error("Error liking post:", err);
      }
    }
  };

  // Unlike the post
  const handleUnlike = async () => {
    try {
      await axios.post(`/posts/${post.id}/unlike/`);
      setUserHasLiked(false);
      setLikeCount((prev) => (prev > 0 ? prev - 1 : 0));
      triggerToast("💔 You unliked this post.");
    } catch (err) {
      console.error("Error unliking post:", err);
    }
  };

  // NEW CODE: Toggle pinned
  const handleTogglePin = async () => {
    try {
      const res = await axios.post(`/posts/${post.id}/toggle_pin/`);
      setIsPinned(res.data.pinned);
      triggerToast(`Post is now ${res.data.pinned ? "pinned" : "unpinned"}!`);
    } catch (err) {
      console.error("Error pinning post:", err);
      triggerToast("❌ Could not pin/unpin post.");
    }
  };

  // NEW CODE: Edit the post (navigate to an Edit screen or do inline)
  const handleEditPost = () => {
    // For a simpler approach, let's navigate user to a separate route or do inline editing
    navigate(`/posts/edit/${post.id}`, { state: { post } });
    // We'll handle editing in a new component or you can do a small inline approach
  };

  // NEW CODE: Delete the post
  const handleDeletePost = async () => {
    try {
      await axios.delete(`/posts/delete/${post.id}/`);
      triggerToast("🗑️ Post deleted!");
      // Optionally refresh or remove from UI
      window.location.reload();
    } catch (err) {
      console.error("Error deleting post:", err);
      triggerToast("❌ Could not delete post.");
    }
  };

  const handleReaction = async (reactionType) => {
    try {
      await axios.post(`/posts/${post.id}/react/`, { reaction_type: reactionType });
      triggerToast(`You reacted ${reactionType}!`);
    } catch (err) {
      console.error("Error reacting to post:", err);
      triggerToast("❌ Could not add reaction.");
    } finally {
      setShowReactions(false);
    }
  };

  const isMyPost = token && post.username === localStorage.getItem("username");

  return (
    <div className="card post-card">
      <div className="card-body">
        <Link to={`/profile/${post.username}`} className="username-link">
          <h5 className="card-title">@{post.username || "Anonymous"}</h5>
        </Link>

        {post.image && (
          <img
            src={`http://127.0.0.1:8000${post.image}`}
            alt="post"
            className="post-image"
          />
        )}

        <p
          className="card-text"
          dangerouslySetInnerHTML={{ __html: highlightText(post.content) }}
          onClick={(e) => {
            const target = e.target;
            if (target.classList.contains("hashtag")) {
              const tagName = target.innerText.replace("#", "");
              navigate(`/hashtag/${tagName}`);
            } else if (target.classList.contains("mention")) {
              const userName = target.innerText.replace("@", "");
              navigate(`/profile/${userName}`);
            }
          }}
        />

        <small className="text-muted">
          Posted at: {new Date(post.created_at).toLocaleString()}
        </small>

        {isPinned && <span className="badge bg-info ms-2">Pinned</span>}

        <div className="d-flex align-items-center mt-2 gap-2">
          {!userHasLiked ? (
            <button className="btn btn-sm btn-outline-danger" onClick={handleLike}>
              <i className="bi bi-heart"></i> Like
            </button>
          ) : (
            <button className="btn btn-sm btn-danger" onClick={handleUnlike}>
              <i className="bi bi-heart-fill"></i> Unlike
            </button>
          )}
          <span className="like-count small text-muted">{likeCount} Likes</span>

          {/* Advanced Reactions (optional) */}
          <button
            className="btn btn-sm btn-outline-success"
            onClick={() => setShowReactions(!showReactions)}
          >
            React
          </button>
          {showReactions && (
            <div className="bg-light p-2 border rounded">
              {["love", "haha", "wow", "sad", "angry"].map((r) => (
                <button
                  key={r}
                  className="btn btn-sm me-1"
                  onClick={() => handleReaction(r)}
                >
                  {r}
                </button>
              ))}
            </div>
          )}

          <button className="btn btn-sm btn-outline-primary" onClick={handleToggleComments}>
            <i className="bi bi-chat"></i> Comments
          </button>
          <span className="comment-count small text-muted">{commentCount} Comments</span>
        </div>

        {isMyPost && (
          <div className="mt-2 d-flex gap-2">
            {/* Toggle Pin */}
            <button className="btn btn-sm btn-warning" onClick={handleTogglePin}>
              {isPinned ? "Unpin" : "Pin"}
            </button>
            {/* Edit */}
            <button className="btn btn-sm btn-secondary" onClick={handleEditPost}>
              Edit
            </button>
            {/* Delete */}
            <button className="btn btn-sm btn-danger" onClick={handleDeletePost}>
              Delete
            </button>
          </div>
        )}

        {showComments && (
          <div className="comments-section mt-3">
            <hr />
            <h6>Comments</h6>
            {comments.length === 0 ? (
              <p className="small text-muted">No comments yet.</p>
            ) : (
              comments.map((c) => (
                <div key={c.id} className="comment-item mb-2">
                  <strong>@{c.username}:</strong> {c.content}
                  <br />
                  <small className="text-muted">
                    {new Date(c.created_at).toLocaleString()}
                  </small>
                </div>
              ))
            )}

            <form onSubmit={handleCommentSubmit} className="mt-2">
              <div className="input-group">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                />
                <button className="btn btn-sm btn-primary" type="submit">
                  Post
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostItem;
