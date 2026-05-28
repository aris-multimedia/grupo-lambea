#!/bin/bash
# v2 — Genera pares antes/después REALISTAS para cada variante de producto.
# El "antes" muestra situaciones moderadas y creíbles que el producto puede resolver,
# no escenas exageradas. El "después" muestra un resultado limpio pero natural.
# Uso: ./generate-pairs.sh [slug_filtro]   (sin argumento = todos)
set -euo pipefail

# Carga GEMINI_API_KEY desde web/.env.local (que está en .gitignore).
# Si necesitas regenerar la key: https://aistudio.google.com/apikey
ENV_FILE="$(cd "$(dirname "$0")/../../.." && pwd)/.env.local"
if [ -f "$ENV_FILE" ]; then
  # Extrae solo la línea GEMINI_API_KEY sin ejecutar el resto del archivo
  GEMINI_API_KEY=$(grep -E '^GEMINI_API_KEY=' "$ENV_FILE" | head -1 | cut -d= -f2- | sed 's/^["'\'']//;s/["'\'']$//')
  export GEMINI_API_KEY
fi
: "${GEMINI_API_KEY:?ERROR: GEMINI_API_KEY no encontrada. Añádela a web/.env.local}"
if [ "$GEMINI_API_KEY" = "PEGA_AQUI_TU_NUEVA_KEY" ]; then
  echo "ERROR: aún no has pegado la key real en web/.env.local" >&2
  exit 1
fi
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

# ─── Instrucciones de limpieza (naturales, no exageradas) ──────────────────
RUST="Remove the surface rust and corrosion, revealing clean steel underneath. Keep the same realistic lighting, natural metal finish, no exaggerated polish. Same exact composition, framing and background."
GREASE="Remove the grease and grime, leaving the surface visibly clean. Keep natural matte finish, no plastic shine. Same exact composition, framing and lighting."
HULL="Clean this surface, removing the algae stains and waterline marks. Restore the gelcoat to a clean white state with realistic finish. Same exact composition and framing."
SLIP="Apply a fine anti-slip texture coating to make the surface safe. Keep the underlying material visible, just with added grip texture. Same exact composition."
WELD="Remove the heat discoloration around the weld, restoring the stainless steel to a uniform brushed finish. Keep the weld bead visible, just clean. Same composition."
INOX="Remove the lime scale and water stains. Restore the brushed stainless steel finish, natural metallic look. Same composition."
INJECT="Remove the carbon deposits, revealing clean metal with visible spray holes. Keep natural metallic finish. Same composition."
POL1="Polish out the visible scratches and dullness, leaving a smooth satin finish. Realistic shine, not mirror-perfect. Same composition."
POL2="Polish to a high-gloss mirror finish with clear reflections. Same composition."
GC1="Remove the scratches and oxidation, polish to a smooth clean surface with realistic gelcoat finish. Same composition."
GC2="Polish to a deep mirror reflection with crystal-clear gloss. Same composition."
PLAS="Restore the plastic to clear transparency, removing yellowing and scratches. Realistic clarity, not glass-perfect. Same composition."
DASH="Clean off the dust and fingerprints, apply a subtle protective satin finish. Natural dust-repellent shine without plastic gloss. Same composition."
UPHOL="Remove the stains and discoloration from the fabric, restoring original colors. Keep realistic fabric texture. Same composition."
WOOD="Apply wood protector, restoring a warm natural color and nourished wood grain. Realistic finish, not over-saturated. Same composition."
TOILET="Clean and sanitize the toilet, removing residue and stains. Bright white porcelain with realistic finish. Same composition."

# ─── ANTIDESLILAM — superficie mojada normal, no tormenta ──────────────────
generate_pair "antideslilam-nautico" \
  "Wooden boat deck planks slightly wet after a brief rain shower, water droplets and a small reflective puddle on the smooth varnished wood surface, realistic outdoor lighting, documentary product photography, no text" \
  "$SLIP"

