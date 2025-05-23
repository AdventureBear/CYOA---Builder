This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Creating a New Adventure (CYOA Skeleton)

To create a new adventure, you only need to provide two data files:

- `data/scenes.ts` (or `data/scenes.json`)
- `data/actions.ts` (or `data/actions.json`)

### Scenes Format
Each scene is an object with the following structure:

```ts
{
  id: string, // unique scene ID
  name: string, // scene title
  text: string, // scene description
  location: string, // location name
  season: string, // time/season
  storyPhase: string, // e.g. 'ACT_I', 'ACT_II', etc.
  isRequired: boolean, // is this scene required for main story?
  imageUrl?: string, // optional image
  actions?: string[], // optional action IDs to trigger
  choices: [
    {
      text: string, // choice text
      nextScene: string, // ID of next scene
      alignment?: string // optional alignment or tag
    },
    // ...
  ]
}
```

### Actions Format
Each action is an object with the following structure:

```ts
{
  id: string, // unique action ID
  trigger: 'onEnter' | 'onExit' | 'onChoice',
  conditions?: [ /* array of condition objects */ ],
  outcomes: [
    {
      description: string,
      stateChanges?: [ /* array of state change objects */ ],
      choices?: [
        { text: string, nextAction: string, alignment?: string }
      ]
    }
  ]
}
```

### Scenes vs. Actions: Key Differences

#### Scenes
- **Definition:** A scene represents a location or moment in the story. It contains narrative text, a list of actions that occur when the player enters or interacts, and a set of choices that let the player move to other scenes.
- **Purpose:** To set the context, describe what's happening, and present the player with choices for where to go next.
- **Example:**
  ```json
  {
    "id": "oak_tree",
    "location": "Under the Oak Tree",
    "text": "Hazel finds a baby bird on the ground, chirping for help.",
    "actions": ["help_bird"],
    "choices": [
      { "text": "Return to the clearing", "nextNodeId": "intro" }
    ]
  }
  ```

#### Actions
- **Definition:** Actions are events or interactions that happen within a scene. They can have outcomes, state changes, and may chain to other actions, but do not move the player to a new scene.
- **Purpose:** To handle logic, consequences, and branching events that occur as part of the scene's narrative.
- **Example:**
  ```json
  {
    "id": "help_bird",
    "trigger": "onEnter",
    "outcomes": [
      {
        "description": "You help the baby bird back to its nest.",
        "stateChanges": [{ "type": "setFlag", "key": "helped_bird" }]
      }
    ]
  }
  ```

#### Quick Reference Table

| Aspect         | Scene                                      | Action                                 |
|---------------|--------------------------------------------|----------------------------------------|
| What is it?    | Location/moment in the story               | Event or interaction within a scene    |
| Contains       | Narrative, actions, choices                | Outcomes, state changes, logic         |
| Moves player?  | Yes (via choices to other scenes)          | No (may chain to other actions)        |
| Example        | "Forest Clearing", "Oak Tree"              | "help_bird", "share_nuts"              |

### How to Use
1. Copy the repo.
2. Replace the contents of `data/scenes.ts` and `data/actions.ts` with your own adventure data, following the above format.
3. Set your initial scene ID and story phase in the game state config.
4. Run the app—your new adventure is ready!

See the `data/` directory for example files.
