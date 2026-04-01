
require("dotenv").config();

const express = require("express");
const fs = require("fs");
const cors = require("cors");
const { ethers } = require("ethers");

const app = express();

app.use(cors());
app.use(express.json());

const DB_FILE = "usuarios.json";

const RPC_BSC = process.env.RPC_BSC || "https://bsc-dataseed.binance.org/";
const TOKEN_NOMBRE = "USDT";
const RED_PAGO = "BEP20";
const CHAIN_ID = 56;

const WALLET_MADRE =
  process.env.WALLET_MADRE || "0x08cc7d080473435c47cc2a89f5e10a1eecb81796";

const USDT_BEP20_CONTRACT =
  process.env.USDT_BEP20_CONTRACT || "0x55d398326f99059ff775485246999027b3197955";

const MONTO_MEMBRESIA = 15;

const MODO_SISTEMA = process.env.MODO_SISTEMA || "SIMULACION";

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
    }
  ],

  avanzado: [
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
    }
  ],

  recompra: [
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
   UTILIDADES
========================= */

function leerDB() {
  if (!fs.existsSync(DB_FILE)) return [];
  return JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
}

function guardarDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
  console.log("✅ Archivo guardado:", DB_FILE);
}

function buscarUsuario(email, usuarios) {
  return usuarios.find(u => u.email === email);
}

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
   REGISTRO - MODELO V1
