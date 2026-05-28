#!/bin/bash
# v6 — Quinta ronda. Regenera las 12 imágenes marcadas "rehacer" en v4.
#
# CORRECCIONES CLAVE (feedback del cliente):
#  - GELCOATLAM: el producto NO quita rayas profundas. Las rayas se MANTIENEN
#    idénticas en las 3 imágenes encadenadas. Solo cambia el acabado:
#    sucio/oxidado → limpio mate → brillo. Misma pieza (encadenado por copia).
#  - INYECTORES: vista FRONTAL de la punta (como la web antigua). Solo el
#    orificio central de inyección se limpia; el cuerpo sigue oscuro y usado.
#    Cambio sutil, NO queda como nuevo.
#  - MANZALAM náutico: el "después" debe MANTENER el grifo.
#  - PLASTILAM náutico: solo la ventana, sin interior falso a través del cristal.
#
# Salida: before-v6/ y after-v6/ con SOLO las 12 parejas.

set -euo pipefail
ENV_FILE="$(cd "$(dirname "$0")/../../.." && pwd)/.env.local"
[ -f "$ENV_FILE" ] && export GEMINI_API_KEY=$(grep -E '^GEMINI_API_KEY=' "$ENV_FILE" | head -1 | cut -d= -f2- | sed 's/^["'\'']//;s/["'\'']$//')
: "${GEMINI_API_KEY:?ERROR: GEMINI_API_KEY no encontrada}"
BASE="$(cd "$(dirname "$0")" && pwd)"; cd "$BASE"
mkdir -p before-v6 after-v6 nanobanana-output
FILTER="${1:-}"

