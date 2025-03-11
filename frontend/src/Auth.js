
import React, { useState } from "react";
import axios from "axios";

export const getAuthToken = () => localStorage.getItem("token"); 

function Auth({ setToken }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = isLogin
      ? "http://127.0.0.1:8000/api/token/"
      : "http://127.0.0.1:8000/api/register/";

    try {
      const { data } = await axios.post(url, { username, password });
      if (isLogin && data.access) {
        localStorage.setItem("token", data.access);
        setToken(data.access);
      } else if (!isLogin && data.message === "User registered successfully") {
        setIsLogin(true);
      }
      setErrorMsg("");
    } catch (err) {
      console.error("Auth error:", err);
      setErrorMsg("Authentication failed. Check credentials or try again.");
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "90vh" }}>
      <div className="card p-4 shadow" style={{ maxWidth: "400px", width: "100%" }}>
        <h2 className="text-center mb-4">
          {isLogin ? "Login to Tweety" : "Register an Account"}
        </h2>

        {errorMsg && (
          <div className="alert alert-danger" role="alert">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-semibold">Username</label>
            <input
              type="text"
              className="form-control"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Your username"
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label fw-semibold">Password</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-100">
            {isLogin ? "Login" : "Register"}
          </button>
        </form>

        <button
          className="btn btn-link mt-3 w-100 text-secondary"
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin ? "Need an account? Register" : "Already have an account? Login"}
        </button>
      </div>
    </div>
  );
}

export default Auth;
