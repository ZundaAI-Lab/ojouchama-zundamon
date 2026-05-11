/**
 * 責務: チュートリアルで表示する分類・本文・表示条件を宣言データとして管理する。
 * 更新ルール: UI生成やセーブ読み取りは持たず、項目追加時はtopic/group/requiredStoryFlag/requiredUpgrade/requiredUpgradesだけで表示条件を表現する。
 */
import { INPUT_ACTIONS } from './inputActions.js';

export const TUTORIAL_TOPICS = [
  {
    id: 'player',
    label: '操作説明',
    title: '操作説明',
    subtitle: '基本の動きとステージ中の見方を確認できるの。',
  },
  {
    id: 'nano',
    label: 'なのちゃん解説',
    title: 'なのちゃん解説',
    subtitle: '仲間になったなのちゃんの操作と便利な機能なの。',
    requiredStoryFlag: 'nanoJoined',
  },
];

export const TUTORIAL_ENTRIES = [
  {
    id: 'player-move',
    topic: 'player',
    group: '基本操作',
    title: '移動',
    imageKey: 'hero_walk_2',
    bindings: [
      { label: '左', action: INPUT_ACTIONS.LEFT },
      { label: '右', action: INPUT_ACTIONS.RIGHT },
      { label: '上', action: INPUT_ACTIONS.UP },
      { label: '下', action: INPUT_ACTIONS.DOWN },
      { text: 'タッチ：移動パッド' },
    ],
    body: '左右入力で歩きます。空中でも少し向きを変えられるので、着地位置を整えながら進むの。',
    notes: [
      '上や下の入力は、まほうを撃つ方向や一部操作にも使います。',
    ],
  },
  {
    id: 'player-jump',
    topic: 'player',
    group: '基本操作',
    title: 'ジャンプ',
    imageKey: 'hero_jump',
    bindings: [
      { action: INPUT_ACTIONS.JUMP },
      { text: 'タッチ：「飛」ボタン' },
    ],
    body: 'ジャンプで足場を渡ります。空中では左右入力で着地位置を調整できるの。',
    notes: [
      '落下中に操作を入れると、狭い足場にも合わせやすくなります。',
    ],
  },
  {
    id: 'player-magic',
    topic: 'player',
    group: 'アクション',
    title: '豆の魔法',
    imageKey: 'hero_magic',
    bindings: [
      { action: INPUT_ACTIONS.MAGIC },
      { text: '方向入力 + 豆の魔法' },
      { text: 'タッチ：「魔法」ボタン' },
    ],
    body: '豆の魔法を撃ちます。方向入力を合わせると、その方向へ撃てるの。',
    notes: [
      '住民を助けたり、ボスやギミック、救出イベントに使います。',
      '方向を入れていない時は、向いている方向へ撃ちます。',
    ],
  },
  {
    id: 'player-bow',
    topic: 'player',
    group: 'アクション',
    title: 'おじぎ',
    imageKey: 'hero_bow',
    bindings: [
      { action: INPUT_ACTIONS.BOW },
      { text: 'タッチ：「礼」ボタン' },
    ],
    body: '近くの住民へ丁寧におじぎするの。相手を落ち着かせたり、道を開くきっかけになるの。',
    notes: [
      'おじぎ中はダメージを受けません。',
      '一部の扉やボス戦でも、おじぎが役立つことがあります。',
    ],
  },
  {
    id: 'player-tea',
    topic: 'player',
    group: 'アクション',
    title: 'お茶',
    imageKey: 'hero_tea',
    bindings: [
      { action: INPUT_ACTIONS.TEA },
      { text: 'タッチ：「茶」ボタン' },
    ],
    body: 'ティーカップを1つ使って体力を回復するの。少しの間、豆の魔法も強くなるの。',
    notes: [
      'お茶は地上でのみ使えます。',
      'ティーカップがない時は使用できません。',
    ],
  },
  {
    id: 'player-hud',
    topic: 'player',
    group: 'ステージ中の見方',
    title: '画面の見方',
    imageKey: 'icon_teacup',
    bindings: [
      { text: '左上：HP' },
      { text: '上部：豆コイン・ティーカップ・時間' },
    ],
    body: 'HP、豆コイン、ティーカップ、経過時間を確認できるの。アクションが使えない時は、表示や状況も確認するの。',
    notes: [
      'ずんだもちは回復、豆コインはおかいもの、ティーカップはお茶に使います。',
    ],
  },
  {
    id: 'player-pause',
    topic: 'player',
    group: 'ステージ中の見方',
    title: 'ポーズと設定',
    imageKey: 'portrait_proud',
    bindings: [
      { action: INPUT_ACTIONS.PAUSE },
      { text: 'Esc：ポーズ/戻る' },
    ],
    body: 'ステージ中はポーズメニューから、操作説明・オプション・ガーデンへの移動を選べるの。',
    notes: [
      'キーコンフィグやタッチ操作設定も、ステージ中オプションから変更できます。',
    ],
  },
  {
    id: 'nano-wait',
    topic: 'nano',
    group: '基本',
    title: 'その場で待機',
    imageKey: 'npc_teacup_fairy_float',
    bindings: [
      { action: INPUT_ACTIONS.NANO },
      { text: 'タッチ：なのボタン' },
    ],
    body: 'なのちゃんが頭上にいる時、方向を入れずになのちゃんボタンを押すと、その場で待機するの。',
    requiredStoryFlag: 'nanoJoined',
  },
  {
    id: 'nano-launch',
    topic: 'nano',
    group: '基本',
    title: '方向へ飛ばす',
    imageKey: 'npc_teacup_fairy_spin',
    bindings: [
      { text: '方向入力 + なのちゃん' },
      { action: INPUT_ACTIONS.NANO },
      { text: 'タッチ：なのボタンをフリック' },
    ],
    body: '方向入力と一緒になのちゃんボタンを押すと、なのちゃんがその方向へ飛ぶの。',
    requiredStoryFlag: 'nanoJoined',
  },
  {
    id: 'nano-return',
    topic: 'nano',
    group: '基本',
    title: '呼び戻し',
    imageKey: 'npc_teacup_fairy_happy',
    bindings: [
      { action: INPUT_ACTIONS.NANO },
      { text: 'タッチ：なのボタン' },
    ],
    body: '待機中や飛行中になのちゃんボタンを押すと、なのちゃんが頭上へ戻ってくるの。',
    requiredStoryFlag: 'nanoJoined',
  },
  {
    id: 'nano-collect',
    topic: 'nano',
    group: '応用',
    title: 'アイテム回収',
    imageKey: 'icon_coin',
    bindings: [
      { text: '飛行中・帰還中に接触' },
    ],
    body: 'なのちゃんは飛んでいる間や帰ってくる途中でも、豆コインやアイテムを拾えるの。',
    requiredStoryFlag: 'nanoJoined',
  },
  {
    id: 'nano-glide',
    topic: 'nano',
    group: '応用',
    title: '滑空補助',
    imageKey: 'npc_teacup_fairy_happy',
    bindings: [
      { action: INPUT_ACTIONS.JUMP },
      { text: '落下中にジャンプ長押し' },
    ],
    body: 'なのちゃんが頭上にいる時、落下中にジャンプを押し続けると、落ちる速さをゆるめてくれるの。',
    requiredStoryFlag: 'nanoJoined',
  },
  {
    id: 'nano-swap',
    topic: 'nano',
    group: '応用',
    title: '位置交換',
    imageKey: 'hero_magic',
    bindings: [
      { action: INPUT_ACTIONS.MAGIC },
      { text: 'なのちゃんに豆の魔法を当てる' },
    ],
    body: '待機中や飛行中のなのちゃんに豆の魔法を当てると、空間がある場所ならプレイヤーと位置を交換するの。',
    notes: [
      '交換先に入れる空間がない時は、交換しません。',
    ],
    requiredStoryFlag: 'nanoJoined',
  },
  {
    id: 'nano-auto-shot',
    topic: 'nano',
    group: '強化',
    title: 'なのちゃんの魔法援護',
    imageKey: 'npc_teacup_fairy_shine',
    bindings: [
      { text: 'まほうのリボン 入手後' },
    ],
    body: 'まほうのリボンを持っていると、なのちゃんが近くの相手へ時々まほうで援護してくれるの。',
    notes: [
      '住民やボスが近くにいる時だけ発動します。',
      '帰還中は復帰を優先します。',
    ],
    requiredStoryFlag: 'nanoJoined',
    requiredUpgrade: 'nanoMagicRibbon',
  },
  {
    id: 'nano-sugar',
    topic: 'nano',
    group: '強化',
    title: '援護まほう強化',
    imageKey: 'npc_teacup_fairy_shine',
    bindings: [
      { text: 'ずんだシュガー 入手後' },
    ],
    body: 'ずんだシュガーを持っていると、なのちゃんの援護まほうがさらに頼もしくなるの。',
    notes: [
      '魔法援護を入手してから確認できる強化です。',
    ],
    requiredStoryFlag: 'nanoJoined',
    requiredUpgrades: ['nanoMagicRibbon', 'nanoSugar'],
  },
  {
    id: 'nano-powder',
    topic: 'nano',
    group: '強化',
    title: '援護間隔短縮',
    imageKey: 'npc_teacup_fairy_worry',
    bindings: [
      { text: 'なのだパウダー 入手後' },
    ],
    body: 'なのだパウダーを持っていると、なのちゃんが援護できるまでの間隔が短くなるの。',
    notes: [
      '魔法援護を入手してから確認できる強化です。',
    ],
    requiredStoryFlag: 'nanoJoined',
    requiredUpgrades: ['nanoMagicRibbon', 'nanoPowder'],
  },
];