generate_pair "antideslilam-caravaning" \
  "Motorhome aluminum entrance step lightly wet from morning dew, smooth metal surface with a few water droplets reflecting daylight, realistic outdoor photography, no text" \
  "$SLIP"

generate_pair "antideslilam-industrial" \
  "Smooth metal industrial ramp surface lightly wet, a few small puddles after cleaning, normal workshop environment, realistic photography, no text" \
  "$SLIP"

# ─── DECALAM — pequeñas marcas de soldadura típicas ───────────────────────
generate_pair "decalam-nautico" \
  "Marine stainless steel tube with a fresh weld joint showing typical golden-blue heat tint discoloration around the weld bead, normal post-welding appearance, macro photography, soft white background, no text" \
  "$WELD"

generate_pair "decalam-industrial" \
  "Industrial stainless steel pipe with a weld joint showing typical heat tint coloration from recent welding work, realistic metallic surface, macro photography, soft white background, no text" \
  "$WELD"

# ─── DESOXILAM — óxido moderado de uso real, no apocalíptico ──────────────
generate_pair "desoxilam-nautico" \
  "Boat anchor chain with realistic surface rust on some links from one season of saltwater exposure, most of the steel still visible underneath, light orange patina spots, professional documentary photography, soft white background, no text" \
  "$RUST"

generate_pair "desoxilam-caravaning" \
  "Caravan tow hitch ball with light surface rust spots and minor weathering after a winter unused outdoors, mostly clean steel with a few corrosion patches, realistic product photography, soft white background, no text" \
  "$RUST"

generate_pair "desoxilam-industrial" \
  "Industrial steel bolt and flange with moderate surface rust from outdoor exposure, clean metal still visible between rust patches, realistic workshop conditions, close-up photography, soft white background, no text" \
  "$RUST"

# ─── FIBRALAM — manchas típicas de waterline, no casco abandonado ────────
generate_pair "fibralam-nautico" \
  "Fiberglass boat hull near the waterline showing typical light algae stains and a faint yellow waterline mark after one season in the water, gelcoat still mostly white, realistic boat maintenance scenario, close-up documentary photography, no text" \
  "$HULL"

generate_pair "fibralam-caravaning" \
  "Caravan fiberglass side panel with mild green algae streaks and light dust accumulation after winter storage outdoors, panel still mostly white, realistic photography, no text" \
  "$HULL"

# ─── FOSSLAM — uso normal de baño portátil, no estado abandonado ──────────
generate_pair "fosslam-nautico" \
  "Boat portable chemical toilet bowl interior with light residue and faint waterline marks from regular use, mostly clean white surface, realistic product photography, soft white background, no text" \
  "$TOILET"

generate_pair "fosslam-caravaning" \
  "Caravan chemical toilet interior with mild residue marks and slight discoloration from normal weekend trips, realistic camping conditions, soft white background, no text" \
  "$TOILET"

generate_pair "fosslam-industrial" \
  "Portable construction site toilet interior with moderate use marks and light staining, realistic working conditions, soft white background, no text" \
  "$TOILET"

# ─── GELCOATLAM F1 — rayones suaves, no superficie destruida ──────────────
generate_pair "gelcoatlam-fase-1-nautico" \
  "Boat gelcoat surface with light swirl marks and a few visible scratches from polishing, mild dullness from sun exposure, realistic close-up macro photography, no text" \
  "$GC1"

generate_pair "gelcoatlam-fase-1-caravaning" \
  "Caravan gelcoat panel with mild swirl marks and light surface scratches from normal cleaning, slight dullness, realistic macro photography, no text" \
  "$GC1"

# ─── GELCOATLAM F2 — fase de pulido fino ──────────────────────────────────
generate_pair "gelcoatlam-fase-2-nautico" \
  "Gelcoat surface after first polish phase showing very fine micro-swirl marks, slight haze visible under direct light, otherwise smooth, macro photography, no text" \
  "$GC2"

