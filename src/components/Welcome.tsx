import { useState, useEffect } from "react";
import axios from "axios";
import { Navigate } from "react-router-dom";
import "./Welcome.css";

interface WelcomeProps {
  isLoggedIn: boolean;
  username: string;
  userId: number;
}

interface Post {
  post_id: number;
  user_id: number;
  content: string;
  timestamp: string;
  likes: number;
  dislikes: number;
  user_likes: number[];
  user_dislikes: number[];
}

function Welcome({ isLoggedIn, username, userId }: WelcomeProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostContent, setNewPostContent] = useState<string>("");

  const fetchPosts = () => {
    axios
      .get("http://localhost:3000/posts")
      .then((response) => {
        // Ensure user_likes and user_dislikes are always arrays
        const updatedPosts = response.data.map((post: Post) => ({
          ...post,
          user_likes: post.user_likes ? JSON.parse(post.user_likes) : [],
          user_dislikes: post.user_dislikes
            ? JSON.parse(post.user_dislikes)
            : [],
        }));
        setPosts(updatedPosts);
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

  const handleLike = (postId: number) => {
    axios
      .post(`http://localhost:3000/posts/${postId}/like`, { user_id: userId })
      .then((response) => {
        fetchPosts();
      })
      .catch((error) => {
        console.error("There was an error liking the post!", error);
      });
  };

  const handleDislike = (postId: number) => {
    axios
      .post(`http://localhost:3000/posts/${postId}/dislike`, {
        user_id: userId,
      })
      .then((response) => {
        fetchPosts();
      })
      .catch((error) => {
        console.error("There was an error disliking the post!", error);
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
            <div className="reactions">
              <button onClick={() => handleLike(post.post_id)}>
                {post.user_likes.includes(userId) ? "Unlike" : "Like"} (
                {post.likes})
              </button>
              <button onClick={() => handleDislike(post.post_id)}>
                {post.user_dislikes.includes(userId) ? "Undislike" : "Dislike"}{" "}
                ({post.dislikes})
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  ) : (
    <Navigate to="/login" />
  );
}

export default Welcome;
