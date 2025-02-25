import { defineComponent } from "afive";
import { TroikaTextComponent } from "afive/modules/troika-text";
import { TheatreSystem } from "../systems/theatre.system";

export const ErrorTextComponent = defineComponent('error-text', {
    schema: {},
    __fields: {} as {
        textComponent: InstanceType<typeof TroikaTextComponent>;
        theatreSystem: InstanceType<typeof TheatreSystem>;

        mode: number;
        switched: boolean;
    },
    init: function() {
        this.textComponent = this.el.getComponent(TroikaTextComponent)!;
        this.theatreSystem = this.el.sceneEl.getSystem(TheatreSystem)!;
        this.mode = 0;
        this.switched = false;
    },
    tick: function(t, dt) {
        if(this.theatreSystem.sheet.sequence.position >= 13) {
            const mode = ~~(t / 500) % 2;
            this.el.object3D.visible = mode === 1;
    
            if(!this.switched) {
                this.el.setAttribute('troika-text', { value: 'SYSTEM MALFUNCTION', color: 0xFF0000 });
                this.el.object3D.position.y -= 0.13;
                this.el.object3D.position.x += 0.04;
                this.switched = true;
            }
        } else {
            const mode = ~~(t / 500) % 2;
            if(this.mode !== mode) {
                this.el.setAttribute('troika-text', 'value', mode === 0 ? 'SYSTEM> READY?' : 'SYSTEM> READY?_');
                this.mode = mode;
            }
        }
    }
})

