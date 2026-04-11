const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/* =========================
   OBTENER SIGUIENTE ORDEN
========================= */
async function obtenerSiguienteOrden(bloque) {
  const { data, error } = await supabase
    .from("colas_1x3")
    .select("orden")
    .eq("bloque", bloque)
    .order("orden", { ascending: false })
    .limit(1);

  if (error) throw error;

  if (!data || data.length === 0) {
    return 1;
  }

  return data[0].orden + 1;
}

/* =========================
   INSERTAR EN COLA
========================= */
async function insertarEnCola(bloque) {
  const siguiente = await obtenerSiguienteOrden(bloque);

  const { data, error } = await supabase
    .from("colas_1x3")
    .insert([{ bloque, orden: siguiente }])
    .select();

  if (error) throw error;

  return data[0];
}

/* =========================
   EXPORTAR FUNCIONES
========================= */
module.exports = {
  obtenerSiguienteOrden,
  insertarEnCola,
};