_gen() { rm -f nanobanana-output/*.png 2>/dev/null||true; gemini --yolo "/generate '$2'" 2>&1|tail -2; local l=$(ls -t nanobanana-output/*.png 2>/dev/null|head -1||true); [ -n "$l" ]&&[ -s "$l" ]&&{ cp "$l" "$1"; echo "  ✓ $1"; return 0; }||{ echo "  ✗ falló"; return 1; }; }
_edit() { rm -f nanobanana-output/*.png 2>/dev/null||true; gemini --yolo "/edit '$1' '$3'" 2>&1|tail -2; local l=$(ls -t nanobanana-output/*.png 2>/dev/null|head -1||true); [ -n "$l" ]&&[ -s "$l" ]&&{ cp "$l" "$2"; echo "  ✓ $2"; return 0; }||{ echo "  ✗ falló"; return 1; }; }

gen_both() {
  local slug="$1" bp="$2" ai="$3"
  [[ -n "$FILTER" && "$slug" != *"$FILTER"* ]] && return 0
  local bf="before-v6/${slug}.png" af="after-v6/${slug}.png"
  echo ""; echo "=== [$slug] ==="
  [ -f "$bf" ] && echo "  · antes ok" || { echo "  → ANTES"; _gen "$bf" "$bp" || return 0; }
  [ -f "$af" ] && echo "  · después ok" || { echo "  → DESPUÉS"; _edit "$bf" "$af" "$ai" || true; }
}

# ═══ GELCOATLAM — rayas SE MANTIENEN, encadenado, misma pieza ═══
gelcoat_chain() {
  local cat="$1" word="$2"
  [[ -n "$FILTER" && "gelcoatlam" != *"$FILTER"* && "$cat" != *"$FILTER"* ]] && return 0
  local f1b="before-v6/gelcoatlam-fase-1-${cat}.png" f1a="after-v6/gelcoatlam-fase-1-${cat}.png"
  local f2b="before-v6/gelcoatlam-fase-2-${cat}.png" f2a="after-v6/gelcoatlam-fase-2-${cat}.png"
  echo ""; echo "=== [gelcoatlam-${cat}] CADENA (rayas se mantienen) ==="
  # 1) BEFORE F1: deteriorado CON RAYAS PROFUNDAS + oxidación/suciedad mate
  [ -f "$f1b" ] && echo "  · F1 before ok" || { echo "  → F1 BEFORE"; _gen "$f1b" \
    "${word} fiberglass gelcoat surface with DEEP visible SCRATCHES and gouges, plus chalky white oxidation, dullness and dirt. The deep scratches are prominent. A small section edge or mounting hole is visible as a reference point. Macro close-up photography, soft white background, no text" || return 0; }
  # 2) AFTER F1 (= BEFORE F2): limpio MATE, RAYAS INTACTAS
  [ -f "$f1a" ] && echo "  · F1 after ok" || { echo "  → F1 AFTER (limpio mate, rayas se mantienen)"; _edit "$f1b" "$f1a" \
    "Clean and restore the gelcoat: remove the chalky oxidation, dullness and dirt, leaving a clean MATTE finish (no shine yet). CRITICAL: KEEP ALL the deep scratches and gouges EXACTLY as they are — this product does NOT remove scratches, it only cleans and restores. The same scratches must remain clearly visible. Same exact composition and reference point." || return 0; }
  # 3) BEFORE F2 = copia de AFTER F1
  [ -f "$f2b" ] && echo "  · F2 before ok" || { cp "$f1a" "$f2b"; echo "  ✓ F2 before = copia F1 after (encadenado)"; }
  # 4) AFTER F2: BRILLO, RAYAS INTACTAS
  [ -f "$f2a" ] && echo "  · F2 after ok" || { echo "  → F2 AFTER (brillo, rayas se mantienen)"; _edit "$f2b" "$f2a" \
    "Add GLOSS and SHINE to the matte surface — it becomes glossy and reflective. CRITICAL: KEEP ALL the deep scratches and gouges EXACTLY as they are — phase 2 ONLY adds shine, it does NOT remove scratches. The same scratches must remain visible under the new gloss. Same exact composition and reference point." || true; }
}
gelcoat_chain "nautico"    "Boat"
gelcoat_chain "caravaning" "Caravan"

# ═══ INYECTORES — vista FRONTAL, solo el orificio central se limpia ═══
# (basado en la imagen de referencia de la web antigua del cliente)
INJ_D_BEFORE="Front-on extreme macro view looking directly at the nozzle face of a diesel fuel injector. The injector is a dark cylindrical metal part seen head-on, filling the frame. The CENTRAL injection nozzle hole is completely CLOGGED and buried under thick BLACK CARBON DEPOSITS, the center is obstructed and dirty. The surrounding body is dark, sooty and used. Studio macro photography, soft white background, no text"
INJ_D_AFTER="Clean ONLY the CENTRAL injection nozzle — remove the carbon from the center so the clean metal nozzle tip with its tiny spray holes and central pin is now clearly visible and unobstructed in the middle. CRITICAL: the rest of the injector body stays DARK, SOOTY and USED exactly as before — do NOT make the whole part look new or shiny. Only the central hole is now clean and functional. Subtle, realistic change. Same front-on composition."
INJ_G_BEFORE="Front-on extreme macro view looking directly at the nozzle face of a gasoline fuel injector. The injector is a dark cylindrical metal part seen head-on, filling the frame. The CENTRAL injection nozzle is CLOGGED with BROWN VARNISH and gummy deposits, the center is obstructed. The surrounding body is dark and used. Studio macro photography, soft white background, no text"
INJ_G_AFTER="Clean ONLY the CENTRAL injection nozzle — remove the varnish from the center so the clean metal nozzle with its spray holes is now clearly visible and unobstructed in the middle. CRITICAL: the rest of the injector body stays DARK and USED exactly as before — do NOT make the whole part look new. Only the central hole is clean. Subtle realistic change. Same front-on composition."

gen_both "inyeclam-diesel-nautico"     "$INJ_D_BEFORE" "$INJ_D_AFTER"
gen_both "inyeclam-diesel-caravaning"  "$INJ_D_BEFORE" "$INJ_D_AFTER"
gen_both "inyeclam-diesel-industrial"  "$INJ_D_BEFORE" "$INJ_D_AFTER"
gen_both "inyeclam-gasolina-nautico"    "$INJ_G_BEFORE" "$INJ_G_AFTER"
gen_both "inyeclam-gasolina-caravaning" "$INJ_G_BEFORE" "$INJ_G_AFTER"
gen_both "inyeclam-gasolina-industrial" "$INJ_G_BEFORE" "$INJ_G_AFTER"

# ═══ MANZALAM náutico — solo regen AFTER, MANTENER el grifo ═══
if [[ -z "$FILTER" || "manzalam-nautico" == *"$FILTER"* ]]; then
  echo ""; echo "=== [manzalam-nautico] AFTER (mantener grifo) ==="
  af="after-v6/manzalam-nautico.png"
  [ -f "$af" ] && echo "  · ok" || _edit "before-v6/manzalam-nautico.png" "$af" \
    "Remove the lime scale and water stains from the sink — now clean brushed stainless steel. CRITICAL: the FAUCET / TAP must remain fully visible and present (do NOT remove or crop the faucet). Move the green scouring pad to lie flat on the countertop beside the sink. Same composition with the faucet clearly intact." || true
fi

# ═══ PLASTILAM náutico — solo la ventana, sin interior falso ═══
gen_both "plastilam-nautico" \
  "Close-up centered ONLY on a circular boat porthole window with a brass/metal frame, the window fills most of the frame. The acrylic glass is heavily YELLOWED, cloudy and opaque from UV — you cannot see through it. Only the window and its frame are shown, minimal boat hull around the edges. Realistic marine photography, no text" \
  "Restore the porthole acrylic glass to CLEAR transparent, removing the yellowing and cloudiness. Through the clean glass there is only a soft dark dim reflection — do NOT draw a detailed or fake interior scene. Keep it simple and realistic, like looking into a dim shaded space. Same composition centered on the window and its frame."

echo ""; echo "═══ v6 COMPLETADA ═══"
echo " before-v6: $(ls before-v6/*.png 2>/dev/null|wc -l|tr -d ' ') / 12"
echo " after-v6:  $(ls after-v6/*.png 2>/dev/null|wc -l|tr -d ' ') / 12"