// src/routes/Dashboard.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  attachDevice, detachDevice, getLicense, refreshLicense, subscribe
} from "../api";
import { getOrCreateDeviceId } from "../utils/deviceId";
import SubscribeModal from "../components/SubscribeModal";
import Toast from "../components/Toast";

function Stat({ label, value }) {
  return (
    <div style={statCard}>
      <div style={{fontSize:12, color:"#94a3b8"}}>{label}</div>
      <div style={{fontSize:18, fontWeight:700, color:"#e5e7eb"}}>{value}</div>
    </div>
  );
}

function daysLeft(expiresAt) {
  if (!expiresAt) return "-";
  const end = new Date(expiresAt).getTime();
  const now = Date.now();
  const d = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  return d < 0 ? 0 : d;
}

function themeForStatus(status) {
  const s = String(status || "pending").toLowerCase();
  if (s === "active") {
    return { bg:"#083c37", border:"#10b981", text:"#d1fae5", chipBg:"transparent", chipText:"#10b981" };
  }
  if (s === "paused") {
    return { bg:"#0b1220", border:"#64748b", text:"#cbd5e1", chipBg:"transparent", chipText:"#94a3b8" };
  }
  if (s === "cancelled") {
    return { bg:"#3b0a0a", border:"#f87171", text:"#fee2e2", chipBg:"transparent", chipText:"#f87171" };
  }
  // pending / inactive
  return { bg:"#3a2a07", border:"#fbbf24", text:"#fde68a", chipBg:"transparent", chipText:"#fbbf24" };
}