generate_pair "gelcoatlam-fase-2-caravaning" \
  "Caravan bodywork after initial polishing pass with subtle micro-swirls and mild cloudiness in direct light, almost ready for final shine, macro photography, no text" \
  "$GC2"

# ─── INYECLAM DIESEL — depósitos típicos de mantenimiento ─────────────────
generate_pair "inyeclam-diesel-nautico" \
  "Marine diesel injector nozzle with moderate carbon deposits around the spray holes after one service interval, metallic surface still visible, realistic product photography, soft white background, no text" \
  "$INJECT"

generate_pair "inyeclam-diesel-caravaning" \
  "Motorhome diesel injector tip with typical carbon buildup from regular use, moderate deposits not full blockage, macro close-up, soft white background, no text" \
  "$INJECT"

generate_pair "inyeclam-diesel-industrial" \
  "Truck diesel injector nozzle with moderate carbon deposits typical of 30,000 km service, partial buildup around spray holes, realistic macro photography, soft white background, no text" \
  "$INJECT"

# ─── INYECLAM GASOLINA — barniz moderado ───────────────────────────────────
generate_pair "inyeclam-gasolina-nautico" \
  "Marine outboard gasoline injector with light brown varnish deposits on the tip after a season of use, clean metal still visible, realistic product photography, soft white background, no text" \
  "$INJECT"

generate_pair "inyeclam-gasolina-caravaning" \
  "Motorhome gasoline engine intake with mild brown varnish buildup typical of long unused periods, realistic mechanical photography, soft white background, no text" \
  "$INJECT"

generate_pair "inyeclam-gasolina-industrial" \
  "Car gasoline intake manifold port with moderate brown varnish deposits from regular use, metal still mostly visible, realistic close-up, soft white background, no text" \
  "$INJECT"

# ─── MANZALAM — cal y manchas típicas de cocina/baño ──────────────────────
generate_pair "manzalam-nautico" \
  "Marine stainless steel galley sink with typical lime scale around the drain and light water spots from daily use, realistic kitchen photography, overhead view, no text" \
  "$INOX"

generate_pair "manzalam-caravaning" \
  "Caravan stainless steel sink with mild calcium scale and water spots from a few weeks of camping use, mostly clean brushed steel, realistic photography, overhead view, no text" \
  "$INOX"

generate_pair "manzalam-industrial" \
  "Stainless steel industrial surface with moderate calcium deposits and fingerprint marks from regular use, realistic close-up photography, no text" \
  "$INOX"

# ─── MOTORLAM — motor con suciedad normal, no derrame ─────────────────────
generate_pair "motorlam-nautico" \
  "Boat engine compartment with typical light oil film and dust accumulation after one season, components visible underneath, realistic mechanical photography, no text" \
  "$GREASE"

generate_pair "motorlam-caravaning" \
  "Motorhome engine bay with normal grime and dust buildup typical of long road trips, components clearly visible, realistic automotive photography, no text" \
  "$GREASE"

generate_pair "motorlam-industrial" \
  "Car engine bay with typical accumulated grime and dust from regular driving, mechanical components still clearly visible, realistic automotive photography, no text" \
  "$GREASE"

# ─── PASTA ROSA — oxidación leve de aluminio ──────────────────────────────
generate_pair "pasta-rosa-superbrillo-nautico" \
  "Aluminum boat fitting with mild surface oxidation and a thin white patina from sea exposure, base aluminum still visible, realistic product photography, soft white background, no text" \
  "$POL1"

generate_pair "pasta-rosa-superbrillo-industrial" \
  "Aluminum industrial part with light surface oxidation and minor pitting from outdoor use, realistic close-up photography, soft white background, no text" \
  "$POL1"

# ─── PASTA VERDE — pulido intermedio ──────────────────────────────────────
generate_pair "pasta-verde-superbrillo-nautico" \
  "Polished aluminum boat cleat after rough polishing showing fine swirl marks and soft satin finish, almost ready for mirror polish, realistic close-up, no text" \
  "$POL2"

