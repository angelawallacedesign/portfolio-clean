// Documentation only: production motion remains owned by its existing sources.
import { initSurfaceMotion } from "../awd-lab/modules/shared/interaction-engine.js";

export const motion = [
  {
    id: "awd-motion-surface-tilt", name: "Surface Tilt",
    description: "Pointer-responsive 3D transformation",
    source: "../awd-lab/modules/shared/interaction-engine.js",
    css: "../awd-lab/modules/surface-node/surface-node.css",
    selector: "initSurfaceMotion() · .sn-surface-node__motion",
    preview: `<div class="kit-toolbar kit-surface-controls">
      <label for="kit-surface-orientation">Orientation</label>
      <select id="kit-surface-orientation" aria-controls="kit-surface-stage">
        <option value="default">Default</option><option value="left">Left</option><option value="right">Right</option>
      </select>
    </div>
    <div id="kit-surface-stage" class="sn-surface-node kit-motion-surface" data-sn-root aria-describedby="kit-surface-help">
      <div class="sn-surface-node__motion" data-kit-surface>
        <div class="sn-surface-node__orientation" data-sn-orientation>
          <div class="sn-surface-node__content">
            <img class="sn-surface-node__face" data-sn-flat src="../awd-lab/assets/surface/surface_flat.svg" alt="Flat Surface face">
            <img class="sn-surface-node__face" data-sn-face src="../awd-lab/assets/surface/surface_face.svg" alt="Surface face">
            <img class="sn-surface-node__edge" data-sn-edge src="../awd-lab/assets/surface/surface_edge.svg" alt="">
          </div>
        </div>
      </div>
    </div>
    <button type="button" data-kit-reset>Reset Surface Tilt</button>
    <p id="kit-surface-help" class="kit-source">Choose Default, Left, or Right. Move across the preview; leave to return to that orientation.</p>
    <p id="kit-surface-state" class="kit-source" role="status"></p>`,
    specs: [
      ["Purpose", "Give a surface spatial feedback as the pointer moves."],
      ["Trigger", "Mouse pointer movement; touch or pen movement while pressed."],
      ["Animated properties", "Outer transform: pointer-driven rotateY and rotateX. Inner orientation layer: flat rectangle, original SVG projection, or reflection. --light-x and --light-y drive lighting. Oriented variants use scale(1); perspective rotation creates the edge-size changes."],
      ["Duration / easing", "320ms while responding; 440ms on exit. cubic-bezier(0.22, 1, 0.36, 1). Pointer mapping uses easeSigned(v) = v × v × sign(v)."],
      ["States", "Default: front-facing 160 × 470 rectangle from surface_flat.svg. Left: original SVG silhouette, unchanged. Right: horizontally mirrored Left. Resting geometry stays on the inner layer; the outer layer adds signed-square × 38 × 2.6 rotation (±24.7° per axis; X rotation inverted). No interaction scale is applied to oriented variants."],
      ["Perspective / reference", "Original perspective: 1200px, origin 80% 50%; transform origin 60% 50%. Right mirrors those origins to 20% 50% and 40% 50%, plus the horizontal lighting response. The compact preview scales the perspective distance with artwork height (180 / 470) to preserve depth proportions. Git b1c466d retains the signed-square gain from 1bb4651 and sets 320ms / 440ms timing. The SVG already encodes Left; no arbitrary resting angle is added."],
      ["API", "initSurfaceMotion({ surface, orientation: \"default\" | \"left\" | \"right\", pointerTarget }) requires an inner [data-sn-orientation] layer. setOrientation() changes rest geometry; reset() clears offsets; setEnabled(false) keeps a static variant. createSurfaceNodeMap accepts options.orientation. Omit orientation to retain legacy behavior."],
      ["Exit", "Pointer leave, window pointer cancel, or Reset clears pointer offsets, lighting and responding state, preserving the selected resting orientation."],
      ["Reduced motion", "The preview calls setEnabled(false) under reduced motion: pointer motion is disabled and offsets reset, while the selected resting orientation remains visible. Shared CSS limits transitions to 1ms."],
      ["Keyboard", "Tab to the native Orientation selector and use arrow keys to choose a variant; Reset is a native button. Pointer movement is a spatial demonstration."],
    ],
  },
  {
    id: "awd-motion-shimmer", name: "Shimmer",
    description: "Moving highlight effect",
    source: "../css/components.css", selector: ".cta-btn::before · .cta-btn:hover::before",
    preview: '<button class="cta-btn xl" type="button" aria-describedby="kit-shimmer-help">Hover for shimmer</button><p id="kit-shimmer-help" class="kit-source">Move the pointer off and on to replay. This production highlight responds to hover only.</p>',
    specs: [
      ["Purpose", "Sweep an accent highlight across a surface."],
      ["Trigger", "Hover. Existing CTA pseudo-element behavior; no standalone shimmer utility or keyframes are defined."],
      ["Animated properties", "::before transform: translateX; 112deg gradient with transparent stops at 36% / 64% and 22% accent at 50%."],
      ["Duration / easing", "900ms; cubic-bezier(0.2, 0.72, 0.2, 1)."],
      ["States", "Rest: translateX(-125%). Hover: translateX(125%)."],
      ["Exit / completion", "Settles at 125% while hovered; transitions back to −125% on exit. No automatic loop. Exit and re-enter to replay."],
      ["Reduced motion", "Production CSS hides ::before and removes its transition."],
      ["Keyboard", "Focus shows the existing CTA outline and border feedback; production shimmer is hover-only. No keyboard shimmer is added."],
    ],
  },
  {
    id: "awd-motion-press-feedback", name: "Press Feedback",
    description: "Press-and-release movement",
    source: "../css/components.css", selector: ".cta-btn · .cta-btn:active",
    preview: '<button class="cta-btn xl" type="button">Press and release</button>',
    specs: [
      ["Purpose", "Confirm a pressed control with a small displacement."],
      ["Trigger", "Native button :active state: pointer press or Space while focused."],
      ["Animated properties", "Individual translate property. This button also retains the existing CTA hover highlight and accent border."],
      ["Duration / easing", "250ms; cubic-bezier(0.2, 0.72, 0.2, 1)."],
      ["States", "Rest: translate none. Hover: −0.125rem −0.125rem. Active: 0.08rem 0.08rem."],
      ["Exit", "Release returns to hover displacement while hovered, otherwise rest. Keyboard Space release returns to rest."],
      ["Reduced motion", "Production CSS sets hover / active translate to none and removes transitions. Focus indicators remain visible."],
      ["Keyboard", "Tab to focus; hold and release Space to preview. Enter activates the native button; it has no navigation or submission action."],
    ],
  },
];

export function initializeMotionPreviews() {
  const surface = document.querySelector("[data-kit-surface]");
  const selector = document.querySelector("#kit-surface-orientation");
  const state = document.querySelector("#kit-surface-state");
  const preference = matchMedia("(prefers-reduced-motion: reduce)");
  const status = document.querySelector("#kit-motion-status");
  const interaction = initSurfaceMotion({
    surface,
    pointerTarget: document.querySelector("#kit-surface-stage"),
    orientation: selector.value,
    enabled: !preference.matches,
  });
  function update() {
    interaction.setEnabled(!preference.matches);
    state.textContent = `${selector.selectedOptions[0].textContent} orientation · ${preference.matches ? "static preview" : "pointer interaction enabled"}`;
    status.textContent = preference.matches
      ? "Reduced motion: tilt disabled; shimmer and press movement suppressed by production CSS."
      : "Motion enabled. Hover the highlight, press the button, or move across the Surface.";
  }
  selector.addEventListener("change", () => {
    interaction.setOrientation(selector.value);
    update();
  });
  document.querySelector("[data-kit-reset]").addEventListener("click", interaction.reset);
  preference.addEventListener("change", update);
  update();
}
