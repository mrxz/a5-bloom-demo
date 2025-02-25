import { defineComponent, Object3DSetEvent } from "afive";
import * as THREE from "three";
import { replaceMaterial } from "../three-utils";
import { HandModelComponent } from "./hand-model.component";
import { HAND_JOINT_NAMES } from "../../../a5/modules/motion-controller/hand-joint-names";
import { TheatreSystem } from "../systems/theatre.system";

// Note: hard-coded box matching the keyboard
const keys = new THREE.Box3().setFromCenterAndSize(
    new THREE.Vector3(-0.95, 0.85, -1.15),
    new THREE.Vector3(0.5, 0.1, 0.2),
);
const JOINTS = ['wrist', 'thumb-tip', 'index-finger-tip', 'middle-finger-tip', 'ring-finger-tip', 'pinky-finger-tip']
    .map(x => HAND_JOINT_NAMES.findIndex(jointName => x === jointName));
const tempV3 = new THREE.Vector3();

export const ButtonsComponent = defineComponent('buttons', {
    schema: {
        leftHand: { type: 'selector', default: '#leftHand' },
        rightHand: { type: 'selector', default: '#rightHand' },
        buttonSfx: { type: 'selector', default: '#button-sfx' },
    },
    __fields: {} as {
        triggered: boolean;
        leftHandModel: InstanceType<typeof HandModelComponent>;
        rightHandModel: InstanceType<typeof HandModelComponent>;

        theatreSystem: InstanceType<typeof TheatreSystem>;
    },
    init: function() {
        this.triggered = false;
        this.leftHandModel = this.data.leftHand!.getComponent(HandModelComponent)!;
        this.rightHandModel = this.data.rightHand!.getComponent(HandModelComponent)!;
        this.theatreSystem = this.el.sceneEl.getSystem(TheatreSystem)!;
    },
    tick: function() {
        if(this.triggered) {
            return;
        }

        // Check if any finger tips or wrist
        for(const jointIndex of JOINTS) {
            const containsJoint = keys.containsPoint(this.leftHandModel.handJoints[jointIndex]!.getWorldPosition(tempV3))
                || keys.containsPoint(this.rightHandModel.handJoints[jointIndex]!.getWorldPosition(tempV3));
            if(containsJoint) {
                this.data.buttonSfx?.components['sound'].playSound();
                this.triggered = true;
                this.theatreSystem.start();
                break;
            }
        }
    }
})

