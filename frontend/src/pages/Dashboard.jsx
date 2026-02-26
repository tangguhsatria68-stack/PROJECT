import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {

  const [products,setProducts] = useState([]);
  const [previewList, setPreviewList] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const navigate = useNavigate();

  // Pemetaan nama produk ke file gambar
  const imageMap = {
    "asbak": "asbak.png",
    "sapi": "sapi.png",
    "cangkir": "cangkir.png",
    "piring": "piring.png",
    "guci": "guci.png",
    "wajan": "wajan.png",
    "vas": "vas.png"
  };

  // Label/deskripsi yang diinginkan untuk setiap file gambar
  const labelMap = {
    "asbak.png": "asbak baali",
    "sapi.png": "patung sapi",
    "cangkir.png": "cangkir minum",
    "piring.png": "piring gerabah",
    "guci.png": "guci ukir besar",
    "wajan.png": "wajan gerabah",
    "vas.png": "vas motif batik"
  };

  // Daftar file gambar yang tersedia di public/images
  const imageFiles = [
    "asbak.png",
    "sapi.png",
    "cangkir.png",
    "piring.png",
    "guci.png",
    "wajan.png",
    "vas.png"
  ];

  const getImageFor = (name) => {
    if (!name) return "placeholder.svg";
    const key = name.toLowerCase();
    return imageMap[key] || "placeholder.svg";
  };

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  }; 

  const handleAddProduct = async (file) => {
    const token = localStorage.getItem("token");
    const name = file.replace(/\.[^/.]+$/, "");
    if (products.some(p => p.name && p.name.toLowerCase() === name.toLowerCase())) {
      alert("Produk sudah ada di etalase");
      return;
    }
    try {
      const payload = {
        category_id: null,
        name,
        price: 10000,
        stock: 10,
        description: labelMap[file] || name
      };
      const res = await axios.post("http://localhost:5000/api/products", payload, {
        headers: { Authorization: token }
      });
      setProducts(prev => [res.data, ...prev]);
    } catch (err) {
      console.error(err);
      alert("Gagal menambahkan produk. Pastikan Anda login dan memiliki izin.");
    }
  };

  const handlePreviewDelete = () => {
    const targets = ['asbak','sapi','cangkir','piring','guci','wajan','vas'];
    const matches = products.filter(p => p.name && targets.includes(p.name.toLowerCase()));
    setPreviewList(matches);
    setShowPreview(true);
  };

  const handleConfirmDelete = async () => {
    if (!confirm('Yakin ingin menghapus produk yang tampil di preview? Tindakan ini permanen.')) return;
    const token = localStorage.getItem('token');
    const names = ['asbak','sapi','cangkir','piring','guci','wajan','vas'];
    try {
      const res = await axios.post('http://localhost:5000/api/products/delete-names', { names }, {
        headers: { Authorization: token }
      });
      const refreshed = await axios.get('http://localhost:5000/api/products');
      setProducts(refreshed.data);
      setPreviewList([]);
      setShowPreview(false);
      alert(`${res.data.deleted} produk dihapus.`);
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 403) {
        alert('Anda bukan admin. Tidak dapat menghapus.');
        return;
      }
      alert('Gagal menghapus produk.');
    }
  };

  const handleDeleteNoImageAuto = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.post('http://localhost:5000/api/products/delete-no-image', {}, {
        headers: { Authorization: token }
      });
      // refresh products after deletion
      const refreshed = await axios.get('http://localhost:5000/api/products');
      setProducts(refreshed.data);
      if (res.data.deleted > 0) {
        console.log(`Auto deleted ${res.data.deleted} products without images.`);
      }
    } catch (err) {
      console.error(err);
      // silently fail if not admin or server error
    }
  }; 

  useEffect(()=>{

    const fetchProducts = async () => {

      const res = await axios.get(
        "http://localhost:5000/api/products"
      );

      setProducts(res.data);
      // Auto delete products without images
      await handleDeleteNoImageAuto();
    };

    fetchProducts();

  },[]);

  return (
    <div>

      {/* HEADER */}
      <div style={{
        background:"#8B4513",
        color:"white",
        padding:"15px",
        display:"flex",
        justifyContent:"space-between"
      }}>
        <h2>Gerabah Tangguh</h2>

        <div>
          <button
            onClick={handlePreviewDelete}
            style={{ background:"#ffa500", color:"white", marginRight:10, width:"180px" }}
          >
            Preview Hapus Etalase
          </button>

          <button
            onClick={logout}
            style={{ background:"red", width:"100px" }}
          >
            Logout
          </button>
        </div>
      </div> 




      {/* PRODUK */}
      <div style={{
        padding:"20px",
        display:"grid",
        gridTemplateColumns:"repeat(auto-fit, minmax(220px,1fr))",
        gap:"20px"
      }}>

        {products.filter(item => getImageFor(item.name) !== 'placeholder.svg').map((item)=>(
          <div key={item.product_id} style={{
            background:"white",
            padding:"15px",
            borderRadius:"10px",
            boxShadow:"0 0 5px rgba(0,0,0,0.2)"
          }}>
            {/* Gambar produk */}
            <div style={{width:"100%", height:160, overflow:"hidden", borderRadius:8, marginBottom:10}}>
              <img
                src={`/images/${getImageFor(item.name)}`}
                alt={item.name}
                style={{width:"100%", height:"100%", objectFit:"cover"}}
                onError={(e)=>{ e.target.onerror=null; e.target.src='/images/placeholder.svg'; }}
              />
            </div>

            <h3>{ item.name }</h3>
            <small style={{color:'#555'}}>{ labelMap[getImageFor(item.name)] || '' }</small>

            <p>Harga : Rp {item.price}</p>

            <p>Stok : {item.stock}</p>

            <p>{item.description}</p>

          </div>
        ))}

      </div>

    </div>
  );
}
