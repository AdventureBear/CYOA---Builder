const fs = require('fs');
const path = require('path');

// Adjust these paths as needed:
const scenesPath = path.join(__dirname, '..', 'data', 'games', 'cute-animals', 'scenes.json');
const actionsPath = path.join(__dirname, '..', 'data', 'games', 'cute-animals', 'actions.json');

const scenes = JSON.parse(fs.readFileSync(scenesPath, 'utf-8'));
const actions = JSON.parse(fs.readFileSync(actionsPath, 'utf-8'));

const allSceneIds = new Set(Object.keys(scenes));
const referencedSceneIds = new Set();

// 1. Scan scenes.json for nextNodeId
for (const [sceneId, scene] of Object.entries(scenes)) {
  if (Array.isArray(scene.choices)) {
    for (const choice of scene.choices) {
      if (choice.nextNodeId) {
        referencedSceneIds.add(choice.nextNodeId);
      }
    }
  }
}

// 2. Scan actions.json for nextScene in outcomes.choices
for (const [actionId, action] of Object.entries(actions)) {
  if (Array.isArray(action.outcomes)) {
    for (const outcome of action.outcomes) {
      if (Array.isArray(outcome.choices)) {
        for (const choice of outcome.choices) {
          if (choice.nextScene) {
            referencedSceneIds.add(choice.nextScene);
          }
        }
      }
    }
  }
}

// 3. Find missing scene references
const missing = [];
for (const refId of referencedSceneIds) {
  if (!allSceneIds.has(refId)) {
    missing.push(refId);
    console.log(`Missing scene referenced: "${refId}"`);
  }
}

if (missing.length === 0) {
  console.log('✅ All referenced scenes exist!');
} else {
  console.log(`❌ Missing scenes: ${missing.join(', ')}`);
  // Add templates for missing scenes
  for (const sceneId of missing) {
    scenes[sceneId] = {
      id: sceneId,
      location: "TODO: Add location name",
      description: "TODO: Add scene description.",
      actions: [],
      choices: [
        {
          text: "TODO: Add choice text.",
          nextNodeId: "TODO: Add next scene id."
        }
      ]
    };
    console.log(`Added template for missing scene: "${sceneId}"`);
  }
  // Write back to scenes.json
  fs.writeFileSync(scenesPath, JSON.stringify(scenes, null, 2), 'utf-8');
  console.log('📝 Appended missing scene templates to scenes.json');
}