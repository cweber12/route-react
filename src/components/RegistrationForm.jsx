import { useState } from 'react';
import "../App.css"

export default function RegistrationForm() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [message, setMessage] = useState('');

  const API = import.meta.env.VITE_API_BASE_URL_M;
  
  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/api/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      setMessage(data.message);
    } catch (err) {
      console.error(err);
      setMessage("Error registering");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
       <div className="child-container child-container-column">
            <input
            style={{width: "220px", height: "30px", fontSize: "18px"}} 
            name="username" onChange={handleChange} placeholder="Username" required />
            <input
            style={{width: "220px", height: "30px", fontSize: "18px"}} 
            name="email" onChange={handleChange} placeholder="Email" required />
            <input
            style={{width: "220px", height: "30px", fontSize: "18px"}} 
            name="password" onChange={handleChange} type="password" placeholder="Password" required />
            <button 
            className="button-action"
            type="submit"
            >Register</button>
            <p>{message}</p>
            </div>
       
    </form>
  );
}
