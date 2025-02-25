import * as THREE from "three";

export function replaceMaterial(object3d: THREE.Object3D) {
    const mesh = (object3d as any) as THREE.Mesh;
    if(!mesh.isMesh) {
        return;
    }
    const meshStandardMaterial = mesh.material as THREE.MeshStandardMaterial;
    if(!meshStandardMaterial.isMeshStandardMaterial) {
        return;
    }

    mesh.material = new THREE.MeshPhongMaterial({
        color: meshStandardMaterial.color,
        map: meshStandardMaterial.map,
        emissive: meshStandardMaterial.emissive,
        emissiveMap: meshStandardMaterial.emissiveMap,
        emissiveIntensity: meshStandardMaterial.emissiveIntensity,
        side: meshStandardMaterial.side,
        transparent: meshStandardMaterial.transparent,
        forceSinglePass: true,
    });
};

export function patchSkinningShaderChunks() {
    // For this experience only one bone influence is needed for the skinned meshes (hands).
    // Since the scene is rendered twice for the bloom and twice for the eyes, that's 4x skinning.
    THREE.ShaderChunk.skinbase_vertex = /*glsl*/`
        #ifdef USE_SKINNING
       	    mat4 boneMatX = getBoneMatrix( skinIndex.x );
        #endif`;
    THREE.ShaderChunk.skinning_vertex = /*glsl*/`
        #ifdef USE_SKINNING
            vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
            vec4 skinned = boneMatX * skinVertex * skinWeight.x;
            transformed = ( bindMatrixInverse * skinned ).xyz;
        #endif`;
    THREE.ShaderChunk.skinnormal_vertex = /*glsl*/`
        #ifdef USE_SKINNING

            mat4 skinMatrix = skinWeight.x * boneMatX;
            skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;

            objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;

            #ifdef USE_TANGENT

                objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;

            #endif

        #endif`;
}