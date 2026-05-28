#!/bin/bash
# v7 — Sexta ronda. Solo 5 imágenes: 4 GELCOATLAM + plastilam-nautico.
#
# CORRECCIONES:
#  - GELCOATLAM: daño MUCHO más sutil. Alguna raya/marca leve que se vea que
#    el producto NO la quita, pero SIN brechas enormes ni picado exagerado.
#    El picado llamaba más la atención que el producto. Mantener encadenado.
#  - PLASTILAM náutico: ventana SEMITRANSPARENTE con interior de barco sutil
#    (no negra opaca). Que se intuya un pequeño interior de barco.
#
# Salida: before-v7/ y after-v7/

set -euo pipefail
ENV_FILE="$(cd "$(dirname "$0")/../../.." && pwd)/.env.local"
[ -f "$ENV_FILE" ] && export GEMINI_API_KEY=$(grep -E '^GEMINI_API_KEY=' "$ENV_FILE" | head -1 | cut -d= -f2- | sed 's/^["'\'']//;s/["'\'']$//')
: "${GEMINI_API_KEY:?ERROR: GEMINI_API_KEY no encontrada}"
BASE="$(cd "$(dirname "$0")" && pwd)"; cd "$BASE"
mkdir -p before-v7 after-v7 nanobanana-output
FILTER="${1:-}"

_gen() { rm -f nanobanana-output/*.png 2>/dev/null||true; gemini --yolo "/generate '$2'" 2>&1|tail -2; local l=$(ls -t nanobanana-output/*.png 2>/dev/null|head -1||true); [ -n "$l" ]&&[ -s "$l" ]&&{ cp "$l" "$1"; echo "  ✓ $1"; return 0; }||{ echo "  ✗ falló"; return 1; }; }
_edit() { rm -f nanobanana-output/*.png 2>/dev/null||true; gemini --yolo "/edit '$1' '$3'" 2>&1|tail -2; local l=$(ls -t nanobanana-output/*.png 2>/dev/null|head -1||true); [ -n "$l" ]&&[ -s "$l" ]&&{ cp "$l" "$2"; echo "  ✓ $2"; return 0; }||{ echo "  ✗ falló"; return 1; }; }

# ═══ GELCOATLAM — daño SUTIL, encadenado, rayas leves se mantienen ═══
gelcoat_chain() {
  local cat="$1" word="$2"
  [[ -n "$FILTER" && "gelcoatlam" != *"$FILTER"* && "$cat" != *"$FILTER"* ]] && return 0
  local f1b="before-v7/gelcoatlam-fase-1-${cat}.png" f1a="after-v7/gelcoatlam-fase-1-${cat}.png"
  local f2b="before-v7/gelcoatlam-fase-2-${cat}.png" f2a="after-v7/gelcoatlam-fase-2-${cat}.png"
  echo ""; echo "=== [gelcoatlam-${cat}] CADENA (daño sutil) ==="
  # 1) BEFORE F1: gelcoat con LIGERA oxidación + UNAS POCAS rayas finas (sin brechas, sin picado)
  [ -f "$f1b" ] && echo "  · F1 before ok" || { echo "  → F1 BEFORE (daño leve)"; _gen "$f1b" \
    "${word} fiberglass gelcoat surface that is dull and chalky from oxidation, with just a FEW fine light scratches here and there. NO deep gouges, NO cracks, NO heavy damage — only mild surface oxidation and a couple of thin shallow scratches. Smooth surface overall. Macro close-up photography, soft white background, no text" || return 0; }
  # 2) AFTER F1 (= BEFORE F2): limpio MATE, las pocas rayas finas se mantienen
  [ -f "$f1a" ] && echo "  · F1 after ok" || { echo "  → F1 AFTER (limpio mate, rayas finas se mantienen)"; _edit "$f1b" "$f1a" \
    "Clean and restore the gelcoat: remove the chalky oxidation and dullness, leaving a clean MATTE finish (no shine yet). KEEP the few fine scratches visible — this product does not remove scratches, but there are only a couple of thin ones. Same exact composition." || return 0; }
  # 3) BEFORE F2 = copia AFTER F1
  [ -f "$f2b" ] && echo "  · F2 before ok" || { cp "$f1a" "$f2b"; echo "  ✓ F2 before = copia F1 after"; }
  # 4) AFTER F2: BRILLO, rayas finas se mantienen
  [ -f "$f2a" ] && echo "  · F2 after ok" || { echo "  → F2 AFTER (brillo, rayas finas se mantienen)"; _edit "$f2b" "$f2a" \
    "Add GLOSS and SHINE to the matte surface — it becomes glossy and reflective. KEEP the few fine scratches still faintly visible under the gloss. Same exact composition." || true; }
}
gelcoat_chain "nautico"    "Boat"
gelcoat_chain "caravaning" "Caravan"

# ═══ PLASTILAM náutico — semitransparente con interior de barco sutil ═══
if [[ -z "$FILTER" || "plastilam-nautico" == *"$FILTER"* ]]; then
  echo ""; echo "=== [plastilam-nautico] ==="
  bf="before-v7/plastilam-nautico.png" af="after-v7/plastilam-nautico.png"
  [ -f "$bf" ] && echo "  · antes ok" || { echo "  → ANTES"; _gen "$bf" \
    "Close-up centered on a circular boat porthole window with a brass marine frame, filling most of the frame. The acrylic glass is YELLOWED and cloudy from UV exposure, semi-opaque — you can barely make out anything through it. Realistic marine photography, soft daylight, no text"; }
  [ -f "$af" ] && echo "  · después ok" || { echo "  → DESPUÉS (semitransparente, interior barco sutil)"; _edit "$bf" "$af" \
    "Restore the porthole glass to a clean SEMI-TRANSLUCENT clear acrylic. Through the glass you can now softly see a small cozy boat cabin interior — a hint of warm wood and a small window inside, gently blurred and dim, realistic and subtle (NOT a black opaque glass, NOT a fake bright scene). It should look like glancing into a small boat cabin. Same composition centered on the porthole and its brass frame."; }
fi

echo ""; echo "═══ v7 COMPLETADA ═══"
echo " before-v7: $(ls before-v7/*.png 2>/dev/null|wc -l|tr -d ' ') / 5"
echo " after-v7:  $(ls after-v7/*.png 2>/dev/null|wc -l|tr -d ' ') / 5"