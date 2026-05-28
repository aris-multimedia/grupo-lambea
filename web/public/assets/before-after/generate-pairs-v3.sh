#!/bin/bash
# v3 — Genera segunda ronda de imágenes basadas en feedback ESPECÍFICO del cliente.
#
# Carpetas:
#   before-v3/  ← nuevas (algunas copiadas intactas de before/, otras regeneradas)
#   after-v3/   ← todas nuevas
#
# Tres modos por slug:
#   gen_both     → before + after nuevos desde cero (rehacer)
#   gen_after_keep_before → before-v3 ya existe (copiado intacto), solo regen after
#   gen_after_recopy → copia before/ original a before-v3, regen after
#
# Excluido: ANTIDESLILAM (se elimina del catálogo)
#
# Uso: ./generate-pairs-v3.sh [slug_filtro]

set -euo pipefail

# API key desde web/.env.local (NO hardcodear)
ENV_FILE="$(cd "$(dirname "$0")/../../.." && pwd)/.env.local"
if [ -f "$ENV_FILE" ]; then
  GEMINI_API_KEY=$(grep -E '^GEMINI_API_KEY=' "$ENV_FILE" | head -1 | cut -d= -f2- | sed 's/^["'\'']//;s/["'\'']$//')
  export GEMINI_API_KEY
fi
: "${GEMINI_API_KEY:?ERROR: GEMINI_API_KEY no encontrada}"
if [ "$GEMINI_API_KEY" = "PEGA_AQUI_TU_NUEVA_KEY" ]; then
  echo "ERROR: pega la key real en web/.env.local" >&2; exit 1
fi

BASE="$(cd "$(dirname "$0")" && pwd)"
cd "$BASE"
mkdir -p before-v3 after-v3 nanobanana-output

FILTER="${1:-}"

# ─── Instrucción crítica reutilizable: items secundarios reposicionados ──────
MOVE_ITEMS="IMPORTANT: subtly reposition any secondary objects (cloths, sponges, brushes, tools, equipment) so they don't appear in the EXACT same position as before — simulate a photo taken minutes later. Move/rotate them slightly. Keep the MAIN subject and framing identical."

