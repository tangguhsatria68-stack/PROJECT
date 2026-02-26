import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import Toast from "../components/Toast";

export default function Login() {

  const [form,setForm] = useState({});
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", form);

      localStorage.setItem("token", res.data.token);

      // Tampilkan notifikasi sukses lalu pindah ke dashboard setelah 1 detik
      setToast({ visible: true, message: 'Login berhasil', type: 'success' });
      setTimeout(() => {
        setToast({ visible: false, message: '', type: 'success' });
        navigate("/dashboard");
      }, 1000);

    } catch (err) {
      // Tampilkan notifikasi gagal
      setToast({ visible: true, message: 'Login gagal', type: 'error' });
      setTimeout(() => setToast({ visible: false, message: '', type: 'error' }), 3000);
    }
  }; 

  return (
    <div className="container">
      <Toast visible={toast.visible} message={toast.message} type={toast.type} />

      <h2>Login Toko Gerabah</h2> 

      <input
        placeholder="Username"
        onChange={(e)=>setForm({...form,username:e.target.value})}
      />

      <input
        type="password"
        placeholder="Password"
        onChange={(e)=>setForm({...form,password:e.target.value})}
      />

      <button onClick={handleSubmit}>Login</button>

      <Link className="link" to="/register">
        Belum punya akun? Daftar
      </Link>

    </div>
  );
}
