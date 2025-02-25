import { defineComponent, EnterVREvent, ExitVREvent, RendererResizeEvent } from "afive";
import * as THREE from "three";
import { UnrealBloomEffect } from "@fern-solutions/three-vr-postfx";

const tempV2 = new THREE.Vector2();

export const VrBloomComponent = defineComponent('vr-bloom', {
    schema: {
        strength: { type: 'number', default: 1.0 },
        radius: { type: 'number', default: 1.0 },
        threshold: { type: 'number', default: 1.0 },
    },
    sceneOnly: true,
    __fields: {} as {
        effect: UnrealBloomEffect;
    },
    init: function() {
        const sceneEl = this.sceneEl;
        const renderer = this.sceneEl.renderer;

        const effect = this.effect = new UnrealBloomEffect(undefined, this.data.strength, this.data.radius, this.data.threshold);
        this.sceneEl.customRenderMethod = this.effect.render.bind(this.effect);

        function resize() {
            if(!renderer.xr.isPresenting) {
                renderer.setSize(window.innerWidth, window.innerHeight);

                // Injected camera might not be present yet
                if(sceneEl.camera) {
                    sceneEl.camera.aspect = window.innerWidth / window.innerHeight;
                    sceneEl.camera.updateProjectionMatrix();
                }
            }

            const size = renderer.getSize(tempV2)
            effect.setSize(size.x, size.y);
        }
        resize();

        this.sceneEl.addEventListener(EnterVREvent, _ => resize());
        this.sceneEl.addEventListener(ExitVREvent, _ => resize());
        this.sceneEl.addEventListener(RendererResizeEvent, _ => resize());
    }
})