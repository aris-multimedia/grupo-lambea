#!/bin/bash
# v4 — Tercera ronda. Solo regenera las 19 imágenes que el cliente marcó.
# Las 26 aprobadas ya están copiadas intactas en before-v4/ y after-v4/.
#
# Cambios CRÍTICOS respecto a v3:
# - Inyectores: cuerpo intacto, SOLO el tip que entra al motor se limpia
# - Items secundarios MUY desplazados (no sutil — claramente distinto)
# - GELCOATLAM Fase 1: marcas iguales o menos, NUNCA acentuadas
# - FOSSLAM: sin cepillo, mantiene color del WC
# - Composiciones más dinámicas (no fotos congeladas)
#
# Uso: ./generate-pairs-v4.sh [slug_filtro]

set -euo pipefail

ENV_FILE="$(cd "$(dirname "$0")/../../.." && pwd)/.env.local"
[ -f "$ENV_FILE" ] && export GEMINI_API_KEY=$(grep -E '^GEMINI_API_KEY=' "$ENV_FILE" | head -1 | cut -d= -f2- | sed 's/^["'\'']//;s/["'\'']$//')
: "${GEMINI_API_KEY:?ERROR: GEMINI_API_KEY no encontrada}"

BASE="$(cd "$(dirname "$0")" && pwd)"
cd "$BASE"
mkdir -p before-v4 after-v4 nanobanana-output

FILTER="${1:-}"

# Instrucción reforzada (más agresiva que v3)
MOVE_HARD="CRITICAL: any secondary objects (cloths, sponges, brushes, tools, hands, products) MUST be in CLEARLY DIFFERENT positions, angles, or completely removed. The two images should look like photos taken on different days, not the same photo edited. Same main subject, same overall framing, but a DIFFERENT scene around it."

