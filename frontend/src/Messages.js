// Messages.js
import React, { useState, useEffect } from "react";
import axios from "axios";


function Messages({ token, triggerToast }) {
  const [friends, setFriends] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");

  useEffect(() => {
    if (token) {
      axios
        .get("/friends/")
        .then((res) => {
          const data = res.data.results || res.data;
          setFriends(data);
        })
        .catch((err) => console.error("Error fetching friends for messages:", err));
    }
  }, [token]);

  const handleSelectUser = async (userId) => {
    setSelectedUserId(userId);
    setMessages([]);
    try {
      const res = await axios.get(`/messages/${userId}/`);
      setMessages(res.data);
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMsg.trim() || !selectedUserId) return;
    try {
      const res = await axios.post("/messages/send/", {
        receiver: selectedUserId,
        content: newMsg,
      });
      setMessages((prev) => [...prev, res.data]);
      setNewMsg("");
    } catch (err) {
      console.error("Error sending message:", err);
      if (triggerToast) triggerToast("❌ Could not send message.");
    }
  };

  return (
    <div className="container my-4">
      <h2>Private Messages</h2>
      <div className="row">
        <div className="col-md-4">
          <h4>Your Friends</h4>
          <ul className="list-group">
            {friends.map((f) => (
              <li
                key={f.id}
                className={`list-group-item ${f.id === selectedUserId ? "active" : ""}`}
                onClick={() => handleSelectUser(f.id)}
                style={{ cursor: "pointer" }}
              >
                @{f.username}
              </li>
            ))}
          </ul>
        </div>
        <div className="col-md-8">
          <h4>Chat</h4>
          {selectedUserId ? (
            <>
              <div className="card p-3 mb-3" style={{ maxHeight: "400px", overflowY: "auto" }}>
                {messages.length === 0 ? (
                  <p>No messages yet.</p>
                ) : (
                  messages.map((m) => (
                    <div key={m.id} className="mb-2">
                      <strong>@{m.sender_username}: </strong> {m.content}
                      <br />
                      <small className="text-muted">
                        {new Date(m.created_at).toLocaleString()}
                      </small>
                    </div>
                  ))
                )}
              </div>
              <form onSubmit={handleSendMessage} className="d-flex">
                <input
                  type="text"
                  className="form-control me-2"
                  value={newMsg}
                  onChange={(e) => setNewMsg(e.target.value)}
                  placeholder="Type your message..."
                />
                <button className="btn btn-primary" type="submit">
                  Send
                </button>
              </form>
            </>
          ) : (
            <p>Select a friend to chat with.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Messages;
