// import { Scene } from "@/app/types";
// import { useGameStore } from "@/store/gameStore";

// function ensureTags(scene: Scene) {
//     if (!scene.tags) scene.tags = [];
//     return scene;
//   }

// export async function loadCapsules(enabledIds: string[]) {
//     for (const id of enabledIds) {
//       const { scenes, actions } = await import(
//         /* @vite-ignore */ `../encounters/${id}/scenes.json`
//       );
//       Object.values(scenes).forEach(ensureTags);
//       useGameStore.getState().mergeScenes(scenes);
//       useGameStore.getState().mergeActions(actions);
//     }
//   }