generate_pair "pasta-verde-superbrillo-industrial" \
  "Industrial aluminum part after rough polishing with fine micro-swirls visible in reflected light, satin finish, realistic close-up, soft white background, no text" \
  "$POL2"

# ─── PLASTILAM — amarilleo moderado por sol ───────────────────────────────
generate_pair "plastilam-nautico" \
  "Boat acrylic porthole cover with mild yellowing and faint surface scratches from UV exposure over a few seasons, still partially transparent, realistic product photography, no text" \
  "$PLAS"

generate_pair "plastilam-caravaning" \
  "Caravan acrylic skylight with light yellowing and surface haze from UV exposure, still translucent, realistic close-up, no text" \
  "$PLAS"

generate_pair "plastilam-industrial" \
  "Car headlight lens with mild yellowing and surface haze typical of a vehicle a few years old, still functional, realistic automotive close-up, no text" \
  "$PLAS"

# ─── PROTECLAM — polvo y huellas típicas ──────────────────────────────────
generate_pair "proteclam-nautico" \
  "Boat dashboard vinyl panel with light dust accumulation and a few fingerprint marks from regular use, realistic close-up product photography, no text" \
  "$DASH"

generate_pair "proteclam-caravaning" \
  "Caravan interior vinyl dashboard with mild dust and a few smudges from travel, realistic close-up photography, no text" \
  "$DASH"

generate_pair "proteclam-industrial" \
  "Industrial control panel vinyl surface with light dust accumulation from workshop use, realistic close-up, no text" \
  "$DASH"

# ─── PULIMENTO SUPERBRILLO — desgaste leve ────────────────────────────────
generate_pair "pulimento-superbrillo-nautico" \
  "Boat stainless steel deck cleat with light surface oxidation and water spots from saltwater exposure, mostly clean metal, realistic close-up product photography, soft white background, no text" \
  "$RUST"

generate_pair "pulimento-superbrillo-caravaning" \
  "Caravan aluminum trim strip with mild surface oxidation and light dullness, base material clearly visible, realistic close-up, soft white background, no text" \
  "$POL2"

generate_pair "pulimento-superbrillo-industrial" \
  "Industrial metal fitting with light surface dullness and minor oxidation from outdoor exposure, realistic close-up photography, soft white background, no text" \
  "$POL2"

# ─── TAPILAM — tapicería con manchas normales ─────────────────────────────
generate_pair "tapilam-nautico" \
  "Boat upholstery seat with a few visible food or drink stains and light soiling from a season of use, realistic fabric close-up, no text" \
  "$UPHOL"

generate_pair "tapilam-caravaning" \
  "Caravan dinette fabric seat with mild coffee stains and light dirt marks from family trips, realistic fabric photography, no text" \
  "$UPHOL"

generate_pair "tapilam-industrial" \
  "Commercial van seat fabric with light staining and grime from work use, realistic close-up photography, no text" \
  "$UPHOL"

# ─── TEKALAM — teca envejecida moderadamente ──────────────────────────────
generate_pair "tekalam-nautico" \
  "Teak boat deck planks weathered to a soft gray patina with subtle surface texture from sun and rain, no deep cracks, realistic close-up texture photography, no text" \
  "$WOOD"

generate_pair "tekalam-caravaning" \
  "Caravan interior wood trim with mild fading and dryness from age, natural wood grain still clearly visible, realistic close-up, no text" \
  "$WOOD"

generate_pair "tekalam-industrial" \
  "Wooden workbench top with normal wear and slight graying from regular workshop use, natural wood grain visible, realistic close-up, no text" \
  "$WOOD"

# ─── Resumen final ─────────────────────────────────────────────────────────
echo ""
echo "═══════════════════════════════════"
echo " GENERACIÓN v2 COMPLETADA"
echo " Antes: $(ls before/*.png 2>/dev/null | wc -l | tr -d ' ') imágenes"
echo " Después: $(ls after/*.png 2>/dev/null | wc -l | tr -d ' ') imágenes"
echo "═══════════════════════════════════"
