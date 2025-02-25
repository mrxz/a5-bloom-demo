import { defineSystem } from "afive";
import * as THREE from "three";
import { getProject, createRafDriver, type IRafDriver, type IProject, type ISheet } from '@theatre/core';
//import studio from '@theatre/studio'
//studio.initialize();

export const TheatreSystem = defineSystem('theatre', {
    schema: {
        src: { type: 'asset' },
        audioTrack: { type: 'audio' },
    },
    __fields: {} as {
        rafDriver: IRafDriver;
        project: IProject;
        sheet: ISheet;
    },
    init: async function() {
        // Wait for animation JSON to load as system initialize concurrently with assets
        await this.data.src.awaitLoad();

        this.rafDriver = createRafDriver({ name: 'a custom raf driver' });
        this.project = getProject('Bloom Demo', { state: this.data.src.data }); // FIXME: Typing
        this.sheet = this.project.sheet('Reactor');

        await this.sheet.sequence.attachAudio({ source: 'assets/67325__nodelete__engine-4.wav', audioContext: THREE.AudioContext.getContext() });
    },
    start: function() {
        this.sheet.sequence.play({ rafDriver: this.rafDriver });
    },
    tick: function(t, dt) {
        this.rafDriver.tick(performance.now());
    }
})