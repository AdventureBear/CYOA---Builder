### “Wonderly Woods Weekly” – a season of bite-sized episodes

Below are **8 self-contained story arcs** you can drop into your existing engine.
Each one:

* fits in 5-10 scenes (Calvin-and-Hobbes length)
* ends with **1-3 boons** that roll forward into later episodes (optional)
* re-uses core locations but introduces 1-2 new ones to keep art-budget small

Use them in any order—or release one every Friday as a comic-strip-quest.

| #     | Episode title & hook                                                                                                                                                              | New locations                    | Key NPCs                        | Fresh mechanics (tiny)                                                                         | Final boons                                                    |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- | ------------------------------- | ---------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| **1** | **“The Lost Lantern”**  A firefly lamplighter has dropped his magic lantern, plunging the nighttime woods into gloom. Hazel must find & re-light it before night predators prowl. | Firefly Glade (night palette)    | Firefly Lamplighter, Sleepy Owl | • **Light meter** (flag `lantern_lit`) gates night scenes<br>• Simple time loop (dusk → night) | `lantern_restored` flag (lets night events later)              |
| **2** | **“Dam Danger”**  Spring flood threatens Beaver’s new dam; sabotage suspected!                                                                                                    | Rapids Outlook                   | Otter twins (pranksters)        | • Water-level counter (3→0) as timer<br>• Choice-based repair minigame                         | `beaver_dam_secure` (Beaver rep +2)                            |
| **3** | **“Acorn Heist”**  Squirrel stash goes missing; tracks lead to the Old Hollow.                                                                                                    | Old Hollow (inside tree)         | Masked Raccoon, Baby Bats       | • Simple stealth mechanic: flag `noise` rises if wrong actions                                 | `acorns_recovered`, `raccoon_friend` (trades rare items later) |
| **4** | **“The Seer’s Riddle”**  Hedgehog Seer offers a prophecy if Hazel solves three mini-puzzles hidden around the meadow.                                                             | Puzzle Stones (meadow sub-scene) | Hedgehog Seer                   | • Riddle tokens (task set/complete)<br>• Modal multiple-choice riddles                         | `prophecy_known` (reveals shortcuts in later quests)           |
| **5** | **“Spider Silk Symphony”**  Choir needs spider-silk strings for a festival lyre.                                                                                                  | Silk Grotto (cave)               | Maestro Cricket, Gentle Spider  | • Crafting: gather dew + silk = lyre string item                                               | `lyre_strings` item (upgrades future songs: storm\_calm +10 %) |
| **6** | **“Moonlight Market”**  One-night pop-up bazaar run by fox merchants—barter system introduced.                                                                                    | Moonlight Clearing (night)       | Fox Trader, Mole Banker         | • **Barter UI** using `shiny_pebble`, `fish`, etc.<br>• Limited-time flag `market_open`        | `mole_bank_account` (carry coins), rare charm items            |
| **7** | **“Icevine Crisis”**  Winter episode. Thorny icevine spreads, freezing paths.                                                                                                     | Frozen Brook, Icevine Patch      | Weasel Herbalist                | • Environmental hazard flag `icevine_cleared` needed to reopen routes                          | `winter_route_open`, `herbalist_friend`                        |
| **8** | **“Festival of Twinkles”**  Season finale. Combine boons—lantern, lyre strings, prophecy—to host a grand forest festival … and tease next season’s villain!                       | Festival Grounds                 | Nearly every NPC                | • Checks for 3-4 prior boons; missing ones trigger side-quests                                 | `festival_success` flag, teaser cliff-hanger                   |

---

### How to drop an episode into the engine

1. **Create the new scenes** (2-4 hubs + sub-scenes).
2. **Add tasks & boons** to `phaseTasks` for that episode’s “phase”.
3. **Write actions** following the patterns you’ve built:

   * `onEnter` to discover problem
   * choices / follow-up `onChoice` actions to solve sub-puzzles
   * final `onExit` or modal action that sets the boon flag(s).
4. **Block access** to later episodes with a simple condition:

   ```json
   { "type":"flagSet", "key":"festival_success" }
   ```

   …unlocks next-season content only when Episode 8 ends.
5. **Art & sound** – reuse day/night palettes and UI; only 1-2 new
   backgrounds per episode keeps scope sane.

---

### Mini-roadmap (building order)

| Sprint     | Focus                            | Output                              |
| ---------- | -------------------------------- | ----------------------------------- |
| **Week 1** | Episode 1 core loop (lantern)    | New flag, two scenes, one modal     |
| **Week 2** | Task UI polish + Episode 2 timer | Water-level counter component       |
| **Week 3** | Barter panel (Moonlight Market)  | Generic barter modal reusable later |
| **Week 4** | Finale scaffolding               | Festival scene + unlock checks      |

Release one episode each week, gather feedback, tighten puzzles—the rhythm of a webcomic but interactive. Have fun in Wonderly Woods!
