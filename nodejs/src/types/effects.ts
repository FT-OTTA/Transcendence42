
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
| "freeze"
| "win";

export type EffectTime =
| "immediate"
| "end_of_turn";

export type EffectTarget =
| "self_hero"
| "opponent_hero"
| "self"
| "opponent"
| "all"
| "random_enemies"
| "random_allies"
| "random_all"
| "left_neighbor"
| "right_neighbor"
| "all_allies"
| "all_board"
| "all_enemies";

export type TargetType = {
    creature?: boolean;
    building?: boolean;
    hero?: boolean;
}
export type EffectTrigger = "on_deal_damage"

export type Effect = {
    effect: EffectType;
    value?: number;
    valueFrom?: string;
    trigger?: EffectTrigger;
    target?: EffectTarget;
    targetType?: TargetType;
}

