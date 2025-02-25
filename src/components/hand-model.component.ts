import { defineComponent } from "afive";
import { MotionControllerSystem } from "afive/modules/motion-controller";
import * as THREE from "three";
import type { InputSourceRecord } from "../../../a5/modules/motion-controller/motion-controller.system";
import { HAND_JOINT_NAMES } from "../../../a5/modules/motion-controller/hand-joint-names";
import { replaceMaterial } from "../three-utils";

const tempMat4 = new THREE.Matrix4();
const tempV3 = new THREE.Vector3();

export const HandModelComponent = defineComponent('hand-model', {
    schema: {
        hand: { type: 'string', oneOf: ['left', 'right'] },
        model: { type: 'model' },
    },
    after: ['system:motion-controller'],
    __fields: {} as {
        readonly motionControllerSystem: InstanceType<typeof MotionControllerSystem>,
        readonly inputSourceRecord: InputSourceRecord|null,
        readonly componentMeshes: Map<string, Array<{mesh: THREE.Mesh, originalColor: THREE.Color}>>,
        // Only relevant for hand tracking models
        handJoints: Array<THREE.Object3D|undefined>
        offsets: Array<THREE.Vector3>
    },
    init: function() {
        const model = (this.data.model as any).data.scene as THREE.Object3D;
        model.traverse(c => replaceMaterial(c as THREE.Object3D));

        // Compute bone offsets in rest pose
        this.handJoints = [];
        this.offsets = HAND_JOINT_NAMES.map(_ => new THREE.Vector3());
		HAND_JOINT_NAMES.forEach( jointName => {
		    const bone = model.getObjectByName(jointName)!;
            if(bone === undefined) {
				console.warn( `Couldn't find ${jointName} in ${this.data.hand} hand mesh` );
			}

			this.handJoints.push(bone as THREE.Object3D);

            // Measure offset to parent bone
            if(jointName !== 'wrist') {
                const parentBone = jointName.endsWith('proximal') ? this.handJoints[0]! : this.handJoints[this.handJoints.length - 2]!;
                bone.getWorldPosition(this.offsets[this.handJoints.length - 1]);
                parentBone.worldToLocal(this.offsets[this.handJoints.length - 1]);
            }
        });

        this.motionControllerSystem = this.el.sceneEl.getSystem(MotionControllerSystem)!;
        this.el.sceneEl.addEventListener('motion-controller-change', _event => {
            const inputSourceRecord = this.motionControllerSystem[this.data.hand]!;
            this.inputSourceRecord = inputSourceRecord;

            if(inputSourceRecord && inputSourceRecord.motionController) {
                this.el.setObject3D('mesh', model);

                const isHandModel = inputSourceRecord.motionController?.id === 'generic-hand';
                if(!isHandModel) {
                    // Return to rest pose;
                    for(let i = 0; i < 25; i++) {
                        const jointName = HAND_JOINT_NAMES[i];
                        const bone = this.handJoints[i]!;

                        if(jointName === 'wrist') {
                            bone.position.set(0, 0, 0);
                            bone.quaternion.identity();
                        } else {
                            const parent = jointName.endsWith('proximal') ? this.handJoints[0]! : this.handJoints[i - 1]!;
                            tempV3.copy(this.offsets[i]).applyQuaternion(parent.quaternion);
                            bone.position.copy(parent.position).add(tempV3);
                            bone.quaternion.identity();
                        }
                    }
                }
            } else {
                // Hide model
                if(this.el.getObject3D('mesh')) {
                    this.el.removeObject3D('mesh');
                }
            }
        });
    },
    tick: function() {
        if(this.inputSourceRecord?.jointState) {
            for(let i = 0; i < 25; i++) {
                const jointName = HAND_JOINT_NAMES[i];
                const bone = this.handJoints[i]!;

                tempMat4.fromArray(this.inputSourceRecord.jointState.poses, i*16);

                if(jointName === 'wrist') {
                    tempMat4.decompose(bone.position, bone.quaternion, tempV3);
                } else {
                    const parent = jointName.endsWith('proximal') ? this.handJoints[0]! : this.handJoints[i - 1]!;
                    tempV3.copy(this.offsets[i]).applyQuaternion(parent.quaternion);
                    bone.position.copy(parent.position).add(tempV3);
                    bone.quaternion.setFromRotationMatrix(tempMat4);
                }
            }
        }
    }
})