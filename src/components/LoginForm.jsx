import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import axios from 'axios';
import "../App.css";

export default function LoginForm({ onLogin }) {
  const [form, setForm] = useState({ username: '', password: '' });
  const [message, setMessage] = useState('');

  const API = import.meta.env.VITE_API_BASE_URL_M;
  const navigate = useNavigate();
  
  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API}/api/login`, form);
      const username = res.data.userName;
      sessionStorage.setItem("userName", username);
      setMessage("Login successful!");
      onLogin(); // Notify parent
      navigate("/route-data"); // Redirect to route data page
    } catch (err) {
      setMessage(err.response?.data?.detail || "Login failed");
    }
  };

  return (    
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <div className="child-container child-container-column"
        style={{padding: 0}} >
          <input 
          style={{width: "100%", height: "40px", fontSize: "22px", border: "1px solid #ccc", borderRadius: "4px"}}
          name="username" onChange={handleChange} placeholder="Username" required />
          <input
          style={{width: "100%", height: "40px", fontSize: "22px", border: "1px solid #ccc", borderRadius: "4px"}} 
          name="password" onChange={handleChange} type="password" placeholder="Password" required />
          <button 
          type="submit"
          style={{width: "100%", fontSize: "22px"}}
          >Login</button>
          <p>{message}</p>
      </div>
      </form>   
  );
}

