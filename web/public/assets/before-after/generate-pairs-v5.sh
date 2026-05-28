#!/bin/bash
# v5 — Cuarta ronda. Solo regenera las 18 imágenes con feedback en v3.
# Casos especiales:
#   - INYECTORES (6): tip CENTRADO en la imagen para que el cambio se vea sin mover el slider
#   - GELCOATLAM (4): F1 y F2 encadenados — after-F1 = before-F2 (la misma imagen)
#
# Salida: before-v5/ y after-v5/ con SOLO las 18 parejas regeneradas.

set -euo pipefail

ENV_FILE="$(cd "$(dirname "$0")/../../.." && pwd)/.env.local"
[ -f "$ENV_FILE" ] && export GEMINI_API_KEY=$(grep -E '^GEMINI_API_KEY=' "$ENV_FILE" | head -1 | cut -d= -f2- | sed 's/^["'\'']//;s/["'\'']$//')
: "${GEMINI_API_KEY:?ERROR: GEMINI_API_KEY no encontrada}"

BASE="$(cd "$(dirname "$0")" && pwd)"
cd "$BASE"
mkdir -p before-v5 after-v5 nanobanana-output
FILTER="${1:-}"

# ─── Helpers ──────────────────────────────────────────────────────────────
_gen_image() {
  local out="$1" prompt="$2"
  rm -f nanobanana-output/*.png 2>/dev/null || true
  gemini --yolo "/generate '${prompt}'" 2>&1 | tail -3
  latest=$(ls -t nanobanana-output/*.png 2>/dev/null | head -1 || true)
  if [ -n "$latest" ] && [ -s "$latest" ]; then cp "$latest" "$out"; echo "  ✓ $out"; return 0
  else echo "  ✗ falló generate"; return 1; fi
}
_edit_image() {
  local input="$1" out="$2" prompt="$3"
  rm -f nanobanana-output/*.png 2>/dev/null || true
  gemini --yolo "/edit '${input}' '${prompt}'" 2>&1 | tail -3
  latest=$(ls -t nanobanana-output/*.png 2>/dev/null | head -1 || true)
  if [ -n "$latest" ] && [ -s "$latest" ]; then cp "$latest" "$out"; echo "  ✓ $out"; return 0
  else echo "  ✗ falló edit"; return 1; fi
}

gen_both() {
  local slug="$1" bp="$2" ai="$3"
  [[ -n "$FILTER" && "$slug" != *"$FILTER"* ]] && return 0
  local bf="before-v5/${slug}.png" af="after-v5/${slug}.png"
  echo ""; echo "=== [$slug] BOTH ==="
  [ -f "$bf" ] && echo "  · antes ya existe" || { echo "  → ANTES..."; _gen_image "$bf" "$bp" || return 0; }
  [ -f "$af" ] && echo "  · después ya existe" || { echo "  → DESPUÉS..."; _edit_image "$bf" "$af" "$ai" || true; }
}

gen_after_only() {
  # Mantiene el "antes" copiado de la versión anterior aprobada
  local slug="$1" source_before="$2" ai="$3"
  [[ -n "$FILTER" && "$slug" != *"$FILTER"* ]] && return 0
  local bf="before-v5/${slug}.png" af="after-v5/${slug}.png"
  echo ""; echo "=== [$slug] AFTER ONLY ==="
  if [ ! -f "$bf" ]; then cp "$source_before" "$bf"; echo "  ✓ before copiado de $source_before"; fi
  [ -f "$af" ] && echo "  · después ya existe" || { echo "  → DESPUÉS..."; _edit_image "$bf" "$af" "$ai" || true; }
}

# ═══════════════════════════════════════════════════════════════════════════
# DECALAM NÁUTICO — close-up de soldadura, sin items extra
# ═══════════════════════════════════════════════════════════════════════════
gen_both "decalam-nautico" \
  "Extreme macro close-up of a stainless steel tube weld joint showing typical golden-blue heat tint discoloration around the weld bead. The weld fills most of the frame, no surrounding items or context. Pure soft white background, professional macro photography, no text" \
  "Remove the heat discoloration around the weld, restoring uniform brushed stainless steel finish. Keep the weld bead clearly visible. Same composition."

# ═══════════════════════════════════════════════════════════════════════════
# DESOXILAM NÁUTICO — pieza no tan castigada
# ═══════════════════════════════════════════════════════════════════════════
gen_both "desoxilam-nautico" \
  "Marine stainless steel shackle isolated on white background with MODERATE surface rust covering parts of it (not heavily pitted, not destroyed — just normal weathering after one season), most of the steel still has its original shape, professional product photography, no text" \
  "Remove the surface rust from the shackle revealing clean steel underneath. Keep natural patina, not factory-new. Shackle at slightly different rotation/angle."

# ═══════════════════════════════════════════════════════════════════════════
# DESOXILAM CARAVANING — enganche menos picado, intermedio realista
# ═══════════════════════════════════════════════════════════════════════════
gen_both "desoxilam-caravaning" \
  "Caravan tow hitch coupling ball with MODERATE surface rust patches in some areas and original chrome/steel still visible in others (not heavily pitted or damaged — just normal aged appearance after a winter outdoors), realistic product photography, soft white background, no text" \
  "Remove the surface rust patches, revealing clean steel underneath. Keep some natural patina, not factory-new. Tow ball at slightly different angle."

# ═══════════════════════════════════════════════════════════════════════════
# FIBRALAM NÁUTICO — limpiar también la franja azul (antifouling)
# ═══════════════════════════════════════════════════════════════════════════
gen_both "fibralam-nautico" \
  "Close-up section of a fiberglass sailboat hull SITTING ON LAND on supports in a boatyard. The hull shows: WHITE GELCOAT on top with algae stains and waterline grime, AND a BLUE ANTIFOULING PAINT BAND along the bottom with the same algae buildup and barnacle deposits. Both surfaces are dirty. Boat yard background blurred. Realistic boat maintenance scenario, no text" \
  "Clean BOTH surfaces — the white gelcoat AND the blue antifouling paint band. Remove ALL algae stains, waterline grime and barnacle deposits from both areas. The white gelcoat is now bright white. The blue antifouling is now clean blue. Same boat, same supports, slight camera shift."

# ═══════════════════════════════════════════════════════════════════════════
# GELCOATLAM — F1 y F2 encadenados (after-F1 = before-F2 = MISMA imagen)
# ═══════════════════════════════════════════════════════════════════════════
generate_gelcoatlam_chain() {
  local cat_slug="$1" cat_word="$2"
  local f1_bf="before-v5/gelcoatlam-fase-1-${cat_slug}.png"
  local f1_af="after-v5/gelcoatlam-fase-1-${cat_slug}.png"
  local f2_bf="before-v5/gelcoatlam-fase-2-${cat_slug}.png"
  local f2_af="after-v5/gelcoatlam-fase-2-${cat_slug}.png"

  [[ -n "$FILTER" && "gelcoatlam-fase-1-${cat_slug}" != *"$FILTER"* && "gelcoatlam-fase-2-${cat_slug}" != *"$FILTER"* ]] && return 0

  echo ""; echo "=== [gelcoatlam-${cat_slug}] CADENA F1→F2 ==="

  # 1) Generar BEFORE F1: superficie deteriorada
  if [ ! -f "$f1_bf" ]; then
    echo "  → BEFORE F1 (deteriorado)..."
    _gen_image "$f1_bf" \
      "${cat_word} gelcoat panel surface with VISIBLE shallow surface scratches and clear dullness/oxidation from sun exposure. Soft matte appearance, marks clearly visible. Macro close-up photography, no text" || return 0
  else echo "  · F1 before ya existe"; fi

  # 2) AFTER F1 = edit del before F1 con efecto satin (esta imagen será BEFORE F2)
  if [ ! -f "$f1_af" ]; then
    echo "  → AFTER F1 (pulido satin, será BEFORE F2)..."
    _edit_image "$f1_bf" "$f1_af" \
      "Polish the surface removing the surface scratches and dullness. Now shows a CLEAN SATIN finish — smooth, no scratches visible, but NOT a mirror reflection yet (that comes in phase 2). Subtle warm shine, no deep gloss. Same composition." || return 0
  else echo "  · F1 after ya existe"; fi

  # 3) BEFORE F2 = COPIA del AFTER F1
  if [ ! -f "$f2_bf" ]; then
    cp "$f1_af" "$f2_bf"
    echo "  ✓ F2 before = COPIA de F1 after (encadenado correcto)"
  else echo "  · F2 before ya existe"; fi

  # 4) AFTER F2 = edit del BEFORE F2 con efecto mirror
  if [ ! -f "$f2_af" ]; then
    echo "  → AFTER F2 (brillo espejo final)..."
    _edit_image "$f2_bf" "$f2_af" \
      "Polish to a DEEP MIRROR REFLECTION with crystal-clear glossy finish. The surface goes from satin to bright reflective mirror — clearly more glossy and reflective than before. Same composition." || true
  else echo "  · F2 after ya existe"; fi
}
generate_gelcoatlam_chain "nautico"    "Boat"
generate_gelcoatlam_chain "caravaning" "Caravan"

# ═══════════════════════════════════════════════════════════════════════════
# INYECTORES (6) — TIP CENTRADO para visibilidad sin mover slider
# ═══════════════════════════════════════════════════════════════════════════
INJ_D_BEFORE="Macro side-view photograph of a diesel fuel injector composed so that the NOZZLE TIP is positioned in the HORIZONTAL CENTER of the frame, with the cylindrical body extending to the left side and empty soft white background to the right. The tip and the section that goes into the engine are covered in BLACK CARBON DEPOSITS clearly visible across the central 50% of the image width. The carbon dirt MUST be in the middle of the image so it's visible no matter where you crop. Studio product photography on soft white background, no text."
INJ_D_AFTER="Clean the carbon deposits from the central tip area, now revealing clean shiny metal with visible spray holes. CRITICAL: the cleaning effect must show clearly in the CENTER and RIGHT side of the image (where the tip is). The body on the left stays unchanged. Same composition, same camera angle."

INJ_G_BEFORE="Macro side-view photograph of a gasoline fuel injector composed so that the NOZZLE TIP is positioned in the HORIZONTAL CENTER of the frame, with the cylindrical body extending to the left side and empty soft white background to the right. The tip section is covered in BROWN VARNISH DEPOSITS and gummy residue clearly visible across the central 50% of the image width. The dirt MUST be in the middle of the image. Studio product photography, soft white background, no text."
INJ_G_AFTER="Clean the varnish from the central tip area, now revealing clean metal. CRITICAL: cleaning effect clearly visible in the CENTER and RIGHT of the image. Body on the left unchanged. Same composition and angle."

gen_both "inyeclam-diesel-nautico"     "$INJ_D_BEFORE" "$INJ_D_AFTER"
gen_both "inyeclam-diesel-caravaning"  "$INJ_D_BEFORE" "$INJ_D_AFTER"
gen_both "inyeclam-diesel-industrial"  "$INJ_D_BEFORE" "$INJ_D_AFTER"
gen_both "inyeclam-gasolina-nautico"    "$INJ_G_BEFORE" "$INJ_G_AFTER"
gen_both "inyeclam-gasolina-caravaning" "$INJ_G_BEFORE" "$INJ_G_AFTER"
gen_both "inyeclam-gasolina-industrial" "$INJ_G_BEFORE" "$INJ_G_AFTER"

# ═══════════════════════════════════════════════════════════════════════════
# MANZALAM NÁUTICO — solo regen "after" (mantener "antes" v4 aprobado)
# ═══════════════════════════════════════════════════════════════════════════
gen_after_only "manzalam-nautico" \
  "before-v4/manzalam-nautico.png" \
  "Remove the lime scale and water stains from the sink. The sink is now clean brushed stainless. CRITICAL: the green scouring pad MUST NOT be balanced on top of the faucet — instead it should be placed FLAT on the countertop next to the sink, or removed entirely from the frame. No floating or balancing objects."

# ═══════════════════════════════════════════════════════════════════════════
# PLASTILAM NÁUTICO — más perspectiva, claramente ventana de barco
# ═══════════════════════════════════════════════════════════════════════════
gen_both "plastilam-nautico" \
  "Photograph of a circular boat porthole window seen from a 3/4 angle (not straight-on), showing the marine metal frame around it and clearly visible as a porthole on a fiberglass boat hull. The acrylic glass is yellowed and cloudy from UV exposure — opaque, you cannot see through it. The boat context (white hull, marine setting) is recognizable around the porthole. Realistic marine product photography, no text" \
  "Restore the porthole acrylic glass to CLEAR TRANSPARENT, removing the yellowing and cloudiness. Through the now-clear glass you can see soft natural light from the boat interior (blurred, not a specific scene). Same composition, same angle. The boat context around the porthole remains identical."

# ═══════════════════════════════════════════════════════════════════════════
# TEKALAM — antes menos grisáceo/exagerado
# ═══════════════════════════════════════════════════════════════════════════
gen_both "tekalam-industrial" \
  "Wooden workbench surface showing mild aging — natural light brown wood color with slight darkening and a few visible knots, NOT heavily greyed or weathered. Just normal use marks. No tools on the surface. Realistic close-up texture photography, no text" \
  "Apply wood protector, restoring a slightly warmer and richer wood color. Subtle change — the wood goes from slightly dried to nourished and protected. Same composition, slight camera angle shift."

gen_both "tekalam-nautico" \
  "Teak boat deck planks with mild aging — natural medium-brown teak color with slight surface wear but NOT heavily greyed or weathered. Just normal exposure marks. Realistic close-up texture photography, no text" \
  "Apply teak protector, restoring warm golden-brown rich teak color. Subtle natural enhancement — the wood looks nourished and protected, not artificially bright. Same composition, slight angle shift."

# ─── Resumen ───────────────────────────────────────────────────────────────
echo ""
echo "═══════════════════════════════════"
echo " GENERACIÓN v5 COMPLETADA"
echo " before-v5: $(ls before-v5/*.png 2>/dev/null | wc -l | tr -d ' ') / 18 esperadas"
echo " after-v5:  $(ls after-v5/*.png 2>/dev/null | wc -l | tr -d ' ') / 18 esperadas"
echo "═══════════════════════════════════"
