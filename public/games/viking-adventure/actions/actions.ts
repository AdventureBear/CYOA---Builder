
import { Action, Alignment } from "@/app/types";
// import allActions from "@/app/lib/actions";


// lib/actions.ts

export const allActions: Record<string, Action> = {
//Opening scene actions
    children_dancing: {
        id: "children_dancing",
        trigger: "onEnter",
        outcomes: [
          {
            description: "The village children dance around a maypole and sing songs.",
            stateChanges: []
          }
        ]
      },
      gain_map_from_elder: {
        id: "gain_map_from_elder",
        trigger: "onExit",
        conditions: [
          { type: "hasItem", key: "silver", value: 2 }
        ],
        "outcomes": [
          {
            "description": "The elder offers you a map in exchange for 2 silver. Will you accept?",
            "stateChanges": [],                       // nothing yet
            "choices": [                               // ← optional extension
              {
                "text": "Accept the map (pay 2 silver)",
                "nextAction": "elder_map_accept",
                "alignment": Alignment.Ljosbearer
              },
              {
                "text": "Decline and keep your silver",
                "nextAction": "elder_map_decline",
                "alignment": Alignment.Myrkrider
              }
            ]
          }
        ]
      },
      "elder_map_accept": {
        id: "elder_map_accept",
        trigger: "onChoice",               // fire only when that choice is clicked
        outcomes: [
            {
                description: "The elder accepts your silver for an ancient map. Keep it safe! he snarls.",
                stateChanges: [
                    { type: "removeItem", key: "silver", amount: 2 },
                    { type: "addItem",    key: "map",    amount: 1 },
                    { type: "setFlag",    key: "gotMap" }
                ]
            }
        ]
    },
    "elder_map_decline": {
        id: "elder_map_decline",
        trigger: "onChoice",
        outcomes: [ 
            {
                description: "The elder declines your offer.",
                stateChanges: [
                    { type: "setFlag", key: "declinedMap" }
                ]
            }
        ]
    },
//   gain_map_from_elder: {
//     id: "gain_map_from_elder",
//     trigger: "onExit",
//     conditions: [
//       { type: "hasItem", key: "silver", value: 2, comparator: "gte" }
//     ],
//     outcomes: [
//       {
//         description: "The elder barters your silver for an ancient map.",
//         stateChanges: [
//           { type: "removeItem", key: "silver", amount: 2 },
//           { type: "addItem",    key: "map",    amount: 1 }
//         ]
//       },
//       {
//         description: "The elder smiles, but you lack the silver for his gift.",
//         stateChanges: []      // fallback if conditions fail
//       }
//     ]
//   },

  // --- example #1: 25 % chance of a storm -----------------
  storm_at_sea: {
    id: "storm_at_sea",
    trigger: "onEnter",
    conditions: [
      { type: "random", chance: 0.25 }
    ],
    outcomes: [
      {
        description: "Stormy seas batter your hull (test stub).",
        stateChanges: []   // nothing yet; we're just logging
      }
    ]
  },

  // --- example #2: always fires onExit ---------------------
  farewell_from_elder: {
    id: "farewell_from_elder",
    trigger: "onExit",
    outcomes: [
      {
        description: "The village elder wishes you luck.",
        stateChanges: []
      }
    ]
  },
  seer_vision: {
    id: "seer_vision",
    trigger: "onEnter",
    outcomes: [
      {
        description: 'The seer gives you a mysterious omen token.',
        stateChanges: [
            { type: "setFlag", key: "visitedSeer" },
            {type: "addItem", key: "Omen Token", amount: 1}
        ]
      }
    ]
  }
};


