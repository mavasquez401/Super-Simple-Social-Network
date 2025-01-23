import React from 'react';

interface RegisterProps {
  onRegister: () => Promise<void>;
  setRegistrationData: React.Dispatch<
    React.SetStateAction<{
      username: string;
      password: string;
      email: string;
    }>
  >;
}

const Register: React.FC<RegisterProps> = ({
  onRegister,
  setRegistrationData,
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRegistrationData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="registration">
      <h1>Registration</h1>
      <label>Username: </label>
      <input name="username" type="text" onChange={handleInputChange} />
      <label>Email: </label>
      <input name="email" type="email" onChange={handleInputChange} />
      <label>Password: </label>
      <input name="password" type="password" onChange={handleInputChange} />
      <button onClick={onRegister}>Register</button>
    </div>
  );
};

export default Register;