========================= */
app.post("/registro", (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email y password son obligatorios"
      });
    }

    // 🔐 Normalizar correo
    const emailNormalizado = email.trim().toLowerCase();

    const usuarios = leerDB();

    // 🔎 Validar que el correo no exista
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

      // membresía
      membresia_activa: false,
      producto_entregado: false,

      // progreso
      nivel: 1,
      ciclo: 0,
      tableros_basico: 0,
      tableros_avanzado: 0,
      ciclos_grandes: 0,
      puede_recomprar: false,

      // red (deshabilitada por ahora)
      referidor: null,
      padre: null,
      hijos: [],

      // saldos
      saldo_directo: 0,
      saldo_total: 0,

      // billetera usuario
      wallet_usuario: null,
      wallet_red: RED_PAGO,
      wallet_validada: false,

      // pago inicial
      pago_inicial: {
        estado: "PENDIENTE",
        monto: 15,
        moneda: TOKEN_NOMBRE,
        red: RED_PAGO,
        billetera_destino: WALLET_MADRE,
        txid: null,
        captura_url: null,
        fecha_reporte: null,
        fecha_validacion: null,
        fecha_confirmacion: null,
        observacion: null,
        validacion_automatica: false
      },

      // material
      material: {
        basico_habilitado: false,
        avanzado_habilitado: false,
        recompra_habilitado: false,
        basico_url: "https://drive.google.com/tu-carpeta-basico",
        avanzado_url: "https://drive.google.com/tu-carpeta-avanzado",
        recompra_url: "https://drive.google.com/tu-carpeta-recompra"
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

      // tablero interno
      tableros: {
        nivel1: { A: [], B: [] },
        nivel2: { A: [], B: [] }
      },

      // historial
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
   UBICAR EN TABLERO
========================= */
function ubicarEnTablero(padre, hijoEmail, usuarios) {
  const nivelActual = padre.nivel === 1 ? "nivel1" : "nivel2";
  const tablero = padre.tableros[nivelActual];

  if (tablero.A.length < 3) {
    tablero.A.push(hijoEmail);
  } else {
    tablero.B.push(hijoEmail);
  }

  padre.historial.push({
    fecha: new Date(),
    tipo: "REFERIDO_ACTIVADO",
    detalle: {
      referido: hijoEmail,
      nivel: padre.nivel,
      tablero: tablero.A.includes(hijoEmail) ? "A" : "B"
    }
  });

//  if (padre.hijos.length < 3) {
  //  llenarAutomatico(padre, usuarios);
//  }

  verificarCierre(padre);
}

/* =========================
	VERIFICAR CIERRE
========================= */
function verificarCierre(user) {

  const nivelActual = user.nivel === 1 ? "nivel1" : "nivel2";
  const tablero = user.tableros[nivelActual];

  // ===== CIERRE TABLERO A =====
  if (tablero.A.length === 3 && !user.etapaB) {

    const pago = user.nivel === 1 ? 15 : 25;
    user.saldo_total += pago;

    user.historial.push({
      fecha: new Date(),
      tipo: "CIERRE_TABLERO_A",
      detalle: { nivel: user.nivel, pago }
    });

    user.etapaB = true;
    return;
  }

  // ===== CIERRE TABLERO B =====
  if (user.etapaB && tablero.B.length === 3) {

    const pago = user.nivel === 1 ? 15 : 25;
    user.saldo_total += pago;

    user.historial.push({
      fecha: new Date(),
      tipo: "CIERRE_TABLERO_B",
      detalle: { nivel: user.nivel, pago }
    });

    // 🔥 AVANCE DE NIVEL
    if (user.nivel === 1) {
      user.nivel = 2;
    } else {
      user.ciclos_grandes += 1;
    }

    // 🔥 REINICIO COMPLETO SOLO AQUÍ
    user.etapaB = false;
    user.tableros[nivelActual] = { A: [], B: [] };
  }
}

/* =========================
   INGRESAR A MATRIZ UNIVERSAL (LOGICA FINAL 100% COMPLETA)
   TODO: CADA PADRE TIENE 3 HIJOS POR DERRAME | VALORES AJUSTADOS
========================= */
function ingresarAMatrizUniversal(user, usuarios) {
  // Asegurar todas las propiedades necesarias en el usuario
  if (!user.estado) user.estado = "ACTIVO";
  if (!user.matrizActual) {
    user.matrizActual = { nivel: "CILO1", bloque: "A", hijos: [], completado: false };
  }
  if (!user.acumuladoCicloPequeño) user.acumuladoCicloPequeño = 0;
  if (!user.acumuladoCicloGrande) user.acumuladoCicloGrande = 0;
  if (!user.ciclosPequeñosCompletados) user.ciclosPequeñosCompletados = 0;
  if (!user.pagoDisponible) user.pagoDisponible = 0;
  if (!user.hijos) user.hijos = [];
  if (!user.tableros) {
    user.tableros = { 
      nivel1: { A: [], B: [] }, 
      nivel2: { C: [], D: [] } 
    };
  }
  if (!user.hijosCompletaronBloque) user.hijosCompletaronBloque = 0;


  // FUNCION AUXILIAR: COMPLETAR BLOQUE Y ACTUALIZAR PADRES
  function completarBloqueYActualizarJerarquia(usuario) {
    const nivel = usuario.matrizActual.nivel;
    const bloque = usuario.matrizActual.bloque;

    // Marcar bloque como completado y asignar recompensa
    usuario.matrizActual.completado = true;
    if (nivel === "CILO1" && bloque === "A") {
      usuario.acumuladoCicloPequeño += 15;
      usuario.matrizActual = { nivel: "CILO1", bloque: "B", hijos: [], completado: false };
      usuario.tableros.nivel1.A = [...usuario.matrizActual.hijos];
    }
    if (nivel === "CILO1" && bloque === "B") {
      usuario.acumuladoCicloPequeño += 15;
      usuario.matrizActual = { nivel: "CILO2", bloque: "C", hijos: [], completado: false };
      usuario.tableros.nivel1.B = [...usuario.matrizActual.hijos];
    }
    if (nivel === "CILO2" && bloque === "C") {
      usuario.acumuladoCicloPequeño += 25;
      usuario.matrizActual = { nivel: "CILO2", bloque: "D", hijos: [], completado: false };
      usuario.tableros.nivel2.C = [...usuario.matrizActual.hijos];
    }
    if (nivel === "CILO2" && bloque === "D") {
      usuario.acumuladoCicloPequeño += 25;
      usuario.acumuladoCicloGrande += 80;
      usuario.ciclosPequeñosCompletados += 1;
      usuario.matrizActual = { nivel: "CILO1", bloque: "A", hijos: [], completado: false };
      usuario.tableros.nivel2.D = [...usuario.matrizActual.hijos];
      usuario.acumuladoCicloPequeño = 0;
    }

    // ACTUALIZAR PADRE CUANDO SU HIJO COMPLETA SU BLOQUE
    if (usuario.padre) {
      const padre = usuarios.find(u => u.email === usuario.padre);
      if (padre) {
        padre.hijosCompletaronBloque += 1;
        
        // SI PADRE TIENE 3 HIJOS QUE COMPLETARON SU BLOQUE → ACTUALIZAR EL DE PADRE
        if (padre.hijosCompletaronBloque === 3) {
          if (padre.matrizActual.nivel === "CILO1" && padre.matrizActual.bloque === "B") {
            padre.acumuladoCicloPequeño += 15;
            padre.matrizActual = { nivel: "CILO2", bloque: "C", hijos: [], completado: false };
            padre.hijosCompletaronBloque = 0;
          }
          if (padre.matrizActual.nivel === "CILO2" && padre.matrizActual.bloque === "D") {
            padre.acumuladoCicloGrande += 80;
            padre.ciclosPequeñosCompletados += 1;
            padre.matrizActual = { nivel: "CILO1", bloque: "A", hijos: [], completado: false };
            padre.acumuladoCicloPequeño = 0;
            // RESTAR 15 PARA NUEVO MATERIAL CUANDO SE COMPLETE CICLO GRANDE
            if (padre.ciclosPequeñosCompletados === 3) {
              padre.pagoDisponible = padre.acumuladoCicloGrande - 30;
              padre.acumuladoCicloGrande = 0;
              padre.ciclosPequeñosCompletados = 0;
            }
          }
        }
      }
    }
  }


  // PASO 1: ASIGNAR PADRE POR DERRAME EN ORDEN
  const usuariosActivos = usuarios.filter(u => u.estado === "ACTIVO");
  let padreAsignado = null;

  // PRIMERO: ASIGNAR A "exito@correo.com" LOS PRIMEROS 3 HIJOS
  const cuentaPrincipal = usuarios.find(u => u.email === "exito@correo.com");
  if (cuentaPrincipal && cuentaPrincipal.tableros.nivel1.A.length < 3) {
    padreAsignado = cuentaPrincipal;
  } 
  // SI CUENTA PRINCIPAL YA TIENE 3 HIJOS → ASIGNAR A LOS HIJOS DE ESTA
  else if (cuentaPrincipal) {
    // ASIGNAR A exito1 SI AUN LE FALTAN HIJOS
    const hijo1 = usuarios.find(u => u.email === "exito1@correo.com");
    if (hijo1 && hijo1.tableros.nivel1.A.length < 3) {
      padreAsignado = hijo1;
    }
    // LUEGO A exito2
    else if (hijo1) {
      const hijo2 = usuarios.find(u => u.email === "exito2@correo.com");
      if (hijo2 && hijo2.tableros.nivel1.A.length < 3) {
        padreAsignado = hijo2;
      }
      // LUEGO A exito3
      else if (hijo2) {
        const hijo3 = usuarios.find(u => u.email === "exito3@correo.com");
        if (hijo3 && hijo3.tableros.nivel1.A.length < 3) {
          padreAsignado = hijo3;
        }
      }
    }
  }


  // PASO 2: ASIGNAR HIJO Y ACTUALIZAR LISTAS
  if (padreAsignado) {
    user.padre = padreAsignado.email;
    user.referidor = padreAsignado.email;
    padreAsignado.hijos.push(user.email);
    padreAsignado.tableros.nivel1.A.push(user.email);
    padreAsignado.matrizActual.hijos.push(user.email);
    usuarios.push(user);

    // SI EL PADRE YA TIENE 3 HIJOS → COMPLETAR SU BLOQUE Y ACTUALIZAR
    if (padreAsignado.matrizActual.hijos.length === 3) {
      completarBloqueYActualizarJerarquia(padreAsignado);
    }
  }
  // SI NO HAY PADRE → ES LA CUENTA PRINCIPAL
  else {
    user.padre = null;
    user.referidor = null;
    usuarios.push(user);
  }


  // PASO 3: AJUSTES FINALES PARA CICLO GRANDE
  const todosCompletados = usuariosActivos.every(u => 
    u.matrizActual.completado && u.ciclosPequeñosCompletados >= 1
  );
  if (todosCompletados && usuariosActivos.length === 13) {
    const cuentaPrincipalFinal = usuarios.find(u => u.email === "exito@correo.com");
    if (cuentaPrincipalFinal) {
      cuentaPrincipalFinal.acumuladoCicloPequeño = 30;
      cuentaPrincipalFinal.acumuladoCicloGrande = 80;
      cuentaPrincipalFinal.pagoDisponible = 80 - 15; // RESTAR 15 PARA MATERIAL
    }
  }
}


/* =========================
   RESUMEN
========================= */
app.get("/resumen/:email", (req, res) => {
  try {


const usuarios = leerDB();
const user = buscarUsuario(req.params.email, usuarios);


    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // 🔒 Tablero seguro
    const tableroActual =
      user?.tableros?.nivel1 || { A: [], B: [] };

    // 🔒 Historial seguro
    const historialSeguro = Array.isArray(user.historial)
      ? user.historial
      : [];

    // 🔥 Reconstruir estado de descarga desde historial
    const yaUsoBasico = historialSeguro.some(
      e =>
        e.tipo === "MATERIAL_SELECCIONADO" &&
        e.detalle?.nivel === "basico"
    );

    const yaUsoAvanzado = historialSeguro.some(
      e =>
        e.tipo === "MATERIAL_SELECCIONADO" &&
        e.detalle?.nivel === "avanzado"
    );

    const yaUsoRecompra = historialSeguro.some(
      e =>
        e.tipo === "MATERIAL_SELECCIONADO" &&
        e.detalle?.nivel === "recompra"
    );

    // 🔍 Debug temporal
    console.log("USER COMPLETO:", user);

    res.json({
      email: user.email,
      estado: user.estado,

      nivel: user.nivel,
      ciclo: user.ciclo,
      tableros_basico: user.tableros_basico || 0,
      tableros_avanzado: user.tableros_avanzado || 0,
      ciclos_grandes: user.ciclos_grandes || 0,
      puede_recomprar: user.puede_recomprar || false,
      saldo_directo: user.saldo_directo || 0,
      saldo_total: user.saldo_total || 0,

      wallet: user.wallet_usuario || null,
      wallet_red: user.wallet_red || null,
      wallet_validada: user.wallet_validada || false,

      hijos: user.hijos || [],
      tableroA: tableroActual?.A || [],
      tableroB: tableroActual?.B || [],

      pago_inicial: user.pago_inicial || null,

      material: {
        basico:
          user.material?.basico_habilitado
            ? user.material.basico_url
            : null,
        avanzado:
          user.material?.avanzado_habilitado
            ? user.material.avanzado_url
            : null,
        recompra:
          user.material?.recompra_habilitado
            ? user.material.recompra_url
            : null
      },

      descarga_usada: {
        basico: yaUsoBasico,
        avanzado: yaUsoAvanzado,
        recompra: yaUsoRecompra
      },

      avance_visible: user.avance_visible || {
        hito_30: false,
        hito_50: false,
        hito_3_ciclos: false
      },

      total_retirado: user.total_retirado || 0,
      retiros: user.retiros || [],
      historial: historialSeguro
    });

  } catch (error) {
    res.status(500).json({
      error: "Error obteniendo resumen",
      detalle: error.message
    });
  }
});

/* =========================
   RECOMPRA AUTOMÁTICA / MANUAL
========================= */
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

async function validarPagoAutomaticoBSC(txid) {
  const receipt = await rpcBsc("eth_getTransactionReceipt", [txid]);

  if (!receipt) {
    return { ok: false, motivo: "No se encontró la transacción" };
  }

  if (receipt.status !== "0x1") {
    return {
      ok: false,
      motivo: `La transacción no fue exitosa. Status recibido: ${receipt.status}`
    };
  }

  const logs = Array.isArray(receipt.logs) ? receipt.logs : [];
  const walletMadre = normalizarHex(WALLET_MADRE);
  const contrato = normalizarHex(USDT_BEP20_CONTRACT);
  const transferTopic =
    "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

  for (const log of logs) {
    const logAddress = normalizarHex(log.address);
    const topics = Array.isArray(log.topics) ? log.topics : [];

    if (logAddress !== contrato) continue;
    if (topics.length < 3) continue;
    if (normalizarHex(topics[0]) !== transferTopic) continue;

    const to = normalizarHex(topicAAddress(topics[2]));
    if (to !== walletMadre) continue;

    const amount = weiAUnidad(log.data, 18);

    if (amount < MONTO_MEMBRESIA) {
      return {
        ok: false,
        motivo: `Monto insuficiente. Llegaron ${amount} y se requerían al menos ${MONTO_MEMBRESIA}`
      };
    }

    return {
      ok: true,
      motivo: "Pago validado automáticamente",
      detalle: {
        to,
        contract: log.address,
        amount,
        excedente: amount - MONTO_MEMBRESIA
      }
    };
  }

  return {
    ok: false,
    motivo: "No se encontró una transferencia válida del token a la wallet madre"
  };
}

/* =========================
   REPORTAR PAGO
========================= */
app.post("/reportar-pago", async (req, res) => {
  try {
    const { email, txid, captura_url } = req.body;

    const usuarios = leerDB();
    const user = buscarUsuario(email, usuarios);

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    if (!txid) {
      return res.status(400).json({ error: "TXID requerido" });
    }

    if (txYaUsado(txid, usuarios, email)) {
      return res.status(400).json({
        error: "Ese TXID ya fue usado en otra operación"
      });
    }

    user.estado = "PENDIENTE_PAGO";
    user.pago_inicial.estado = "REPORTADO";
    user.pago_inicial.moneda = TOKEN_NOMBRE;
    user.pago_inicial.red = RED_PAGO;
    user.pago_inicial.billetera_destino = WALLET_MADRE;
    user.pago_inicial.txid = txid;
    user.pago_inicial.captura_url = captura_url || null;
    user.pago_inicial.fecha_reporte = new Date();

    user.historial.push({
      fecha: new Date(),
      tipo: "PAGO_REPORTADO",
      detalle: {
        txid,
        captura_url: captura_url || null,
        red: RED_PAGO,
        moneda: TOKEN_NOMBRE
      }
    });

    /* =========================
       MODO SIMULACION
    ========================= */
    if (MODO_SISTEMA === "SIMULACION") {

      user.estado = "ACTIVO";
      user.fecha_activacion = new Date();
      user.membresia_activa = true;
      user.producto_entregado = true;
      user.material.basico_habilitado = true;

      user.pago_inicial.estado = "CONFIRMADO";
      user.pago_inicial.fecha_confirmacion = new Date();
      user.pago_inicial.validacion_automatica = false;

      user.historial.push({
        fecha: new Date(),
        tipo: "PAGO_SIMULADO",
        detalle: { txid }
      });

      user.historial.push({
        fecha: new Date(),
        tipo: "ACTIVACION",
        detalle: { nivel: 1 }
      });

      user.historial.push({
        fecha: new Date(),
        tipo: "INGRESO_MATRIZ"
      });

      // 🔥 INGRESO REAL A MATRIZ
      ingresarAMatrizUniversal(user, usuarios);

      guardarDB(usuarios);

      return res.json({
        message: "Pago simulado y usuario activado",
        validacion_automatica: false,
        modo: "SIMULACION",
        usuario: user
      });
    }

    /* =========================
       VALIDACION AUTOMATICA REAL
    ========================= */
    let validacionAutomatica = null;

    try {
      user.pago_inicial.estado = "VALIDANDO";
      user.pago_inicial.fecha_validacion = new Date();

      validacionAutomatica = await validarPagoAutomaticoBSC(txid);

      if (validacionAutomatica.ok) {

        user.estado = "ACTIVO";
        user.fecha_activacion = new Date();
        user.membresia_activa = true;
        user.producto_entregado = true;
        user.material.basico_habilitado = true;

        user.pago_inicial.estado = "CONFIRMADO";
        user.pago_inicial.fecha_confirmacion = new Date();
        user.pago_inicial.validacion_automatica = true;

        const excedente = validacionAutomatica?.detalle?.excedente || 0;

        if (excedente > 0) {
          user.saldo_total += excedente;
        }

        user.historial.push({
          fecha: new Date(),
          tipo: "PAGO_VALIDADO_AUTOMATICAMENTE",
          detalle: { txid }
        });

        user.historial.push({
          fecha: new Date(),
          tipo: "ACTIVACION",
          detalle: { nivel: 1 }
        });

        user.historial.push({
          fecha: new Date(),
          tipo: "INGRESO_MATRIZ"
        });

        // 🔥 INGRESO REAL A MATRIZ
        ingresarAMatrizUniversal(user, usuarios);

        guardarDB(usuarios);

        return res.json({
          message: "Pago validado automáticamente y usuario activado",
          validacion_automatica: true,
          usuario: user
        });
      }

      // ❌ FALLA VALIDACION
      user.pago_inicial.estado = "REPORTADO";

      user.historial.push({
        fecha: new Date(),
        tipo: "VALIDACION_AUTOMATICA_FALLIDA",
        detalle: { txid, motivo: validacionAutomatica.motivo }
      });

      guardarDB(usuarios);

      return res.json({
        message: "Pago reportado correctamente",
        validacion_automatica: false,
        usuario: user
      });

    } catch (errorInterno) {

      user.pago_inicial.estado = "REPORTADO";

      user.historial.push({
        fecha: new Date(),
        tipo: "VALIDACION_AUTOMATICA_ERROR",
        detalle: { txid, motivo: errorInterno.message }
      });

      guardarDB(usuarios);

      return res.status(500).json({
        error: "Error validando pago automáticamente",
        detalle: errorInterno.message
      });
    }

  } catch (error) {
    return res.status(500).json({
      error: "Error reportando pago",
      detalle: error.message
    });
  }
});

/* =========================
   SIMULAR AVANCE
========================= */
function simularAvance(user) {

  if (user.estado !== "ACTIVO") return { error: "Usuario no activo" };

  // ===== BÁSICO =====
  if (user.nivel === 1) {
    user.tableros_basico += 1;
    user.ciclo += 1;

    user.historial.push({
      fecha: new Date(),
      tipo: "AVANCE_BASICO",
      detalle: {
        tablero_basico_actual: user.tableros_basico,
        mensaje: "El sistema simuló un avance en básico"
      }
    });

    // Pago al completar 2 básicos
    if (user.tableros_basico === 2) {
      user.saldo_total += 80;

      user.historial.push({
        fecha: new Date(),
        tipo: "PAGO_CICLO_PEQUENO_LIBERADO",
        detalle: {
          valor: 80,
          mensaje: "Se liberaron 80 por completar el ciclo pequeño"
        }
      });

      // Subir a avanzado
      user.nivel = 2;
      user.ciclo = 0;
      user.material.avanzado_habilitado = true;

      user.historial.push({
        fecha: new Date(),
        tipo: "SUBE_A_AVANZADO",
        detalle: {
          mensaje: "El usuario subió al nivel avanzado"
        }
      });
    }

    return { ok: true, etapa: "BASICO" };
  }

  // ===== AVANZADO =====
  if (user.nivel === 2) {
    user.tableros_avanzado += 1;
    user.ciclo += 1;

    user.historial.push({
      fecha: new Date(),
      tipo: "AVANCE_AVANZADO",
      detalle: {
        tablero_avanzado_actual: user.tableros_avanzado,
        mensaje: "El sistema simuló un avance en avanzado"
      }
    });

    // Completa ciclo grande al llegar a 2 avanzados
    if (user.tableros_avanzado === 2) {
      user.ciclos_grandes += 1;
      user.saldo_total += 240;

      user.historial.push({
        fecha: new Date(),
        tipo: "PAGO_CICLO_GRANDE_LIBERADO",
        detalle: {
          valor: 240,
          ciclos_grandes: user.ciclos_grandes,
          mensaje: "Se liberaron 240 por completar un ciclo grande"
        }
      });

      // ===== RECOMPRA OBLIGATORIA =====
      const descuentoMaterial = 15;
      const descuentoReingreso = 15;
      const descuentoTotal = descuentoMaterial + descuentoReingreso;

      if (user.saldo_total >= descuentoTotal) {
        user.saldo_total -= descuentoTotal;

        // Habilitar material de nuevo ciclo
        user.material.recompra_habilitado = true;

        // Reinicio al tablero 1
        user.nivel = 1;
        user.ciclo = 0;
        user.tableros_basico = 0;
        user.tableros_avanzado = 0;
        user.material.avanzado_habilitado = false;
        user.puede_recomprar = false;
        user.hijos = [];
        user.padre = null;

        user.tableros = {
          nivel1: { A: ["AUTO_POSICION_1"], B: [] },
          nivel2: { A: [], B: [] }
        };

        // Reiniciar hitos visibles para el nuevo ciclo
        user.avance_visible = {
          hito_30: false,
          hito_50: false,
          hito_3_ciclos: false
        };

        user.historial.push({
          fecha: new Date(),
          tipo: "RECOMPRA_FORZADA",
          detalle: {
            descuento_material: descuentoMaterial,
            descuento_reingreso: descuentoReingreso,
            descuento_total: descuentoTotal,
            saldo_restante: user.saldo_total,
            mensaje: "El sistema ejecutó recompra obligatoria y reinició al tablero 1"
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
            mensaje: "Usuario reingresado a la matriz 1"
          }
        });
      } else {
        user.puede_recomprar = true;

        user.historial.push({
          fecha: new Date(),
          tipo: "RECOMPRA_PENDIENTE",
          detalle: {
            mensaje: "No hay saldo suficiente para ejecutar la recompra obligatoria"
          }
        });
      }
    }

    return { ok: true, etapa: "AVANZADO" };
  }

  return { error: "Nivel no válido" };
}

/* =========================
   SIMULAR AVANCE ENDPOINT
========================= */
app.post("/simular-avance", (req, res) => {
  try {
    const { email } = req.body;
    const usuarios = leerDB();
    const user = buscarUsuario(email, usuarios);

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const resultado = simularAvance(user);

    if (resultado.error) {
      return res.status(400).json({ error: resultado.error });
    }

    guardarDB(usuarios);

    return res.json({
      message: "Avance simulado correctamente",
      etapa: resultado.etapa,
      usuario: user
    });
  } catch (error) {
    return res.status(500).json({
      error: "Error simulando avance",
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
   ENVIAR PAGO AUTOMÁTICO
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

    // ===== MODO SIMULACION =====
    if (MODO_SISTEMA === "SIMULACION") {
      user.saldo_total -= montoNumero;

      const retiro = {
        id: Date.now(),
        monto: montoNumero,
        estado: "SIMULADO",
        fecha_solicitud: new Date(),
        fecha_confirmacion: new Date(),
        wallet: user.wallet_usuario,
        txid: `SIMULADO_${Date.now()}`
      };

      user.retiros.push(retiro);
      user.total_retirado += montoNumero;

      user.historial.push({
        fecha: new Date(),
        tipo: "PAGO_SIMULADO_SALIENTE",
        detalle: {
          monto: montoNumero,
          wallet: user.wallet_usuario,
          txid: retiro.txid,
          mensaje: "Pago saliente simulado correctamente"
        }
      });

      guardarDB(usuarios);

      return res.json({
        message: "Pago simulado correctamente",
        modo: "SIMULACION",
        retiro,
        usuario: user.email,
        saldo_restante: user.saldo_total
      });
    }

    // ===== MODO REAL =====
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
        wallet: user.wallet_usuario,
        mensaje: "Pago enviado automáticamente desde el backend"
      }
    });

    guardarDB(usuarios);

    return res.json({
      message: "Pago enviado correctamente",
      modo: "REAL",
      txid: tx.hash,
      retiro,
      usuario: user.email,
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
   MATERIALES DISPONIBLES
========================= */
app.get("/materiales-disponibles/:email", (req, res) => {
  try {
    const usuarios = leerDB();
    const user = buscarUsuario(req.params.email, usuarios);

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    let nivelDisponible = null;

    if (user.material?.recompra_habilitado) {
      nivelDisponible = "recompra";
    } else if (user.material?.avanzado_habilitado) {
      nivelDisponible = "avanzado";
    } else if (user.material?.basico_habilitado) {
      nivelDisponible = "basico";
    }

    return res.json({
      email: user.email,
      nivel_disponible: nivelDisponible,
      descarga_usada: user.descarga_usada || {},
      material_seleccionado: user.material_seleccionado || {},
      opciones: nivelDisponible ? (CATALOGO_MATERIAL[nivelDisponible] || []) : []
    });

  } catch (error) {
    return res.status(500).json({
      error: "Error obteniendo materiales",
      detalle: error.message
    });
  }
});

/* =========================
   ELEGIR MATERIAL
========================= */
app.post("/elegir-material", (req, res) => {
  try {
    const { email, material_id } = req.body;

console.log("📩 BODY:", req.body);
console.log("📩 material_id:", material_id);


    if (!email || !material_id) {
      return res.status(400).json({ error: "Faltan datos" });
    }

    const usuarios = leerDB();
    const user = buscarUsuario(email, usuarios);

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    let nivel = null;

    if (user.material?.recompra_habilitado) {
      nivel = "recompra";
    } else if (user.material?.avanzado_habilitado) {
      nivel = "avanzado";
    } else if (user.material?.basico_habilitado) {
      nivel = "basico";
    }

    if (!nivel) {
      return res.status(400).json({ error: "No tiene material disponible" });
    }

    if (!user.descarga_usada) {
      user.descarga_usada = {
        basico: false,
        avanzado: false,
        recompra: false
      };
    }

    if (!user.material_seleccionado) {
      user.material_seleccionado = {
        basico: null,
        avanzado: null,
        recompra: null
      };
    }

    if (user.descarga_usada[nivel]) {
      return res.status(400).json({
        error: "Ya usó su elección de material en este nivel"
      });
    }

    const material = (CATALOGO_MATERIAL[nivel] || []).find(
      item => item.id === material_id
    );

    if (!material) {
      return res.status(404).json({ error: "Material no encontrado" });
    }

    user.material_seleccionado[nivel] = material;
    user.descarga_usada[nivel] = true;

    user.historial.push({
      fecha: new Date(),
      tipo: "MATERIAL_SELECCIONADO",
      detalle: {
        nivel,
        material_id: material.id,
        titulo: material.titulo,
        mensaje: "El usuario seleccionó su material disponible"
      }
    });

    guardarDB(usuarios);

    return res.json({
      message: "Material seleccionado correctamente",
      nivel,
      material
    });

  } catch (error) {
    return res.status(500).json({
      error: "Error seleccionando material",
      detalle: error.message
    });
  }
});

app.delete("/reset", (req, res) => {
  guardarDB([]);
  res.json({ message: "Base de datos reiniciada correctamente" });
});


/* =========================
   SERVER
========================= */
app.listen(3000, () => {
  console.log("🚀 BACKEND MEMBRESIA CARGADO");
  console.log("Servidor corriendo en http://localhost:3000");
});
