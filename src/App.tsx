import { useState } from "react";
import axios, { Axios } from "axios";

function App() {
  const [UsernameReg, setUsernameReg] = useState("");
  const [PasswordReg, setPasswordReg] = useState("");

  const register = () => {
    axios
      .post("http://localhost:3000/register", {
        username: UsernameReg,
        password: PasswordReg,
      })
      .then((response) => {
        console.log(response);
      });
  };
  return (
    <>
      <div className="App">
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
          <button onClick={register}>Register</button>
        </div>

        <div className="login">
          <h1>Login</h1>
          <input type="text" placeholder="Username..." />
          <input type="password" placeholder="Username..." />
          <button>Login</button>
        </div>
      </div>
    </>
  );
}

export default App;
