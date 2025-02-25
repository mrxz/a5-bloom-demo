import { defineSystem } from "afive";

export const ToggleOverlaysSystem = defineSystem("toggle-overlays", {
  schema: {},
  init: function () {
    if ((this.el.sceneEl as any).canEnterXRMode()) { // A5 typing
      // Hide VR notice
      this.el.sceneEl.querySelector("#notice")!.style.display = "none";
      // Custom backdrop for credits
      this.el.sceneEl.querySelector("#credit")!.classList.add('backdrop');
    }
  },
});
