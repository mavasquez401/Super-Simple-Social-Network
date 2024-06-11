import { useState, useEffect } from "react";
import axios from "axios";
import { Navigate } from "react-router-dom";
import "./Welcome.css"; // Import the CSS file

interface WelcomeProps {
  isLoggedIn: boolean;
  username: string;
  userId: number;
}

interface Post {
  post_id: number;
  username: string;
  content: string;
  timestamp: string;
}

function Welcome({ isLoggedIn, username, userId }: WelcomeProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostContent, setNewPostContent] = useState<string>("");

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

  useEffect(() => {
    if (isLoggedIn) {
      fetchPosts();
    }
  }, [isLoggedIn]);

  const createPost = () => {
    axios
      .post("http://localhost:3000/posts", {
        user_id: userId,
        content: newPostContent,
      })
      .then((response) => {
        setNewPostContent("");
        fetchPosts();
      })
      .catch((error) => {
        console.error("There was an error creating the post!", error);
      });
  };

  return isLoggedIn ? (
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
  );
}

export default Welcome;
