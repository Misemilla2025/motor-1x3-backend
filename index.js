require("dotenv").config();

const express = require("express");

const fs = require("fs");

const cors = require("cors");

const { ethers } = require("ethers");

const app = express();

app.use(cors());

app.use(express.json());

const path = require("path");

const crypto = require("crypto");

app.use(express.static(path.join(__dirname, "public")));


const { obtenerSiguienteOrden, insertarEnCola } = require("./motor/motor");

const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

const supabaseAnon = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

function extraerToken(req) {
  const authHeader = req.headers.authorization || "";

  if (!authHeader.startsWith("Bearer ")) {
    return null;
  }

  return authHeader.slice(7).trim();
}

function getSupabaseForUser(req) {
  const token = extraerToken(req);

  if (!token) {
    return null;
  }

  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
}

async function getUsuarioAutenticado(req) {
  const token = extraerToken(req);

  if (!token) {
    return {
      error: "Token no enviado",
      user: null,
      supabaseUser: null
    };
  }

  const { data, error } = await supabaseAnon.auth.getUser(token);

  if (error || !data?.user) {
    return {
      error: "Sesion no valida",
      user: null,
      supabaseUser: null
    };
  }

  return {
    error: null,
    user: data.user,
    supabaseUser: getSupabaseForUser(req)
  };
}

const DB_FILE = "usuarios.json";

const RPC_BSC = process.env.RPC_BSC;
const TOKEN_NOMBRE = "USDT";
const RED_PAGO = "BEP20";
const CHAIN_ID = 56;

const WALLET_MADRE =
  process.env.WALLET_MADRE;

const USDT_BEP20_CONTRACT =
  process.env.USDT_BEP20_CONTRACT;

const MONTO_MEMBRESIA = 15;

const CATALOGO_MATERIAL = {
  basico: [
    {
      id: "conciencia",
      titulo: "Conciencia Espiritual",
      descripcion: "Desarrolla tu crecimiento interior y conexión espiritual",
      url: "https://drive.google.com/file/d/10emT5yE8ksoT6JGVpC-xHou4fWvyVm-D/view?usp=sharing"
    },
    {
      id: "autoestima",
      titulo: "El Poder de Creer en Ti",
      descripcion: "Fortalece tu autoestima y mentalidad de crecimiento",
      url: "https://drive.google.com/file/d/1sxpteWalZrQd6gvxfgTSOxg3zqhvTTar/view?usp=sharing"
    },
    {
      id: "bisuteria",
      titulo: "Emprendimiento en Bisutería",
      descripcion: "Aprende a crear y vender tus propios accesorios",
      url: "https://drive.google.com/file/d/1nn8UxDy9uwLhnTIwnpu06Wrt857Ubcdh/view?usp=sharing"
    },
    {
      id: "postres",
      titulo: "Guía para Emprender en Postres",
      descripcion: "Convierte tus recetas en un negocio rentable",
      url: "https://drive.google.com/file/d/1Oq-4qsGAyrImWZN3q4RAV8hlSRyt0P0X/view?usp=sharing"
    },
    {
      id: "esencias",
      titulo: "Cómo Crear Esencias en Frasco",
      descripcion: "Aprende a producir fragancias y productos artesanales",
      url: "https://drive.google.com/file/d/12gsGTJhkBHe-COdoO_ps7pl4OpdvtIM8/view?usp=sharing"
    },
    {
      id: "pollo_naranja",
      titulo: "Receta de Pollo a la Naranja al Horno",
      descripcion: "Una opción deliciosa para emprender en comida",
      url: "https://drive.google.com/file/d/1mvMrddIkCETmEDsI2CsWcx0VxFLBkesd/view?usp=sharing"
    },
    {
      id: "especias",
      titulo: "Guía de Especias Naturales",
      descripcion: "20 ideas para cocinar y emprender desde casa",
      url: "https://drive.google.com/file/d/1eLa2PqFHdt7gfMYKtVpl5Hy0ism1bgJY/view?usp=sharing"
    },
    {
      id: "equilibrio_interior",
      titulo: "Equilibrio Interior",
      descripcion: "Aprende a fortalecer tu paz y estabilidad emocional",
      url: "https://drive.google.com/file/d/1iK8ZTp26cYcG6v1XApQsoMQyJtbFyl0A/view?usp=sharing"
    },
    {
      id: "hogar_en_calma",
      titulo: "Hogar en Calma",
      descripcion: "Ideas para crear un ambiente de armonía en casa",
      url: "https://drive.google.com/file/d/18X2Qy48ViIJaCMDkLYSV7XMheHwmZbHn/view?usp=sharing"
    },
    {
      id: "finanzas_presupuesto",
      titulo: "Domina Tus Finanzas",
      descripcion: "Crea tu presupuesto en dólares y aprende a ahorrar",
      url: "https://drive.google.com/file/d/1Wzi5ZBe50SV_Tl97gqSmd9XMGQ_9bHoV/view?usp=sharing"
    },
    {
      id: "criptomonedas_2026",
      titulo: "Todo sobre Criptomonedas en 2026",
      descripcion: "Conceptos y panorama actual para entender el mercado",
      url: "https://drive.google.com/file/d/1Zjp6SQBtwdMBb2Q5__oU4BvYsnkMrgvA/view?usp=sharing"
    },
    {
      id: "color_tu_alma",
      titulo: "El Color de Tu Alma",
      descripcion: "Crea un hogar que refleje tu esencia y bienestar",
      url: "https://drive.google.com/file/d/1arxoXYZPaIJp_VAB_wwldMVbFanpgDLh/view?usp=sharing"
    },
    {
      id: "jardin_interior",
      titulo: "Jardín Interior",
      descripcion: "Dale vida a tu hogar con plantas ornamentales",
      url: "https://drive.google.com/file/d/1Zt1qZcMvVI2mPvN4M_44JIYyOgMHr67O/view?usp=sharing"
    },
    {
      id: "joyeria_casa",
      titulo: "Mantenimiento de Joyería en Casa",
      descripcion: "Devuelve el brillo a tus tesoros con cuidados prácticos",
      url: "https://drive.google.com/file/d/1rZYVFrEe46mhrbgyB7BE3b-q_wRgUrmX/view?usp=sharing"
    },
    {
      id: "cuidado_personal",
      titulo: "Qué es Realmente el Cuidado Personal",
      descripcion: "Comprende el autocuidado y cómo aplicarlo en tu vida",
      url: "https://drive.google.com/file/d/1z7_0W0XSm_59DHYUiMJ65a5aS53ODBwq/view?usp=sharing"
    },
    {
      id: "huerto_casa",
      titulo: "Tu Huerto en Casa",
      descripcion: "Cultiva frescura y sabor paso a paso desde tu hogar",
      url: "https://drive.google.com/file/d/1Thkh_bS0exqSgTBp_JFG7Q5MRBNErNpH/view?usp=sharing"
    }
  ]
};

// ===== CONEXIÓN BLOCKCHAIN =====
const provider = new ethers.JsonRpcProvider(RPC_BSC);

const walletBackend = process.env.PRIVATE_KEY
  ? new ethers.Wallet(process.env.PRIVATE_KEY, provider)
  : null;

// ===== CONTRATO USDT =====
const ABI_USDT = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address owner) view returns (uint256)"
];

const contratoUSDT = walletBackend
  ? new ethers.Contract(USDT_BEP20_CONTRACT, ABI_USDT, walletBackend)
  : null;

/* =========================
   LLENADO AUTOMÁTICO
========================= */
function llenarAutomatico(user, usuarios) {
  const faltantes = 3 - user.hijos.length;
  const nivelActual = user.nivel === 1 ? "nivel1" : "nivel2";
  const tablero = user.tableros[nivelActual];

  for (let i = 0; i < faltantes; i++) {
    const autoEmail = `auto_${Date.now()}_${i}@test.com`;

    const nuevo = {
      id: Date.now() + i,
      email: autoEmail,
      password: "auto",
      estado: "ACTIVO",
      nivel: 1,
      ciclo: 0,
      tableros_basico: 0,
      tableros_avanzado: 0,
      ciclos_grandes: 0,
      puede_recomprar: false,
      referidor: user.email,
      padre: user.email,
      hijos: [],
      producto_entregado: true,
      membresia_activa: true,
      fecha_activacion: new Date(),
      saldo_directo: 0,
      saldo_total: 0,

wallet_usuario: null,
wallet_red: RED_PAGO,

      wallet_validada: false,
      tableros: {
        nivel1: { A: [], B: [] },
        nivel2: { A: [], B: [] }
      },
      historial: [
        {
          fecha: new Date(),
          tipo: "AUTO_REGISTRO",
          detalle: { referidor: user.email }
        }
      ]
    };

    usuarios.push(nuevo);
    user.hijos.push(autoEmail);

    if (tablero.A.length < 3) {
      tablero.A.push(autoEmail);
    } else {
      tablero.B.push(autoEmail);
    }

    user.historial.push({
      fecha: new Date(),
      tipo: "AUTO_LLENO",
      detalle: { usuario: autoEmail }
    });
  }
}

/* =========================
   RESET
========================= */
app.post("/admin/reset", (req, res) => {
  guardarDB([]);
  res.json({ message: "Base de datos reiniciada" });
});

