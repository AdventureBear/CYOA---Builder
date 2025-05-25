Below is a **play-test “build map”** that shows—working backward from
**“Troll leaves the bridge”**—every dependency the current data implies,
plus the gaps you still need to fill.
Think of each bullet as a ticket on your Kanban board or a bar on a
simple Gantt; items at the same indent level can be built in parallel.

---

### 0 . Victory condition – **Troll leaves**

* **Requires all three boons to be TRUE**

  1. *Song sung* (`flag : troll_serenaded`)
  2. *Feels appreciated* (`flag : troll_appreciated`)
  3. *Backpack removed* (`flag : backpack_removed`)

When the player returns to **`bridge`** *after* those flags are set, fire
an **onEnter** action that:

```jsonc
{
  "description": "The Troll smiles, drops his baggage and wanders off.",
  "stateChanges": [{ "type":"setFlag","key":"troll_left" }]
}
```

---

## 1 . Boon ➊ – **Song for the Troll**

| Step | Trigger/Scene                                                | Prereq flags/items                           | Result                   |
| ---- | ------------------------------------------------------------ | -------------------------------------------- | ------------------------ |
| 1.1  | *help birds* (`birds_nest`)                                  | none                                         | `flag: helped_bird`      |
| 1.2  | *Robin asks help* (`riverbank` action `robin_asks_for_help`) | `helped_hedgehog` **AND** NOT `robin_helped` | sets `robin_asked`       |
| 1.3  | *Find cousin’s note* (`oak_tree` → `find_message`)           | `robin_asked`                                | sets `found_message`     |
| 1.4  | *Meet robin at meadow at dusk* (`meet_robin_in_meadow`)      | `found_message` **and** time=`dusk`          | sets `met_robin_at_dusk` |
| 1.5  | **NEW:** action `forest_choir_rehearsal` (meadow)            | `met_robin_at_dusk`                          | sets `troll_serenaded`   |

*Missing pieces to build*:
`forest_choir_rehearsal` action that pushes a modal: *“Robins, finches,
and frogs rehearse a lullaby. The Troll across the river seems calmer.”*

---

## 2 . Boon ➋ – **Appreciation token**

| Step | Trigger/Scene                                                                               | Prereq                                       | Result                                             |
| ---- | ------------------------------------------------------------------------------------------- | -------------------------------------------- | -------------------------------------------------- |
| 2.1  | *Help hedgehog* (nut\_grove → `share_nuts` choice #2)                                       | none                                         | sets `helped_hedgehog` **OR** gives `shiny_pebble` |
| 2.2  | *Robin asks help* (already used above)                                                      | `helped_hedgehog`                            | sets `robin_asked`                                 |
| 2.3  | **NEW:** action `craft_token` (oak\_tree or meadow) – the birds paint the **shiny\_pebble** | needs `shiny_pebble` **AND** `found_message` | add `appreciation_token` item                      |
| 2.4  | **NEW:** action `give_token_to_troll` (bridge onChoice)                                     | `appreciation_token`                         | remove item, set `troll_appreciated`               |

---

## 3 . Boon ➌ – **Remove backpack of rocks**

| Step | Trigger/Scene                                                                | Prereq                                                                  | Result                                    |
| ---- | ---------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ----------------------------------------- |
| 3.1  | *Help Beaver build dam* (`give_stick`)                                       | must **first** `helped_bird` ➜ `find_stick` item ➜ `helped_beaver` flag |                                           |
| 3.2  | **NEW:** Beaver rewards with `backpack` item (on success of `helped_beaver`) | `helped_beaver`                                                         | add `backpack`                            |
| 3.3  | *Stash acorns* (`stash_acorns`)                                              | need `backpack`                                                         | sets `stashed_acorns`                     |
| 3.4  | **NEW:** action `swap_backpack_with_troll` (bridge choice)                   | `backpack` **AND** `stashed_acorns`                                     | remove `backpack`, set `backpack_removed` |

---

## 4 . Supporting puzzles / missing tasks

| Gap                                        | Suggested small action                                                             | Unlocks                                                       |
| ------------------------------------------ | ---------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| **Find rope / shoelace** for `try_fishing` | hide a `rope` in `birds_nest` after `helped_bird`                                  | lets player catch a fish -> optional gift for Beaver or Troll |
| **Make time advance to “dusk”**            | simple *“Rest in meadow”* choice sets `timeOfDay = dusk`                           | allows meeting Robin                                          |
| **Troll dialogue variants**                | show different modal text depending on each boon; final variant when all three set | feedback loop for player                                      |

---

## 5 . Minimal UI checklist (component roadmap)

1. **Task panel** – lists the three boons with ✔︎/○
2. **Modal queue** – already in place; reuse for choir rehearsal, gifting token, backpack swap.
3. **Time-of-day indicator** – small icon top-right; buttons to *Wait until evening*.

---

### Build order recommendation (Gantt-style)

| Week  | Deliverable                                                                                       | Depends on               |
| ----- | ------------------------------------------------------------------------------------------------- | ------------------------ |
| **1** | Implement `task` bucket + UI panel with three boons                                               | –                        |
| **1** | Finish existing missing TODO actions (`find_pebble`, `toss_a_pebble`, `try_fishing`) or stub them | –                        |
| **2** | Add *Beaver gives backpack* reward (`helped_beaver` outcome)                                      | existing workflow        |
| **2** | Build **backpack swap** action at bridge                                                          | backpack reward          |
| **3** | Add `craft_token` action + token gift path                                                        | hedgehog → shiny\_pebble |
| **3** | Add time-of-day mechanic + meadow meeting → choir rehearsal                                       | `found_message`          |
| **4** | Storm-of-testing: play through all paths, tweak RNG, polish text                                  | everything               |

When those bars are green, the Troll leaves on schedule and Wonderly
Woods is peaceful again. Happy building!
