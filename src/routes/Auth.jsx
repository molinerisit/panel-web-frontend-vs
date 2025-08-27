import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "../components/LoginForm";
import RegisterForm from "../components/RegisterForm";
import Toast from "../components/Toast";

export default function Auth({ onLogin, onRegister, loading, error }){
  const [mode, setMode] = useState("login");
  const [toast, setToast] = useState("");
  const navigate = useNavigate();

  return (
    <div className="container" style={{paddingTop:20}}>
      <div style={{display:'flex',justifyContent:'center',gap:12,marginBottom:12}}>
        <button className="btn" onClick={()=>setMode("login")} aria-pressed={mode==='login'}>Ingresar</button>
        <button className="btn" onClick={()=>setMode("register")} aria-pressed={mode==='register'}>Registrarse</button>
      </div>
      {mode === "login" ? (
        <LoginForm onSubmit={async (e,p)=>{
          const ok = await onLogin(e,p);
          if(ok){
            setToast("¡Bienvenido! Sesión iniciada.");
            navigate("/app", { replace: true });
          }
        }} loading={loading} error={error} />
      ) : (
        <RegisterForm onSubmit={async (e,p)=>{
          const ok = await onRegister(e,p);
          if(ok){ setToast("Usuario creado. Ahora ingresá con tus credenciales."); setMode("login"); }
        }} loading={loading} error={error} />
      )}
      <Toast msg={toast} onDone={()=>setToast("")} type="success"/>
    </div>
  );
}
