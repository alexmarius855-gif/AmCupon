#!/bin/bash
# SessionStart (doar in sesiunile Claude Code din cloud): starea site-ului, inaintea oricarei alte lucrari.
#
# De ce: intre 14.11 si 17.11.2026 amcupon.ro a raspuns 402 (contul Vercel blocat), iar rularile
# update-data.yml ieseau „success" — deploy-ul se face la Vercel, nu in Actions, deci nimic nu se vedea
# rosu. Statusul Vercel de pe ultimul commit din main spunea „Account is blocked." de la prima ora.
# Ce scrie scriptul la iesire ajunge in contextul sesiunii.
#
# Nu pica niciodata sesiunea: fiecare cerere are timeout, iar lipsa unei unelte doar se noteaza.
set -uo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi
cd "${CLAUDE_PROJECT_DIR:-.}" 2>/dev/null || exit 0

REPO="alexmarius855-gif/amcupon"
echo "== Starea AmCupon la pornirea sesiunii ($(date -u +'%d.%m.%Y %H:%M') UTC) =="

if ! command -v gh >/dev/null 2>&1; then
  echo "gh lipseste: verifica manual statusul Vercel de pe main (vezi CLAUDE.md, intrarea 17.11)."
  exit 0
fi

# 1. Ce spune Vercel despre ultimul commit de pe main (un status pe proiect)
vercel=$(timeout 12 gh api "repos/$REPO/commits/main/status" \
  --jq '.statuses[] | select(.context | startswith("Vercel")) | "\(.state)\t\(.context)\t\(.description)"' 2>/dev/null)
if [ -z "$vercel" ]; then
  echo "Vercel: niciun status pe ultimul commit din main (inca se construieste sau cererea a picat)."
else
  echo "Vercel, ultimul commit din main:"
  printf '%s\n' "$vercel" | while IFS=$'\t' read -r stare proiect descriere; do
    echo "  - $proiect: $stare ($descriere)"
  done
  if printf '%s\n' "$vercel" | grep -q "^failure\|^error"; then
    echo "  ATENTIE: ultimul commit NU s-a publicat. Site-ul poate fi cazut sau ramas pe o versiune veche."
    echo "  Verifica asta INAINTE de orice alta lucrare (motivul exact e in panoul Vercel al lui Alex)."
  fi
fi

# 2. Ultimele rulari ale pipeline-ului de date
rulari=$(timeout 12 gh run list --repo "$REPO" --workflow=update-data.yml --limit 3 \
  --json conclusion,status,createdAt,event \
  --jq '.[] | "  - \(.createdAt[0:16] | sub("T"; " ")) UTC \(.event): \(if (.conclusion // "") == "" then .status else .conclusion end)"' 2>/dev/null)
if [ -n "$rulari" ]; then
  echo "update-data.yml, ultimele 3 rulari:"
  printf '%s\n' "$rulari"
  if printf '%s\n' "$rulari" | grep -q "failure"; then
    echo "  O rulare rosie: poarta de publicare a oprit datele. Vezi logul cu: gh run view --repo $REPO --log-failed"
  fi
else
  echo "update-data.yml: nu am putut citi rularile."
fi

exit 0