/* =========================
   REGISTRO - MODELO LIMPIO 1x3 (BLINDADO)
========================= */
app.post("/registro", (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email y password son obligatorios"
      });
    }

    const emailNormalizado = email.trim().toLowerCase();
    const usuarios = leerDB();

    if (buscarUsuario(emailNormalizado, usuarios)) {
      return res.status(400).json({
        error: "El correo ya está registrado. Por favor utiliza otro."
      });
    }

    const nuevo = {
      id: Date.now(),

      // acceso
      email: emailNormalizado,
      password,

      // estado general
      estado: "PENDIENTE_ACTIVACION",
      fecha_registro: new Date(),
      fecha_activacion: null,

      membresia_activa: false,
      producto_entregado: false,

      // 🔥 ESTRUCTURA MATRIZ 1x3
      estructura: {
        bloque: "A",
        hijos: [],
        padre: null
      },

      ciclo: 1,
      ciclos_pequenos: 0,
      ciclos_grandes: 0,
      acumulado: 0,

      // saldos
      saldo_total: 0,
      saldo_directo: 0,

      // billetera
      wallet_usuario: null,
      wallet_red: RED_PAGO,
      wallet_validada: false,

      /* =========================
         PAGO INICIAL BLINDADO
      ========================= */
      pago_inicial: {
        estado: "PENDIENTE", // PENDIENTE | VALIDANDO | CONFIRMADO_AUTOMATICO | RECHAZADO_AUTOMATICO | PENDIENTE_REVISION

        monto: 15,
        moneda: TOKEN_NOMBRE,
        red: RED_PAGO,
        billetera_destino: WALLET_MADRE,

        txid: null,
        captura_url: null,

        intentos_validacion: 0,
        bloqueado_hasta: null,

        fecha_reporte: null,
        fecha_validacion: null,
        fecha_confirmacion: null,

        motivo_rechazo: null,
        validacion_automatica: false
      },

      // material
      material: {
        basico_habilitado: false,
        avanzado_habilitado: false,
        recompra_habilitado: false
      },

      material_seleccionado: {
        basico: null,
        avanzado: null,
        recompra: null
      },

      descarga_usada: {
        basico: false,
        avanzado: false,
        recompra: false
      },

      avance_visible: {
        hito_30: false,
        hito_50: false,
        hito_3_ciclos: false
      },

      historial: [
        {
          fecha: new Date(),
          tipo: "REGISTRO",
          detalle: {
            mensaje: "Usuario registrado correctamente"
          }
        }
      ]
    };

    usuarios.push(nuevo);
    guardarDB(usuarios);

    res.json({
      message: "Usuario registrado correctamente",
      usuario: nuevo
    });

  } catch (error) {
    res.status(500).json({
      error: "Error en registro",
      detalle: error.message
    });
  }
});

