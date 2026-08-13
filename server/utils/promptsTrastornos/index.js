// server/utils/promptsTrastornos/index.js
// =========================================================
// Un prompt por trastorno para el paciente simulado.
//
// Cada archivo de esta carpeta define la conducta de un
// paciente distinto. Todos quedan registrados en el panel
// de Prompts de IA, así que el equipo clínico puede
// ajustarlos sin tocar código.
//
// Si un trastorno no tiene prompt propio (o su texto quedó
// vacío), el sistema usa el genérico "sim.paciente.turno".
// =========================================================

const { registerPrompt, getPrompt } = require("../promptStore");

const tlp = require("./tlp");
const narcisista = require("./narcisista");
const antisocial = require("./antisocial");
const esquizoide = require("./esquizoide");
const esquizotipico = require("./esquizotipico");
const tpo = require("./tpo");
const dependiente = require("./dependiente");
const paranoico = require("./paranoico");
const bipolarIi = require("./bipolar_ii");
const depresionMayor = require("./depresion_mayor");
const tea = require("./tea");
const tda = require("./tda");
const esquizofrenia = require("./esquizofrenia");
const voyeurismo = require("./voyeurismo");
const fetichismo = require("./fetichismo");
const ansiedad = require("./ansiedad");
const pareja = require("./pareja");
const sustancias = require("./sustancias");
const duelo = require("./duelo");
const agresividad = require("./agresividad");
const culpa = require("./culpa");
const ideacionSuicida = require("./ideacion_suicida");
const autoestima = require("./autoestima");
const codependencia = require("./codependencia");
const aislamiento = require("./aislamiento");
const ideacionSuicidaAdo = require("./ideacion_suicida_ado");
const abandono = require("./abandono");
const rendimientoBajo = require("./rendimiento_bajo");
const autoestimaAdo = require("./autoestima_ado");
const padres = require("./padres");
const profesores = require("./profesores");
const estudiantes = require("./estudiantes");
const bullying = require("./bullying");
const ideacionSuicidaEdu = require("./ideacion_suicida_edu");
const rendimientoBajoEdu = require("./rendimiento_bajo_edu");
const autoestimaEdu = require("./autoestima_edu");
const orientacionVocacional = require("./orientacion_vocacional");
const acosoLaboral = require("./acoso_laboral");
const burnout = require("./burnout");
const despidos = require("./despidos");
const simEntrevistaGerente = require("./sim_entrevista_gerente");
const simEntrevistaOperario = require("./sim_entrevista_operario");
const simEntrevistaTecnico = require("./sim_entrevista_tecnico");

const TRASTORNOS = [
  tlp,
  narcisista,
  antisocial,
  esquizoide,
  esquizotipico,
  tpo,
  dependiente,
  paranoico,
  bipolarIi,
  depresionMayor,
  tea,
  tda,
  esquizofrenia,
  voyeurismo,
  fetichismo,
  ansiedad,
  pareja,
  sustancias,
  duelo,
  agresividad,
  culpa,
  ideacionSuicida,
  autoestima,
  codependencia,
  aislamiento,
  ideacionSuicidaAdo,
  abandono,
  rendimientoBajo,
  autoestimaAdo,
  padres,
  profesores,
  estudiantes,
  bullying,
  ideacionSuicidaEdu,
  rendimientoBajoEdu,
  autoestimaEdu,
  orientacionVocacional,
  acosoLaboral,
  burnout,
  despidos,
  simEntrevistaGerente,
  simEntrevistaOperario,
  simEntrevistaTecnico,
];

/** Variables disponibles en todos los prompts de paciente. */
const VARIABLES = ['identidad', 'problema', 'therapistText', 'minutosTranscurridos', 'tiempoTranscurrido', 'numeroTurno', 'fase'];

/* ========== Registro en el panel del súper usuario ========== */
for (const t of TRASTORNOS) {
  registerPrompt({
    clave: t.clave,
    nombre: t.nombre,
    categoria: t.categoria,
    descripcion: t.descripcion,
    variables: VARIABLES,
    defecto: t.contenido,
  });
}

/** Índice trastorno -> clave de prompt. */
const PORTRASTORNO = new Map(TRASTORNOS.map((t) => [t.trastorno, t.clave]));

function normKey(v) {
  return String(v || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "_");
}

/**
 * Devuelve la clave de prompt que corresponde a un trastorno.
 * Si no hay uno específico, cae en el genérico.
 */
function resolverClavePrompt(trastorno) {
  const clave = PORTRASTORNO.get(normKey(trastorno));
  if (!clave) return "sim.paciente.turno";

  // Si el texto quedó vacío desde el panel, usamos el genérico
  const texto = String(getPrompt(clave) || "").trim();
  return texto ? clave : "sim.paciente.turno";
}

/** Lista de trastornos que ya tienen prompt propio. */
function listarTrastornosConPrompt() {
  return TRASTORNOS.map((t) => ({
    trastorno: t.trastorno,
    clave: t.clave,
    nombre: t.nombre,
    categoria: t.categoria,
  }));
}

module.exports = {
  TRASTORNOS,
  VARIABLES,
  resolverClavePrompt,
  listarTrastornosConPrompt,
};
