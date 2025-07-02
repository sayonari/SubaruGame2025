export interface Character {
  id: string;
  name: string;
  description: string;
  unlockCondition?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  speed: number;
  jump: number;
  special?: string;
}

export const CHARACTERS: Character[] = [
  {
    id: 'subaru',
    name: 'スバルちゃん',
    description: '基本キャラクター',
    rarity: 'common',
    speed: 1,
    jump: 1
  },
  {
    id: 'shuba_duck',
    name: 'しゅばダック',
    description: '完全にアヒルモード',
    rarity: 'rare',
    speed: 1.1,
    jump: 0.9,
    special: 'アイテム取得範囲UP'
  },
  {
    id: 'omae',
    name: 'OMAE',
    description: 'スバルちゃんの相棒',
    rarity: 'rare',
    speed: 0.9,
    jump: 1.2,
    special: 'ダブルジャンプ'
  },
  {
    id: 'summer_subaru',
    name: '水着スバル',
    description: '夏の特別衣装',
    rarity: 'epic',
    speed: 1.2,
    jump: 1.1,
    special: '水しぶきエフェクト'
  },
  {
    id: 'idol_subaru',
    name: 'アイドルスバル',
    description: 'キラキラ衣装',
    rarity: 'epic',
    speed: 1.1,
    jump: 1.1,
    special: 'コンボボーナス+20%'
  },
  {
    id: 'golden_subaru',
    name: 'ゴールデンスバル',
    description: '5000m達成で出現する伝説のスバル',
    unlockCondition: '5000m達成',
    rarity: 'legendary',
    speed: 1.5,
    jump: 1.3,
    special: 'コイン2倍'
  },
  {
    id: 'shadow_subaru',
    name: 'シャドウスバル',
    description: '謎の黒いスバル',
    unlockCondition: '10000m達成',
    rarity: 'legendary',
    speed: 2.0,
    jump: 1.0,
    special: '無敵時間延長'
  }
];

export interface Item {
  id: string;
  name: string;
  description: string;
  effect: string;
  rarity: 'common' | 'rare' | 'epic';
  sprite?: string;
}

export const SPECIAL_ITEMS: Item[] = [
  {
    id: 'super_star',
    name: 'スーパースター',
    description: '無敵になる',
    effect: 'invincible',
    rarity: 'rare'
  },
  {
    id: 'rocket',
    name: 'ロケット',
    description: '超加速！',
    effect: 'super_speed',
    rarity: 'epic'
  },
  {
    id: 'magnet',
    name: 'マグネット',
    description: 'アイテムを引き寄せる',
    effect: 'item_magnet',
    rarity: 'rare'
  },
  {
    id: 'shield',
    name: 'シールド',
    description: '1回だけダメージを防ぐ',
    effect: 'shield',
    rarity: 'common'
  },
  {
    id: 'coin_bag',
    name: 'コイン袋',
    description: 'コイン100枚ゲット！',
    effect: 'coins_100',
    rarity: 'rare'
  }
];