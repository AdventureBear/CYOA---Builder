const fs = require('fs');
const path = require('path');

// Adjust these paths as needed:
const scenesPath = path.join(__dirname, '..', 'data', 'games', 'cute-animals', 'scenes.json');
const actionsPath = path.join(__dirname, '..', 'data', 'games', 'cute-animals', 'actions.json');

const scenes = JSON.parse(fs.readFileSync(scenesPath, 'utf-8'));
const actions = JSON.parse(fs.readFileSync(actionsPath, 'utf-8'));

const allActionIds = new Set(Object.keys(actions));
const missing = new Set();

for (const [sceneId, scene] of Object.entries(scenes)) {
  if (Array.isArray(scene.actions)) {
    for (const actionId of scene.actions) {
      if (!allActionIds.has(actionId)) {
        missing.add(actionId);
        console.log(`Scene "${sceneId}" references missing action: "${actionId}"`);
      }
    }
  }
}

if (missing.size === 0) {
  console.log('✅ All actions referenced in scenes exist!');
} else {
  console.log(`❌ Missing actions: ${Array.from(missing).join(', ')}`);
  // Add templates for missing actions
  for (const actionId of missing) {
    actions[actionId] = {
      id: actionId,
      trigger: "onChoice", // or "onEnter"/"onExit" as appropriate
      conditions: [
        {
          type: "TODO: Add condition type.",
          key: "TODO: Add condition key."
        }
      ],
      outcomes: [
        {
          description: "TODO: Add outcome description.",
          stateChanges: [{
            type: "TODO: Add state change type.",
            key: "TODO: Add state change key."
          }],
          choices: [
            {
              text: "TODO: Add choice text.",
              nextAction: "TODO: Add next action.",
              resultMessage: "TODO: Add result message.",
              resultButtonText: "TODO: Add result button text."
            },
            {
            text: "TODO: Add choice text.",
            nextScene: "TODO: Add jump to scene.",
            resultMessage: "TODO: Add result message.",
            resultButtonText: "TODO: Add result button text."
          }
          ],
         
        }
      ]
    };
    console.log(`Added template for missing action: "${actionId}"`);
  }
  // Write back to actions.json
  fs.writeFileSync(actionsPath, JSON.stringify(actions, null, 2), 'utf-8');
  console.log('📝 Appended missing action templates to actions.json');
}