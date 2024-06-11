import { useState } from "react";
import axios from "axios";

function Register() {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [email, setEmail] = useState<string>("");

  const register = () => {
    axios
      .post("http://localhost:3000/register", { username, password, email })
      .then((response) => {
        console.log(response);
      });
  };

  return (
    <div className="registration">
      <h1>Registration</h1>
      <label>Username: </label>
      <input type="text" onChange={(e) => setUsername(e.target.value)} />
      <label>Email: </label>
      <input type="email" onChange={(e) => setEmail(e.target.value)} />
      <label>Password: </label>
      <input type="password" onChange={(e) => setPassword(e.target.value)} />
      <button onClick={register}>Register</button>
    </div>
  );
}

export default Register;
