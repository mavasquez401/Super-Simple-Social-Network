import { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import axios from "axios";
import "./App.css";

function App() {
  // keys
  const [UsernameReg, setUsernameReg] = useState("");
  const [PasswordReg, setPasswordReg] = useState("");
  const [EmailReg, setEmailReg] = useState("");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [loginMessage, setLoginMessage] = useState("");

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);

  const [posts, setPosts] = useState([]);
  const [newPostContent, setNewPostContent] = useState("");

  // register api
  const register = () => {
    axios
      .post("http://localhost:3000/register", {
        username: UsernameReg,
        password: PasswordReg,
        email: EmailReg,
      })
      .then((response) => {
        console.log(response);
      });
  };

  // login api
  const login = () => {
    axios
      .post("http://localhost:3000/login", {
        username: username,
        password: password,
      })
      .then((response) => {
        console.log(response);
        setIsLoggedIn(true);
        setLoginMessage("Login successful");
        setUserId(response.data.user_id);
        setUsername(response.data.username);
      })
      .catch((error) => {
        if (error.response) {
          if (error.response.status === 401) {
            setLoginMessage("Invalid credentials");
          } else {
            setLoginMessage("Error logging in");
          }
        } else {
          console.error("There was an error logging in!", error);
          setLoginMessage("Error logging in");
        }
      });
  };

  // Logout api
  const logout = () => {
    axios
      .post("http://localhost:3000/logout", {
        username: username,
      })
      .then((response) => {
        console.log(response);
        setIsLoggedIn(false);
        setLoginMessage("Logout successful");
      })
      .catch((error) => {
        console.error("There was an error logging out!", error);
        setLoginMessage("Error logging out");
      });
  };

  // gets the post from logged in user
  const createPost = () => {
    axios
      .post("http://localhost:3000/posts", {
        user_id: userId,
        content: newPostContent,
      })
      .then((response) => {
        console.log(response);
        setNewPostContent(""); // Clear the text box after submission
        fetchPosts(); // Refresh the posts
      })
      .catch((error) => {
        console.error("There was an error creating the post!", error);
      });
  };

  // gets posts from from previous entries
  const fetchPosts = () => {
    axios
      .get("http://localhost:3000/posts")
      .then((response) => {
        setPosts(response.data);
      })
      .catch((error) => {
        console.error("There was an error fetching posts!", error);
      });
  };

  // is used to make sure that only if user is logged in it will fetchpost
  useEffect(() => {
    if (isLoggedIn) {
      fetchPosts();
    }
  }, [isLoggedIn]);

  return (
    <Router>
      <header>
        <h1>Social Network</h1>
        {isLoggedIn && (
          <button className="logout-button" onClick={logout}>
            Logout
          </button>
        )}
      </header>
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route
            path="/login"
            element={
              isLoggedIn ? (
                <Navigate to="/welcome" />
              ) : (
                <div className="login">
                  <h1>Login</h1>
                  <label>Username: </label>
                  <input
                    type="text"
                    placeholder="Username..."
                    onChange={(e) => {
                      setUsername(e.target.value);
                    }}
                  />
                  <label>Password: </label>
                  <input
                    type="password"
                    placeholder="Password..."
                    onChange={(e) => {
                      setPassword(e.target.value);
                    }}
                  />
                  <button onClick={login}>Login</button>
                  {loginMessage && <p>{loginMessage}</p>}
                  <p>
                    Don't have an account? <a href="/register">Register here</a>
                  </p>
                </div>
              )
            }
          />
          <Route
            path="/register"
            element={
              <div className="registration">
                <h1>Registration</h1>
                <label>Username: </label>
                <input
                  type="text"
                  onChange={(e) => {
                    setUsernameReg(e.target.value);
                  }}
                />
                <label>Email: </label>
                <input
                  type="email"
                  onChange={(e) => {
                    setEmailReg(e.target.value);
                  }}
                />
                <label>Password: </label>
                <input
                  type="password"
                  onChange={(e) => {
                    setPasswordReg(e.target.value);
                  }}
                />
                <button onClick={register}>Register</button>
              </div>
            }
          />
          <Route
            path="/welcome"
            element={
              isLoggedIn ? (
                <div className="welcome">
                  <h1>Welcome, {username}!</h1>
                  <div className="create-post">
                    <h2>Create a New Post</h2>
                    <textarea
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      placeholder="What's on your mind?"></textarea>
                    <button onClick={createPost}>Post</button>
                  </div>
                  <div className="posts">
                    <h2>Posts</h2>
                    {posts.map((post) => (
                      <div key={post.post_id} className="post">
                        <p>
                          <strong>{post.username}</strong>
                        </p>
                        <p>{post.content}</p>
                        <p>
                          <em>{new Date(post.timestamp).toLocaleString()}</em>
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <Navigate to="/login" />
              )
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
