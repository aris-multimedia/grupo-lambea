#!/bin/bash
# Genera pares antes/después para cada variante de producto
# Uso: ./generate-pairs.sh [slug_filtro]   (sin argumento = todos)
set -euo pipefail

export GEMINI_API_KEY="AIzaSyD5xNvZfP1E4zwljZ5UVvWUI5YX-F7FK7w"
BASE="$(cd "$(dirname "$0")" && pwd)"
cd "$BASE"
mkdir -p before after nanobanana-output

FILTER="${1:-}"

generate_pair() {
  local slug="$1"
  local before_prompt="$2"
  local after_instruction="$3"
  local before_file="before/${slug}.png"
  local after_file="after/${slug}.png"

  # Aplicar filtro si se especificó
  if [[ -n "$FILTER" && "$slug" != *"$FILTER"* ]]; then return 0; fi

  echo ""
  echo "=== [$slug] ==="

  # --- BEFORE ---
  if [ ! -f "$before_file" ]; then
    echo "  → ANTES..."
    rm -f nanobanana-output/*.png 2>/dev/null || true
    gemini --yolo "/generate '${before_prompt}'" 2>&1 | grep -E "saved|Generated|✓|File" || true
    latest=$(ls -t nanobanana-output/*.png 2>/dev/null | head -1 || true)
    if [ -n "$latest" ]; then
      cp "$latest" "$before_file"
      echo "  ✓ before/${slug}.png"
    else
      echo "  ✗ Falló antes — saltando"
      return 0
    fi
  else
    echo "  · antes ya existe"
  fi

  # --- AFTER (edit desde before) ---
  if [ ! -f "$after_file" ]; then
    echo "  → DESPUÉS (editando antes)..."
    rm -f nanobanana-output/*.png 2>/dev/null || true
    gemini --yolo "/edit '${before_file}' '${after_instruction}'" 2>&1 | grep -E "saved|Generated|✓|File" || true
    latest=$(ls -t nanobanana-output/*.png 2>/dev/null | head -1 || true)
    if [ -n "$latest" ]; then
      cp "$latest" "$after_file"
      echo "  ✓ after/${slug}.png"
    else
      echo "  ✗ Falló después"
    fi
  else
    echo "  · después ya existe"
  fi
}

# ─── Instrucciones de limpieza por tipo ────────────────────────────────────
RUST="Remove all rust, corrosion and oxidation completely. Reveal bright shiny clean metal. Same exact composition, same object, same framing, same background."
GREASE="Remove all grease, oil, grime and dirt completely. Reveal clean spotless surfaces. Same exact composition, same framing and lighting."
HULL="Clean this surface completely. Remove all algae, stains, oxidation and discoloration. Restore to brilliant white or original clean state. Same exact composition and framing."
SLIP="Make this surface safe with anti-slip texture coating. Remove the slippery look, add grip texture. Same exact composition."
WELD="Remove all heat discoloration, blue-gold tints and oxidation stains from this stainless steel weld. Restore to bright mirror-finish passivated stainless steel. Same composition."
INOX="Remove all lime scale, water stains, rust spots and grime. Restore to brilliant brushed stainless steel finish. Same composition."
INJECT="Remove all carbon deposits, soot and clogging from this injector. Reveal clean shiny metal with clear spray holes. Same composition."
POL1="Polish this to a smooth satin finish removing deep scratches and oxidation. Clean smooth metal surface. Same composition."
POL2="Polish this to a perfect mirror-chrome reflection with spectacular glossy shine. Same composition."
GC1="Remove all scratches and dullness from this gelcoat. Polish to smooth clean restored surface. Same composition."
GC2="Polish this gelcoat to an absolute mirror reflection, crystal clear deep shine. Same composition."
PLAS="Restore this plastic to crystal clarity. Remove all yellowing, scratches and haziness. Make it perfectly transparent and new. Same composition."
DASH="Remove all fingerprints, dust and grime. Apply silicone protection for rich glossy dust-repellent shine. Same composition."
UPHOL="Remove all stains, dirt and discoloration from this fabric. Restore vivid original colors and cleanliness. Same composition."
WOOD="Apply wood protector. Restore rich warm golden-brown color, moisturize and nourish the wood grain. Same composition."
TOILET="Clean and sanitize this toilet completely. Remove all residue, deposits and staining. Make it sparkling white and hygienic. Same composition."

# ─── ANTIDESLILAM ──────────────────────────────────────────────────────────
generate_pair "antideslilam-nautico" \
  "Wet slippery wooden boat deck with water pooling on smooth boards in rain, dangerous slick surface, close-up photography, natural light, no text" \
  "$SLIP"

generate_pair "antideslilam-caravaning" \
  "Wet smooth caravan entrance steps with water pooling, slippery metal motorhome steps in rain, close-up photography, no text" \
  "$SLIP"

generate_pair "antideslilam-industrial" \
  "Wet industrial factory floor or metal ramp with water on smooth surface, slippery hazard area, close-up photography, no text" \
  "$SLIP"

# ─── DECALAM ───────────────────────────────────────────────────────────────
generate_pair "decalam-nautico" \
  "Marine stainless steel tube weld joint with dark golden-brown and blue heat discoloration stains around the weld bead, macro photography, white background, no text" \
  "$WELD"

generate_pair "decalam-industrial" \
  "Industrial stainless steel pipe weld with blue-gold heat tint discoloration from welding process, oxidation marks on pipe joint, macro photography, white background, no text" \
  "$WELD"

# ─── DESOXILAM ─────────────────────────────────────────────────────────────
generate_pair "desoxilam-nautico" \
  "Boat anchor chain with heavy orange-red rust covering every metal link, thick corrosion and mineral deposits, macro close-up, white background, no text" \
  "$RUST"

generate_pair "desoxilam-caravaning" \
  "Rusty caravan tow hitch coupling ball with heavy orange corrosion and calcium deposits on the metal trailer hitch, close-up photography, white background, no text" \
  "$RUST"

generate_pair "desoxilam-industrial" \
  "Heavy industrial steel bolt and pipe flange with thick orange-red rust, severely corroded industrial machinery fitting, close-up photography, white background, no text" \
  "$RUST"

# ─── FIBRALAM ──────────────────────────────────────────────────────────────
generate_pair "fibralam-nautico" \
  "Fiberglass boat hull with dark algae stains, waterline grime and oxidized dull yellowish gelcoat with streaks and biological growth, close-up photography, no text" \
  "$HULL"

generate_pair "fibralam-caravaning" \
  "Dirty caravan exterior fiberglass body panel with green algae stains, black streaks and yellow oxidation on caravan side wall, close-up photography, no text" \
  "$HULL"

# ─── FOSSLAM ───────────────────────────────────────────────────────────────
generate_pair "fosslam-nautico" \
  "Boat portable chemical toilet bowl interior with brown residue buildup and limescale deposits, close-up photography, white background, no text" \
  "$TOILET"

generate_pair "fosslam-caravaning" \
  "Caravan chemical toilet interior with dark brown deposits and lime scale staining, close-up photography, white background, no text" \
  "$TOILET"

generate_pair "fosslam-industrial" \
  "Industrial portable toilet waste tank interior with heavy dark brown residue buildup, close-up photography, white background, no text" \
  "$TOILET"

# ─── GELCOATLAM F1 ─────────────────────────────────────────────────────────
generate_pair "gelcoatlam-fase-1-nautico" \
  "Weathered boat gelcoat surface with deep scratches, swirl marks and dull oxidized yellowish surface, macro close-up photography, no text" \
  "$GC1"

generate_pair "gelcoatlam-fase-1-caravaning" \
  "Caravan gelcoat bodywork with scratches, swirl marks and light oxidation, dull yellowish tired surface, macro close-up photography, no text" \
  "$GC1"

# ─── GELCOATLAM F2 ─────────────────────────────────────────────────────────
generate_pair "gelcoatlam-fase-2-nautico" \
  "Gelcoat surface with slight haziness and micro-swirl marks, soft dull reflection but not mirror finish yet, macro photography, no text" \
  "$GC2"

generate_pair "gelcoatlam-fase-2-caravaning" \
  "Caravan bodywork with cloudiness and fine swirl marks after initial polish, not yet mirror finish, macro photography, no text" \
  "$GC2"

# ─── INYECLAM DIESEL ───────────────────────────────────────────────────────
generate_pair "inyeclam-diesel-nautico" \
  "Marine diesel injector nozzle with heavy carbon deposits and black soot clogging the spray holes, macro photography, white background, no text" \
  "$INJECT"

generate_pair "inyeclam-diesel-caravaning" \
  "Motorhome diesel injector nozzle with carbon soot deposits clogging the tip, macro close-up, white background, no text" \
  "$INJECT"

generate_pair "inyeclam-diesel-industrial" \
  "Heavy truck diesel injector nozzle heavily clogged with black carbon soot and deposits, macro photography, white background, no text" \
  "$INJECT"

# ─── INYECLAM GASOLINA ─────────────────────────────────────────────────────
generate_pair "inyeclam-gasolina-nautico" \
  "Marine outboard gasoline engine fuel injector with brown varnish deposits and gummy residue on components, close-up photography, white background, no text" \
  "$INJECT"

generate_pair "inyeclam-gasolina-caravaning" \
  "Motorhome gasoline engine intake with sticky brown varnish deposits and residue in fuel system, close-up photography, white background, no text" \
  "$INJECT"

generate_pair "inyeclam-gasolina-industrial" \
  "Car gasoline intake manifold with brown varnish deposits and gummy resin buildup inside the ports, close-up photography, white background, no text" \
  "$INJECT"

# ─── MANZALAM ──────────────────────────────────────────────────────────────
generate_pair "manzalam-nautico" \
  "Marine stainless steel sink with lime scale deposits, water stains and rust spots on brushed steel surface, overhead photography, no text" \
  "$INOX"

generate_pair "manzalam-caravaning" \
  "Caravan kitchen stainless steel sink with calcium lime scale buildup, water stains and grime on brushed steel, overhead photography, no text" \
  "$INOX"

generate_pair "manzalam-industrial" \
  "Industrial stainless steel equipment surface with calcium deposits, rust spots and grime on brushed steel, close-up photography, no text" \
  "$INOX"

# ─── MOTORLAM ──────────────────────────────────────────────────────────────
generate_pair "motorlam-nautico" \
  "Boat bilge area with oily black sludge and thick grease covering marine engine components, dark grimy bilge, close-up photography, no text" \
  "$GREASE"

generate_pair "motorlam-caravaning" \
  "Motorhome engine covered in thick black grease and oil deposits, dark grime buildup on engine components, close-up photography, no text" \
  "$GREASE"

generate_pair "motorlam-industrial" \
  "Car engine bay with thick black oil and grime on all mechanical components, very dirty engine, automotive photography, no text" \
  "$GREASE"

# ─── PASTA ROSA ────────────────────────────────────────────────────────────
generate_pair "pasta-rosa-superbrillo-nautico" \
  "Dull oxidized aluminum boat fitting with white powdery oxidation layer and pitting marks, close-up photography, white background, no text" \
  "$POL1"

generate_pair "pasta-rosa-superbrillo-industrial" \
  "Industrial aluminum part with heavy white powder oxidation, dull corroded surface with pitting, close-up photography, white background, no text" \
  "$POL1"

# ─── PASTA VERDE ───────────────────────────────────────────────────────────
generate_pair "pasta-verde-superbrillo-nautico" \
  "Metal aluminum boat cleat with satin polish but visible fine swirl marks, not yet mirror finish, soft reflection, close-up photography, no text" \
  "$POL2"

generate_pair "pasta-verde-superbrillo-industrial" \
  "Industrial chrome aluminum part with satin finish and remaining micro-swirl marks, dull cloudy reflection, close-up photography, white background, no text" \
  "$POL2"

# ─── PLASTILAM ─────────────────────────────────────────────────────────────
generate_pair "plastilam-nautico" \
  "Boat porthole hatch cover with heavily yellowed scratched acrylic plastic, UV damage making it opaque and milky, close-up photography, no text" \
  "$PLAS"

generate_pair "plastilam-caravaning" \
  "Caravan skylight roof window with yellowed UV-degraded acrylic, completely opaque and scratched plastic, close-up photography, no text" \
  "$PLAS"

generate_pair "plastilam-industrial" \
  "Car headlight lens heavily yellowed and foggy, UV oxidized opaque plastic with scratches, close-up automotive photography, no text" \
  "$PLAS"

# ─── PROTECLAM ─────────────────────────────────────────────────────────────
generate_pair "proteclam-nautico" \
  "Boat dashboard instrument panel with fingerprint smudges and dusty vinyl surfaces, close-up photography, no text" \
  "$DASH"

generate_pair "proteclam-caravaning" \
  "Caravan interior dashboard with fingerprints, dusty smudged vinyl panels and grime on plastic trim, close-up photography, no text" \
  "$DASH"

generate_pair "proteclam-industrial" \
  "Industrial machinery control panel with fingerprints and dust accumulation on surface, close-up photography, no text" \
  "$DASH"

# ─── PULIMENTO SUPERBRILLO ─────────────────────────────────────────────────
generate_pair "pulimento-superbrillo-nautico" \
  "Rusty corroded boat deck cleat fitting with heavy orange rust and corrosion on stainless steel nautical fitting, close-up photography, white background, no text" \
  "$RUST"

generate_pair "pulimento-superbrillo-caravaning" \
  "Caravan aluminum trim strip with white powdery oxidation, dull corroded aluminum surface, close-up photography, white background, no text" \
  "$POL2"

generate_pair "pulimento-superbrillo-industrial" \
  "Industrial metal fitting or pipe with dull oxidation layer and surface corrosion, worn industrial part, close-up photography, white background, no text" \
  "$POL2"

# ─── TAPILAM ───────────────────────────────────────────────────────────────
generate_pair "tapilam-nautico" \
  "Boat upholstery seat cushion with multiple stains, dark dirt marks and mildew spots on marine fabric, close-up fabric photography, no text" \
  "$UPHOL"

generate_pair "tapilam-caravaning" \
  "Caravan interior fabric sofa with food stains, spilled marks and mildew on dinette seat upholstery, close-up fabric photography, no text" \
  "$UPHOL"

generate_pair "tapilam-industrial" \
  "Commercial van truck seat fabric with heavy staining and dark grime marks on upholstery, close-up photography, no text" \
  "$UPHOL"

# ─── TEKALAM ───────────────────────────────────────────────────────────────
generate_pair "tekalam-nautico" \
  "Grey dried cracked teak wood deck planks, bleached and weathered from sun and rain, deep cracks visible in wood grain, close-up texture photography, no text" \
  "$WOOD"

generate_pair "tekalam-caravaning" \
  "Dry cracked caravan interior wood panel, bleached and weathered looking wood trim with cracks, close-up texture photography, no text" \
  "$WOOD"

generate_pair "tekalam-industrial" \
  "Industrial wooden pallet top or workshop bench, heavily weathered grey dry cracked wood, close-up texture photography, no text" \
  "$WOOD"

# ─── Resumen final ─────────────────────────────────────────────────────────
echo ""
echo "═══════════════════════════════════"
echo " GENERACIÓN COMPLETADA"
echo " Antes: $(ls before/*.png 2>/dev/null | wc -l | tr -d ' ') imágenes"
echo " Después: $(ls after/*.png 2>/dev/null | wc -l | tr -d ' ') imágenes"
echo "═══════════════════════════════════"
