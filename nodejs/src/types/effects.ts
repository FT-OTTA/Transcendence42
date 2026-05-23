
export type EffectType = 
| "ad_mod" // 1 target
| "def_mod" // 1 target
| "addef_mod" // 1 target
| "draw" 
| "dmg" 
| "armor" 
| "runes" 
| "swap" 
| "destroy"
| "freeze";

export type EffectTime = 
| "immediate"
| "end_of_turn";

export type EffectTarget = 
| "self_hero"
| "opponent_hero"
| "self"
| "opponent"
| "random"
| "left_neighbor"
| "right_neighbor"
| "all_allies"
| "all_board"
| "all_enemies";

export type TargetType = 
| "creature"
| "building"
| "hero"
| "zone";

export type Effect = {
    effect: EffectType;
    value: number;
    valueFrom?: string;
    target: EffectTarget;
    targetType?: TargetType;
}

