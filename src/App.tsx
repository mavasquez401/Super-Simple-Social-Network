import { useState } from "react";
import axios, { Axios } from "axios";

function App() {
  // keys
  const [UsernameReg, setUsernameReg] = useState("");
  const [PasswordReg, setPasswordReg] = useState("");
  const [EmailReg, setEmailReg] = useState("");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

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
      })
      .catch((error) => {
        console.error("There was an error logging in!", error);
      });
  };

  //internal html
  return (
    <>
      <div className="App">
        {/* creates register portion */}
        <div className="Registration">
          <h1>Registration</h1>
          <label>Username: </label>
          <input
            type="text"
            onChange={(e) => {
              setUsernameReg(e.target.value);
            }}
          />
          <label>Password: </label>
          <input
            type="password"
            onChange={(e) => {
              setPasswordReg(e.target.value);
            }}
          />
          <label>Email: </label>
          <input
            type="text"
            onChange={(e) => {
              setEmailReg(e.target.value);
            }}
          />
          <button onClick={register}>Register</button>
        </div>

        {/* creates login portion */}
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
        </div>
      </div>
    </>
  );
}

export default App;
