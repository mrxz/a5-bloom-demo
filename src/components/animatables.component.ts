import { defineComponent } from "afive";
import * as THREE from "three";
import { TheatreSystem } from "../systems/theatre.system";
import { types } from "@theatre/core";

export const AnimatablesComponent = defineComponent('animatables', {
    schema: {},
    init: function() {
        const loadUniform = { value: 0.0 };

        const innerRing = this.el.object3D.getObjectByName('MediumShowRoom_Body_Placeable_0')! as THREE.Mesh<THREE.BufferGeometry, THREE.MeshPhongMaterial>;
        innerRing.material.emissive = new THREE.Color('red');
        innerRing.material.emissiveIntensity = 1.0;
        innerRing.material.color = new THREE.Color(0x333333);
        innerRing.material.onBeforeCompile = (shader) => {
            shader.uniforms['loadUniform'] = loadUniform;
            shader.vertexShader = shader.vertexShader
                .replace('#include <common>', /*glsl*/`
                    #include <common>
                    varying vec3 vPosition;`)
                .replace('#include <envmap_vertex>', /*glsl*/`vPosition = position;`)
            shader.fragmentShader = shader.fragmentShader
                .replace('#include <common>', /*glsl*/`
                    #include <common>
                    varying vec3 vPosition;
                    uniform float loadUniform;`)
                .replace('#include <emissivemap_fragment>', /*glsl*/`
                #ifdef USE_EMISSIVEMAP

                    vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
                    totalEmissiveRadiance *= emissiveColor.rgb;
                    float factor = atan(vPosition.x, vPosition.y);
                    totalEmissiveRadiance *= (factor + PI) < loadUniform ? 1.0 : 0.0;

                #endif`);
        }

        const outerRing = this.el.object3D.getObjectByName('MediumShowRoom_Foundation_Placeable_0')! as THREE.Mesh<THREE.BufferGeometry, THREE.MeshPhongMaterial>;
        outerRing.material.emissive = new THREE.Color('blue');
        outerRing.material.emissiveIntensity = 1.0;
        outerRing.material.color = new THREE.Color(0x333333);

        const theatreSystem = this.el.sceneEl.getSystem(TheatreSystem)!;
        const sheet = theatreSystem.sheet;
        const reactorObj = sheet.object('Reactor', {
            // Note that the rotation is in radians
            // (full rotation: 2 * Math.PI)
            innerColor: types.rgba(),
            innerIntensity: types.number(0, { range: [0, 10.0] }),
            innerRotation: types.number(innerRing.rotation.z),
            innerAngle: types.number(0, { range: [0, Math.PI * 2]}),
            outerColor: types.rgba(),
            outerIntensity: types.number(0, { range: [0, 10.0] }),
            outerRotation: types.number(outerRing.rotation.z),
        });
        reactorObj.onValuesChange((values) => {
            innerRing.material.emissive.copy(values.innerColor);
            innerRing.material.emissiveIntensity = values.innerIntensity;
            innerRing.rotation.z = values.innerRotation
            loadUniform.value = values.innerAngle;
        
            outerRing.material.emissive.copy(values.outerColor);
            outerRing.material.emissiveIntensity = values.outerIntensity;
            outerRing.rotation.z = values.outerRotation
        }, theatreSystem.rafDriver);
    }
})