gen_both() {
  local slug="$1" before_prompt="$2" after_instruction="$3"
  local bf="before-v4/${slug}.png" af="after-v4/${slug}.png"
  [[ -n "$FILTER" && "$slug" != *"$FILTER"* ]] && return 0
  echo ""; echo "=== [$slug] BOTH ==="
  if [ ! -f "$bf" ]; then
    echo "  → ANTES..."
    rm -f nanobanana-output/*.png 2>/dev/null || true
    gemini --yolo "/generate '${before_prompt}'" 2>&1 | tail -3
    latest=$(ls -t nanobanana-output/*.png 2>/dev/null | head -1 || true)
    if [ -n "$latest" ] && [ -s "$latest" ]; then cp "$latest" "$bf"; echo "  ✓ $bf"; else echo "  ✗ falló"; return 0; fi
  else echo "  · antes ya existe"; fi
  if [ ! -f "$af" ]; then
    echo "  → DESPUÉS..."
    rm -f nanobanana-output/*.png 2>/dev/null || true
    gemini --yolo "/edit '${bf}' '${after_instruction}'" 2>&1 | tail -3
    latest=$(ls -t nanobanana-output/*.png 2>/dev/null | head -1 || true)
    if [ -n "$latest" ] && [ -s "$latest" ]; then cp "$latest" "$af"; echo "  ✓ $af"; else echo "  ✗ falló"; fi
  else echo "  · después ya existe"; fi
}

# ═══════════════════════════════════════════════════════════════════════════
# DESOXILAM náutico — cambiar de cadena a otra cosa, sin items de fondo
# ═══════════════════════════════════════════════════════════════════════════
gen_both "desoxilam-nautico" \
  "Single rusty marine stainless steel bolt or shackle isolated on white background, moderate orange surface rust covering most of it, professional product photography, completely clean background no other objects no shadows of objects, no text" \
  "Remove the surface rust from the bolt, revealing clean steel underneath with natural finish. Keep some patina, NOT factory-new. The bolt should be at a slightly different angle/rotation than before — different camera moment. $MOVE_HARD"

# ═══════════════════════════════════════════════════════════════════════════
# FIBRALAM náutico — barco FUERA del agua
# ═══════════════════════════════════════════════════════════════════════════
gen_both "fibralam-nautico" \
  "Close-up section of a fiberglass boat hull SITTING ON LAND on supports in a boatyard (not in water), showing algae stains and waterline grime on the gelcoat. Visible anti-fouling paint band along the bottom. Boat yard background blurred. Realistic boat maintenance scenario, no text" \
  "Clean the gelcoat removing algae and waterline grime. CRITICAL: same boat, same hull shape, same anti-fouling paint band. The boat is on land. $MOVE_HARD Move the camera angle very slightly so it doesn't look like the same photo."

# ═══════════════════════════════════════════════════════════════════════════
# FOSSLAM industrial — sin cepillo, MANTIENE color del WC
# ═══════════════════════════════════════════════════════════════════════════
gen_both "fosslam-industrial" \
  "Tight close-up of just the interior bowl of a BLUE plastic portable construction site toilet, with moderate brown residue and stains on the interior surface. No brush, no tools, no hands visible. Only the toilet bowl interior fills the frame. Soft natural lighting, no text" \
  "Clean the toilet bowl interior, removing brown residue and stains. The bowl interior is now clean. CRITICAL: the toilet plastic color is BLUE and STAYS BLUE — do NOT change it to white. The product cleans dirt, it does not change the color of the plastic. No brush, no tools."

# ═══════════════════════════════════════════════════════════════════════════
# GELCOATLAM Fase 1 (2) — marcas NO se acentúan en el después
# ═══════════════════════════════════════════════════════════════════════════
GC1_AFTER="Reduce the visible scratches partially and bring out a moderate satin shine. CRITICAL: any remaining scratches or marks must look the SAME or LESS visible than before — NEVER more visible, NEVER more pronounced. The product polishes lightly, it does not damage the surface."
gen_both "gelcoatlam-fase-1-nautico" \
  "Boat gelcoat panel with light surface scratches and dullness from sun exposure, all marks clearly visible but shallow. Soft matte finish. Macro close-up photography, no text" \
  "$GC1_AFTER"
gen_both "gelcoatlam-fase-1-caravaning" \
  "Caravan gelcoat panel with light surface scratches and dullness from outdoor exposure, all marks clearly visible but shallow. Soft matte finish. Macro close-up, no text" \
  "$GC1_AFTER"

# ═══════════════════════════════════════════════════════════════════════════
# INYECLAM DIESEL (3) — cuerpo intacto, solo el TIP (parte del motor) limpio
# ═══════════════════════════════════════════════════════════════════════════
INJ_D_BEFORE="Side view photograph of a single complete diesel fuel injector laid horizontally on a soft white background. The injector has two clearly different parts: the BODY (upper section with the electrical connector and metal housing — clean and unchanged) and the NOZZLE TIP (lower spike-shaped section that goes into the engine — covered in MODERATE BLACK CARBON DEPOSITS). Studio product photography, no text."
INJ_D_AFTER="Clean ONLY the nozzle tip (the lower spike section), removing the carbon deposits and revealing clean metal with visible spray holes. The BODY (upper section with connector) must remain EXACTLY THE SAME — do not touch it. The injector should be at a slightly different angle than before."
gen_both "inyeclam-diesel-nautico"    "$INJ_D_BEFORE" "$INJ_D_AFTER"
gen_both "inyeclam-diesel-caravaning" "$INJ_D_BEFORE" "$INJ_D_AFTER"
gen_both "inyeclam-diesel-industrial" "$INJ_D_BEFORE" "$INJ_D_AFTER"

# ═══════════════════════════════════════════════════════════════════════════
# INYECLAM GASOLINA (3) — cuerpo intacto, solo el TIP limpio
# ═══════════════════════════════════════════════════════════════════════════
INJ_G_BEFORE="Side view photograph of a single complete gasoline fuel injector laid horizontally on a soft white background. The injector has two clearly different parts: the BODY (upper section with the electrical connector and o-rings — clean and unchanged) and the NOZZLE TIP (lower section that sprays into the engine — covered in MODERATE BROWN VARNISH DEPOSITS and gummy residue). Studio product photography, no text."
INJ_G_AFTER="Clean ONLY the nozzle tip (the lower section), removing the brown varnish and revealing clean metal. The BODY (upper section with connector and o-rings) must remain EXACTLY THE SAME — do not touch it. The injector should be at a slightly different angle than before."
gen_both "inyeclam-gasolina-nautico"    "$INJ_G_BEFORE" "$INJ_G_AFTER"
gen_both "inyeclam-gasolina-caravaning" "$INJ_G_BEFORE" "$INJ_G_AFTER"
gen_both "inyeclam-gasolina-industrial" "$INJ_G_BEFORE" "$INJ_G_AFTER"

# ═══════════════════════════════════════════════════════════════════════════
# MANZALAM caravaning — trapo MUY desplazado
# ═══════════════════════════════════════════════════════════════════════════
gen_both "manzalam-caravaning" \
  "Caravan kitchen stainless steel sink seen from above with calcium scale deposits and water spots around the drain. A blue dishcloth is folded on the LEFT EDGE of the sink. Realistic kitchen photography, soft natural light, no text" \
  "Remove the calcium scale and water stains from the sink. The sink is now clean brushed stainless steel. CRITICAL: the blue dishcloth must NOT be in the same position as before — move it COMPLETELY: now it's draped over the FAUCET hanging down, or hanging off the OPPOSITE edge. The cloth has clearly moved between photos."

# ═══════════════════════════════════════════════════════════════════════════
# MANZALAM náutico — estropajo APOYADO, no flotando
# ═══════════════════════════════════════════════════════════════════════════
gen_both "manzalam-nautico" \
  "Marine stainless steel sink with calcium lime scale around the drain and water spots. A green scouring pad sits RESTING ON THE EDGE of the sink rim (not floating in air, clearly supported by the edge). Realistic galley photography, soft natural light, no text" \
  "Remove the lime scale and water stains. Sink is now clean brushed steel. CRITICAL: move the scouring pad to a DIFFERENT location — now it's resting on top of the faucet, or removed from the frame entirely. Pad must not be in the same position."

# ═══════════════════════════════════════════════════════════════════════════
# MOTORLAM náutico — óxido se mantiene IGUAL (ni se quita ni se acentúa)
# ═══════════════════════════════════════════════════════════════════════════
gen_both "motorlam-nautico" \
  "Boat engine compartment with grease, oil film and dust accumulation on the metal parts. Some flanges and brackets have light rust spots that are clearly visible. Realistic mechanical photography, no text" \
  "Remove the grease, oil and dust from the engine, leaving the metal clean. CRITICAL: any rust spots (especially on flanges and brackets) must REMAIN EXACTLY AS BEFORE — same amount, same intensity, same location. Do NOT remove rust, do NOT make it more visible, do NOT change its appearance. Only clean grease and dust."

# ═══════════════════════════════════════════════════════════════════════════
# PASTA ROSA náutico — muescas se MANTIENEN, solo pule
# ═══════════════════════════════════════════════════════════════════════════
gen_both "pasta-rosa-superbrillo-nautico" \
  "Marine aluminum boat fitting with DULL OXIDIZED surface and visible dents/marks. The metal is structurally worn — clear dents, scratches and surface deformations from years of use, plus matte oxidation patina. Close-up product photography, soft white background, no text" \
  "Polish the aluminum to a satin shine, removing the dull oxidation. CRITICAL: ALL existing dents, marks, scratches and deformations must REMAIN EXACTLY THE SAME — the product polishes the surface but does NOT regenerate the metal or fill any imperfections. Only the dullness is gone, the structural marks are still there clearly visible."

# ═══════════════════════════════════════════════════════════════════════════
# PLASTILAM náutico — close-up, sin contexto exterior estático
# ═══════════════════════════════════════════════════════════════════════════
gen_both "plastilam-nautico" \
  "Extreme close-up of a circular boat porthole acrylic cover viewed from the side, completely YELLOWED and CLOUDY from UV exposure (you cannot see clearly through it). No outside view through the glass, no port background, no scene visible — just the acrylic surface filling the frame, slightly angled. Soft studio lighting, no text" \
  "Restore the porthole acrylic to CLEAR TRANSPARENT plastic, removing all yellowing and cloudiness. Same close-up of the porthole, slight different angle. Through the now-clear glass you can see soft blurred light, but no specific scene. $MOVE_HARD"

# ═══════════════════════════════════════════════════════════════════════════
# PULIMENTO SUPERBRILLO náutico — marcas leves se reducen claramente
# ═══════════════════════════════════════════════════════════════════════════
gen_both "pulimento-superbrillo-nautico" \
  "Marine brushed stainless steel deck cleat with light surface dullness, faint water spots and very mild swirl marks. NO heavy rust, NO deep scratches. Close-up product photography, soft white background, no text" \
  "Hand polish the cleat to bright mirror finish. The dullness, water spots and swirl marks are GONE — surface is now clean and reflective. The product works well on light surface issues. Camera angle slightly different than before."

# ═══════════════════════════════════════════════════════════════════════════
# TEKALAM industrial — sin herramientas durante aplicación
# ═══════════════════════════════════════════════════════════════════════════
gen_both "tekalam-industrial" \
  "Wooden workbench top with weathered grey dry surface from years of workshop use, no tools or items on it — completely empty surface visible. Realistic close-up texture photography, no text" \
  "Apply wood protector, restoring warm natural wood color and nourished grain. The surface is now richer and warmer in color. CRITICAL: NO tools, items or hands appear in either image — just the wood. The camera angle should be SLIGHTLY different from before."

# ═══════════════════════════════════════════════════════════════════════════
# TEKALAM náutico — sin items estáticos
# ═══════════════════════════════════════════════════════════════════════════
gen_both "tekalam-nautico" \
  "Teak boat deck planks weathered to soft grey patina from sun and saltwater, no items or tools on the deck — completely empty wood surface. Realistic close-up texture photography, no text" \
  "Apply teak protector, restoring warm golden-brown wood color and nourished grain. NO tools or items in the scene. CRITICAL: camera angle clearly different from before — slight rotation or pan, so the two photos don't look identical."

# ─── Resumen final ─────────────────────────────────────────────────────────
echo ""
echo "═══════════════════════════════════"
echo " GENERACIÓN v4 LOTE 1 COMPLETADA"
echo " before-v4: $(ls before-v4/*.png 2>/dev/null | wc -l | tr -d ' ') / 45 esperadas"
echo " after-v4:  $(ls after-v4/*.png 2>/dev/null | wc -l | tr -d ' ') / 45 esperadas"
echo "═══════════════════════════════════"