export default function Dashboard({ token, onLogout }) {
  const navigate = useNavigate();
  const [license, setLicense] = useState(null);
  const [loading, setLoading] = useState(true);

  const [toast, setToast] = useState({ open:false, msg:"", type:"info" });
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("single");

  const [deviceIdInput, setDeviceIdInput] = useState("");
  const myDeviceId = useMemo(() => getOrCreateDeviceId(), []);

  useEffect(() => {
    if (!token) { navigate("/auth"); return; }
    (async () => {
      try {
        const lic = await getLicense(token);
        setLicense(lic);
      } catch {/* ignore */} finally { setLoading(false); }
    })();
  }, [token, navigate]);

  async function doRefresh() {
    try {
      const lic = await refreshLicense(token);
      setLicense(lic);
      setToast({ open:true, msg:"Licencia actualizada.", type:"success" });
    } catch {
      setToast({ open:true, msg:"No se pudo actualizar la licencia.", type:"error" });
    }
  }

  function handleSubscribe(plan) {
    setSelectedPlan(plan);
    setModalOpen(true);
  }

  async function confirmSubscribe(mpEmail) {
    setModalOpen(false);
    try {
      const res = await subscribe(selectedPlan, token, mpEmail);
      if (res?.init_point) {
        window.location.href = res.init_point;
      } else {
        setToast({ open:true, msg: res?.error || "No se pudo iniciar la suscripción.", type:"error" });
      }
    } catch {
      setToast({ open:true, msg:"Error al crear la suscripción.", type:"error" });
    }
  }

  async function attachThisDevice() {
    try {
      const lic = await attachDevice(token, myDeviceId);
      setLicense(lic);
      setToast({ open:true, msg:"Dispositivo vinculado.", type:"success" });
    } catch {
      setToast({ open:true, msg:"No se pudo vincular el dispositivo.", type:"error" });
    }
  }

  async function detachById(id) {
    try {
      const lic = await detachDevice(token, id);
      setLicense(lic);
      setToast({ open:true, msg:"Dispositivo desvinculado.", type:"success" });
    } catch {
      setToast({ open:true, msg:"No se pudo desvincular.", type:"error" });
    }
  }

  function copyToken() {
    if (!license?.token) return;
    navigator.clipboard.writeText(license.token).then(
      () => setToast({ open:true, msg:"Token copiado.", type:"success" }),
      () => setToast({ open:true, msg:"No se pudo copiar el token.", type:"error" }),
    );
  }

  const planPrice = (plan) => (plan === "multi" ? "$4.499 ARS/mes" : "$2.999 ARS/mes");
  const remaining = license ? daysLeft(license.expiresAt) : "-";
  const devices = Array.isArray(license?.devices) ? license.devices : [];
  const deviceLimit = (license?.plan === "multi") ? 3 : 1;

  const t = themeForStatus(license?.status);

  return (
    <div style={pageWrap}>
      <header style={headerWrap}>
        <div>
          <h2 style={{margin:0, color:"#e5e7eb"}}>Panel • Venta Simple</h2>
          <div style={{fontSize:13, color:"#94a3b8"}}>Gestión de licencias, dispositivos y pago</div>
        </div>
        <div style={{display:"flex", gap:8}}>
          <button className="btn" onClick={()=>navigate("/")}>Inicio</button>
          <button className="btn" onClick={()=>navigate("/account")}>Cuenta</button>
          <button className="btn danger" onClick={onLogout}>Cerrar sesión</button>
        </div>
      </header>

      {/* Aviso sobre email de MP */}
      <div style={alertInfo}>
        <strong>Importante:</strong> Usá el <u>mismo email</u> con el que iniciás sesión en Mercado Pago durante el checkout.
        Si no coincide con el que declares acá, el pago puede fallar con “Algo salió mal”.
      </div>

      {/* Licencia */}
      <section style={grid2col}>
        <div style={cardDark}>
          <div style={cardHeader}>
            <div style={{display:"flex", alignItems:"center", gap:10}}>
              <h3 style={{margin:0, color:"#e5e7eb"}}>Tu licencia</h3>
              <span className="chip" style={{background:t.chipBg, color:t.chipText, borderColor:t.border}}>
                {String(license?.status || "pendiente").toUpperCase()}
              </span>
            </div>
            <button className="btn" onClick={doRefresh}>Refrescar</button>
          </div>

          {/* banner por estado */}
          <div style={{background:t.bg, border:`1px solid ${t.border}`, color:t.text, borderRadius:10, padding:"10px 12px"}}>
            {license ? (
              <b>
                {license.status === "active" && "Tu suscripción está activa ✔"}
                {license.status === "paused" && "Tu suscripción está en pausa ⚠"}
                {license.status === "cancelled" && "Tu suscripción fue cancelada ❌"}
                {(!["active","paused","cancelled"].includes(license.status)) && "Licencia pendiente ⏳"}
              </b>
            ) : (
              <b>No tenés licencia activa aún.</b>
            )}
          </div>

          {/* stats */}
          <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(160px, 1fr))", gap:12, marginTop:12}}>
            <Stat label="Plan" value={license?.plan || "-"} />
            <Stat label="Expira" value={license?.expiresAt ? new Date(license.expiresAt).toLocaleDateString() : "-"} />
            <Stat label="Días restantes" value={remaining} />
            <Stat label="Dispositivos" value={Array.isArray(license?.devices) ? license.devices.length : 0} />
          </div>

          {/* token */}
          <div style={{marginTop:14, background:"#0b1220", border:"1px solid #1f2937", padding:"12px", borderRadius:10, color:"#e5e7eb"}}>
            <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, flexWrap:"wrap"}}>
              <div style={{fontFamily:"monospace", fontSize:14, whiteSpace:"nowrap", overflow:"auto"}}>
                <strong>Token:</strong> {license?.token || "—"}
              </div>
              <div style={{display:"flex", gap:8}}>
                <button className="btn" onClick={copyToken} disabled={!license?.token}>Copiar token</button>
                {license?.status !== "active" && (
                  <button className="btn primary" onClick={()=>handleSubscribe(license?.plan || "single")}>
                    Activar / Reintentar pago
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Planes / upgrade */}
        <div style={cardDark}>
          <h3 style={{marginTop:0, color:"#e5e7eb"}}>Planes</h3>
          <div style={{display:"grid", gap:10}}>
            {["single","multi"].map(p => (
              <div key={p} style={planRowDark}>
                <div style={{display:"flex", gap:10, alignItems:"center"}}>
                  <div style={planIconDark}>{p === "multi" ? "🖥️🖥️🖥️" : "🖥️"}</div>
                  <div>
                    <div style={{fontWeight:700, textTransform:"capitalize", color:"#e5e7eb"}}>{p}</div>
                    <div style={{fontSize:13, color:"#94a3b8"}}>
                      {p === "multi" ? "Hasta 3 dispositivos" : "1 dispositivo"}
                    </div>
                  </div>
                </div>
                <div style={{display:"flex", alignItems:"center", gap:10}}>
                  <div style={{fontWeight:800, color:"#e5e7eb"}}>{planPrice(p)}</div>
                  <button
                    className={`btn ${p === license?.plan ? "" : "primary"}`}
                    disabled={p === license?.plan}
                    onClick={()=>handleSubscribe(p)}
                  >
                    {p === license?.plan ? "Plan actual" : "Cambiar / Suscribirme"}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div style={{marginTop:12, fontSize:13, color:"#cbd5e1"}}>
            ¿Querés sumar el <strong>bot de WhatsApp</strong> o el módulo de <strong>cámaras IA</strong>? Comunicate con soporte y lo activamos como adicional.
          </div>
        </div>
      </section>

      {/* Dispositivos */}
      <section style={{marginTop:16}}>
        <div style={cardDark}>
          <div style={cardHeader}>
            <h3 style={{margin:0, color:"#e5e7eb"}}>Dispositivos vinculados</h3>
            <div style={{fontSize:13, color:"#94a3b8"}}>
              {devices.length}/{deviceLimit} usados
            </div>
          </div>

          <div style={{display:"flex", gap:8, flexWrap:"wrap", marginTop:12}}>
            <button className="btn primary" onClick={attachThisDevice} disabled={devices.length >= deviceLimit}>
              Vincular este dispositivo ({myDeviceId.slice(0, 20)}…)
            </button>
            <div style={{display:"flex", gap:8}}>
              <input
                placeholder="ID de dispositivo a quitar"
                value={deviceIdInput}
                onChange={(e)=>setDeviceIdInput(e.target.value)}
                style={inputDark}
              />
              <button className="btn" onClick={()=>{ if(deviceIdInput) detachById(deviceIdInput); }}>
                Quitar ID
              </button>
            </div>
          </div>

          {devices.length > 0 ? (
            <ul style={{marginTop:12, paddingLeft:18, color:"#e5e7eb"}}>
              {devices.map(d => (
                <li key={d} style={{marginBottom:6, fontFamily:"monospace"}}>
                  {d}{" "}
                  <button className="btn" style={{padding:"4px 8px", fontSize:12}} onClick={()=>detachById(d)}>
                    Quitar
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div style={{marginTop:12, color:"#94a3b8"}}>No hay dispositivos vinculados.</div>
          )}
        </div>
      </section>

      {/* Modal suscripción */}
      <SubscribeModal
        open={modalOpen}
        plan={selectedPlan}
        onClose={()=>setModalOpen(false)}
        onConfirm={confirmSubscribe}
      />

      {/* Toast */}
      <Toast
        open={toast.open}
        type={toast.type}
        message={toast.msg}
        onClose={()=>setToast({ ...toast, open:false })}
      />
    </div>
  );
}

/* ---------- estilos inline (dark cards, sin blancos) ---------- */
const pageWrap = {
  maxWidth: 1120,
  margin: "30px auto",
  padding: "0 16px",
  background: "linear-gradient(180deg, rgba(2,6,23,0.6) 0%, rgba(2,6,23,0) 160px)"
};
const headerWrap = { display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 };
const grid2col = { display:"grid", gridTemplateColumns:"minmax(280px, 1fr) minmax(280px, 0.8fr)", gap:16, alignItems:"start" };

const cardDark = {
  background:"#0f172a",           // slate-900
  border:"1px solid #1f2937",     // gray-800
  borderRadius:12,
  padding:16,
  boxShadow:"0 6px 24px rgba(0,0,0,.25)",
  color:"#e5e7eb"
};
const cardHeader = { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 };

const statCard = {
  background:"#111827",           // gray-900
  border:"1px solid #1f2937",
  borderRadius:10,
  padding:"10px 12px",
  minWidth:140
};

const planRowDark = {
  display:"grid", gridTemplateColumns:"1fr auto", alignItems:"center",
  border:"1px solid #1f2937", borderRadius:10, padding:12,
  background:"#0b1220"            // dark navy
};
const planIconDark = {
  width:36, height:36, borderRadius:10, display:"grid", placeItems:"center",
  background:"#111827", border:"1px solid #1f2937", fontSize:14, color:"#cbd5e1"
};

const alertInfo = {
  background:"#0b1220",
  border:"1px solid #334155",
  color:"#cbd5e1",
  padding:"10px 12px",
  borderRadius:10,
  marginBottom:12
};

const inputDark = {
  padding:"8px 10px",
  border:"1px solid #334155",
  borderRadius:8,
  minWidth:260,
  background:"#0b1220",
  color:"#e5e7eb",
  outline:"none"
};
