import { globalRegistry } from "afive";
import * as MotionControllerModule from "afive/modules/motion-controller";
import * as TroikaTextModule from "afive/modules/troika-text";
import { VrBloomComponent } from "./components/vr-bloom.component";
import { PhongMaterialComponent } from "./components/phong-material.component";
import { TheatreSystem } from "./systems/theatre.system";
import { AnimatablesComponent } from "./components/animatables.component";
import { HandModelComponent } from "./components/hand-model.component";
import { patchSkinningShaderChunks } from "./three-utils";
import { ButtonsComponent } from "./components/buttons.component";
import { ErrorTextComponent } from "./components/error-text.component";
import { PanCameraComponent } from "./components/pan-camera.component";
import { ToggleOverlaysSystem } from './systems/toggle-overlays.system';

patchSkinningShaderChunks();

globalRegistry
    .addModule(MotionControllerModule)
    .addModule(TroikaTextModule)
    .addSystem(TheatreSystem)
    .addSystem(ToggleOverlaysSystem)
    .addComponent(PanCameraComponent)
    .addComponent(HandModelComponent)
    .addComponent(AnimatablesComponent)
    .addComponent(VrBloomComponent)
    .addComponent(PhongMaterialComponent)
    .addComponent(ErrorTextComponent)
    .addComponent(ButtonsComponent);