export enum Alignment {
    Ljosbearer = "Ljosbearer",
    Skuggasmith = "Skuggasmith",
    Solheart = "Solheart",
    Myrkrider = "Myrkrider",

}

export enum StoryPhase {
    PEACEFUL_BEGINNINGS = "PEACEFUL_BEGINNINGS",
    FIRST_VENTURES = "FIRST_VENTURES",
    EXPANSION = "EXPANSION",
    CONFLICT = "CONFLICT",
    SETTLEMENT = "SETTLEMENT",
    LEGACY = "LEGACY"
}

export interface Choice {
    text: string;
    alignment: Alignment;
    nextScene?: string;
    nextAction?: string;
}

export interface Scene {
    id: string;
    name: string;
    description: string;
    location: string;
    season: string;
    storyPhase: StoryPhase;
    isRequired: boolean;
    isDynamicallyGenerated?: boolean;
    imageUrl?: string;
    choices: Choice[];
    actions?: string[];
    parentSceneId?: string;
}

export interface NPC {
    name: string
    relationship: number
}

export interface GameState {
    currentSceneId: string;
    completedScenes: string[];
    inventory: Record<string, number>;
    flags: Record<string, boolean>;
    reputation: Record<string, number>;
    health: number;
    npcs: Record<string, NPC>;
    timeOfDay: 'morning' | 'afternoon' | 'dusk' | 'night';
    breadcrumbs: string[];
}

export interface Choice {
    text: string;
    nextNodeId?: string;
    nextAction?: string;
  }

export interface NpcRelationship {
    npcId: string;
    name: string;
    affinity: number;
    alignment: Alignment;
}

export interface PlayerCharacter {
    name: string;
    dominantAlignment: Alignment;
    relationships: NpcRelationship[];
}

export interface ProgressTrackerProps {
    currentPhase: StoryPhase;
    phaseProgress: number;
    totalPhases: number;
    dominantAlignment: Alignment;
    keyDecisions: string[];
}

export interface SceneGraphNode {
    id: string;
    name: string;
    children: SceneGraphNode[];
}

export interface SceneCreatorProps {
    onSceneCreated: (newScene: Scene) => void;
}

export interface NpcRelationshipTrackerProps {
    relationships: NpcRelationship[];
}

export interface AlignmentTrackerComponentProps {
    alignmentScores: Record<Alignment, number>;
}

export interface StoryProgressTrackerComponentProps {
    completedScenes: string[];
    currentPhase: StoryPhase;
}

export interface SceneComponentProps {
    scene: Scene;
    onChoiceMade: (choice: Choice) => void;
}


// Game State Management with Actions and Conditions
export type Trigger =
  | "onEnter"   // fires when a scene is loaded
  | "onExit"    // fires just before leaving a scene
  | "onChoice" // fires when a choice is made
  | "onItem" // fires when an item is added to the inventory
  | "onFlag" // fires when a flag is set
  | "onRep" // fires when reputation is changed
  | "onHealth" // fires when health is changed
  | "onAlignment" // fires when alignment is changed
  | "onRandom"; // fires immediately after clicking a choice

  export interface StateChange {
    type: "addItem" | "removeItem" | "setFlag";
    key: string;          // item or flag name
    amount?: number;      // default = 1 for add/remove
  }

export interface Outcome {
    description?: string;         // flavour text to display
    stateChanges: StateChange[];
    nextSceneOverride?: string;   // optional detour
    choices?: Choice[];
  }
  
  export interface Action {
    id: string;
    trigger: Trigger;
    conditions?: Condition[];     // all must pass (AND)
    outcomes: Outcome[];          // choose first that matches its own conds, or weight/prob
    failMessage?: string;         // optional message to show if conditions fail
}

  type ConditionValue = string | number | boolean | Alignment;


  export interface Condition {
    type: "hasItem" | "flagSet" | "flagNotSet" | "random" | "reputation" | "doesNotHaveItem";
    key?:   string;        // item name, flag id, etc.
    value?: ConditionValue;           // expected value (true, 3+, etc.)
    chance?: number;       // 0–1 for random rolls
    comparator?: "gte" | "eq" | "lte" | "neq";
  }



  
  export interface StateChange {
    type: "addItem" | "removeItem" | "setFlag" 
    key: string;
    amount?: number | undefined;
  }