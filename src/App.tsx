import { useState } from 'react';
import { Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Welcome from './components/Welcome';
import './App.css';
import axios from 'axios';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [username, setUsername] = useState<string>('');

  // Add registration data state
  const [registrationData, setRegistrationData] = useState({
    username: '',
    password: '',
    email: '',
  });

  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      const response = await axios.post(
        'http://localhost:3000/register',
        registrationData
      );
      setIsLoggedIn(true);
      setUsername(registrationData.username);
      // Get user_id from response and set it
      if (response.data.user_id) {
        setUserId(response.data.user_id);
      }
      navigate('/welcome');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.code === 'ERR_NETWORK') {
          alert('Server is not running. Please start the backend server.');
        } else {
          alert(error.response?.data || 'Registration failed');
        }
      }
    }
  };

  return (
    <div className="App">
      <header>
        <h1>Social Network</h1>
        {isLoggedIn && (
          <button
            className="logout-button"
            onClick={() => setIsLoggedIn(false)}
          >
            Logout
          </button>
        )}
      </header>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route
          path="/login"
          element={
            isLoggedIn ? (
              <Navigate to="/welcome" />
            ) : (
              <Login
                setIsLoggedIn={setIsLoggedIn}
                setUserId={setUserId}
                setUsername={setUsername}
              />
            )
          }
        />
        <Route
          path="/register"
          element={
            isLoggedIn ? (
              <Navigate to="/welcome" />
            ) : (
              <Register
                onRegister={handleRegister}
                setRegistrationData={setRegistrationData}
              />
            )
          }
        />
        <Route
          path="/welcome"
          element={
            <Welcome
              isLoggedIn={isLoggedIn}
              username={username}
              userId={userId as number}
            />
          }
        />
      </Routes>
    </div>
  );
}

export default App;
