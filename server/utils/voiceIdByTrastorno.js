// server/utils/voiceIdByTrastorno.js (CommonJS)

function normKey(v) {
    return String(v || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_");
  }
  
  function getVoiceIdForTrastorno(trastorno) {
    const t = normKey(trastorno);
  
    const map = {
      // PERSONALIDAD
      tlp: process.env.ELEVEN_VOICE_TRANSTORNO_TLP,
      narcisista: process.env.ELEVEN_VOICE_TRANSTORNO_NARCISISTA,
      antisocial: process.env.ELEVEN_VOICE_TRANSTORNO_ANTISOCIAL,
      esquizoide: process.env.ELEVEN_VOICE_TRANSTORNO_ESQUIZOIDE,
      esquizotipico: process.env.ELEVEN_VOICE_TRANSTORNO_ESQUIZOTIPICO,
      paranoico: process.env.ELEVEN_VOICE_TRANSTORNO_PARANOICO,
  
      // ✅ NUEVOS
      tpo: process.env.ELEVEN_VOICE_TRANSTORNO_TPO,
      dependiente: process.env.ELEVEN_VOICE_TRANSTORNO_DEPENDIENTE,
  
      // ESTADOS DE ÁNIMO
      bipolar_ii: process.env.ELEVEN_VOICE_TRANSTORNO_BIPOLAR_II,
      depresion_mayor: process.env.ELEVEN_VOICE_TRANSTORNO_DEPRESION_MAYOR,
  
      // NEURODESARROLLO
      tea: process.env.ELEVEN_VOICE_TRANSTORNO_TEA,
      tda: process.env.ELEVEN_VOICE_TRANSTORNO_TDA,
      esquizofrenia: process.env.ELEVEN_VOICE_TRANSTORNO_ESQUIZOFRENIA,
  
      // PARAFÍLICOS
      voyeurismo: process.env.ELEVEN_VOICE_TRANSTORNO_VOYEURISMO,
      fetichismo: process.env.ELEVEN_VOICE_TRANSTORNO_FETICHISMO,
  
      // PROBLEMAS COTIDIANOS
      ansiedad: process.env.ELEVEN_VOICE_TRANSTORNO_ANSIEDAD,
      pareja: process.env.ELEVEN_VOICE_TRANSTORNO_PAREJA,
      sustancias: process.env.ELEVEN_VOICE_TRANSTORNO_SUSTANCIAS,
      duelo: process.env.ELEVEN_VOICE_TRANSTORNO_DUELO,
      agresividad: process.env.ELEVEN_VOICE_TRANSTORNO_AGRESIVIDAD,
      culpa: process.env.ELEVEN_VOICE_TRANSTORNO_CULPA,
      ideacion_suicida: process.env.ELEVEN_VOICE_TRANSTORNO_IDEACION_SUICIDA,
      autoestima: process.env.ELEVEN_VOICE_TRANSTORNO_AUTOESTIMA,
      codependencia: process.env.ELEVEN_VOICE_TRANSTORNO_CODEPENDENCIA,
  
      // ADOLESCENTES
      aislamiento: process.env.ELEVEN_VOICE_TRANSTORNO_AISLAMIENTO,
      ideacion_suicida_ado: process.env.ELEVEN_VOICE_TRANSTORNO_IDEACION_SUICIDA_ADO,
      abandono: process.env.ELEVEN_VOICE_TRANSTORNO_ABANDONO,
      rendimiento_bajo: process.env.ELEVEN_VOICE_TRANSTORNO_RENDIMIENTO_BAJO,
      autoestima_ado: process.env.ELEVEN_VOICE_TRANSTORNO_AUTOESTIMA_ADO,
  
      // EDUCATIVA
      padres: process.env.ELEVEN_VOICE_TRANSTORNO_PADRES,
      profesores: process.env.ELEVEN_VOICE_TRANSTORNO_PROFESORES,
      estudiantes: process.env.ELEVEN_VOICE_TRANSTORNO_ESTUDIANTES,
      bullying: process.env.ELEVEN_VOICE_TRANSTORNO_BULLYING,
      ideacion_suicida_edu: process.env.ELEVEN_VOICE_TRANSTORNO_IDEACION_SUICIDA_EDU,
      rendimiento_bajo_edu: process.env.ELEVEN_VOICE_TRANSTORNO_RENDIMIENTO_BAJO_EDU,
      autoestima_edu: process.env.ELEVEN_VOICE_TRANSTORNO_AUTOESTIMA_EDU,
      orientacion_vocacional: process.env.ELEVEN_VOICE_TRANSTORNO_ORIENTACION_VOCACIONAL,
  
      // LABORAL
      acoso_laboral: process.env.ELEVEN_VOICE_TRANSTORNO_ACOSO_LABORAL,
      burnout: process.env.ELEVEN_VOICE_TRANSTORNO_BURNOUT,
      despidos: process.env.ELEVEN_VOICE_TRANSTORNO_DESPIDOS,
      sim_entrevista_gerente: process.env.ELEVEN_VOICE_TRANSTORNO_SIM_ENTREVISTA_GERENTE,
      sim_entrevista_operario: process.env.ELEVEN_VOICE_TRANSTORNO_SIM_ENTREVISTA_OPERARIO,
      sim_entrevista_tecnico: process.env.ELEVEN_VOICE_TRANSTORNO_SIM_ENTREVISTA_TECNICO,
    };
  
    const v = map[t];
    const voiceId = String(v || "").trim();
    return voiceId ? voiceId : null;
  }
  
  module.exports = { getVoiceIdForTrastorno };