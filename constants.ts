import { ScriptVariant, Trigger } from './types';

// Base retention probabilities for a 30-second video.
export const BASE_P_STAY: number[] = [
  0.95, 0.93, 0.88, 0.85, 0.83, 0.83, 0.80, 0.80, 0.82, 0.82, 
  0.78, 0.78, 0.78, 0.80, 0.80, 0.80, 0.80, 0.83, 0.83, 0.83,
  0.84, 0.84, 0.85, 0.85, 0.86, 0.86, 0.87, 0.88, 0.88, 0.89
];

export const RETENTION_WEAK_THRESHOLD = 0.80;

// Multipliers for different triggers.
export const TRIGGER_MULTIPLIERS: Record<Trigger, number> = {
  hook: 0.07,
  shock: 0.09,
  curiosity_question: 0.05,
  jump_cut: 0.04,
  music_cue: 0.03,
  text_overlay_bold: 0.02,
  poignant_pov: 0.06,
  loop_hint: 0.10,
  surprise_reveal: 0.08,
  context: 0.01,
  cta: 0.02,
  sound_effect: 0.035,
  pattern_interrupt: 0.065,
  quick_zoom: 0.025,
  point_of_view_shot: 0.055,
  satisfying_visual: 0.045,
  callback_joke: 0.05,
  foreshadowing: 0.03,
  visual_metaphor: 0.04,
};

export const MOCK_SCRIPTS: ScriptVariant[] = [
    {
      "variant_id": "v1",
      "duration_s": 20,
      "sources": [
        { "title": "Blender Community Forum - File Recovery Tips", "uri": "#" },
        { "title": "How to Find Hidden AppData Files in Windows", "uri": "#" }
      ],
      "loopability_analysis": {
        "score": 9,
        "analysis": "The final caption 'It's right where you started' directly prompts the viewer to re-watch from the beginning to find the 'secret', creating a perfect cognitive loop.",
        "transition_point_analysis": {
          "last_event_visual": "Character reacts with joy and relief as the full scene is restored on their monitor.",
          "first_event_visual": "Extreme close-up on a character's face, eyes wide with shock and panic.",
          "visual_match_score": 9,
          "last_event_audio": "A triumphant 'tada' sound effect combined with a cheering sound.",
          "first_event_audio": "A sudden, sharp impact sound effect.",
          "audio_match_score": 8,
          "suggestion_for_improvement": "The audio transition could be slightly smoother by having the cheer fade into a quick whoosh that leads into the impact sound, creating a less jarring cut."
        }
      },
      "timeline": [
        {"sec_start":0, "sec_end":1, "visual":"close_face_shock", "audio":"impact_sfx", "caption":"My Blender scene just deleted itself", "triggers":["hook","shock"], "suggested_triggers": ["poignant_pov"], "isWeak": false},
        {"sec_start":1, "sec_end":3, "visual":"screen_record_error_message", "audio":"glitch_loop", "caption":"Here's what happened...", "triggers":["context", "curiosity_question"], "suggested_triggers": [], "isWeak": false},
        {"sec_start":3, "sec_end":5, "visual":"fast_mouse_clicks", "audio":"fast_typing_sfx", "caption":"I tried everything to recover it", "triggers":[], "suggested_triggers": ["jump_cut", "text_overlay_bold", "music_cue", "sound_effect"], "isWeak": true},
        {"sec_start":5, "sec_end":8, "visual":"POV_looking_at_code", "audio":"thinking_music", "caption":"But the autosaves were all corrupted.", "triggers":["poignant_pov"], "suggested_triggers":["shock", "quick_zoom"], "isWeak": true},
        {"sec_start":8, "sec_end":11, "visual":"jump_cut_to_solution_in_UI", "audio":"aha_moment_sfx", "caption":"Then I found this ONE hidden file.", "triggers":["jump_cut", "surprise_reveal"], "suggested_triggers":["music_cue"], "isWeak": false},
        {"sec_start":11, "sec_end":14, "visual":"dragging_file_to_blender_icon", "audio":" hopeful_music_swell", "caption":"Could this actually work?", "triggers":[], "suggested_triggers":["curiosity_question", "pattern_interrupt"], "isWeak": true},
        {"sec_start":14, "sec_end":17, "visual":"blender_loading_screen", "audio":"suspense_drone", "caption":"The moment of truth...", "triggers":["music_cue"], "suggested_triggers":[], "isWeak": false},
        {"sec_start":17, "sec_end":20, "visual":"full_scene_restored_reaction", "audio":"tada_sfx_and_cheer", "caption":"Want to know the secret? It's right where you started.", "triggers":["cta","loop_hint"], "suggested_triggers": ["surprise_reveal"], "isWeak": false}
      ]
    },
    {
        "variant_id": "v2",
        "duration_s": 22,
        "loopability_analysis": {
            "score": 7,
            "analysis": "The final call to action to 'Follow for more gamedev tips' links thematically to the initial hook 'Stop making this mistake in Unity', encouraging users to re-evaluate the first statement.",
            "transition_point_analysis": {
              "last_event_visual": "A character points directly at the camera, which is positioned over a 'subscribe' button.",
              "first_event_visual": "A rapid zoom-in on the Unity game engine logo.",
              "visual_match_score": 6,
              "last_event_audio": "Upbeat tech music fades out.",
              "first_event_audio": "A sharp 'whoosh' sound effect.",
              "audio_match_score": 8,
              "suggestion_for_improvement": "The visual cut is abrupt. To improve, the final frame could zoom out from the subscribe button and quickly pan/blur transition into the zoom-in on the Unity logo, creating a continuous motion."
            }
        },
        "timeline": [
          {"sec_start":0, "sec_end":2, "visual":"quick_zoom_on_Unity_logo", "audio":"whoosh_sfx", "caption":"Stop making this mistake in Unity.", "triggers":["hook", "quick_zoom"], "suggested_triggers":["shock", "text_overlay_bold"], "isWeak": false},
          {"sec_start":2, "sec_end":5, "visual":"screen_record_of_messy_hierarchy", "audio":"disappointed_sound", "caption":"Does your project look like this?", "triggers":["context", "poignant_pov"], "suggested_triggers":["curiosity_question"], "isWeak": false},
          {"sec_start":5, "sec_end":8, "visual":"text_overlay_of_bad_code", "audio":"error_buzz", "caption":"And your code is probably even worse.", "triggers":["text_overlay_bold"], "suggested_triggers":["shock", "jump_cut"], "isWeak": true},
          {"sec_start":8, "sec_end":12, "visual":"jump_cut_to_clean_interface", "audio":"upbeat_tech_music", "caption":"Let me show you a 2-minute fix.", "triggers":["jump_cut", "curiosity_question"], "suggested_triggers":[], "isWeak": false},
          {"sec_start":12, "sec_end":16, "visual":"fast-paced_typing_and_UI_clicks", "audio":"typing_sfx_on_beat", "caption":"We'll use a simple ScriptableObject pattern.", "triggers":["music_cue"], "suggested_triggers":["sound_effect", "pattern_interrupt"], "isWeak": true},
          {"sec_start":16, "sec_end":19, "visual":"side-by-side_before_and_after", "audio":"magic_chime_sfx", "caption":"Look at the difference. Clean and scalable!", "triggers":["surprise_reveal"], "suggested_triggers":["jump_cut"], "isWeak": false},
          {"sec_start":19, "sec_end":22, "visual":"pointing_at_subscribe_button", "audio":"upbeat_tech_music_fadeout", "caption":"Follow for more gamedev tips that will save you time.", "triggers":["cta"], "suggested_triggers":[], "isWeak": false}
        ]
      }
  ];