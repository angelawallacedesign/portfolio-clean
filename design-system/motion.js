// Documentation only: production motion remains owned by its existing sources.
import { initSurfaceMotion } from "../awd-lab/modules/shared/interaction-engine.js";

export const motion = [
  {
    id: "awd-motion-surface-tilt", name: "Surface Tilt",
    description: "Pointer-responsive 3D transformation",
    source: "../awd-lab/modules/shared/interaction-engine.js",
    css: "../awd-lab/modules/surface-node/surface-node.css",
    selector: "initSurfaceMotion() · .sn-surface-node__motion",
    preview: '<div class="sn-surface-node kit-motion-surface" data-sn-root><div class="sn-surface-node__motion" data-kit-surface><img src="../awd-lab/assets/surface/surface_face.svg" alt="Interactive Surface preview"></div></div><button type="button" data-kit-reset>Reset Surface Tilt</button>',
    specs: [
      ["Purpose", "Give a surface spatial feedback as the pointer moves."],
      ["Trigger", "Mouse pointer movement; touch or pen movement while pressed."],
      ["Animated properties", "transform: rotateY, rotateX, scale; --light-x and --light-y updated for lighting consumers."],
      ["Duration / easing", "320ms while responding; 440ms on exit. cubic-bezier(0.22, 1, 0.36, 1). Pointer mapping uses easeSigned(v) = v × v × sign(v)."],
      ["States", "Rest: rotateY(0deg) rotateX(0deg) scale(1). Active: clamped normalized coordinates (−0.5…0.5), signed square × 38 × 2.6 (Y rotation; negative for X rotation), scale(1.05)."],
      ["Exit", "Pointer leave or window pointer cancel resets rotation, scale, lighting and responding state."],
      ["Reduced motion", "Production utility has no preference check. This preview unbinds it and clears transforms when reduced motion is requested; shared CSS also limits transitions to 1ms."],
      ["Keyboard", "Spatial pointer demonstration has no keyboard action. Reset is a native keyboard-accessible button."],
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
  const preference = matchMedia("(prefers-reduced-motion: reduce)");
  const status = document.querySelector("#kit-motion-status");
  let interaction;
  function update() {
    interaction?.destroy();
    surface.style.removeProperty("transform");
    surface.style.removeProperty("--light-x");
    surface.style.removeProperty("--light-y");
    interaction = preference.matches ? null : initSurfaceMotion({ surface });
    status.textContent = preference.matches
      ? "Reduced motion: tilt disabled; shimmer and press movement suppressed by production CSS."
      : "Motion enabled. Hover the highlight, press the button, or move across the Surface.";
  }
  document.querySelector("[data-kit-reset]").addEventListener("click", () => {
    // Use the production reset handler rather than recreating its motion logic.
    surface.dispatchEvent(new PointerEvent("pointerleave"));
  });
  preference.addEventListener("change", update);
  update();
}
