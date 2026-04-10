# Image Generation Prompts — RoboMowSK Website

## Global Style Guide (prepend to every prompt)

> **Style prefix:** "Professional commercial photography, natural daylight, shallow depth of field, warm golden-hour tones with lush green colors. Central European suburban setting with well-maintained gardens typical of Slovakia. Clean, modern, aspirational feel. No text overlays."

Use this prefix before each prompt below to keep all images visually consistent.

---

## 1. HERO IMAGE (`img-hero` — 720x520)

**Prompt:**
{style prefix} A sleek white robotic lawn mower gliding across a perfectly manicured green lawn in a beautiful Slovak suburban garden. In the background, a modern family house with a terrace and mature trees. The lawn is striped from fresh cutting. Camera angle: low, slightly from the side, emphasizing the mower on the lush grass. Bokeh background. Aspect ratio 14:10.

---

## 2. STEP 1 — Planning (`img-step-1` — 400x280)

**Prompt:**
{style prefix} A technician in a green polo shirt standing in a garden with a homeowner, both looking at a tablet showing a lawn zone map. The technician is pointing at different areas of the garden. Lawn with flower beds and trees visible. Professional and collaborative atmosphere. Aspect ratio 10:7.

---

## 3. STEP 2 — Station placement (`img-step-2` — 400x280)

**Prompt:**
{style prefix} A technician in a green polo shirt positioning a robotic mower charging station on a flat area of lawn near a house wall with an electrical outlet. The station is sleek and modern. Tools and level visible nearby. Clean, organized workspace. Aspect ratio 10:7.

---

## 4. STEP 3 — Cable burial (`img-step-3` — 400x280)

**Prompt:**
{style prefix} Close-up of a specialized cable-laying machine cutting a thin line into lawn turf and burying a boundary wire 5 cm underground. A technician guides the machine. The grass is green and barely disturbed by the process. Focus on the precision of the machine. Aspect ratio 10:7.

---

## 5. STEP 4 — Station connection (`img-step-4` — 400x280)

**Prompt:**
{style prefix} Close-up of a technician's hands connecting wires at a robotic mower charging station base. Cable ends, connectors, and a small screwdriver visible. The station is mounted on green lawn. Clean, detailed, technical shot. Aspect ratio 10:7.

---

## 6. STEP 5 — Launch (`img-step-5` — 400x280)

**Prompt:**
{style prefix} A white robotic mower leaving its charging station onto a perfectly green lawn for its first run. A technician and homeowner watch from behind, the homeowner holding a smartphone. Warm, satisfying moment. The lawn stretches out ahead. Aspect ratio 10:7.

---

## 7. PREPARATION (`img-preparation` — 560x400)

**Prompt:**
{style prefix} A well-prepared garden ready for robotic mower installation — freshly mowed short lawn, clear of objects, edges trimmed, slightly damp soil from recent watering. A garden hose coiled neatly to the side. Morning light, clean and inviting. Aspect ratio 14:10.

---

## 8. BENEFITS — Lifestyle (`img-benefits` — 600x700)

**Prompt:**
{style prefix} A family (couple with a young child) relaxing on a garden terrace in a Slovak suburban setting, drinking coffee and laughing, while a white robotic mower works quietly on the beautiful lawn in the foreground. The scene conveys leisure, freedom, and a premium lifestyle. Vertical composition, portrait orientation. Aspect ratio 6:7.

---

## 9. AVATAR 1 — Martin K. (`img-avatar-1` — 72x72)

**Prompt:**
{style prefix} Headshot portrait of a friendly Slovak man in his early 40s, short brown hair, slight smile, wearing a casual collared shirt. Neutral blurred garden background. Square crop, centered face. Aspect ratio 1:1.

---

## 10. AVATAR 2 — Zuzana M. (`img-avatar-2` — 72x72)

**Prompt:**
{style prefix} Headshot portrait of a friendly Slovak woman in her mid-30s, shoulder-length dark blonde hair, warm smile, wearing a light blouse. Neutral blurred garden background. Square crop, centered face. Aspect ratio 1:1.

---

## 11. AVATAR 3 — Peter H. (`img-avatar-3` — 72x72)

**Prompt:**
{style prefix} Headshot portrait of a friendly Slovak man in his late 50s, gray hair, glasses, kind smile, wearing a casual polo shirt. Neutral blurred garden background. Square crop, centered face. Aspect ratio 1:1.

---

## 12. GALLERY 1 (`img-gallery-1` — wide, 600x400)

**Prompt:**
{style prefix} Aerial drone view of a large, perfectly striped green lawn in a Slovak suburban garden with a white robotic mower in the center. Flower beds along the edges, a stone pathway, and a modern house visible at the top. Aspect ratio 3:2.

---

## 13. GALLERY 2 (`img-gallery-2` — 400x400)

**Prompt:**
{style prefix} A white robotic mower docked at its sleek charging station tucked into the corner of a garden, surrounded by low hedging. The station has a small protective cover. Clean and tidy installation. Square crop. Aspect ratio 1:1.

---

## 14. GALLERY 3 (`img-gallery-3` — 400x400)

**Prompt:**
{style prefix} Close-up of a robotic mower navigating a gentle slope in a garden, with wildflowers on one side and a neatly mowed lawn on the other. The mower is white and compact. The image conveys capability on varied terrain. Square crop. Aspect ratio 1:1.

---

## 15. GALLERY 4 (`img-gallery-4` — 400x400)

**Prompt:**
{style prefix} A beautifully maintained front yard of a modern Slovak house with a robotic mower on the lawn. A gravel driveway on one side, ornamental shrubs lining the property. The overall scene looks premium and well-cared for. Square crop. Aspect ratio 1:1.

---

## 16. GALLERY 5 (`img-gallery-5` — wide, 600x400)

**Prompt:**
{style prefix} A wide shot of a large garden at dusk with warm ambient lighting from the terrace. A white robotic mower is working on the lawn. String lights hang above the terrace. The mood is serene and inviting. Aspect ratio 3:2.

---

## Usage Notes

- **Tool recommendation:** These prompts work well with Midjourney, DALL-E 3, or Flux. For best consistency, generate all images in one session.
- **Color consistency:** The mower should always be **white** across all images.
- **People consistency:** If your tool supports character references, use the same seed/reference for the technician (Steps 1–5) and keep a consistent uniform (green polo shirt).
- **Brand logos:** For Husqvarna, Gardena, Bosch, Honda, and STIHL — use their official logos (download from their press kits) rather than generating them.
- **After generating:** Replace the `placehold.co` URLs in `index.html` with your image file paths (e.g., `images/hero.jpg`).
