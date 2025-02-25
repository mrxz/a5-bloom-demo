import { defineComponent, Object3DSetEvent } from "afive";
import * as THREE from "three";
import { replaceMaterial } from "../three-utils";

export const PhongMaterialComponent = defineComponent('phong-material', {
    schema: {},
    init: function() {
        this.el.addEventListener(Object3DSetEvent, e => {
            e.detail.object.traverse(c => replaceMaterial(c as THREE.Object3D)); // FIXME: Typing
        });
        this.el.object3D.traverse(c => replaceMaterial(c as THREE.Object3D));
    }
})

