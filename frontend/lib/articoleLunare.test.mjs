// node lib/articoleLunare.test.mjs (din frontend/). Pica daca adresele lunare vechi ajung iar pe 404.
import assert from "node:assert/strict";
import { adresaArticolVechi as a } from "./articoleLunare.ts";

const articole = ["cod-reducere-otter-noiembrie-2026", "top-reduceri-fashion-noiembrie-2026", "cel-mai-bun-laptop-2026"];
const magazine = ["otter.ro", "petmax.ro", "faradaunatori.ro", "esyhair.com/en"];

assert.equal(a("cod-reducere-otter-iunie-2026", articole, magazine), "/blog/cod-reducere-otter-noiembrie-2026");
assert.equal(a("top-reduceri-fashion-iunie-2026", articole, magazine), "/blog/top-reduceri-fashion-noiembrie-2026");
assert.equal(a("cod-reducere-petmax-mai-2026", articole, magazine), "/cod-reducere/petmax.ro");
assert.equal(a("cod-reducere-fara-daunatori-iunie-2026", articole, magazine), "/cod-reducere/faradaunatori.ro");
assert.equal(a("cele-mai-bune-reduceri-saptamana-mai-2026", articole, magazine), "/oferte-azi");
// Magazin iesit din program: 404 cinstit, nu alta pagina.
assert.equal(a("cod-reducere-bookzone-iunie-2026", articole, magazine), null);
// O adresa fara luna nu e articol lunar.
assert.equal(a("cel-mai-bun-telefon-2026", articole, magazine), null);
// Nu se trimite spre ea insasi, ca sa nu iasa o bucla.
assert.equal(a("cod-reducere-otter-noiembrie-2026", ["cod-reducere-otter-noiembrie-2026"], []), null);
console.log("Toate testele trec.");
