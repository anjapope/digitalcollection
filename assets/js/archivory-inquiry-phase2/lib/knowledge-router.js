import { loadKnowledgeFile } from "./loaders.js";
function scoreModule(question, moduleConfig) {
  const q = question.toLowerCase();
  return moduleConfig.keywords.reduce((n, k) => n + (q.includes(k.toLowerCase()) ? 1 : 0), 0);
}
export async function selectKnowledge(question, config) {
  const ranked = Object.entries(config.modules).map(([moduleId,moduleConfig]) => ({moduleId,moduleConfig,score:scoreModule(question,moduleConfig)})).sort((a,b)=>b.score-a.score);
  const selected = ranked.filter((e,i)=>i===0 || e.score>0).slice(0,2);
  const chunks = [];
  for (const e of selected) {
    const content = await loadKnowledgeFile(e.moduleConfig.knowledgeFile);
    chunks.push(`MODULE ID: ${e.moduleId}\nMODULE LABEL: ${e.moduleConfig.label}\n\n${content}`);
  }
  return chunks.join("\n\n====================\n\n").slice(0, config.limits.knowledgeCharactersPerRequest);
}
