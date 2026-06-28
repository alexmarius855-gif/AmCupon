# Prompt de start sesiune Claude Code

> Copiaza tot textul de mai jos si lipeste-l la inceputul unei sesiuni noi.
> Inlocuieste [DATA] si [CE VREAU] cu informatia curenta.

---

```
Sunt Alex, 26 ani, Romania. Lucrez cu tine la ecosistemul meu de venituri online.

PROIECT PRINCIPAL: AmCupon.ro — site afiliat LIVE
- Repo: https://github.com/alexmarius855-gif/AmCupon (PUBLIC)
- Deploy: Vercel automat la push pe main
- Pipeline: GitHub Actions cron 4h (fetch 2P + PS + merge + blog + radar)
- Stack: Next.js 16 + React 19 + Tailwind 4

CITESTE OBLIGATORIU inainte de orice modificare:
1. C:\Users\alexm\Projects\afiliere-site\CLAUDE.md  (stare tehnica completa)
2. C:\Users\alexm\Projects\afiliere-site\STRATEGIE.md  (viziune + nise + promovare)

REGULI FIXE (nu se negociaza):
- Raspunde INTOTDEAUNA in romana
- Push pe main = astept confirmare explicita de la mine inainte
- NU orange in UI (logo-ul are gradient, interfata nu)
- Site lejer si curat — fara clutter pe carduri
- Repo trebuie sa ramana PUBLIC (Actions gratuit nelimitat)
- Construieste pagina nisa DOAR dupa ce am partener aprobat

DATA AZI: [DATA — ex: 29.06.2026]

CE VREAU SA FAC AZI: [descrie aici — ex: "vreau pagina /gradina", "vreau sa fix-uiesc X", "continua de unde am ramas"]

PROBLEME ACTIVE BLOCANTE (de la mine):
- Brevo sender newsletter@amcupon.ro = blocat (4 abonati asteapta)
- cursuri-ai.ro de eliminat pana 07-07-2026
- outfitblack.ro de eliminat pana 10-07-2026
```

---

## Sfaturi de utilizare Claude Code

**Pentru sesiuni noi:** lipeste promptul de sus → Claude citeste CLAUDE.md automat → incepe direct cu task-ul.

**Comenzi utile in terminal Claude Code:**
```
/compact          — curata contextul cand sesiunea devine lenta
/cost             — vezi cat ai cheltuit in sesiunea curenta  
/model            — schimba modelul (sonnet = standard, opus = mai puternic)
Ctrl+C            — opreste o comanda in executie
```

**Cand sa folosesti ce model:**
- `claude-sonnet-4-6` (implicit) — pentru tot codul, paginile noi, fix-uri
- `claude-opus-4-8` — numai pentru strategii complexe, analize mari (costa mai mult)
- `claude-haiku-4-5` — in scripturi Python pentru voce/continut (ieftin, rapid)

**Fluxul de lucru recomandat:**
1. Deschizi Claude Code in folderul proiectului
2. Lipesti promptul de start (cu data + ce vrei)
3. Claude citeste CLAUDE.md si stie tot contextul
4. Lucrezi direct — fara sa re-explici de fiecare data

**Nu trebuie sa stii pe de rost nimic** — CLAUDE.md si STRATEGIE.md tin minte tot.
Tu dai directia, Claude executa si iti cere confirmare inainte de actiuni importante.
