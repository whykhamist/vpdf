import { n as __name } from "./chunk-Y2CYZVJY-CfdURDvj.js";
import { R as select_default } from "./src-D5-_by6k.js";
//#region ../../node_modules/mermaid/dist/chunks/mermaid.core/chunk-XXDRQBXY.mjs
var getDiagramElement = /* @__PURE__ */ __name((id, securityLevel) => {
	let sandboxElement;
	if (securityLevel === "sandbox") sandboxElement = select_default("#i" + id);
	return (securityLevel === "sandbox" ? select_default(sandboxElement.nodes()[0].contentDocument.body) : select_default("body")).select(`[id="${id}"]`);
}, "getDiagramElement");
//#endregion
export { getDiagramElement as t };
