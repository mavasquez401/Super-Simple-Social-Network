import { useState } from "react";
import axios from "axios";

interface LoginProps {
  setIsLoggedIn: (isLoggedIn: boolean) => void;
  setUserId: (userId: number) => void;
  setUsername: (username: string) => void;
}

function Login({ setIsLoggedIn, setUserId, setUsername }: LoginProps) {
  const [username, setUsernameLocal] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loginMessage, setLoginMessage] = useState<string>("");

  const login = () => {
    axios
      .post("http://localhost:3000/login", { username, password })
      .then((response) => {
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

  return (
    <div className="login">
      <h1>Login</h1>
      <label>Username: </label>
      <input
        type="text"
        placeholder="Username..."
        onChange={(e) => setUsernameLocal(e.target.value)}
      />
      <label>Password: </label>
      <input
        type="password"
        placeholder="Password..."
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={login}>Login</button>
      {loginMessage && <p>{loginMessage}</p>}
      <p>
        Don't have an account? <a href="/register">Register here</a>
      </p>
    </div>
  );
}

export default Login;