# ─── Modo 1: regen both ─────────────────────────────────────────────────────
gen_both() {
  local slug="$1" before_prompt="$2" after_instruction="$3"
  local bf="before-v3/${slug}.png" af="after-v3/${slug}.png"
  [[ -n "$FILTER" && "$slug" != *"$FILTER"* ]] && return 0
  echo ""; echo "=== [$slug] BOTH ==="
  # BEFORE
  if [ ! -f "$bf" ]; then
    echo "  → ANTES nuevo..."
    rm -f nanobanana-output/*.png 2>/dev/null || true
    gemini --yolo "/generate '${before_prompt}'" 2>&1 | grep -E "saved|Generated|✓" || true
    latest=$(ls -t nanobanana-output/*.png 2>/dev/null | head -1 || true)
    if [ -n "$latest" ]; then cp "$latest" "$bf"; echo "  ✓ $bf"
    else echo "  ✗ Falló antes — saltando"; return 0; fi
  else echo "  · antes ya existe"; fi
  # AFTER
  if [ ! -f "$af" ]; then
    echo "  → DESPUÉS (edit desde antes)..."
    rm -f nanobanana-output/*.png 2>/dev/null || true
    gemini --yolo "/edit '${bf}' '${after_instruction}'" 2>&1 | grep -E "saved|Generated|✓" || true
    latest=$(ls -t nanobanana-output/*.png 2>/dev/null | head -1 || true)
    if [ -n "$latest" ]; then cp "$latest" "$af"; echo "  ✓ $af"
    else echo "  ✗ Falló después"; fi
  else echo "  · después ya existe"; fi
}

# ─── Modo 2: before-v3 ya existe, regenerar solo after ──────────────────────
gen_after_keep_before() {
  local slug="$1" after_instruction="$2"
  local bf="before-v3/${slug}.png" af="after-v3/${slug}.png"
  [[ -n "$FILTER" && "$slug" != *"$FILTER"* ]] && return 0
  echo ""; echo "=== [$slug] AFTER ONLY (before intacto) ==="
  if [ ! -f "$bf" ]; then echo "  ✗ ERROR: $bf no existe"; return 0; fi
  if [ ! -f "$af" ]; then
    echo "  → DESPUÉS (edit con items movidos)..."
    rm -f nanobanana-output/*.png 2>/dev/null || true
    gemini --yolo "/edit '${bf}' '${after_instruction}'" 2>&1 | grep -E "saved|Generated|✓" || true
    latest=$(ls -t nanobanana-output/*.png 2>/dev/null | head -1 || true)
    if [ -n "$latest" ]; then cp "$latest" "$af"; echo "  ✓ $af"
    else echo "  ✗ Falló"; fi
  else echo "  · después ya existe"; fi
}

# ─── Modo 3: copiar before/ original a before-v3, regen after ───────────────
gen_after_recopy() {
  local slug="$1" after_instruction="$2"
  local bf_old="before/${slug}.png" bf="before-v3/${slug}.png" af="after-v3/${slug}.png"
  [[ -n "$FILTER" && "$slug" != *"$FILTER"* ]] && return 0
  echo ""; echo "=== [$slug] RECOPY + AFTER ==="
  if [ ! -f "$bf" ]; then
    if [ -f "$bf_old" ]; then cp "$bf_old" "$bf"; echo "  ✓ copiado antes original a v3"
    else echo "  ✗ ERROR: ni v3 ni original"; return 0; fi
  fi
  if [ ! -f "$af" ]; then
    echo "  → DESPUÉS (custom)..."
    rm -f nanobanana-output/*.png 2>/dev/null || true
    gemini --yolo "/edit '${bf}' '${after_instruction}'" 2>&1 | grep -E "saved|Generated|✓" || true
    latest=$(ls -t nanobanana-output/*.png 2>/dev/null | head -1 || true)
    if [ -n "$latest" ]; then cp "$latest" "$af"; echo "  ✓ $af"
    else echo "  ✗ Falló"; fi
  else echo "  · después ya existe"; fi
}

# ═══════════════════════════════════════════════════════════════════════════
# APROBADAS SIN COMENTARIO (13) — solo regenerar after con items movidos
# ═══════════════════════════════════════════════════════════════════════════

# DECALAM (decapante soldaduras inox): remove heat discoloration
DECALAM_AFTER="Remove the blue-gold heat discoloration around the weld bead, restoring uniform brushed stainless steel finish. Keep the weld bead clearly visible. ${MOVE_ITEMS}"
gen_after_keep_before "decalam-industrial" "$DECALAM_AFTER"
gen_after_keep_before "decalam-nautico"    "$DECALAM_AFTER"

# FOSSLAM náutico (interior WC limpio)
gen_after_keep_before "fosslam-nautico" \
  "Clean the toilet bowl interior, removing residue and lime scale stains. Bright white porcelain. ${MOVE_ITEMS}"

# MANZALAM industrial (acero inox sin cal)
gen_after_keep_before "manzalam-industrial" \
  "Remove the calcium deposits, water stains and fingerprints. Restore brushed stainless steel finish. ${MOVE_ITEMS}"

# MOTORLAM (motor desengrasado SIN tocar óxido)
MOTORLAM_AFTER="Remove grease and grime from the engine, leaving the components clean. CRITICAL: do NOT touch any rust — keep all rust spots intact (motorlam does not remove rust). ${MOVE_ITEMS}"
gen_after_keep_before "motorlam-industrial" "$MOTORLAM_AFTER"
gen_after_keep_before "motorlam-nautico"    "$MOTORLAM_AFTER"

# PLASTILAM industrial (faro limpio transparente)
gen_after_keep_before "plastilam-industrial" \
  "Restore the headlight plastic to clear transparency, removing yellowing and haze. Realistic clarity. ${MOVE_ITEMS}"

# TAPILAM (tapicería limpia)
TAPILAM_AFTER="Remove stains and discoloration from the fabric, restoring original colors. Keep realistic fabric texture. ${MOVE_ITEMS}"
gen_after_keep_before "tapilam-caravaning" "$TAPILAM_AFTER"
gen_after_keep_before "tapilam-industrial" "$TAPILAM_AFTER"
gen_after_keep_before "tapilam-nautico"    "$TAPILAM_AFTER"

# TEKALAM (madera/teca nutrida)
TEKALAM_AFTER="Apply wood protector, restoring a warm natural color and nourished wood grain. Realistic finish, not over-saturated. ${MOVE_ITEMS}"
gen_after_keep_before "tekalam-caravaning" "$TEKALAM_AFTER"
gen_after_keep_before "tekalam-industrial" "$TEKALAM_AFTER"
gen_after_keep_before "tekalam-nautico"    "$TEKALAM_AFTER"

# ═══════════════════════════════════════════════════════════════════════════
# APROBADAS CON COMENTARIO (items en misma posición)
# ═══════════════════════════════════════════════════════════════════════════

# MANZALAM caravaning — recopiar before y mover items
gen_after_recopy "manzalam-caravaning" \
  "Remove calcium deposits and water stains from the brushed stainless sink. Restore clean stainless finish. CRUCIAL: any sponge, cloth or brush MUST be in a DIFFERENT position than in the before image — move it, rotate it, or change its angle clearly. ${MOVE_ITEMS}"

# ═══════════════════════════════════════════════════════════════════════════
# MEJORAR (8) — ajustes específicos
# ═══════════════════════════════════════════════════════════════════════════

# MANZALAM náutico — mismo problema de items
gen_after_recopy "manzalam-nautico" \
  "Remove calcium deposits and water stains from the marine stainless sink. CRUCIAL: any sponge, cloth or brush MUST be in a DIFFERENT position than in the before image. ${MOVE_ITEMS}"

# PULIMENTO SUPERBRILLO náutico — más brillo en el después
gen_after_recopy "pulimento-superbrillo-nautico" \
  "Polish to high-gloss mirror finish, very reflective, deep clean shine. The result must be noticeably more polished and shinier. KEEP any deformations or marks intact (the product polishes, doesn't remove dents). ${MOVE_ITEMS}"

# DESOXILAM caravaning/industrial — corrosión más leve (regen both)
DESOX_GENTLE_BEFORE_BASE="with very light surface rust spots and minor weathering, mostly clean steel still visible, no heavy corrosion. Realistic close-up photography, soft white background, no text"
DESOX_GENTLE_AFTER="Remove the light surface rust, revealing clean steel underneath. KEEP some natural patina and signs of use — the metal should look used, not factory-new. Subtle change, not dramatic. ${MOVE_ITEMS}"
gen_both "desoxilam-caravaning" \
  "Caravan tow hitch coupling ball ${DESOX_GENTLE_BEFORE_BASE}" \
  "$DESOX_GENTLE_AFTER"
gen_both "desoxilam-industrial" \
  "Industrial steel bolt and pipe flange ${DESOX_GENTLE_BEFORE_BASE}" \
  "$DESOX_GENTLE_AFTER"

# FIBRALAM náutico — mismo barco antes/después (coherencia de pintura)
gen_both "fibralam-nautico" \
  "Fiberglass boat hull near the waterline with typical light algae stains and faint yellow waterline marks. The boat has clearly visible anti-fouling paint band along the bottom edge (dark blue or black). Realistic boat maintenance scenario, close-up photography, no text" \
  "Clean the hull above the waterline, removing algae stains and waterline grime. CRITICAL: the boat must look EXACTLY the same — same shape, same paint, same anti-fouling band, same hardware. Do not add, remove or modify ANY structural element or coating. Only remove dirt. ${MOVE_ITEMS}"

# MOTORLAM caravaning — sin óxido en el antes
gen_both "motorlam-caravaning" \
  "Motorhome engine bay with typical light oil film, grease and dust accumulation. NO RUST visible anywhere — all metal parts are clean steel or coated, just dirty with grease/oil. Realistic mechanical photography, no text" \
  "Remove the grease and grime from the engine components. Leave a clean surface. ${MOVE_ITEMS}"

# PLASTILAM caravaning — antes con menos rayas
gen_both "plastilam-caravaning" \
  "Caravan skylight acrylic with mild yellowing and slight surface haze from UV exposure. Very few or no visible scratches — just the yellow tint and cloudiness. Realistic close-up, no text" \
  "Restore the acrylic to clear transparency, removing yellowing and haze. ${MOVE_ITEMS}"

# PLASTILAM náutico — cristal mate opaco SIN rayas
gen_both "plastilam-nautico" \
  "Boat porthole acrylic cover that looks matte, opaque and cloudy from UV exposure, no scratches visible — just the cloudiness/yellowing. Realistic product photography, no text" \
  "Restore the porthole to crystal-clear transparent plastic. Same composition. ${MOVE_ITEMS}"

# ═══════════════════════════════════════════════════════════════════════════
# REHACER (23) — regenerar both con prompts completamente nuevos
# ═══════════════════════════════════════════════════════════════════════════

# DESOXILAM náutico — close-up cadena, no toda la cadena
gen_both "desoxilam-nautico" \
  "Extreme close-up macro photography of just a few links of a marine anchor chain with realistic surface rust spots, mostly clean steel still visible, professional documentary style, soft white background, no text" \
  "Remove the surface rust from the chain links, revealing clean steel. Keep natural patina, no factory-new shine. ${MOVE_ITEMS}"

# FIBRALAM caravaning — sin modificar estructura (ventanas)
gen_both "fibralam-caravaning" \
  "Caravan fiberglass side panel with mild green algae streaks and light dust from outdoor storage. Plain panel, no windows or special features. Realistic photography, no text" \
  "Clean the algae and dust from the panel surface. CRITICAL: keep the panel EXACTLY the same shape and structure — do not add windows, hatches or any features. Only remove dirt. ${MOVE_ITEMS}"

# FOSSLAM — solo interior del WC, no todo el baño
FOSSLAM_CLOSEUP_AFTER="Clean the toilet bowl interior, removing residue and stains. Bright white porcelain. Same closeup of just the interior. ${MOVE_ITEMS}"
gen_both "fosslam-caravaning" \
  "Tight close-up of just the interior of a caravan chemical toilet bowl with mild brown residue stains, no surrounding bathroom visible — only the toilet bowl interior fills the frame, soft white background, no text" \
  "$FOSSLAM_CLOSEUP_AFTER"
gen_both "fosslam-industrial" \
  "Tight close-up of just the interior of a portable construction site toilet bowl with moderate residue, no bathroom context — only the bowl interior fills the frame, no text" \
  "$FOSSLAM_CLOSEUP_AFTER"

# GELCOATLAM FASE 1 — rayas superficiales (no profundas), después con brillo moderado
GC1_BEFORE_BASE="gelcoat surface with SHALLOW surface scratches and light dullness from sun exposure, NO deep gouges or heavy damage, macro close-up photography, no text"
GC1_AFTER="Remove the shallow surface scratches, leaving a smooth clean surface with a moderate satin shine — not a full mirror finish (that's phase 2). KEEP any deep marks intact. ${MOVE_ITEMS}"
gen_both "gelcoatlam-fase-1-nautico"    "Boat $GC1_BEFORE_BASE" "$GC1_AFTER"
gen_both "gelcoatlam-fase-1-caravaning" "Caravan $GC1_BEFORE_BASE" "$GC1_AFTER"

# GELCOATLAM FASE 2 — antes = output ya pulido (sin rayas), después = brillo espejo
GC2_BEFORE_BASE="gelcoat surface ALREADY cleaned and polished from a previous phase, showing satin finish with mild micro-swirls, no scratches, slight haze visible in direct light, macro photography, no text"
GC2_AFTER="Polish to a deep mirror reflection with crystal-clear glossy shine. The surface gains noticeable extra shine and reflectivity from the satin start. ${MOVE_ITEMS}"
gen_both "gelcoatlam-fase-2-nautico"    "Boat $GC2_BEFORE_BASE" "$GC2_AFTER"
gen_both "gelcoatlam-fase-2-caravaning" "Caravan $GC2_BEFORE_BASE" "$GC2_AFTER"

# INYECLAM DIESEL — close-up del INYECTOR (no del motor)
INJECT_DIESEL_BEFORE="Extreme close-up macro photography of a single diesel injector nozzle tip showing moderate carbon deposits and varnish around the spray holes. Isolated component view — just the injector, no engine or surroundings visible. Studio lighting, soft white background, no text"
INJECT_DIESEL_AFTER="Remove the carbon deposits and varnish from the injector tip, revealing clean metal with visible clear spray holes. Same isolated injector component, same composition. ${MOVE_ITEMS}"
gen_both "inyeclam-diesel-nautico"     "$INJECT_DIESEL_BEFORE" "$INJECT_DIESEL_AFTER"
gen_both "inyeclam-diesel-caravaning"  "$INJECT_DIESEL_BEFORE" "$INJECT_DIESEL_AFTER"
gen_both "inyeclam-diesel-industrial"  "$INJECT_DIESEL_BEFORE" "$INJECT_DIESEL_AFTER"

# INYECLAM GASOLINA — close-up del inyector
INJECT_GAS_BEFORE="Extreme close-up macro photography of a single gasoline fuel injector with moderate brown varnish deposits and gummy residue on the tip. Isolated component view — just the injector, no engine visible. Studio lighting, soft white background, no text"
INJECT_GAS_AFTER="Remove the varnish and residue from the injector, revealing clean metal. Same isolated component, same composition. ${MOVE_ITEMS}"
gen_both "inyeclam-gasolina-nautico"    "$INJECT_GAS_BEFORE" "$INJECT_GAS_AFTER"
gen_both "inyeclam-gasolina-caravaning" "$INJECT_GAS_BEFORE" "$INJECT_GAS_AFTER"
gen_both "inyeclam-gasolina-industrial" "$INJECT_GAS_BEFORE" "$INJECT_GAS_AFTER"

# PASTA ROSA — antes: opacidad/desgaste (sin deformaciones), después: brillo manteniendo defectos
ROSA_BEFORE_BASE="aluminum/metal fitting with a DULL matte oxidized surface and visible patina, NO scratches no dents no deformations — the metal is structurally perfect, just dull and oxidized. Close-up product photography, soft white background, no text"
ROSA_AFTER="Polish the metal to a clean satin finish, removing dullness and oxidation. Realistic shine, not mirror-perfect. The product polishes — it does NOT remove any structural marks or deformations (none should be present anyway). ${MOVE_ITEMS}"
gen_both "pasta-rosa-superbrillo-nautico"    "Boat $ROSA_BEFORE_BASE" "$ROSA_AFTER"
gen_both "pasta-rosa-superbrillo-industrial" "Industrial $ROSA_BEFORE_BASE" "$ROSA_AFTER"

# PASTA VERDE — antes: satin (output rosa), después: brillo espejo, sin tocar defectos
VERDE_BEFORE_BASE="aluminum/metal part with a satin polished finish and very mild micro-swirls in direct light, NO scratches no deformations — just satin sheen needing more polish. Close-up photography, soft white background, no text"
VERDE_AFTER="Polish to a high-gloss mirror finish with clear bright reflections. The product polishes — it does NOT remove any deformation or imperfection (none should be present). ${MOVE_ITEMS}"
gen_both "pasta-verde-superbrillo-nautico"    "Boat $VERDE_BEFORE_BASE" "$VERDE_AFTER"
gen_both "pasta-verde-superbrillo-industrial" "Industrial $VERDE_BEFORE_BASE" "$VERDE_AFTER"

# PROTECLAM — antes: superficie LIMPIA pero mate, después: brillo satinado
PROTECLAM_BEFORE_BASE="dashboard vinyl/plastic panel that is COMPLETELY CLEAN — no dirt, no fingerprints, no dust — but has a DULL MATTE finish that looks dry and tired. Realistic close-up, no text"
PROTECLAM_AFTER="Apply silicone protection that brings out a subtle satin glossy shine to the dashboard. The surface goes from matte/dry to subtle gloss. NO cleaning involved — the surface was already clean. ${MOVE_ITEMS}"
gen_both "proteclam-nautico"    "Boat $PROTECLAM_BEFORE_BASE" "$PROTECLAM_AFTER"
gen_both "proteclam-caravaning" "Caravan interior $PROTECLAM_BEFORE_BASE" "$PROTECLAM_AFTER"
gen_both "proteclam-industrial" "Industrial machinery control panel $PROTECLAM_BEFORE_BASE" "$PROTECLAM_AFTER"

# PULIMENTO SUPERBRILLO — antes: STAINLESS STEEL (no hierro) con marcas leves, después: pulido a mano
PULIMENTO_BEFORE_BASE="brushed STAINLESS STEEL fitting (NOT iron — must be stainless steel) with mild surface dullness, light water spots and a few faint swirl marks. NO heavy rust, NO deep scratches, NO corrosion. Just a tired stainless surface needing hand polish. Close-up product photography, soft white background, no text"
PULIMENTO_AFTER="Hand polish the stainless steel to a bright mirror finish, removing dullness, water spots and faint swirls. The product is hand-applied — it works on light surface issues, NOT on heavy rust or deep marks (none should be present). ${MOVE_ITEMS}"
gen_both "pulimento-superbrillo-caravaning" "Caravan $PULIMENTO_BEFORE_BASE" "$PULIMENTO_AFTER"
gen_both "pulimento-superbrillo-industrial" "Industrial $PULIMENTO_BEFORE_BASE" "$PULIMENTO_AFTER"

# ─── Resumen final ─────────────────────────────────────────────────────────
echo ""
echo "═══════════════════════════════════"
echo " GENERACIÓN v3 COMPLETADA"
echo " before-v3: $(ls before-v3/*.png 2>/dev/null | wc -l | tr -d ' ') / 45 esperadas"
echo " after-v3:  $(ls after-v3/*.png 2>/dev/null | wc -l | tr -d ' ') / 45 esperadas"
echo "═══════════════════════════════════"
