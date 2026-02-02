const ais = require('./escalas/ansiedad_infantil_spence');
const eps = require('./escalas/escala_probabilidad_suicidio');
const hhd = require('./escalas/hdrs_ham_dep');
const evms = require('./vf/esc_evi_mal_soc');
const ften = require('./vf/fne_tem_eval_neg');
const cfsa = require('./completar/fra_incomp_sac_adul');
const cfsn = require('./completar/fra_incomp_sac_nin');
const pseisf = require('./marque_x/personalidad_16_PF');
const ibd = require('./marque_x/inv_beck_dep');

module.exports = [ais, eps, hhd, evms, ften, cfsa, cfsn, pseisf, ibd];
