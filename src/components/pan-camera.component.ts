import { defineComponent, ExitVREvent } from 'afive';
import * as THREE from 'three';

const tempV3 = new THREE.Vector3();
const tempMat4 = new THREE.Matrix4();
const UP = (THREE.Object3D as any).DEFAULT_UP as THREE.Vector3; // FIXME: Outdated types

const SHOTS = [
    {
        start: new THREE.Vector3(-0.1, 1.6, 0.5),
        offset: new THREE.Vector3(-0.1, -0.25, -0.6),
        direction: new THREE.Vector3(0.05, 0.0, 0.0),
        fov: 60,
        duration: 30.0
    },
    {
        start: new THREE.Vector3(0.0, 1.4, -0.5),
        offset: new THREE.Vector3(0.0, -0.15, -1.0),
        fixedPoint: new THREE.Vector3(0.0, 1.2, -1.5),
        direction: new THREE.Vector3(0.0, 0.03, 0.075),
        fov: 90,
        duration: 22.0
    },
    {
        start: new THREE.Vector3(0.5, 1.2, -0.3),
        offset: new THREE.Vector3(-0.9, 0.15, -1.2),
        direction: new THREE.Vector3(0.0, 0.02, 0.0),
        fov: 60,
        duration: 20.0
    },
]

export const PanCameraComponent = defineComponent('pan-camera', {
    schema: {
        enabled: {default: true},
    },
    __fields: {} as {
        readonly shotTime: number;
        readonly currentShot: number;
    },
    init: function() {
        if (!this.data.enabled) {
            return;
        }

        this.el.removeAttribute('look-controls');
        this.el.removeAttribute('wasd-controls');
        this.el.setAttribute('camera', 'fov', SHOTS[0].fov);
        this.shotTime = 0.0;
        this.currentShot = 0;

        this.el.sceneEl!.addEventListener(ExitVREvent, _ => {
            // Reset to second shot to show user their creation.
            this.shotTime = 0.0;
            this.currentShot = 1;
            // FIXME: fov changes in VR, preventing change detection when setting it to the value
            //        it was last set. As a workaround first set it to a bogus value.
            this.el.setAttribute('camera', 'fov', 10);
            this.el.setAttribute('camera', 'fov', SHOTS[this.currentShot].fov);
        });
    },
    tick: function(_t, dt) {
        if((this.el.sceneEl as any).isXRMode || !this.data.enabled) { return; } // FIXME: A5 typing

        this.shotTime += dt/1000.0;
        // Advance if needed
        if(this.shotTime > SHOTS[this.currentShot].duration) {
            this.shotTime -= SHOTS[this.currentShot].duration;
            this.currentShot = (this.currentShot + 1) % SHOTS.length;
            this.el.setAttribute('camera', 'fov', SHOTS[this.currentShot].fov);
        }

        const shot = SHOTS[this.currentShot];
        tempV3.set(0, 0, 0).addScaledVector(shot.direction, this.shotTime);
        this.el.object3D.position.addVectors(shot.start, tempV3);
        if(!shot.fixedPoint) {
            tempV3.addVectors(this.el.object3D.position, shot.offset);
        } else {
            tempV3.copy(shot.fixedPoint);
        }

        tempMat4.lookAt(this.el.object3D.position, tempV3, UP);
        this.el.object3D.quaternion.setFromRotationMatrix(tempMat4);

    }
});
