import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {

  const [form,setForm] = useState({});
  const navigate = useNavigate();

  const handleSubmit = async () => {

    try {

      await axios.post(
        "http://localhost:5000/api/auth/register",
        form
      );

      alert("Register berhasil");
      navigate("/");

    } catch {
      alert("Register gagal");
    }
  };

  return (
    <div className="container">

      <h2>Register Akun</h2>

      <input
        placeholder="Username"
        onChange={(e)=>setForm({...form,username:e.target.value})}
      />

      <input
        placeholder="Nama Lengkap"
        onChange={(e)=>setForm({...form,full_name:e.target.value})}
      />

      <input
        type="password"
        placeholder="Password"
        onChange={(e)=>setForm({...form,password:e.target.value})}
      />

      <button onClick={handleSubmit}>Register</button>

      <Link className="link" to="/">
        Kembali ke Login
      </Link>

    </div>
  );
}
