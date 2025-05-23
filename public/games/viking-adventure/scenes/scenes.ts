// file: lib/scenes.ts

import { StoryPhase, Alignment, Choice, Scene } from '@/app/types';

export type { Choice, Scene };

export const allScenes: Record<string, Scene> = {
    village_gathering: {
        id: "village_gathering",
        imageUrl: '/scene-images/village_gathering-1747029157872.png',
        name: "The Village Gathering",
        text: "As the sun sets over your coastal Viking village, the community gathers for an important meeting. The air is thick with anticipation as your jarl announces plans for the coming season. You stand among your fellow villagers, knowing that your voice could shape the future of your people.",
        location: "Coastal Viking Village",
        season: "Late Spring, 793 AD",
        storyPhase: StoryPhase.PEACEFUL_BEGINNINGS,
        isRequired: true,
        actions: ["children_dancing", "gain_map_from_elder"],
        choices: [
            {
                text: "Advocate for a peaceful trading expedition",
                alignment: Alignment.Ljosbearer,
                nextScene: "prepare_trade_voyage"
            },
            {
                text: "Suggest a raid on a nearby settlement",
                alignment: Alignment.Myrkrider,
                nextScene: "plan_first_raid"
            },
            {
                text: "Propose building stronger defenses",
                alignment: Alignment.Solheart,
                nextScene: "fortify_village"
            },
            {
                text: "Recommend secret scouting of potential targets",
                alignment: Alignment.Skuggasmith,
                nextScene: "scouting_mission"
            }
        ]
    },
    prepare_trade_voyage: {
        id: "prepare_trade_voyage",
        imageUrl: '/scene-images/prepare_trade_voyage-1747029481412.png',
        name: "Preparing the Trade Voyage",
        text: "With the decision made to embark on a trading expedition, the village buzzes with activity. You find yourself at the docks, overseeing the preparation of a sturdy longship. Goods are being loaded, and the crew is assembling. As a respected voice in the community, you're asked to make some key decisions.",
        location: "Village Docks",
        season: "Early Summer, 793 AD",
        storyPhase: StoryPhase.PEACEFUL_BEGINNINGS,
        isRequired: false,
        actions: ["farewell_from_elder", "storm_at_sea"],
        choices: [
            {
                text: "Focus on gathering a diverse range of trade goods",
                alignment: Alignment.Ljosbearer,
                nextScene: "diverse_cargo"
            },
            {
                text: "Ensure the ship is well-armed, just in case",
                alignment: Alignment.Solheart,
                nextScene: "armed_traders"
            },
            {
                text: "Secretly include some warriors disguised as traders",
                alignment: Alignment.Skuggasmith,
                nextScene: "first_foreign_shore"
            }
        ]
    },
    diverse_cargo: {
        id: "diverse_cargo",
        imageUrl: '/scene-images/diverse_cargo-1747112104889.png',
    
        name: "A Diverse Cargo",
        text: "Your decision to focus on a wide range of trade goods pays off. The hold of your ship is filled with furs, amber, honey, and crafted items. As you set sail, the village elder praises your wisdom, noting that this variety will surely open doors in foreign lands. The crew's morale is high as you embark on this peaceful venture.",
        location: "Aboard the Longship",
        season: "Early Summer, 793 AD",
        storyPhase: StoryPhase.PEACEFUL_BEGINNINGS,
        isRequired: false,
        choices: [
            {
                text: "Set course for the rumored rich lands to the west",
                alignment: Alignment.Ljosbearer,
                nextScene: "first_foreign_shore"
            },
            {
                text: "Stop at a nearby Viking settlement to gather information",
                alignment: Alignment.Skuggasmith,
                nextScene: "viking_outpost"
            }
        ]
    },
    seer_prophecy: {
        id: "seer_prophecy",
        imageUrl: '/scene-images/seer_prophecy-1747029157872.png',
        name: "The Seer's Tent",
        text: "In a dimly lit tent at the edge of the village, the air smells of herbs and smoke. The ancient völva, eyes clouded with age and wisdom, beckons you forward. She reaches for your hand and begins to speak in a low voice filled with portent.",
        location: "The Seer’s Tent, Coastal Village",
        season: "Late Spring, 793 AD",
        storyPhase: StoryPhase.PEACEFUL_BEGINNINGS,
        isRequired: true,
        actions: ["seer_vision"],
        choices: [
          {
            text: "Interpret the vision as a call to protect the innocent.",
            alignment: Alignment.Ljosbearer,
            nextScene: "village_gathering"
          },
          {
            text: "Seek deeper secrets hidden within the vision.",
            alignment: Alignment.Skuggasmith,
            nextScene: "village_gathering"
          },
          {
            text: "See the vision as a challenge to prove your strength.",
            alignment: Alignment.Solheart,
            nextScene: "village_gathering"
          },
          {
            text: "Embrace the chaos and power the vision promises.",
            alignment: Alignment.Myrkrider,
            nextScene: "village_gathering"
          }
        ]
      },      
    viking_outpost: {
        id: "viking_outpost",
        imageUrl: '/scene-images/viking_outpost-1747112846105.png',
    
        name: "The Viking Outpost",
        text: "You arrive at a small Viking trading post. The settlers here have established good relations with the locals and share valuable information about the surrounding lands. They offer to join your expedition, bringing their knowledge and connections.",
        location: "Viking Trading Post",
        season: "Early Summer, 793 AD",
        storyPhase: StoryPhase.PEACEFUL_BEGINNINGS,
        isRequired: false,
        choices: [
            {
                text: "Welcome them aboard and share your cargo",
                alignment: Alignment.Ljosbearer,
                nextScene: "first_foreign_shore"
            },
            {
                text: "Accept their help but keep your distance",
                alignment: Alignment.Skuggasmith,
                nextScene: "first_foreign_shore"
            }
        ]
    },
    armed_traders: {
        id: "armed_traders",
        imageUrl: '/scene-images/armed_traders-1747029704682.png',
        name: "Armed Traders",
        text: "Your ship is well-prepared for any eventuality. The crew is trained in both trade and combat, and the ship's defenses are formidable. As you set sail, you feel confident in your ability to handle any situation that arises.",
        location: "Aboard the Longship",
        season: "Early Summer, 793 AD",
        storyPhase: StoryPhase.PEACEFUL_BEGINNINGS,
        isRequired: false,
        choices: [
            {
                text: "Assign extra guards to the cargo hold",
                alignment: Alignment.Solheart,
                nextScene: "first_foreign_shore"
            },
            {
                text: "Drill the crew on defensive maneuvers",
                alignment: Alignment.Myrkrider,
                nextScene: "first_foreign_shore"
            },
            {
                text: "Hide weapons among the trade goods",
                alignment: Alignment.Skuggasmith,
                nextScene: "first_foreign_shore"
            },
            {
                text: "Hold a council to discuss possible threats",
                alignment: Alignment.Ljosbearer,
                nextScene: "first_foreign_shore"
            }
        ]
    },
    plan_first_raid: {
        id: "plan_first_raid",
        name: "Planning the First Raid",
        text: "The village has chosen the path of the raider. As you gather with the warriors, the air is charged with anticipation. The target has been chosen, and now you must decide how to approach this first raid.",
        location: "Warrior's Hall",
        season: "Early Summer, 793 AD",
        storyPhase: StoryPhase.PEACEFUL_BEGINNINGS,
        isRequired: false,
        choices: [
            {
                text: "Launch a full-scale attack at dawn",
                alignment: Alignment.Myrkrider,
                nextScene: "first_foreign_shore"
            },
            {
                text: "Send scouts first to gather intelligence",
                alignment: Alignment.Skuggasmith,
                nextScene: "scouting_mission"
            },
            {
                text: "Prepare a show of force to demand tribute",
                alignment: Alignment.Solheart,
                nextScene: "first_foreign_shore"
            }
        ]
    },
    scouting_mission: {
        id: "scouting_mission",
        name: "The Scouting Mission",
        text: "Under cover of darkness, your scouts return with detailed information about the target settlement. They've mapped the defenses, identified valuable resources, and learned about the local customs. This knowledge could be used for either peaceful trade or strategic advantage.",
        location: "Enemy Territory",
        season: "Early Summer, 793 AD",
        storyPhase: StoryPhase.PEACEFUL_BEGINNINGS,
        isRequired: false,
        choices: [
            {
                text: "Use the information to plan a precise, targeted raid",
                alignment: Alignment.Myrkrider,
                nextScene: "first_foreign_shore"
            },
            {
                text: "Approach with knowledge of their customs for better trade",
                alignment: Alignment.Ljosbearer,
                nextScene: "first_foreign_shore"
            },
            {
                text: "Establish a hidden camp for future operations",
                alignment: Alignment.Skuggasmith,
                nextScene: "first_foreign_shore"
            }
        ]
    },
    first_foreign_shore: {
        id: "first_foreign_shore",
        imageUrl: '/scene-images/first_foreign_shore-1747030172104.png',
    
        name: "First Foreign Shore",
        text: "After days at sea, your ship approaches an unfamiliar coastline. The beach is lined with dense forests, and smoke rises from what appears to be a thriving settlement inland. As you drop anchor in a hidden cove, the crew looks to you for guidance on how to proceed in this new land.",
        location: "Unknown Foreign Coast",
        season: "Mid-Summer, 793 AD",
        storyPhase: StoryPhase.FIRST_VENTURES,
        isRequired: true,
        choices: [
            {
                text: "Approach openly, with gifts and intentions to trade",
                alignment: Alignment.Ljosbearer,
                nextScene: "peaceful_contact"
            },
            {
                text: "Send a small party to scout the settlement secretly",
                alignment: Alignment.Skuggasmith,
                nextScene: "covert_scouting"
            },
            {
                text: "Prepare the crew for a surprise raid",
                alignment: Alignment.Myrkrider,
                nextScene: "establish_colony"
            },
            {
                text: "Set up a defensive camp and wait for the locals to notice you",
                alignment: Alignment.Solheart,
                nextScene: "establish_colony"
            }
        ]
    },
    peaceful_contact: {
        id: "peaceful_contact",
        imageUrl: '/scene-images/peaceful_contact-1747111651483.png',
    
        name: "Peaceful First Contact",
        text: "Your open approach is met with cautious curiosity. The local leaders agree to meet with you, presenting an opportunity for negotiation and alliance-building. The initial meeting goes well, and they seem interested in establishing trade relations.",
        location: "Foreign Settlement",
        season: "Mid-Summer, 793 AD",
        storyPhase: StoryPhase.FIRST_VENTURES,
        isRequired: false,
        choices: [
            {
                text: "Propose a long-term trade agreement",
                alignment: Alignment.Ljosbearer,
                nextScene: "establish_colony"
            },
            {
                text: "Offer military protection in exchange for land",
                alignment: Alignment.Solheart,
                nextScene: "establish_colony"
            },
            {
                text: "Gather intelligence while appearing friendly",
                alignment: Alignment.Skuggasmith,
                nextScene: "establish_colony"
            }
        ]
    },
    covert_scouting: {
        id: "covert_scouting",
        imageUrl: '/scene-images/covert_scouting-1747030512816.png',
    
        name: "Covert Scouting",
        text: "Your scouts return with valuable information about the settlement's defenses, resources, and social structure. They've identified potential allies and enemies within the community, giving you multiple options for how to proceed.",
        location: "Foreign Settlement",
        season: "Mid-Summer, 793 AD",
        storyPhase: StoryPhase.FIRST_VENTURES,
        isRequired: false,
        choices: [
            {
                text: "Use the information to establish peaceful trade",
                alignment: Alignment.Ljosbearer,
                nextScene: "establish_colony"
            },
            {
                text: "Plan a strategic takeover of the settlement",
                alignment: Alignment.Myrkrider,
                nextScene: "establish_colony"
            },
            {
                text: "Manipulate internal conflicts to your advantage",
                alignment: Alignment.Skuggasmith,
                nextScene: "establish_colony"
            }
        ]
    },
    establish_colony: {
        id: "establish_colony",
        imageUrl: '/scene-images/establish_colony-1747112298049.png',
    
        name: "Establishing the Colony",
        text: "With a foothold in this new land, you begin the process of establishing a permanent Viking settlement. However, tensions rise as different factions within your group have conflicting visions for the colony's future.",
        location: "New Viking Settlement",
        season: "Spring, 794 AD",
        storyPhase: StoryPhase.EXPANSION,
        isRequired: true,
        choices: [
            {
                text: "Focus on building infrastructure and fostering good relations with neighbors",
                alignment: Alignment.Ljosbearer,
                nextScene: "colony_flourishes"
            },
            {
                text: "Fortify the settlement and train all colonists in combat",
                alignment: Alignment.Solheart,
                nextScene: "colony_flourishes"
            },
            {
                text: "Expand aggressively, raiding nearby settlements for resources",
                alignment: Alignment.Myrkrider,
                nextScene: "colony_flourishes"
            },
            {
                text: "Establish a network of spies and informants in neighboring settlements",
                alignment: Alignment.Skuggasmith,
                nextScene: "colony_flourishes"
            }
        ]
    },
    colony_flourishes: {
        id: "colony_flourishes",
        name: "A Flourishing Legacy",
        text: "Years have passed, and your decisions have shaped the colony's growth and reputation. As you reflect on your journey from a small village to this thriving settlement, you must make one final choice that will define your legacy.",
        location: "Thriving Viking Colony",
        season: "Autumn, 800 AD",
        storyPhase: StoryPhase.LEGACY,
        isRequired: true,
        choices: [
            {
                text: "Establish a great hall of learning and culture",
                alignment: Alignment.Ljosbearer,
                nextScene: "game_end"
            },
            {
                text: "Build a mighty fortress to protect your people for generations",
                alignment: Alignment.Solheart,
                nextScene: "game_end"
            },
            {
                text: "Launch a massive fleet to continue expansion and conquest",
                alignment: Alignment.Myrkrider,
                nextScene: "game_end"
            },
            {
                text: "Create a secret society to guide the colony's future from the shadows",
                alignment: Alignment.Skuggasmith,
                nextScene: "game_end"
            }
        ]
    },
    game_end: {
        id: "game_end",
        name: "The Saga Concludes",
        text: "Your choices have written a unique saga of Viking adventure and ambition. The impact of your decisions will echo through the ages, shaping the future of your people and the lands you've touched.",
        location: "The Annals of History",
        season: "The Passage of Time",
        storyPhase: StoryPhase.LEGACY,
        isRequired: true,
        choices: []
    },
    fortify_village: {
        id: "fortify_village",
        name: "Fortifying the Village",
        text: "The village has chosen to strengthen its defenses. As you oversee the construction of new palisades and watchtowers, you must decide how to balance security with the needs of daily life. The work is demanding, but the community is united in this effort.",
        location: "Village Perimeter",
        season: "Early Summer, 793 AD",
        storyPhase: StoryPhase.PEACEFUL_BEGINNINGS,
        isRequired: false,
        choices: [
            {
                text: "Focus on defensive structures and training",
                alignment: Alignment.Solheart,
                nextScene: "defense_training"
            },
            {
                text: "Build hidden escape routes and secret passages",
                alignment: Alignment.Skuggasmith,
                nextScene: "secret_defenses"
            },
            {
                text: "Create a system of early warning beacons",
                alignment: Alignment.Ljosbearer,
                nextScene: "warning_system"
            }
        ]
    },
    defense_training: {
        id: "defense_training",
        name: "Defense Training",
        text: "The new defensive structures are taking shape, and now it's time to train the villagers in their use. You organize drills and practice sessions, teaching everyone how to respond to potential threats.",
        location: "Village Training Grounds",
        season: "Mid-Summer, 793 AD",
        storyPhase: StoryPhase.PEACEFUL_BEGINNINGS,
        isRequired: false,
        choices: [
            {
                text: "Emphasize coordinated defense strategies",
                alignment: Alignment.Solheart,
                nextScene: "first_foreign_shore"
            },
            {
                text: "Train specialized units for different threats",
                alignment: Alignment.Myrkrider,
                nextScene: "first_foreign_shore"
            }
        ]
    },
    secret_defenses: {
        id: "secret_defenses",
        name: "Secret Defenses",
        text: "Your network of hidden passages and escape routes is nearly complete. These secret paths could save lives in an emergency, but they could also be used for more... strategic purposes.",
        location: "Village Underground",
        season: "Mid-Summer, 793 AD",
        storyPhase: StoryPhase.PEACEFUL_BEGINNINGS,
        isRequired: false,
        choices: [
            {
                text: "Share the knowledge with trusted villagers",
                alignment: Alignment.Skuggasmith,
                nextScene: "first_foreign_shore"
            },
            {
                text: "Keep the passages secret for future use",
                alignment: Alignment.Myrkrider,
                nextScene: "first_foreign_shore"
            }
        ]
    },
    warning_system: {
        id: "warning_system",
        name: "Warning System",
        text: "The beacon system is ready, with signal fires prepared at key points around the village. This early warning system will help protect not just your village, but also nearby settlements.",
        location: "Village Watchtowers",
        season: "Mid-Summer, 793 AD",
        storyPhase: StoryPhase.PEACEFUL_BEGINNINGS,
        isRequired: false,
        choices: [
            {
                text: "Extend the warning system to neighboring villages",
                alignment: Alignment.Ljosbearer,
                nextScene: "first_foreign_shore"
            },
            {
                text: "Keep the system exclusive to your village",
                alignment: Alignment.Solheart,
                nextScene: "first_foreign_shore"
            }
        ]
    }
};

export const initialSceneId = "village_gathering";