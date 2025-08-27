import { useState } from "react";

export default function RegisterForm({ onSubmit, loading, error }){
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="card" style={{padding:20}}>
      <h2 style={{marginTop:0}}>Crear cuenta</h2>
      {error && <p style={{ color: '#fca5a5' }}>{error}</p>}
      <form onSubmit={(e)=>{ e.preventDefault(); onSubmit(email, password); }}>
        <div style={{display:'grid',gap:12}}>
          <input className="input" type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required />
          <input className="input" type="password" placeholder="Contraseña" value={password} onChange={e=>setPassword(e.target.value)} required />
          <button className="btn" type="submit" disabled={loading}>{loading ? 'Creando...' : 'Registrarse'}</button>
          <div className="small">Al registrarte aceptás los Términos y la Política de Privacidad.</div>
        </div>
      </form>
    </div>
  );
}