/* =========================
   CREAR ESTRUCTURA USUARIO
========================= */
app.post("/crear-estructura", async (req, res) => {
  try {
    const { user_id, email } = req.body;

    if (!user_id || !email) {
      return res.status(400).json({ message: "Faltan datos" });
    }

    // 🔍 Verificar si ya existe
    const { data: existente } = await supabase
      .from("usuarios_1x3")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existente) {
      return res.json({ message: "Usuario ya tiene estructura" });
    }

    // 🚀 Crear estructura inicial
   const { error } = await supabase
  .from("usuarios_1x3")
  .insert([{
    user_id: user_id,
    email: email,

    estado: "PENDIENTE_ACTIVACION",
    bloque_actual: null,
    nivel: null,
    ciclo: 0,
    txid: null,

    saldo_directo: 0,
    saldo_acumulado: 0,
    saldo_retenido: 0,
    saldo_disponible_retiro: 0,
    total_retirado: 0,

    ciclos_pequenos: 0,
    ciclos_grandes: 0,

    wallet_usuario: null,
    wallet_red: "BEP20",
    wallet_validada: false,
    automatico_activo: true,
    decision_pendiente: false,

    material_basico_usado: false,
    material_basico_id: null
  }]);

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    res.json({ message: "Estructura creada correctamente" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* =========================
   RESUMEN (SUPABASE) - NUEVA LOGICA A + B
========================= */
app.get("/resumen", async (req, res) => {
  try {
    const authInfo = await getUsuarioAutenticado(req);

    if (authInfo.error || !authInfo.user) {
      return res.status(401).json({
        message: "Sesion no valida"
      });
    }

    const email = String(authInfo.user.email || "").trim().toLowerCase();

    if (!email) {
      return res.status(400).json({
        message: "No se pudo obtener el correo del usuario autenticado"
      });
    }

    const { data: user, error } = await supabase
      .from("usuarios_1x3")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (error) {
      console.log("❌ Error consultando usuario:", error.message);
      return res.status(500).json({ message: "Error consultando usuario" });
    }

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const estado = user.estado || "PENDIENTE_ACTIVACION";
    const activo = estado === "ACTIVO";

    const saldoDirecto = Number(user.saldo_directo || 0);
    const saldoAcumulado = Number(user.saldo_acumulado || 0);
    const saldoRetenido = Number(user.saldo_retenido || 0);
    const saldoDisponibleRetiro = Number(user.saldo_disponible_retiro || 0);
    const ciclosPequenos = Number(user.ciclos_pequenos || 0);
    const totalRetirado = Number(user.total_retirado || 0);

    const materialBasicoUsado = user.material_basico_usado === true;

    // =========================
    // AUTOMATICO / ESTADO DE FLUJO
    // =========================
    const bloqueActual = user.bloque_actual || user.nivel || null;

    const automaticoActivo =
      user.automatico_activo !== false &&
      bloqueActual !== "DETENIDO" &&
      !!bloqueActual;

    const puedeApagarAutomatico =
      user.decision_pendiente === true &&
      automaticoActivo &&
      bloqueActual === "A" &&
      materialBasicoUsado !== true;

    // =========================
    // SOLO MATERIAL BASICO
    // =========================
    const basicoHabilitado = activo && !materialBasicoUsado;

    // =========================
    // PROGRESO REAL DE BARRAS
    // =========================
    let hijosA = 0;
    let hijosB = 0;

    if (automaticoActivo) {
      if (bloqueActual === "A") {
        const { data: nodoA, error: errorNodoA } = await supabase
          .from("colas_1x3")
          .select("hijos, completado")
          .eq("user_id", user.user_id)
          .eq("bloque", "A")
          .order("orden", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (errorNodoA) {
          console.log("⚠️ Error consultando nodo A:", errorNodoA.message);
        }

        hijosA = nodoA?.completado === true ? 3 : Number(nodoA?.hijos || 0);
        hijosB = 0;
      }

      if (bloqueActual === "B") {
        const { data: nodoB, error: errorNodoB } = await supabase
          .from("colas_1x3")
          .select("hijos, completado")
          .eq("user_id", user.user_id)
          .eq("bloque", "B")
          .order("orden", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (errorNodoB) {
          console.log("⚠️ Error consultando nodo B:", errorNodoB.message);
        }

        hijosA = 3;
        hijosB = nodoB?.completado === true ? 3 : Number(nodoB?.hijos || 0);
      }
    }

    return res.json({
      email: user.email,
      estado,

      nivel: user.nivel || user.bloque_actual || null,
      bloque_actual: bloqueActual,
      ciclo: Number(user.ciclo || 1),

      saldo_directo: saldoDirecto,
      saldo_total: saldoAcumulado,
      saldo_acumulado: saldoAcumulado,
      saldo_retenido: saldoRetenido,
      saldo_disponible_retiro: saldoDisponibleRetiro,

      ciclos_pequenos: ciclosPequenos,

      decision_pendiente: user.decision_pendiente === true,
      puede_apagar_automatico: puedeApagarAutomatico,
      automatico_activo: automaticoActivo,

      wallet: user.wallet_usuario || null,
      wallet_red: user.wallet_red || "BEP20",
      wallet_validada: user.wallet_validada || false,

      progreso_visible: {
        mostrar_barras: automaticoActivo,
        hijos_a: hijosA,
        hijos_b: hijosB,
        total_a: 3,
        total_b: 3
      },

      pago_inicial: user.pago_inicial || null,

      material: {
        basico_habilitado: basicoHabilitado,
        tipo_disponible: basicoHabilitado ? "basico" : null
      },

      material_basico_id: user.material_basico_id || null,

      descarga_usada: {
        basico: materialBasicoUsado
      },

      total_retirado: totalRetirado,

      hijos: [],
      tableroA: [],
      tableroB: [],
      historial: []
    });

  } catch (error) {
    console.log("❌ Error en resumen:", error.message);
    return res.status(500).json({
      error: "Error obteniendo resumen",
      detalle: error.message
    });
  }
});

/* =========================
   RECOMPRA DESACTIVADA
========================= */
/*
app.post("/recomprar", (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email requerido" });
    }

    const usuarios = leerDB();
    const user = buscarUsuario(email, usuarios);

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // ===== VALIDACIÓN =====
    const COSTO_RECOMPRA = 15; // puedes ajustar después

    if (user.saldo_total < COSTO_RECOMPRA) {
      return res.status(400).json({
        error: "Saldo insuficiente para recompra"
      });
    }

    // ===== DESCUENTO =====
    user.saldo_total -= COSTO_RECOMPRA;

    // ===== HABILITAR NUEVO MATERIAL =====
    user.material.recompra_habilitado = true;

    // ===== REINICIO DE MATRIZ =====
    user.nivel = 1;
    user.ciclo = 0;
    user.tableros_basico = 0;
    user.tableros_avanzado = 0;
    user.hijos = [];

    user.tableros = {
      nivel1: { A: [], B: [] },
      nivel2: { A: [], B: [] }
    };

    // ===== RESETEAR AVANCES VISIBLES =====
    user.avance_visible = {
      hito_30: false,
      hito_50: false,
      hito_3_ciclos: false
    };

    // ===== HISTORIAL =====
    user.historial.push({
      fecha: new Date(),
      tipo: "RECOMPRA_EJECUTADA",
      detalle: {
        mensaje: "Recompra automática ejecutada, nuevo ciclo iniciado",
        saldo_restante: user.saldo_total
      }
    });

    user.historial.push({
      fecha: new Date(),
      tipo: "NUEVO_MATERIAL_HABILITADO",
      detalle: {
        mensaje: "Se habilitó el material de recompra / nuevo ciclo"
      }
    });

    user.historial.push({
      fecha: new Date(),
      tipo: "REINGRESO_MATRIZ",
      detalle: {
        mensaje: "Usuario reingresado a matriz 1"
      }
    });

    guardarDB(usuarios);

    res.json({
      message: "Recompra ejecutada, nuevo ciclo iniciado",
      usuario: user
    });

  } catch (error) {
    res.status(500).json({
      error: "Error en recompra",
      detalle: error.message
    });
  }
});
*/

/* =========================
   LISTA
========================= */
app.get("/usuarios", (req, res) => {
  res.json(leerDB());
});

/* =========================
   GUARDAR BILLETERA
========================= */
app.post("/guardar-billetera", (req, res) => {
  try {
    const { email, wallet_usdc } = req.body;
    const usuarios = leerDB();
    const user = buscarUsuario(email, usuarios);

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    if (!wallet_usdc) {
      return res.status(400).json({ error: "Billetera requerida" });
    }

    user.wallet_usuario = wallet_usdc;
    user.wallet_red = RED_PAGO;
    user.wallet_validada = true;

    user.historial.push({
      fecha: new Date(),
      tipo: "WALLET_REGISTRADA",
      detalle: {
        wallet_usuario: wallet_usdc,
        red: RED_PAGO
      }
    });

    guardarDB(usuarios);

    res.json({
      message: "Billetera guardada correctamente",
      usuario: user
    });
  } catch (error) {
    res.status(500).json({
      error: "Error guardando billetera",
      detalle: error.message
    });
  }
});


function txYaUsado(txid, usuarios, emailActual = null) {
  return usuarios.some(u =>
    u.email !== emailActual &&
    u.pago_inicial &&
    String(u.pago_inicial.txid || "").trim().toLowerCase() ===
      String(txid || "").trim().toLowerCase()
  );
}

/* =========================
   VALIDACIÓN AUTOMÁTICA BSC / BEP20 POR RPC
========================= */
function normalizarHex(valor) {
  return String(valor || "").trim().toLowerCase();
}

function topicAAddress(topic) {
  if (!topic) return null;
  const limpio = topic.toLowerCase().replace(/^0x/, "");
  return "0x" + limpio.slice(-40);
}

function weiAUnidad(valorHex, decimals = 18) {
  const raw = BigInt(valorHex);
  const divisor = 10n ** BigInt(decimals);
  const entero = raw / divisor;
  const fraccion = raw % divisor;
  const frStr = fraccion.toString().padStart(decimals, "0").replace(/0+$/, "");
  return frStr ? Number(`${entero}.${frStr}`) : Number(entero);
}



function txYaUsado(txid, usuarios, emailActual = null) {
  return usuarios.some(u =>
    u.email !== emailActual &&
    u.pago_inicial &&
    String(u.pago_inicial.txid || "").trim().toLowerCase() ===
      String(txid || "").trim().toLowerCase()
  );
}

async function rpcBsc(method, params) {
  const res = await fetch(RPC_BSC, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method,
      params
    })
  });

  if (!res.ok) {
    throw new Error(`Error RPC BSC: ${res.status}`);
  }

  const data = await res.json();

  if (data.error) {
    throw new Error(data.error.message || "Error desconocido en RPC");
  }

  return data.result;
}

/* =========================
   VALIDAR PAGO AUTOMATICO BSC (FINAL + MATRIZ)
========================= */

async function validarPagoAutomaticoBSC(txid, email) {
  try {
    if (!txid || !txid.startsWith("0x")) {
      return { ok: false, motivo: "Hash inválido" };
    }

    const tx = await rpcBsc("eth_getTransactionByHash", [txid]);
    if (!tx || !tx.blockNumber) {
      return { ok: false, motivo: "Transacción no confirmada" };
    }

    const receipt = await rpcBsc("eth_getTransactionReceipt", [txid]);
    if (!receipt) {
      return { ok: false, motivo: "No se encontró el receipt" };
    }

    if (receipt.status !== "0x1") {
      return { ok: false, motivo: "Transacción fallida" };
    }

    const logs = Array.isArray(receipt.logs) ? receipt.logs : [];
    const walletMadre = normalizarHex(WALLET_MADRE);
    const contrato = normalizarHex(USDT_BEP20_CONTRACT);
    const transferTopic = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

    for (const log of logs) {
      const logAddress = normalizarHex(log.address);
      const topics = Array.isArray(log.topics) ? log.topics : [];
      if (logAddress !== contrato) continue;
      if (topics.length < 3) continue;
      if (normalizarHex(topics[0]) !== transferTopic) continue;

      const to = normalizarHex(topicAAddress(topics[2]));
      if (to !== walletMadre) continue;

      try {
        const iface = new ethers.Interface([
          "event Transfer(address indexed from, address indexed to, uint256 value)"
        ]);
        const parsed = iface.parseLog(log);
        const rawValueStr = parsed.args.value.toString();
        let amount = rawValueStr.length > 12 ? Number(rawValueStr) / 1e18 : Number(rawValueStr) / 1e6;
        amount = Number(Number(amount).toFixed(2));

        if (amount < MONTO_MEMBRESIA) {
          return { ok: false, motivo: `Monto insuficiente: ${amount} USDT` };
        }
        if (amount > 18) {
          return { ok: false, motivo: `Monto excedido: ${amount} USDT` };
        }

        return {
          ok: true,
          motivo: "Pago validado correctamente",
          monto: amount,
          excedente: Number((amount - MONTO_MEMBRESIA).toFixed(2)),
          detalle: { to, contract: log.address, hash: txid }
        };
      } catch (e) {
        console.log("⚠️ Error en log de transferencia:", e.message);
        continue;
      }
    }

    return { ok: false, motivo: "No se encontró transferencia válida de USDT" };
  } catch (error) {
    console.error("❌ Error:", error.message);
    return { ok: false, motivo: "Error consultando blockchain" };
  }
}
console.log("🔥 ESTE ES EL BACKEND REAL QUE ESTOY EJECUTANDO");
console.log("🔥 VALIDAR PAGO CARGADO");

/* =========================
   REPORTAR PAGO (ACTIVACIÓN + REACTIVACIÓN) - FIX COMPLETO
========================= */
console.log("🔥 CARGANDO ENDPOINT REPORTAR-PAGO...");

app.post("/reportar-pago", async (req, res) => {
  console.log("🔥 ENDPOINT REPORTAR-PAGO ACTIVO");

  try {
    const { email, txid } = req.body;

    console.log("📩 Entró a /reportar-pago:", email, txid);

    if (!email || !txid) {
      return res.status(400).json({ error: "Datos incompletos" });
    }

    // =========================
    // VALIDAR SI EL HASH YA FUE USADO
    // =========================
    const { data: pagoExistente, error: errorPago } = await supabase
      .from("pagos_verificados")
      .select("*")
      .eq("hash", txid)
      .maybeSingle();

    if (errorPago) {
      console.log("⚠️ Error consultando pagos_verificados:", errorPago.message);
    }

    if (pagoExistente && pagoExistente.usado) {
      return res.status(400).json({
        error: "Este pago ya fue utilizado"
      });
    }

    // =========================
    // BUSCAR USUARIO
    // =========================
    const { data: user, error: errorUser } = await supabase
      .from("usuarios_1x3")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (errorUser || !user) {
      console.log("❌ Usuario no encontrado:", errorUser?.message || "");
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Reactivación = usuario activo pero fuera del flujo
    const esReactivacion =
      user.estado === "ACTIVO" &&
      (
        user.bloque_actual === "DETENIDO" ||
        user.nivel === "DETENIDO"
      );

    // Si ya está activo y participando, no debe volver a pagar
    if (user.estado === "ACTIVO" && !esReactivacion) {
      return res.status(400).json({
        error: "Usuario ya activado y participando en el sistema"
      });
    }

    const ahora = Date.now();

    // =========================
    // BLOQUEO POR INTENTOS
    // =========================
    if (
      user.bloqueado_hasta &&
      new Date(user.bloqueado_hasta).getTime() > ahora
    ) {
      const minutos = Math.ceil(
        (new Date(user.bloqueado_hasta).getTime() - ahora) / 60000
      );

      return res.status(400).json({
        error: `Bloqueado. Intenta en ${minutos} minutos`
      });
    }

    const intentos = Number(user.intentos_validacion || 0) + 1;

    if (intentos >= 5) {
      const bloqueo = new Date();
      bloqueo.setMinutes(bloqueo.getMinutes() + 30);

      await supabase
        .from("usuarios_1x3")
        .update({
          intentos_validacion: intentos,
          bloqueado_hasta: bloqueo.toISOString()
        })
        .eq("email", email);

      return res.status(400).json({
        error: "Demasiados intentos. Bloqueado 30 minutos."
      });
    }

    // =========================
    // VALIDACIÓN REAL EN BLOCKCHAIN
    // =========================
    let resultado;

    try {
      resultado = await validarPagoAutomaticoBSC(txid, email);
    } catch (e) {
      console.log("⚠️ Error blockchain:", e.message);

      return res.status(400).json({
        error: "No se pudo validar el pago (intenta nuevamente)"
      });
    }

    const montoFinal = Number(Number(resultado?.monto || 0).toFixed(2));

    console.log("DEBUG RESULTADO:", resultado);
    console.log("💰 MONTO LIMPIO:", montoFinal);

    if (!resultado || !resultado.ok) {
      await supabase
        .from("usuarios_1x3")
        .update({
          intentos_validacion: intentos,
          motivo_rechazo: resultado?.motivo || "Error desconocido"
        })
        .eq("email", email);

      return res.status(400).json({
        error: resultado?.motivo || "Pago inválido",
        intentos
      });
    }

    const fechaAhora = new Date().toISOString();

    // =========================
    // REVISAR SI YA TIENE NODO ACTIVO
    // =========================
    const { data: nodoActivo, error: errorNodoActivo } = await supabase
      .from("colas_1x3")
      .select("id, bloque, orden, completado")
      .eq("user_id", user.user_id)
      .eq("completado", false)
      .limit(1);

    if (errorNodoActivo) {
      console.log("❌ Error validando nodo activo:", errorNodoActivo.message);
      return res.status(500).json({ error: "Error validando estructura actual" });
    }

    let ordenAUsar = null;
    let seInsertoNuevoNodo = false;

    // Si ya existe un nodo activo, no lo duplicamos.
    // Solo completamos la activación/reactivación pendiente.
    if (nodoActivo && nodoActivo.length > 0) {
      console.log("⚠️ El usuario ya tenía nodo activo. Se completará la activación pendiente.");
      ordenAUsar = Number(nodoActivo[0].orden || 0);
    } else {
      // =========================
      // CALCULAR NUEVO ORDEN EN A
      // =========================
      const { data: ultimoA, error: errorUltimoA } = await supabase
        .from("colas_1x3")
        .select("orden")
        .eq("bloque", "A")
        .order("orden", { ascending: false })
        .limit(1);

      if (errorUltimoA) {
        console.log("❌ Error buscando último orden en A:", errorUltimoA.message);
        return res.status(500).json({ error: "Error preparando ingreso al tablero A" });
      }

      ordenAUsar =
        ultimoA && ultimoA.length > 0
          ? Number(ultimoA[0].orden || 0) + 1
          : 1;

      // =========================
      // INSERTAR EN COLA A
      // =========================
      const { error: errorInsertA } = await supabase
        .from("colas_1x3")
       .insert([{
        user_id: user.user_id,
        email,
        bloque: "A",
        orden: ordenAUsar,
        hijos: 0,
        completado: false,
        padre_id: null,
        padre_email: null
       }]);


      if (errorInsertA) {
        console.log("❌ Error insertando en A:", errorInsertA.message);
        return res.status(500).json({ error: "Error insertando usuario en tablero A" });
      }

      seInsertoNuevoNodo = true;
    }

    // =========================
    // ACTUALIZAR USUARIO
    // =========================
    const updateData = {
      estado: "ACTIVO",
      bloque_actual: "A",
      nivel: "A",
      txid: txid,
      intentos_validacion: 0,
      bloqueado_hasta: null,
      fecha_confirmacion: fechaAhora,
      motivo_rechazo: null,
      wallet_validada: true,
      automatico_activo: true,
      decision_pendiente: false,

      saldo_acumulado: 0,
      saldo_directo: 0,
      saldo_retenido: 0,

      // Mantener retiros acumulados si viene de reactivación
      saldo_disponible_retiro: Number(user.saldo_disponible_retiro || 0),

      // Liberar nuevamente el material básico
      material_basico_usado: false,
      material_basico_id: null
    };

    // Solo en activación inicial se guarda como pago inicial
    if (!esReactivacion) {
      updateData.pago_inicial = {
        txid,
        monto: montoFinal,
        red: "BEP20",
        confirmado: true,
        fecha: fechaAhora
      };
    }

    const { error: updateError } = await supabase
      .from("usuarios_1x3")
      .update(updateData)
      .eq("email", email);

    if (updateError) {
      console.log("❌ Error actualizando usuario:", updateError.message);

      // rollback solo si sí insertamos un nodo nuevo en esta ejecución
      if (seInsertoNuevoNodo) {
        await supabase
          .from("colas_1x3")
          .delete()
          .eq("user_id", user.user_id)
          .eq("bloque", "A")
          .eq("orden", ordenAUsar)
          .eq("completado", false);
      }

      return res.status(500).json({ error: updateError.message });
    }

    // =========================
    // GUARDAR HASH DEL PAGO
    // =========================
    const { error: errorInsertPago } = await supabase
      .from("pagos_verificados")
      .upsert([{
        hash: txid,
        correo: email,
        monto: montoFinal,
        red: "BEP20",
        usado: true,
        fecha: fechaAhora
      }]);

    if (errorInsertPago) {
      console.log("⚠️ Error guardando pago:", errorInsertPago.message);
    }

    // =========================
    // HISTORIAL
    // =========================
    const { error: errorHistorial } = await supabase
      .from("historial_1x3")
      .insert([{
        user_id: user.user_id,
        email,
        tipo: esReactivacion ? "reactivacion_pagada" : "activacion_pagada",
        detalle: {
          txid,
          monto: montoFinal,
          red: "BEP20",
          reingreso_bloque: "A",
          orden_reingreso: ordenAUsar,
          material_basico_habilitado: true
        },
        fecha: fechaAhora
      }]);

    if (errorHistorial) {
      console.log("⚠️ Error guardando historial:", errorHistorial.message);
    }

    if (seInsertoNuevoNodo) {
      await asignarPadreYSumarHijo(user.user_id, "A", email);
    }

    console.log(`✅ Usuario ${esReactivacion ? "reactivado" : "activado"} correctamente:`, email);

    return res.json({
      ok: true,
      message: esReactivacion
        ? "Cuenta reactivada correctamente"
        : "Cuenta activada correctamente",
      estado: "ACTIVO",
      monto: montoFinal,
      red: "BEP20",
      bloque_actual: "A",
      nivel: "A"
    });

  } catch (error) {
    console.error("❌ Error en /reportar-pago:", error.message);

    return res.status(500).json({
      error: "Error validando pago",
      detalle: error.message
    });
  }
});

    // =========================
    // ENTRAR AL DERRAME DE A
    // =========================
/*
    await asignarPadreYSumarHijo(user.user_id, "A", email);

    console.log(esReactivacion
      ? "✅ Usuario reactivado correctamente:"
      : "✅ Usuario activado correctamente:", email);

    return res.json({
      ok: true,
      message: esReactivacion
        ? "Cuenta reactivada correctamente"
        : "Cuenta activada correctamente",
      estado: "ACTIVO",
      bloque_actual: "A",
      nivel: "A",
      monto: montoFinal,
      red: "BEP20",
      reactivado: esReactivacion
    });

  } catch (error) {
    console.error("❌ Error en /reportar-pago:", error.message);

    return res.status(500).json({
      error: "Error validando pago",
      detalle: error.message
    });
  }
});
*/

/* =========================
   RESOLVER DECISION / SALIR DEL FLUJO
========================= */
app.post("/resolver-decision", async (req, res) => {
  try {
    const authInfo = await getUsuarioAutenticado(req);

    if (authInfo.error || !authInfo.user) {
      return res.status(401).json({ error: "Sesion no valida" });
    }

    const email = String(authInfo.user.email || "").trim().toLowerCase();
    const { decision } = req.body;

    if (!email || !decision) {
      return res.status(400).json({ error: "Faltan datos" });
    }

    if (decision !== "detener_automatico") {
      return res.status(400).json({ error: "Accion invalida" });
    }

    const { data: usuario, error: errorUsuario } = await supabase
      .from("usuarios_1x3")
      .select(`
        user_id,
        email,
        estado,
        decision_pendiente,
        bloque_actual,
        nivel,
        saldo_retenido,
        saldo_disponible_retiro,
        total_retirado
      `)
      .eq("email", email)
      .maybeSingle();

    if (errorUsuario) {
      console.log("Error buscando usuario:", errorUsuario.message);
      return res.status(500).json({ error: "Error buscando usuario" });
    }

    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    if (usuario.estado !== "ACTIVO") {
      return res.status(400).json({ error: "El usuario no esta activo" });
    }

    if (!usuario.decision_pendiente) {
      return res.status(400).json({
        error: "Este usuario no tiene habilitada la opcion de salir del flujo"
      });
    }

    const { data: nodoActivoA, error: errorNodoActivoA } = await supabase
      .from("colas_1x3")
      .select("id, bloque, completado, padre_id, padre_email")
      .eq("user_id", usuario.user_id)
      .eq("bloque", "A")
      .eq("completado", false)
      .order("orden", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (errorNodoActivoA) {
      console.log("Error buscando nodo activo en A:", errorNodoActivoA.message);
      return res.status(500).json({
        error: "Error validando la fase actual del usuario"
      });
    }

    if (!nodoActivoA) {
      return res.status(400).json({
        error: "No tienes una posicion activa en fase A para salir del flujo"
      });
    }

    const saldoRetenido = Number(usuario.saldo_retenido || 0);
    const saldoDisponibleActual = Number(usuario.saldo_disponible_retiro || 0);

    const nuevoSaldoDisponibleRetiro = Number(
      (saldoDisponibleActual + saldoRetenido).toFixed(2)
    );

    if (nodoActivoA?.padre_id) {
      const { data: padreActual, error: errorPadreActual } = await supabase
        .from("colas_1x3")
        .select("id, hijos, completado")
        .eq("id", nodoActivoA.padre_id)
        .maybeSingle();

      if (errorPadreActual) {
        console.log("Error consultando padre actual:", errorPadreActual.message);
      }

      if (padreActual && padreActual.completado === false) {
        const hijosActualizados = Math.max(
          0,
          Number(padreActual.hijos || 0) - 1
        );

        const { error: errorRestarHijo } = await supabase
          .from("colas_1x3")
          .update({ hijos: hijosActualizados })
          .eq("id", padreActual.id);

        if (errorRestarHijo) {
          console.log("Error restando hijo al padre:", errorRestarHijo.message);
        } else {
          console.log(`Se libero un espacio en el padre ${nodoActivoA.padre_email}`);
        }
      }
    }

    const { error: errorCerrarNodo } = await supabase
      .from("colas_1x3")
      .update({ completado: true })
      .eq("id", nodoActivoA.id);

    if (errorCerrarNodo) {
      console.log("Error cerrando nodo activo en A:", errorCerrarNodo.message);
      return res.status(500).json({
        error: "Error retirando usuario del flujo automatico"
      });
    }

    const { error: errorUpdate } = await supabase
      .from("usuarios_1x3")
      .update({
        decision_pendiente: false,
        automatico_activo: false,
        bloque_actual: "DETENIDO",
        nivel: "DETENIDO",
        saldo_retenido: 0,
        saldo_disponible_retiro: nuevoSaldoDisponibleRetiro
      })
      .eq("email", email);

    if (errorUpdate) {
      console.log("Error sacando usuario del flujo:", errorUpdate.message);
      return res.status(500).json({
        error: "Error actualizando estado del usuario"
      });
    }

    const { error: errorHistorial } = await supabase
      .from("historial_1x3")
      .insert([{
        user_id: usuario.user_id,
        email: usuario.email,
        tipo: "automatico_apagado",
        detalle: {
          mensaje: "Usuario salio del flujo automatico desde fase A y se libero el saldo retenido",
          saldo_retenido_liberado: saldoRetenido,
          saldo_disponible_retiro: nuevoSaldoDisponibleRetiro,
          total_retirado: Number(usuario.total_retirado || 0),
          padre_liberado: nodoActivoA.padre_email || null
        },
        fecha: new Date().toISOString()
      }]);

    if (errorHistorial) {
      console.log("Error guardando historial:", errorHistorial.message);
    }

    return res.json({
      ok: true,
      message: `Saliste del flujo correctamente. Ahora tienes $${nuevoSaldoDisponibleRetiro} disponibles para retiro.`,
      bloque_actual: "DETENIDO",
      nivel: "DETENIDO",
      saldo_disponible_retiro: nuevoSaldoDisponibleRetiro
    });

  } catch (error) {
    console.log("Error en /resolver-decision:", error.message);
    return res.status(500).json({
      error: "Error procesando la accion",
      detalle: error.message
    });
  }
});

/* =========================
   RETIRAR GANANCIAS
========================= */
app.post("/retirar", (req, res) => {
  try {
    const { email, monto } = req.body;

    if (!email || !monto) {
      return res.status(400).json({ error: "Faltan datos" });
    }

    const usuarios = leerDB();
    const user = usuarios.find(u => u.email === email);

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    if (user.estado !== "ACTIVO") {
      return res.status(400).json({ error: "Usuario no activo" });
    }

    if (user.saldo_total < monto) {
      return res.status(400).json({ error: "Saldo insuficiente" });
    }

    // 🔥 FIX IMPORTANTE
    if (!user.retiros) user.retiros = [];
    if (!user.total_retirado) user.total_retirado = 0;

    // Crear retiro
    const retiro = {
      id: Date.now(),
      monto: monto,
      estado: "PENDIENTE",
      fecha_solicitud: new Date(),
      fecha_confirmacion: null,
wallet: user.wallet_usuario
    };

    // Descontar saldo
    user.saldo_total -= monto;

    // Guardar retiro
    user.retiros.push(retiro);

    // Historial
    user.historial.push({
      fecha: new Date(),
      tipo: "RETIRO_SOLICITADO",
      detalle: {
        monto,
        mensaje: "El usuario solicitó un retiro"
      }
    });

    guardarDB(usuarios);

    res.json({
      message: "Retiro solicitado correctamente",
      retiro,
      saldo_restante: user.saldo_total
    });

  } catch (error) {
    res.status(500).json({
      error: "Error en retiro",
      detalle: error.message
    });
  }
});

/* =========================
   CONFIRMAR RETIRO (ADMIN)
========================= */
app.post("/confirmar-retiro", (req, res) => {
  try {
    const { email, retiro_id } = req.body;

    if (!email || !retiro_id) {
      return res.status(400).json({ error: "Faltan datos" });
    }

    const usuarios = leerDB();
    const user = usuarios.find(u => u.email === email);

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // 🔥 FIX IMPORTANTE
    if (!user.retiros) user.retiros = [];
    if (!user.total_retirado) user.total_retirado = 0;

    const retiro = user.retiros.find(r => r.id == retiro_id);

    if (!retiro) {
      return res.status(404).json({ error: "Retiro no encontrado" });
    }

    if (retiro.estado === "CONFIRMADO") {
      return res.status(400).json({ error: "Retiro ya confirmado" });
    }

    // Confirmar retiro
    retiro.estado = "CONFIRMADO";
    retiro.fecha_confirmacion = new Date();

    user.total_retirado += retiro.monto;

    // Historial
    user.historial.push({
      fecha: new Date(),
      tipo: "RETIRO_CONFIRMADO",
      detalle: {
        monto: retiro.monto,
        mensaje: "Retiro enviado correctamente al usuario"
      }
    });

    guardarDB(usuarios);

    res.json({
      message: "Retiro confirmado correctamente",
      retiro,
      total_retirado: user.total_retirado
    });

  } catch (error) {
    res.status(500).json({
      error: "Error confirmando retiro",
      detalle: error.message
    });
  }
});

/* =========================
   ENVIAR PAGO AUTOMÁTICO (BLINDADO)
========================= */
app.post("/enviar-pago", async (req, res) => {
  try {
    const { email, monto } = req.body;

    if (!email || !monto) {
      return res.status(400).json({ error: "Email y monto requeridos" });
    }

    const usuarios = leerDB();
    const user = buscarUsuario(email, usuarios);

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // 🔒 SOLO usuarios activos pueden retirar
    if (user.estado !== "ACTIVO") {
      return res.status(400).json({ error: "Usuario no activo" });
    }

    if (!user.wallet_usuario) {
      return res.status(400).json({ error: "Usuario sin wallet registrada" });
    }

    const montoNumero = Number(monto);

    if (!montoNumero || montoNumero <= 0) {
      return res.status(400).json({ error: "Monto inválido" });
    }

    if (user.saldo_total < montoNumero) {
      return res.status(400).json({ error: "Saldo insuficiente" });
    }

    if (!user.retiros) user.retiros = [];
    if (!user.total_retirado) user.total_retirado = 0;
    
    /* =======================
       EJECUCION REAL EN CRIPTO
    ======================== */

    if (!walletBackend || !contratoUSDT) {
      return res.status(500).json({
        error: "Wallet backend no configurada correctamente"
      });
    }

    const decimals = await contratoUSDT.decimals();
    const amount = ethers.parseUnits(String(montoNumero), decimals);

    const tx = await contratoUSDT.transfer(user.wallet_usuario, amount);
    await tx.wait();

    user.saldo_total -= montoNumero;

    const retiro = {
      id: Date.now(),
      monto: montoNumero,
      estado: "ENVIADO_AUTOMATICAMENTE",
      fecha_solicitud: new Date(),
      fecha_confirmacion: new Date(),
      wallet: user.wallet_usuario,
      txid: tx.hash
    };

    user.retiros.push(retiro);
    user.total_retirado += montoNumero;

    user.historial.push({
      fecha: new Date(),
      tipo: "PAGO_ENVIADO_AUTOMATICAMENTE",
      detalle: {
        monto: montoNumero,
        txid: tx.hash,
        wallet: user.wallet_usuario
      }
    });

    guardarDB(usuarios);

    return res.json({
      message: "Pago enviado correctamente",
      modo: "REAL",
      txid: tx.hash,
      retiro,
      saldo_restante: user.saldo_total
    });

  } catch (error) {
    return res.status(500).json({
      error: "Error enviando pago",
      detalle: error.message
    });
  }
});


/* =========================
   MATERIALES DISPONIBLES (SOLO BÁSICO)
========================= */
app.get("/materiales-disponibles/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const { data: user, error } = await supabase
      .from("usuarios_1x3")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (error || !user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const activo = user.estado === "ACTIVO";
    const materialBasicoUsado = user.material_basico_usado === true;
    const disponible = activo && !materialBasicoUsado;

    return res.json({
      email: user.email,
      nivel_disponible: disponible ? "basico" : null,
      descarga_usada: { basico: materialBasicoUsado },
      material_seleccionado: { basico: user.material_basico_id || null },
      opciones: disponible ? (CATALOGO_MATERIAL.basico || []) : []
    });
  } catch (error) {
    return res.status(500).json({
      error: "Error obteniendo materiales",
      detalle: error.message
    });
  }
});


/* =========================
   ELEGIR MATERIAL (SOLO BÁSICO)
========================= */
app.post("/elegir-material", async (req, res) => {
  try {
    const authInfo = await getUsuarioAutenticado(req);

    if (authInfo.error || !authInfo.user) {
      return res.status(401).json({ error: "Sesion no valida" });
    }

    const email = String(authInfo.user.email || "").trim().toLowerCase();
    const { material_id } = req.body;

    if (!email || !material_id) {
      return res.status(400).json({ error: "Faltan datos" });
    }

    const { data: user, error } = await supabase
      .from("usuarios_1x3")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (error || !user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    if (user.estado !== "ACTIVO") {
      return res.status(400).json({ error: "Usuario no activo" });
    }

    if (user.material_basico_usado === true) {
      return res.status(400).json({ error: "No tienes material disponible para elegir" });
    }

    const material = (CATALOGO_MATERIAL.basico || []).find(item => item.id === material_id);
    if (!material) {
      return res.status(404).json({ error: "Material no encontrado en catálogo básico" });
    }

    const { error: updateError } = await supabase
      .from("usuarios_1x3")
      .update({
        material_basico_usado: true,
        material_basico_id: material.id,
        decision_pendiente: false
      })
      .eq("email", email);

    if (updateError) {
      return res.status(500).json({ error: "Error guardando material", detalle: updateError.message });
    }

    return res.json({
      message: "Material básico seleccionado correctamente",
      tipo_material: "basico",
      material
    });
  } catch (error) {
    return res.status(500).json({ error: "Error seleccionando material", detalle: error.message });
  }
});

/* =========================
   BUSCAR PADRE DISPONIBLE (FIFO REAL)
========================= */
async function buscarPadreDisponible(nivel, email, user_id = null) {
  const { data, error } = await supabase
    .from("colas_1x3")
    .select("*")
    .eq("bloque", nivel)
    .eq("completado", false)
    .lt("hijos", 3)
    .order("orden", { ascending: true })
    .limit(1000);

  if (error) {
    console.log("❌ Error buscando padre:", error.message);
    return null;
  }

  if (!data || data.length === 0) return null;

  for (const p of data) {
    if ((user_id ? p.user_id !== user_id : true) && p.email !== email) {
      return p;
    }
  }

  return null;
}

/* =========================
   ASIGNAR PADRE Y SUMAR HIJO (MOTOR A + B)
========================= */
async function asignarPadreYSumarHijo(nuevoUserId, nivel, email) {
  console.log("🔥 MATRIZ INICIADA PARA:", email, "en", nivel);

  const padre = await buscarPadreDisponible(nivel, email, nuevoUserId);

  if (!padre) {
    console.log("⚠️ No hay padre disponible en", nivel, "- queda como cabeza");
    return;
  }

  console.log("👨 Padre encontrado:", padre.email, "en", nivel);

  const nuevosHijos = Number(padre.hijos || 0) + 1;

  const { error: errorHijos } = await supabase
    .from("colas_1x3")
    .update({ hijos: nuevosHijos })
    .eq("id", padre.id);

  if (errorHijos) {
    console.log("❌ Error sumando hijo:", errorHijos.message);
    return;
  }

const { error: errorAsignarPadre } = await supabase
  .from("colas_1x3")
  .update({
    padre_id: padre.id,
    padre_email: padre.email
  })
  .eq("user_id", nuevoUserId)
  .eq("bloque", nivel)
  .eq("completado", false);

if (errorAsignarPadre) {
  console.log("⚠️ Error guardando padre del hijo:", errorAsignarPadre.message);
}

  console.log(`👶 ${padre.email} ahora tiene ${nuevosHijos} hijos en ${nivel}`);

  // Solo cierra cuando llega a 3
  if (nuevosHijos < 3) return;

  console.log("🔥 BLOQUE COMPLETADO:", padre.email, "en", nivel);

  const { error: errorCompletar } = await supabase
    .from("colas_1x3")
    .update({ completado: true })
    .eq("id", padre.id);

  if (errorCompletar) {
    console.log("❌ Error marcando completado:", errorCompletar.message);
    return;
  }

  const nivelActual = padre.bloque;

  let monto = 0;
  if (nivelActual === "A") monto = 15;
  else if (nivelActual === "B") monto = 15;

  const montoFinal = Number(Number(monto).toFixed(2));

  const { data: usuario, error: errorUsuario } = await supabase
    .from("usuarios_1x3")
    .select("*")
    .eq("email", padre.email)
    .maybeSingle();

  if (errorUsuario) {
    console.log("❌ Error obteniendo usuario:", errorUsuario.message);
    return;
  }

  if (!usuario) {
    console.log("❌ Usuario no encontrado en usuarios_1x3");
    return;
  }

  const nuevoSaldoDirecto = Number(
    (Number(usuario.saldo_directo || 0) + montoFinal).toFixed(2)
  );

  const nuevoSaldoAcumulado = Number(
    (Number(usuario.saldo_acumulado || 0) + montoFinal).toFixed(2)
  );

  const { error: errorUpdate } = await supabase
    .from("usuarios_1x3")
    .update({
      saldo_directo: nuevoSaldoDirecto,
      saldo_acumulado: nuevoSaldoAcumulado
    })
    .eq("email", padre.email);

  if (errorUpdate) {
    console.log("❌ Error aplicando pago:", errorUpdate.message);
    return;
  }

  console.log(`💰 Pago aplicado: $${montoFinal} a ${padre.email}`);

  const { error: errorHistorial } = await supabase
    .from("historial_1x3")
    .insert([{
      user_id: padre.user_id,
      email: padre.email,
      tipo: "bloque_completado",
      detalle: {
        nivel: nivelActual,
        monto: montoFinal,
        hijos: nuevosHijos
      },
      fecha: new Date().toISOString()
    }]);

  if (errorHistorial) {
    console.log("⚠️ Error guardando historial:", errorHistorial.message);
  }

  /* =========================
   CIERRE DE CICLO EN B
========================= */
if (nivelActual === "B") {
  console.log("🏁 CIERRE DE CICLO A+B:", padre.email);

  const totalGenerado = Number(
    (Number(usuario.saldo_acumulado || 0) + montoFinal).toFixed(2)
  ); // normalmente 30

  const ciclosPequenos = Number(usuario.ciclos_pequenos || 0) + 1;
  const saldoDisponibleActual = Number(usuario.saldo_disponible_retiro || 0);

  // Por defecto el sistema sigue automático
  const automaticoActivo = usuario.automatico_activo !== false;

  // Nueva lógica:
  // - si sigue automático: 15 libres + 15 retenidos para la reinserción
  // - si no sigue automático: los 30 quedan libres
  const montoRetenidoReinsercion = automaticoActivo ? 15 : 0;
  const montoLibreUsuario = Number(
    (totalGenerado - montoRetenidoReinsercion).toFixed(2)
  );

  const nuevoSaldoDisponibleRetiro = Number(
    (saldoDisponibleActual + montoLibreUsuario).toFixed(2)
  );

  const baseUpdateData = {
    saldo_retenido: montoRetenidoReinsercion,
    saldo_disponible_retiro: nuevoSaldoDisponibleRetiro,
    saldo_acumulado: 0,
    saldo_directo: 0,
    ciclos_pequenos: ciclosPequenos,
    automatico_activo: automaticoActivo,
    decision_pendiente: automaticoActivo,

    // vuelve a habilitar material para el nuevo ciclo
    material_basico_usado: false,
    material_basico_id: null
  };

  let nuevoOrdenA = null;

  // =========================
  // REINSERCIÓN AUTOMÁTICA EN A
  // =========================
  if (automaticoActivo) {
    console.log("🔁 Reinserción automática en A");

    const { data: ultimoA, error: errorUltimoA } = await supabase
      .from("colas_1x3")
      .select("orden")
      .eq("bloque", "A")
      .order("orden", { ascending: false })
      .limit(1);

    if (errorUltimoA) {
      console.log("❌ Error buscando último orden en A:", errorUltimoA.message);
      return;
    }

    nuevoOrdenA =
      ultimoA && ultimoA.length > 0
        ? Number(ultimoA[0].orden || 0) + 1
        : 1;

    const { error: errorInsertA } = await supabase
      .from("colas_1x3")
      .insert([{
        user_id: padre.user_id,
        email: padre.email,
        bloque: "A",
        orden: nuevoOrdenA,
        hijos: 0,
        completado: false
      }]);

    if (errorInsertA) {
      console.log("❌ Error reinsertando en A:", errorInsertA.message);
      return;
    }

    const { error: errorCierre } = await supabase
      .from("usuarios_1x3")
      .update({
        ...baseUpdateData,
        bloque_actual: "A",
        nivel: "A"
      })
      .eq("email", padre.email);

    if (errorCierre) {
      console.log("❌ Error cerrando ciclo en B:", errorCierre.message);

      // rollback simple del nodo insertado en A
      await supabase
        .from("colas_1x3")
        .delete()
        .eq("user_id", padre.user_id)
        .eq("bloque", "A")
        .eq("orden", nuevoOrdenA)
        .eq("completado", false);

      return;
    }
  } else {
    const { error: errorCierre } = await supabase
      .from("usuarios_1x3")
      .update({
        ...baseUpdateData,
        bloque_actual: "DETENIDO",
        nivel: "DETENIDO"
      })
      .eq("email", padre.email);

    if (errorCierre) {
      console.log("❌ Error cerrando ciclo en B:", errorCierre.message);
      return;
    }
  }

  // =========================
  // HISTORIAL
  // =========================
  const { error: errorHistorial } = await supabase
    .from("historial_1x3")
    .insert([{
      user_id: padre.user_id,
      email: padre.email,
      tipo: "ciclo_ab_completado",
      detalle: {
        total_generado: totalGenerado,
        liberado_para_retiro: montoLibreUsuario,
        retenido_reinsercion: montoRetenidoReinsercion,
        saldo_disponible_retiro: nuevoSaldoDisponibleRetiro,
        ciclos: ciclosPequenos,
        automatico_activo: automaticoActivo,
        reinsertado_en: automaticoActivo ? "A" : null,
        orden_reingreso: automaticoActivo ? nuevoOrdenA : null,
        material_basico_habilitado: true
      },
      fecha: new Date().toISOString()
    }]);

  if (errorHistorial) {
    console.log("⚠️ Error guardando historial ciclo A+B:", errorHistorial.message);
  }

  // =========================
  // ENTRAR AL DERRAME DE A
  // =========================
  if (automaticoActivo) {
    await asignarPadreYSumarHijo(padre.user_id, "A", padre.email);
  }

  return;
}

  /* =========================
     ASCENSO NORMAL
  ========================= */
  const siguiente = obtenerSiguienteNivel(nivelActual);

  const subio = await registrarAscenso(
    padre.user_id,
    padre.email,
    siguiente
  );

  if (!subio) {
    console.log("❌ No se pudo registrar ascenso de", padre.email, "a", siguiente);
    return;
  }

  console.log(`🚀 ${padre.email} sube de ${nivelActual} -> ${siguiente}`);
}

/* =========================
   REGISTRAR ASCENSO (SOLO A -> B)
========================= */
async function registrarAscenso(user_id, email, bloqueDestino) {
  const { data: ultimo, error: errorUltimo } = await supabase
    .from("colas_1x3")
    .select("orden")
    .eq("bloque", bloqueDestino)
    .order("orden", { ascending: false })
    .limit(1);

  if (errorUltimo) {
    console.log("❌ Error buscando último orden en", bloqueDestino, ":", errorUltimo.message);
    return false;
  }

  const nuevoOrden =
    ultimo && ultimo.length > 0
      ? Number(ultimo[0].orden || 0) + 1
      : 1;

  const { data: existente } = await supabase
    .from("colas_1x3")
    .select("id")
    .eq("user_id", user_id)
    .eq("bloque", bloqueDestino)
    .eq("completado", false)
    .maybeSingle();

  if (!existente) {
  const { error: errorInsert } = await supabase
    .from("colas_1x3")
    .insert([{
      user_id,
      email,
      bloque: bloqueDestino,
      orden: nuevoOrden,
      hijos: 0,
      completado: false,
      padre_id: null,
      padre_email: null
    }]);

  if (errorInsert) {
    console.log("❌ Error insertando ascenso en", bloqueDestino, ":", errorInsert.message);
    return false;
  }
}

  const { error: errorUpdateUser } = await supabase
    .from("usuarios_1x3")
    .update({
      bloque_actual: bloqueDestino,
      nivel: bloqueDestino
    })
    .eq("user_id", user_id);

  if (errorUpdateUser) {
    console.log("⚠️ Error sincronizando usuario al subir a", bloqueDestino, ":", errorUpdateUser.message);
  }

  console.log(`✅ ASCENSO REGISTRADO EN ${bloqueDestino}:`, email);

  await asignarPadreYSumarHijo(user_id, bloqueDestino, email);

  return true;
}

/* =========================
   MOVER A SIGUIENTE BLOQUE (COMPATIBLE)
========================= */
async function moverABloqueSiguiente(padre) {
  const siguiente = obtenerSiguienteNivel(padre.bloque);
  return await registrarAscenso(padre.user_id, padre.email, siguiente);
}

/* =========================
   PROCESAR BLOQUE (NO USAR)
========================= */
async function procesarBloque() {
  // Esta función ya NO se usa.
  // El avance correcto ahora es por rama individual,
  // no por "4 activos" en cola global.
  return false;
}

/* =========================
   SIGUIENTE NIVEL (SOLO A Y B)
========================= */
function obtenerSiguienteNivel(nivel) {
  if (nivel === "A") return "B";
  return "A";
}

/* =========================
   HELPERS OTP RETIRO
========================= */
function generarCodigoOTP() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function hashOTP(codigo) {
  return crypto.createHash("sha256").update(String(codigo)).digest("hex");
}

async function enviarCorreoOtpRetiro(destinatario, codigo, monto, walletDestino, red) {
  const apiKey = process.env.SENDGRID_API_KEY;
  const from = process.env.OTP_FROM_EMAIL || "administracion@misemilla.org";

  if (!apiKey) {
    throw new Error("Falta SENDGRID_API_KEY en .env");
  }

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#222;">
      <h2>Validación de retiro - Mi Semilla</h2>
      <p>Hemos recibido una solicitud de retiro con estos datos:</p>

      <ul>
        <li><strong>Monto:</strong> $${monto}</li>
        <li><strong>Red:</strong> ${red}</li>
        <li><strong>Billetera destino:</strong> ${walletDestino}</li>
      </ul>

      <p>Tu código OTP es:</p>

      <div style="
        font-size:32px;
        font-weight:bold;
        letter-spacing:6px;
        padding:14px 18px;
        background:#f4f4f4;
        border-radius:8px;
        display:inline-block;
        margin:10px 0;
      ">
        ${codigo}
      </div>

      <p>Este código vence en <strong>3 minutos</strong>.</p>
      <p>Si no solicitaste este retiro, ignora este correo.</p>
    </div>
  `;

  const resp = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      personalizations: [
        {
          to: [{ email: destinatario }],
          subject: "Código OTP para retiro - Mi Semilla"
        }
      ],
      from: {
        email: from,
        name: "Mi Semilla"
      },
      content: [
        {
          type: "text/html",
          value: html
        }
      ]
    })
  });

  if (!resp.ok) {
    const detalle = await resp.text();
    throw new Error(`SendGrid error: ${resp.status} - ${detalle}`);
  }
}

function obtenerVentanaDiaBogota() {
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Bogota",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(new Date());

  const get = (type) => partes.find(p => p.type === type)?.value;

  const y = get("year");
  const m = get("month");
  const d = get("day");

  const inicio = new Date(`${y}-${m}-${d}T00:00:00-05:00`).toISOString();
  const fin = new Date(`${y}-${m}-${d}T23:59:59.999-05:00`).toISOString();

  return { inicio, fin };
}

async function usuarioYaRetiroHoy(userId) {
  const { inicio, fin } = obtenerVentanaDiaBogota();

  const { data, error } = await supabase
    .from("historial_1x3")
    .select("id, fecha")
    .eq("user_id", userId)
    .eq("tipo", "retiro_confirmado")
    .gte("fecha", inicio)
    .lte("fecha", fin)
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Error validando retiro diario: ${error.message}`);
  }

  return !!data;
}

console.log("✅ RUTA /solicitar-otp-retiro CARGADA");

app.post("/solicitar-otp-retiro", async (req, res) => {
  try {
    console.log("📩 ENTRÓ A /solicitar-otp-retiro", req.body);

    const authInfo = await getUsuarioAutenticado(req);

    if (authInfo.error || !authInfo.user) {
      return res.status(401).json({ error: "Sesion no valida" });
    }

    const email = String(authInfo.user.email || "").trim().toLowerCase();
    const { wallet_destino, monto_solicitado } = req.body;

    if (!email || !wallet_destino || monto_solicitado === undefined || monto_solicitado === null) {
      return res.status(400).json({ error: "Faltan datos" });
    }

    const wallet = String(wallet_destino).trim();
    const red = "BEP20";
    const montoSolicitado = Number(monto_solicitado);

    if (!/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
      return res.status(400).json({ error: "La billetera no es válida para red BEP20" });
    }

    if (!montoSolicitado || isNaN(montoSolicitado)) {
      return res.status(400).json({ error: "El monto solicitado no es válido" });
    }

    if (montoSolicitado < 15) {
      return res.status(400).json({ error: "El monto mínimo de retiro es $15" });
    }

    const { data: usuario, error: errorUsuario } = await supabase
      .from("usuarios_1x3")
      .select("user_id, email, saldo_disponible_retiro, decision_pendiente, estado")
      .eq("email", email)
      .maybeSingle();

    if (errorUsuario) {
      return res.status(500).json({
        error: "Error consultando usuario",
        detalle: errorUsuario.message
      });
    }

    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    if (usuario.estado !== "ACTIVO") {
      return res.status(400).json({ error: "El usuario no está activo" });
    }

    if (usuario.decision_pendiente === true) {
      return res.status(400).json({
        error: "Este usuario tiene una decisión pendiente de ciclo grande. Debe resolverla antes de retirar."
      });
    }

    const saldoDisponible = Number(usuario.saldo_disponible_retiro || 0);
    const maximoPermitido = saldoDisponible;

    if (saldoDisponible <= 0) {
      return res.status(400).json({ error: "No hay saldo disponible para retiro" });
    }

    if (montoSolicitado > maximoPermitido) {
      return res.status(400).json({
        error: `El monto máximo permitido para este retiro es $${maximoPermitido}`
      });
    }

    const yaRetiroHoy = await usuarioYaRetiroHoy(usuario.user_id);

    if (yaRetiroHoy) {
      return res.status(400).json({
        error: "Ya realizaste un retiro hoy. Intenta nuevamente mañana."
      });
    }

    const ahoraIso = new Date().toISOString();

    const { data: otpBloqueado, error: errorBloqueado } = await supabase
      .from("otp_operaciones_1x3")
      .select("id, bloqueado_hasta")
      .eq("email", email)
      .eq("tipo", "retiro")
      .eq("estado", "bloqueado")
      .gt("bloqueado_hasta", ahoraIso)
      .order("creado_en", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (errorBloqueado) {
      return res.status(500).json({
        error: "Error validando bloqueo OTP",
        detalle: errorBloqueado.message
      });
    }

    if (otpBloqueado) {
      return res.status(403).json({
        error: "Demasiados intentos fallidos. Intenta más tarde."
      });
    }

    const { data: otpPendienteVigente, error: errorOtpPendienteVigente } = await supabase
      .from("otp_operaciones_1x3")
      .select("id, expira_en")
      .eq("email", email)
      .eq("tipo", "retiro")
      .eq("estado", "pendiente")
      .gt("expira_en", ahoraIso)
      .order("creado_en", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (errorOtpPendienteVigente) {
      return res.status(500).json({
        error: "Error validando OTP pendiente",
        detalle: errorOtpPendienteVigente.message
      });
    }

    if (otpPendienteVigente) {
      return res.status(429).json({
        error: "Ya se envió un código OTP. Espera a que expire o revisa tu correo.",
        expira_en: otpPendienteVigente.expira_en
      });
    }

    await supabase
      .from("otp_operaciones_1x3")
      .update({ estado: "expirado" })
      .eq("email", email)
      .eq("tipo", "retiro")
      .eq("estado", "pendiente")
      .lt("expira_en", ahoraIso);

    const codigo = generarCodigoOTP();
    const codigoHash = hashOTP(codigo);
    const expiraEn = new Date(Date.now() + 3 * 60 * 1000).toISOString();

    const montoFinal = Number(montoSolicitado.toFixed(2));

    const { error: errorInsertOtp } = await supabase
      .from("otp_operaciones_1x3")
      .insert([{
        email,
        user_id: usuario.user_id,
        tipo: "retiro",
        codigo_hash: codigoHash,
        codigo_ultimos4: codigo.slice(-4),
        estado: "pendiente",
        intentos: 0,
        max_intentos: 5,
        expira_en: expiraEn,
        monto: montoFinal,
        wallet_destino: wallet,
        red,
        metadata: {
          origen: "panel_1x3",
          retiro_diario: true,
          retiro_maximo: saldoDisponible
        }
      }]);

    if (errorInsertOtp) {
      return res.status(500).json({
        error: "Error guardando OTP de retiro",
        detalle: errorInsertOtp.message
      });
    }

    await enviarCorreoOtpRetiro(email, codigo, montoFinal, wallet, red);

    return res.json({
      ok: true,
      message: "OTP enviado al correo",
      expira_en: expiraEn,
      monto: montoFinal,
      red
    });

  } catch (error) {
    console.error("❌ Error en /solicitar-otp-retiro:", error.message);
    return res.status(500).json({
      error: "Error solicitando OTP de retiro",
      detalle: error.message
    });
  }
});

/* =========================
   CONFIRMAR OTP RETIRO
========================= */
app.post("/confirmar-otp-retiro", async (req, res) => {
  try {
    const authInfo = await getUsuarioAutenticado(req);

    if (authInfo.error || !authInfo.user) {
      return res.status(401).json({ error: "Sesion no valida" });
    }

    const email = String(authInfo.user.email || "").trim().toLowerCase();
    const { codigo } = req.body;

    if (!email || !codigo) {
      return res.status(400).json({ error: "Faltan datos" });
    }

    if (!/^\d{6}$/.test(String(codigo))) {
      return res.status(400).json({ error: "El código OTP debe tener 6 dígitos" });
    }

    const ahoraIso = new Date().toISOString();
    const codigoHash = hashOTP(codigo);

    const { data: otp, error: errorOtp } = await supabase
      .from("otp_operaciones_1x3")
      .select("*")
      .eq("email", email)
      .eq("tipo", "retiro")
      .eq("estado", "pendiente")
      .order("creado_en", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (errorOtp) {
      return res.status(500).json({
        error: "Error consultando OTP",
        detalle: errorOtp.message
      });
    }

    if (!otp) {
      return res.status(404).json({ error: "No hay un OTP pendiente para este retiro" });
    }

    if (otp.bloqueado_hasta && otp.bloqueado_hasta > ahoraIso) {
      return res.status(403).json({ error: "OTP bloqueado temporalmente. Intenta más tarde." });
    }

    if (otp.expira_en && otp.expira_en < ahoraIso) {
      await supabase
        .from("otp_operaciones_1x3")
        .update({ estado: "expirado" })
        .eq("id", otp.id);

      return res.status(400).json({ error: "El código OTP ya expiró" });
    }

    if (otp.codigo_hash !== codigoHash) {
      const nuevosIntentos = Number(otp.intentos || 0) + 1;
      const maxIntentos = Number(otp.max_intentos || 5);

      const updateData = { intentos: nuevosIntentos };

      if (nuevosIntentos >= maxIntentos) {
        updateData.estado = "bloqueado";
        updateData.bloqueado_hasta = new Date(Date.now() + 30 * 60 * 1000).toISOString();
      }

      await supabase
        .from("otp_operaciones_1x3")
        .update(updateData)
        .eq("id", otp.id);

      return res.status(nuevosIntentos >= maxIntentos ? 403 : 400).json({
        error: nuevosIntentos >= maxIntentos
          ? "Demasiados intentos fallidos. OTP bloqueado temporalmente."
          : "Código OTP incorrecto"
      });
    }

    const montoRetiro = Number(otp.monto || 0);

    if (montoRetiro < 15) {
      return res.status(400).json({ error: "El monto mínimo de retiro es $15" });
    }

    const { data: usuario, error: errorUsuario } = await supabase
      .from("usuarios_1x3")
      .select("user_id, email, estado, saldo_disponible_retiro, saldo_retenido, total_retirado")
      .eq("email", email)
      .maybeSingle();

    if (errorUsuario) {
      return res.status(500).json({
        error: "Error consultando usuario",
        detalle: errorUsuario.message
      });
    }

    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    if (usuario.estado !== "ACTIVO") {
      return res.status(400).json({ error: "El usuario no está activo" });
    }

    const yaRetiroHoy = await usuarioYaRetiroHoy(usuario.user_id);

    if (yaRetiroHoy) {
      return res.status(400).json({
        error: "Ya realizaste un retiro hoy. Intenta nuevamente mañana."
      });
    }

    const saldoDisponible = Number(usuario.saldo_disponible_retiro || 0);
    const saldoRetenido = Number(usuario.saldo_retenido || 0);
    const totalRetiradoActual = Number(usuario.total_retirado || 0);
    const maximoPermitidoActual = saldoDisponible;

    if (saldoDisponible <= 0) {
      return res.status(400).json({ error: "No hay saldo disponible para retiro" });
    }

    if (montoRetiro > maximoPermitidoActual) {
      return res.status(400).json({
        error: `El monto ya no es válido. Máximo permitido actual: $${maximoPermitidoActual}`
      });
    }

    if (!otp.wallet_destino || !/^0x[a-fA-F0-9]{40}$/.test(String(otp.wallet_destino))) {
      return res.status(400).json({ error: "La billetera destino guardada no es válida" });
    }

    const decimals = await contratoUSDT.decimals();
    const amount = ethers.parseUnits(String(montoRetiro), decimals);

    const tx = await contratoUSDT.transfer(String(otp.wallet_destino), amount);
    await tx.wait();

    const nuevoSaldoDisponible = Number((saldoDisponible - montoRetiro).toFixed(2));
    const nuevoSaldoRetenido = Number(Math.max(0, saldoRetenido - montoRetiro).toFixed(2));
    const nuevoTotalRetirado = Number((totalRetiradoActual + montoRetiro).toFixed(2));

    const { error: errorUpdateUsuario } = await supabase
      .from("usuarios_1x3")
      .update({
        saldo_disponible_retiro: nuevoSaldoDisponible,
        saldo_retenido: nuevoSaldoRetenido,
        total_retirado: nuevoTotalRetirado
      })
      .eq("email", email);

    if (errorUpdateUsuario) {
      return res.status(500).json({
        error: "Error actualizando saldo tras retiro",
        detalle: errorUpdateUsuario.message
      });
    }

    const { error: errorUpdateOtp } = await supabase
      .from("otp_operaciones_1x3")
      .update({
        estado: "usado"
      })
      .eq("id", otp.id);

    if (errorUpdateOtp) {
      return res.status(500).json({
        error: "Error marcando OTP como usado",
        detalle: errorUpdateOtp.message
      });
    }

    const { error: errorHistorial } = await supabase
      .from("historial_1x3")
      .insert([{
        user_id: usuario.user_id,
        email,
        tipo: "retiro_confirmado",
        detalle: {
          monto: montoRetiro,
          red: otp.red || "BEP20",
          wallet_destino: otp.wallet_destino,
          txid: tx.hash,
          otp_id: otp.id
        },
        fecha: new Date().toISOString()
      }]);

    if (errorHistorial) {
      console.log("⚠️ Error guardando historial de retiro:", errorHistorial.message);
    }

    return res.json({
      ok: true,
      message: `Retiro confirmado y enviado correctamente. TXID: ${tx.hash}`,
      txid: tx.hash,
      monto: montoRetiro,
      wallet_destino: otp.wallet_destino,
      red: otp.red || "BEP20"
    });

  } catch (error) {
    console.error("❌ Error en /confirmar-otp-retiro:", error.message);
    return res.status(500).json({
      error: "Error confirmando retiro",
      detalle: error.message
    });
  }
});

/* =========================
   CAMBIAR EMAIL AUTH + TABLA (TEMPORAL PRUEBA)
========================= */
app.post("/admin/cambiar-email-auth-prueba", async (req, res) => {
  try {
    const { user_id, email_nuevo } = req.body;

    if (!user_id || !email_nuevo) {
      return res.status(400).json({ error: "Faltan datos" });
    }

    const email = String(email_nuevo).trim().toLowerCase();

    // 1) cambiar email en AUTH
    const { data, error } = await supabase.auth.admin.updateUserById(user_id, {
      email,
      email_confirm: true
    });

    if (error) {
      return res.status(500).json({
        error: "Error actualizando email en Auth",
        detalle: error.message
      });
    }

    // 2) cambiar email en usuarios_1x3
    const { error: errorTabla } = await supabase
      .from("usuarios_1x3")
      .update({ email })
      .eq("user_id", user_id);

    if (errorTabla) {
      return res.status(500).json({
        error: "Auth actualizado, pero falló usuarios_1x3",
        detalle: errorTabla.message
      });
    }

    return res.json({
      ok: true,
      message: "Correo actualizado correctamente en Auth y usuarios_1x3",
      user_id,
      email,
      auth_user: data?.user || null
    });

  } catch (error) {
    console.error("❌ Error en /admin/cambiar-email-auth-prueba:", error.message);
    return res.status(500).json({
      error: "Error cambiando correo de prueba",
      detalle: error.message
    });
  }
});

/* =========================
   SERVER
========================= */
app.listen(3000, () => {
  console.log("🚀 BACKEND MEMBRESIA CARGADO");
  console.log("Servidor corriendo en http://localhost:3000");
});
