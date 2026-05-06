/**
 * 責務: ステージエディタの配置パレット、表示名、初期配置値、入力フィールド定義を提供する。
 * 更新ルール: Runtimeの生成処理は参照せず、配置可能データのUIメタ情報だけをここへ追加する。
 * 更新ルール: 種類別フィールドは、現行Runtimeが参照するプロパティだけを定義し、未実装の新規パラメータは追加しない。
 * 更新ルール: page/wishLeaf/ribbonBridgeのactiveDurationはPlatformGimmickSystemが参照し、0秒を無制限として扱う。
 */
import { PLATFORM_KINDS } from '../data/platformDefs.js';
import { ITEM_DEFS } from '../data/itemDefs.js';
import { RESIDENT_DEFS } from '../data/residentDefs.js';
import { ASSET_MANIFEST } from '../data/assetManifest.js';
import { BGM_OPTIONS } from '../data/audio/audioCatalog.js';
import { PROJECTILE_CATALOG } from '../actors/projectile/ProjectileCatalog.js';
import { DOOR_OPEN_CONDITIONS, DOOR_OPEN_CONDITION_OPTIONS } from '../data/doorDefs.js';

export const EDITOR_BACKGROUND_KEYS = Object.freeze(Object.keys(ASSET_MANIFEST.images).filter(key => key.startsWith('bg_')));

export const EDITOR_DIALOGUE_DEFS = Object.freeze([
  { key: 'introDialogue', label: '開始時' },
  { key: 'areaClearDialogue', label: 'エリアクリア時' },
  { key: 'bossDialogue', label: 'ボス開始時' },
  { key: 'bossDefeatDialogue', label: 'ボス撃破時' },
  { key: 'clearDialogue', label: 'ステージクリア時' },
]);

export const EDITOR_DIALOGUE_DEFAULT_LINE = Object.freeze({
  portrait: 'portrait_smile',
  speaker: 'お嬢ちゃまずんだもん',
  text: '',
});

export const EDITOR_DIALOGUE_PORTRAIT_OPTIONS = Object.freeze(Object.keys(ASSET_MANIFEST.images)
  .filter(key => key.startsWith('portrait_') || key.startsWith('npc_') || key.startsWith('boss_'))
  .map(key => ({ value: key, label: key })));

const PLATFORM_KIND_VALUES = Object.freeze(Object.values(PLATFORM_KINDS));
const RESIDENT_TYPE_VALUES = Object.freeze(Object.keys(RESIDENT_DEFS));
const PROJECTILE_KIND_VALUES = Object.freeze(Object.keys(PROJECTILE_CATALOG));
const AIM_MODE_OPTIONS = Object.freeze(['towardTargetX', 'towardTargetUpArc', 'horizontal_or_45_by_target_y', 'towardTarget', 'fixed']);

const numberField = (key, label, options = {}) => ({ key, label, type: 'number', ...options });
const textField = (key, label, options = {}) => ({ key, label, type: 'text', ...options });
const checkboxField = (key, label, options = {}) => ({ key, label, type: 'checkbox', ...options });
const selectField = (key, label, options, extra = {}) => ({ key, label, type: 'select', options, ...extra });

export const EDITOR_CATEGORY_DEFS = Object.freeze({
  points: { label: '開始/ゴール', collection: null, singleton: true },
  platforms: { label: '足場', collection: 'platforms' },
  items: { label: 'アイテム', collection: 'items' },
  residents: { label: '住民', collection: 'residents' },
  checkpoints: { label: '中継', collection: 'checkpoints' },
  areas: { label: 'エリア', collection: 'areas' },
  boss: { label: 'ボス', collection: 'boss', singleton: true },
  doors: { label: '扉', collection: 'doors' },
  switchGimmicks: { label: 'スイッチ', collection: 'switchGimmicks' },
  switchTargets: { label: 'スイッチ対象', collection: 'switchTargets' },
  balloonRides: { label: '風船ライド', collection: 'balloonRides' },
  specialEvents: { label: '特殊イベント', collection: 'specialEvents' },
  decorations: { label: '装飾', collection: 'decorations' },
});

export const EDITOR_OBJECT_PRESETS = Object.freeze({
  platforms: Object.values(PLATFORM_KINDS).map(kind => ({
    label: kind === PLATFORM_KINDS.NORMAL ? '通常足場' : `足場: ${kind}`,
    value: { x: 96, y: 208, w: 128, h: 16, kind, active: true, groupId: '' },
  })),
  items: Object.keys(ITEM_DEFS).map(kind => ({
    label: ITEM_DEFS[kind].label || kind,
    value: { x: 160, y: 180, kind, groupId: '' },
  })),
  residents: Object.keys(RESIDENT_DEFS).map(type => ({
    label: type,
    value: { x: 240, y: 208, type, groupId: '', minX: 184, maxX: 320 },
  })),
  checkpoints: [
    { label: '中継ポイント', value: { id: 'checkpoint_1', x: 480, y: 188, w: 24, h: 48 } },
  ],
  areas: [
    { label: 'エリア境界', value: { id: 'area_new', name: '新規エリア', startX: 0, endX: 480, respawn: { x: 48, y: 180 } } },
  ],
  boss: [
    { label: '標準ボス', value: { id: 'boss_new', name: '新しいボス', imageKey: 'boss_cupcake_queen', x: 1880, y: 112, w: 86, h: 110, hp: 12 } },
  ],
  doors: [
    { label: 'スイッチ扉', value: { id: 'door_1', groupId: '', x: 360, y: 154, w: 54, h: 82, openCondition: DOOR_OPEN_CONDITIONS.SWITCH, switchId: 'switch_1', openWhenOn: true, imageKey: 'door_bow' } },
    { label: 'おじぎ扉', value: { id: 'bow_door_1', groupId: '', x: 360, y: 154, w: 54, h: 82, openCondition: DOOR_OPEN_CONDITIONS.BOW, imageKey: 'door_bow', bowRange: 96 } },
    { label: 'にんじん時計扉', value: { id: 'clock_door_1', kind: 'carrotClockDoor', groupId: '', x: 360, y: 136, w: 64, h: 104, imageKey: 'gimmick_carrot_clock_gate', initialTime: 0, targetTime: 3, hourHandTime: 0, clockModulo: 12, openWhenMatched: true, handAnimDuration: 0.34, clockInputs: [{ switchId: 'clock_plus_1', step: 1 }] } },
  ],
  switchGimmicks: [
    { label: 'お茶会ベル', value: { id: 'switch_1', kind: 'teaBell', groupId: '', x: 190, y: 178, w: 42, h: 48, switchId: 'switch_1', duration: 4, triggerBy: ['player', 'nano', 'magic'] } },
    { label: 'ガラスのローズ', value: { id: 'rose_1', kind: 'glassRose', groupId: '', setId: 'rose_set_1', x: 626, y: 178, w: 40, h: 54, switchId: 'rose_all', color: 'red', required: 3, litDuration: 0 } },
    { label: '虹色シャボン', value: { id: 'bubble_1', kind: 'rainbowBubble', groupId: '', x: 1260, y: 172, w: 40, h: 40, switchId: 'bubble_pair', duration: 5 } },
    { label: 'リボンスイッチ', value: { id: 'ribbon_switch_1', kind: 'ribbonSwitch', groupId: '', x: 504, y: 192, w: 40, h: 40, targetGroup: 'default', triggerBy: ['magic'] } },
  ],
  switchTargets: [
    { label: 'スイッチ対象テーブル', value: { id: 'target_1', groupId: '', kind: 'teaTable', variant: 'long', imageKey: 'switch_target_table_long', x: 420, y: 198, w: 92, h: 38, switchId: 'switch_1', activeWhenOn: true, solid: true } },
  ],
  balloonRides: [
    {
      label: '風船ライド',
      value: {
        id: 'balloon_ride_1',
        groupId: '',
        start: { x: 236, y: 142, w: 38, h: 94, cameraX: 0, respawn: { x: 44, y: 172 } },
        goal: { x: 2038, y: 212, w: 190, h: 34 },
        config: { scrollMode: 'horizontal', scrollSpeed: 64, moveSpeedX: 146, moveSpeedY: 128, startDelay: 0.48, hitGrace: 0.92, balloonLossDownDrift: 10, bounds: { minX: 72, maxX: 372, minY: 38, maxY: 218 } },
        hazards: [],
      },
    },
    {
      label: '上昇風船ライド',
      value: {
        id: 'vertical_balloon_ride_1',
        groupId: '',
        start: { x: 220, y: 1500, w: 40, h: 96, cameraX: 0, cameraY: 1370, respawn: { x: 190, y: 1560 } },
        goal: { x: 152, y: 88, w: 176, h: 32 },
        config: { scrollMode: 'verticalUp', scrollSpeed: 58, moveSpeedX: 144, moveSpeedY: 132, startDelay: 0.52, hitGrace: 0.98, balloonLossDownDrift: 12, failScreenMarginY: 42, bounds: { minX: 64, maxX: 388, minY: 36, maxY: 224 } },
        hazards: [],
      },
    },
  ],
  specialEvents: [
    {
      label: 'なのちゃん救出',
      value: {
        id: 'nano_rescue_1',
        kind: 'nanoRescue',
        groupId: '',
        configId: 'candyDomeNanoRescue',
        x: 1112,
        y: 144,
        w: 64,
        h: 64,
        hitbox: { x: 8, y: 8, w: 48, h: 56 },
      },
    },
    {
      label: '住民増援トリガー',
      value: {
        id: 'resident_reinforcement_1',
        kind: 'residentReinforcement',
        groupId: '',
        x: 792,
        y: 104,
        w: 64,
        h: 64,
        once: true,
        message: { portrait: 'resident_spoon_a', speaker: 'スプーン兵', text: '無礼者！' },
        residents: [
          { type: 'spoon', offsetX: -60, offsetY: -160, facing: 1 },
          { type: 'spoon', offsetX: 60, offsetY: -160, facing: -1 },
        ],
      },
    },
    {
      label: '突風発生',
      value: {
        id: 'gust_1',
        kind: 'gust',
        groupId: '',
        x: 520,
        y: 160,
        w: 72,
        h: 72,
        once: false,
        triggerBy: ['player', 'nano'],
        vx: -360,
        vy: -230,
      },
    },
    {
      label: '対象無効化',
      value: {
        id: 'deactivate_group_1',
        kind: 'deactivateGroup',
        groupId: '',
        targetGroupId: 'target_group_1',
        x: 680,
        y: 160,
        w: 64,
        h: 64,
        once: true,
        triggerBy: ['player'],
      },
    },
  ],
  decorations: [
    { label: '光粒', value: { x: 120, y: 80, r: 10, color: 'rgba(255,255,255,0.25)' } },
  ],
});

export const EDITOR_FIELD_GROUPS = Object.freeze({
  stage: [
    { key: 'id', label: 'ステージID', type: 'text' },
    { key: 'name', label: '名前', type: 'text' },
    { key: 'worldIndex', label: 'ワールド番号', type: 'number', step: 1 },
    { key: 'areaRole', label: 'エリア役割', type: 'select', options: ['area_1', 'area_2', 'area_3', 'boss'] },
    { key: 'backgroundKey', label: '背景', type: 'select', options: EDITOR_BACKGROUND_KEYS },
    { key: 'bgm', label: 'BGM', type: 'select', options: BGM_OPTIONS },
    { key: 'width', label: '幅', type: 'number', step: 8, min: 480 },
    { key: 'height', label: '高さ', type: 'number', step: 8, min: 360 },
    { key: 'testStage', label: 'テストステージ', type: 'checkbox' },
  ],
  commonRect: [
    { key: 'x', label: 'X', type: 'number', step: 8 },
    { key: 'y', label: 'Y', type: 'number', step: 8 },
    { key: 'w', label: '幅', type: 'number', step: 8, min: 1 },
    { key: 'h', label: '高さ', type: 'number', step: 8, min: 1 },
  ],
});

export const EDITOR_PLATFORM_FIELD_GROUPS = Object.freeze({
  common: {
    label: '基本',
    fields: [
      numberField('x', 'X', { step: 8 }),
      numberField('y', 'Y', { step: 8 }),
      numberField('w', '幅', { step: 8, min: 1 }),
      numberField('h', '高さ', { step: 8, min: 1 }),
      selectField('kind', '種類', PLATFORM_KIND_VALUES),
      textField('groupId', 'グループID'),
      checkboxField('active', '有効', { defaultValue: true }),
    ],
  },
  switchLink: {
    label: 'スイッチ連動',
    fields: [
      textField('switchId', 'スイッチID'),
      checkboxField('activeWhenOn', 'ON時に有効', { defaultValue: true }),
    ],
  },
  byKind: {
    [PLATFORM_KINDS.SPOON]: {
      label: 'スプーン足場',
      fields: [
        numberField('slopeDir', '傾き方向（-1/1）', { step: 1, defaultValue: 1 }),
        numberField('tilt', '傾き量(rad)', { step: 0.01, min: 0, defaultValue: 0.14 }),
      ],
    },
    [PLATFORM_KINDS.TEACUP_SPIN]: {
      label: '回転ティーカップ足場',
      fields: [numberField('tilt', '最大傾き量(rad)', { step: 0.01, min: 0, defaultValue: 0.18 })],
    },
    [PLATFORM_KINDS.PAGE]: {
      label: 'ページ足場',
      fields: [
        numberField('phase', '表示タイミング位相', { step: 0.1, defaultValue: 0 }),
        numberField('activeDuration', '有効時間（秒・0=無制限）', { step: 0.1, min: 0, defaultValue: 1.6 }),
      ],
    },
    [PLATFORM_KINDS.WISH_LEAF]: {
      label: '願いの葉',
      fields: [numberField('activeDuration', '有効時間（秒・0=無制限）', { step: 0.1, min: 0, defaultValue: 4.0 })],
    },
    [PLATFORM_KINDS.DREAM_WIND]: {
      label: '風足場',
      fields: [numberField('windDir', '風向き（-1/1）', { step: 1, defaultValue: 1 })],
    },
    [PLATFORM_KINDS.RIBBON_WIND]: {
      label: 'リボン風',
      fields: [numberField('windDir', '風向き（-1/1）', { step: 1, defaultValue: 1 })],
    },
    [PLATFORM_KINDS.RIBBON_BRIDGE]: {
      label: 'リボン橋',
      fields: [
        textField('group', 'グループ', { defaultValue: 'default' }),
        numberField('activeDuration', '有効時間（秒・0=無制限）', { step: 0.1, min: 0, defaultValue: 5.2 }),
      ],
    },
  },
});

const RESIDENT_COMMON_FIELDS = Object.freeze([
  numberField('x', 'X', { step: 8 }),
  numberField('y', 'Y', { step: 8 }),
  selectField('type', '種類', RESIDENT_TYPE_VALUES),
  textField('groupId', 'グループID'),
  numberField('minX', '巡回左端', { step: 8 }),
  numberField('maxX', '巡回右端', { step: 8 }),
]);

const RESIDENT_BASIC_TUNING_FIELDS = Object.freeze([
  numberField('speed', '移動速度', { step: 1 }),
  numberField('hp', 'HP', { step: 1, min: 1 }),
  numberField('facing', '初期向き（-1/1）', { step: 1, defaultValue: 1 }),
  checkboxField('contactDamage', '接触ダメージ', { defaultValue: true }),
]);

const RESIDENT_APPEARANCE_FIELDS = Object.freeze([
  numberField('w', '当たり幅', { step: 1, min: 1 }),
  numberField('h', '当たり高さ', { step: 1, min: 1 }),
  numberField('drawW', '表示幅', { step: 1, min: 1 }),
  numberField('drawH', '表示高さ', { step: 1, min: 1 }),
  textField('imageKey', '画像キー'),
  textField('actionImageKey', 'アクション画像キー'),
  numberField('rewardCoins', '報酬コイン', { step: 1, min: 0 }),
]);

const MOVE_SPEED_SCALE_FIELD = numberField('behaviorParams.move.speedScale', '移動倍率', { step: 0.01, defaultValue: 1 });
const FLOAT_MOVE_FIELDS = Object.freeze([
  numberField('behaviorParams.move.amplitudeY', '上下揺れ幅', { step: 1 }),
  numberField('behaviorParams.move.frequencyY', '上下揺れ速度', { step: 0.1 }),
]);
const DETECT_FIELDS = Object.freeze([
  numberField('behaviorParams.detect.rangeX', '検知範囲X', { step: 1 }),
  numberField('behaviorParams.detect.rangeY', '検知範囲Y', { step: 1 }),
]);
const EMIT_FIELDS = Object.freeze([
  selectField('behaviorParams.emit.projectileKind', '弾の種類', PROJECTILE_KIND_VALUES),
  numberField('behaviorParams.emit.cooldown', '発射間隔', { step: 0.05 }),
  numberField('behaviorParams.emit.spawnOffsetX', '発射位置X補正', { step: 1 }),
  numberField('behaviorParams.emit.spawnOffsetY', '発射位置Y補正', { step: 1 }),
]);
const AIM_UP_ARC_FIELDS = Object.freeze([
  selectField('behaviorParams.aim.mode', '狙い方', AIM_MODE_OPTIONS),
  numberField('behaviorParams.aim.upY', '上方向補正', { step: 0.01 }),
]);
const RIDE_COMMON_FIELDS = Object.freeze([
  textField('rideId', '風船ライドID'),
  numberField('ampX', '左右揺れ幅', { step: 1 }),
  numberField('ampY', '上下揺れ幅', { step: 1 }),
  numberField('behaviorParams.move.frequencyX', '左右揺れ速度', { step: 0.1 }),
  numberField('behaviorParams.move.frequencyY', '上下揺れ速度', { step: 0.1 }),
]);

export const EDITOR_RESIDENT_FIELD_GROUPS = Object.freeze({
  common: { label: '基本', fields: RESIDENT_COMMON_FIELDS },
  tuning: { label: '共通調整', fields: RESIDENT_BASIC_TUNING_FIELDS },
  appearance: { label: '表示/当たり判定', fields: RESIDENT_APPEARANCE_FIELDS },
  byType: {
    macaron: {
      label: '歩行',
      fields: [MOVE_SPEED_SCALE_FIELD],
    },
    jelly: {
      label: 'ジャンプ巡回',
      fields: [
        MOVE_SPEED_SCALE_FIELD,
        numberField('behaviorParams.hop.interval', 'ジャンプ間隔', { step: 0.05 }),
        numberField('behaviorParams.hop.power', 'ジャンプ力', { step: 1 }),
        checkboxField('behaviorParams.hop.towardTarget', '対象へ跳ぶ', { defaultValue: false }),
      ],
    },
    invitationHopper: {
      label: '検知ジャンプ',
      fields: [
        MOVE_SPEED_SCALE_FIELD,
        ...DETECT_FIELDS,
        numberField('behaviorParams.hop.interval', 'ジャンプ間隔', { step: 0.05 }),
        numberField('behaviorParams.hop.power', 'ジャンプ力', { step: 1 }),
        checkboxField('behaviorParams.hop.towardTarget', '対象へ跳ぶ', { defaultValue: true }),
      ],
    },
    spoon: {
      label: '突進',
      fields: [
        MOVE_SPEED_SCALE_FIELD,
        ...DETECT_FIELDS,
        numberField('behaviorParams.charge.windupTime', '突進予備時間', { step: 0.05 }),
        numberField('behaviorParams.charge.time', '突進時間', { step: 0.05 }),
        numberField('behaviorParams.charge.recoverTime', '復帰時間', { step: 0.05 }),
        numberField('behaviorParams.charge.cooldown', '突進間隔', { step: 0.05 }),
        numberField('behaviorParams.charge.speed', '突進速度', { step: 1 }),
      ],
    },
    shadowRabbit: {
      label: '突進',
      fields: [
        MOVE_SPEED_SCALE_FIELD,
        ...DETECT_FIELDS,
        numberField('behaviorParams.charge.windupTime', '突進予備時間', { step: 0.05 }),
        numberField('behaviorParams.charge.time', '突進時間', { step: 0.05 }),
        numberField('behaviorParams.charge.recoverTime', '復帰時間', { step: 0.05 }),
        numberField('behaviorParams.charge.cooldown', '突進間隔', { step: 0.05 }),
        numberField('behaviorParams.charge.speed', '突進速度', { step: 1 }),
      ],
    },
    ribbonWisp: {
      label: '浮遊射撃',
      fields: [
        ...FLOAT_MOVE_FIELDS,
        ...DETECT_FIELDS,
        selectField('behaviorParams.aim.mode', '狙い方', AIM_MODE_OPTIONS),
        ...EMIT_FIELDS,
      ],
    },
    bat: {
      label: '浮遊巡回',
      fields: [...FLOAT_MOVE_FIELDS],
    },
    cloud: {
      label: '浮遊射撃',
      fields: [
        ...FLOAT_MOVE_FIELDS,
        ...DETECT_FIELDS,
        selectField('behaviorParams.aim.mode', '狙い方', AIM_MODE_OPTIONS),
        ...EMIT_FIELDS,
      ],
    },
    pageWisp: {
      label: '地上射撃',
      fields: [
        MOVE_SPEED_SCALE_FIELD,
        ...DETECT_FIELDS,
        ...AIM_UP_ARC_FIELDS,
        ...EMIT_FIELDS,
      ],
    },
    teaImp: {
      label: '地上射撃',
      fields: [
        MOVE_SPEED_SCALE_FIELD,
        ...DETECT_FIELDS,
        ...AIM_UP_ARC_FIELDS,
        ...EMIT_FIELDS,
      ],
    },
    toyKnight: {
      label: '予備動作つき射撃',
      fields: [
        MOVE_SPEED_SCALE_FIELD,
        ...DETECT_FIELDS,
        numberField('behaviorParams.telegraph.time', '予備動作時間', { step: 0.05 }),
        selectField('behaviorParams.aim.mode', '狙い方', AIM_MODE_OPTIONS),
        numberField('behaviorParams.aim.yThreshold', '斜め撃ち判定Y', { step: 1 }),
        ...EMIT_FIELDS,
        numberField('behaviorParams.emit.recoverTime', '発射後硬直', { step: 0.05 }),
      ],
    },
    mirrorGhost: {
      label: '反射',
      fields: [
        MOVE_SPEED_SCALE_FIELD,
        numberField('behaviorParams.reflect.speedScale', '反射速度倍率', { step: 0.01 }),
        numberField('behaviorParams.reflect.ignoreSameResidentTime', '再接触無視時間', { step: 0.01 }),
        numberField('behaviorParams.reflect.minLifeAfterReflect', '反射後最低寿命', { step: 0.05 }),
        numberField('behaviorParams.reflect.flashTime', '反射フラッシュ時間', { step: 0.01 }),
      ],
    },
    cloudImp: {
      label: '風船ライド射撃',
      fields: [
        ...RIDE_COMMON_FIELDS,
        numberField('fireDelay', '初回発射遅延', { step: 0.05 }),
        numberField('fireEvery', '発射間隔', { step: 0.05 }),
        numberField('shotSpeed', '弾速', { step: 1 }),
        numberField('shotVy', '弾Y速度補正', { step: 1 }),
        numberField('attackFlashTime', '攻撃表示時間', { step: 0.01 }),
        selectField('behaviorParams.emit.projectileKind', '弾の種類', PROJECTILE_KIND_VALUES),
        selectField('behaviorParams.aim.mode', '狙い方', AIM_MODE_OPTIONS),
        numberField('behaviorParams.aim.x', '固定狙いX', { step: 0.1 }),
        numberField('behaviorParams.aim.y', '固定狙いY', { step: 0.1 }),
      ],
    },
    stormCloud: {
      label: '風船ライド射撃',
      fields: [
        ...RIDE_COMMON_FIELDS,
        numberField('fireDelay', '初回発射遅延', { step: 0.05 }),
        numberField('fireEvery', '発射間隔', { step: 0.05 }),
        numberField('shotSpeed', '弾速', { step: 1 }),
        numberField('attackFlashTime', '攻撃表示時間', { step: 0.01 }),
        selectField('behaviorParams.emit.projectileKind', '弾の種類', PROJECTILE_KIND_VALUES),
        selectField('behaviorParams.aim.mode', '狙い方', AIM_MODE_OPTIONS),
      ],
    },
    thornCloud: {
      label: '風船ライド障害物',
      fields: [...RIDE_COMMON_FIELDS],
    },
    balloonBird: {
      label: '風船ライド急降下',
      fields: [
        ...RIDE_COMMON_FIELDS,
        numberField('idleRiseSpeed', '待機上昇速度', { step: 1 }),
        numberField('diveTriggerRangeX', '急降下検知X', { step: 1 }),
        numberField('diveTriggerRangeY', '急降下検知Y', { step: 1 }),
        numberField('diveDuration', '急降下時間', { step: 0.05 }),
        numberField('diveCooldown', '急降下間隔', { step: 0.05 }),
        numberField('diveDrop', '急降下距離', { step: 1 }),
        numberField('diveMinY', '急降下最小Y', { step: 1 }),
        numberField('diveMaxY', '急降下最大Y', { step: 1 }),
      ],
    },
  },
});

function cloneFieldGroup(group) {
  return {
    label: group.label,
    fields: group.fields.map(field => ({ ...field })),
  };
}

export function getEditorFieldGroupsForObject(category, object = {}) {
  if (category === 'platforms') {
    const kind = object.kind || PLATFORM_KINDS.NORMAL;
    const groups = [cloneFieldGroup(EDITOR_PLATFORM_FIELD_GROUPS.common)];
    const kindGroup = EDITOR_PLATFORM_FIELD_GROUPS.byKind[kind];
    if (kindGroup) groups.push(cloneFieldGroup(kindGroup));
    groups.push(cloneFieldGroup(EDITOR_PLATFORM_FIELD_GROUPS.switchLink));
    return groups;
  }

  if (category === 'residents') {
    const type = object.type || 'macaron';
    const groups = [
      cloneFieldGroup(EDITOR_RESIDENT_FIELD_GROUPS.common),
      cloneFieldGroup(EDITOR_RESIDENT_FIELD_GROUPS.tuning),
    ];
    const typeGroup = EDITOR_RESIDENT_FIELD_GROUPS.byType[type];
    if (typeGroup) groups.push(cloneFieldGroup(typeGroup));
    groups.push(cloneFieldGroup(EDITOR_RESIDENT_FIELD_GROUPS.appearance));
    return groups;
  }



  if (category === 'doors') {
    const common = {
      label: '扉',
      fields: [
        textField('id', 'ID'),
        selectField('kind', '種類', [
          { value: '', label: '通常扉' },
          { value: 'carrotClockDoor', label: 'にんじん時計扉' },
        ]),
        selectField('openCondition', '開く条件', DOOR_OPEN_CONDITION_OPTIONS, { defaultValue: DOOR_OPEN_CONDITIONS.SWITCH }),
        textField('groupId', 'グループID'),
        numberField('x', 'X', { step: 8 }),
        numberField('y', 'Y', { step: 8 }),
        numberField('w', '幅', { step: 8, min: 1 }),
        numberField('h', '高さ', { step: 8, min: 1 }),
        textField('imageKey', '画像キー'),
      ],
    };
    if (object.kind === 'carrotClockDoor') {
      common.fields = common.fields.filter(field => field.key !== 'openCondition');
      return [common, {
        label: '時計扉',
        fields: [
          numberField('initialTime', '初期時刻（0=12時）', { step: 1, min: 0, defaultValue: 0 }),
          numberField('targetTime', '正解時刻（0=12時）', { step: 1, min: 0, defaultValue: 3 }),
          numberField('hourHandTime', '短針位置（0=12時）', { step: 1, min: 0, defaultValue: 0 }),
          numberField('clockModulo', '時刻数', { step: 1, min: 2, defaultValue: 12 }),
          checkboxField('openWhenMatched', '一致時に開く', { defaultValue: true }),
          numberField('handAnimDuration', '針アニメ時間', { step: 0.01, min: 0, defaultValue: 0.34 }),
          { key: 'clockInputs', label: '時計入力JSON', type: 'json' },
        ],
      }];
    }
    if (object.openCondition === DOOR_OPEN_CONDITIONS.BOW) {
      return [common, {
        label: 'おじぎ',
        fields: [
          numberField('bowRange', '開放距離', { step: 8, min: 1, defaultValue: 96 }),
        ],
      }];
    }
    return [common, {
      label: 'スイッチ連動',
      fields: [
        textField('switchId', 'スイッチID'),
        checkboxField('openWhenOn', 'ON時に開く', { defaultValue: true }),
      ],
    }];
  }

  if (category === 'switchGimmicks') {
    const common = {
      label: 'スイッチ',
      fields: [
        textField('id', 'ID'),
        selectField('kind', '種類', [
          { value: 'teaBell', label: 'お茶会ベル' },
          { value: 'glassRose', label: 'ガラスのローズ' },
          { value: 'rainbowBubble', label: '虹色シャボン' },
          { value: 'magicCandelabra', label: '魔法燭台' },
          { value: 'ribbonSwitch', label: 'リボンスイッチ' },
        ]),
        textField('groupId', 'グループID'),
        numberField('x', 'X', { step: 8 }),
        numberField('y', 'Y', { step: 8 }),
        numberField('w', '幅', { step: 8, min: 1 }),
        numberField('h', '高さ', { step: 8, min: 1 }),
      ],
    };
    const kind = object.kind || 'teaBell';
    if (kind === 'ribbonSwitch') {
      return [common, {
        label: 'リボンスイッチ',
        fields: [
          textField('targetGroup', '起動対象グループ', { defaultValue: 'default' }),
        ],
      }];
    }
    return [common, {
      label: 'スイッチ連動',
      fields: [
        textField('switchId', 'スイッチID'),
        textField('setId', 'セットID'),
        numberField('required', '必要数', { step: 1, min: 1, defaultValue: 1 }),
        numberField('duration', 'ON時間', { step: 0.1 }),
        numberField('litDuration', '点灯時間', { step: 0.1 }),
      ],
    }];
  }


  if (category === 'specialEvents') {
    const common = {
      label: '特殊イベント',
      fields: [
        textField('id', 'ID'),
        selectField('kind', '種類', [
          { value: 'nanoRescue', label: 'なのちゃん救出' },
          { value: 'residentReinforcement', label: '住民増援' },
          { value: 'gust', label: '突風発生' },
          { value: 'deactivateGroup', label: '対象無効化' },
        ]),
        textField('groupId', 'グループID'),
        checkboxField('active', '有効', { defaultValue: true }),
        numberField('x', 'X', { step: 8 }),
        numberField('y', 'Y', { step: 8 }),
        numberField('w', '幅', { step: 8, min: 1 }),
        numberField('h', '高さ', { step: 8, min: 1 }),
      ],
    };
    const kind = object.kind || 'nanoRescue';
    if (kind === 'residentReinforcement') {
      return [common, {
        label: '住民増援',
        fields: [
          checkboxField('once', '一度だけ', { defaultValue: true }),
          textField('message.portrait', 'メッセージ画像', { defaultValue: 'resident_spoon_a' }),
          textField('message.speaker', '話者', { defaultValue: 'スプーン兵' }),
          textField('message.text', '本文', { defaultValue: '無礼者！' }),
          selectField('message.mode', '表示位置', ['center', 'bottom'], { defaultValue: 'center' }),
          numberField('initialVy', '出現時の落下速度', { step: 1, defaultValue: 40 }),
          { key: 'residents', label: '増援住民JSON', type: 'json' },
        ],
      }];
    }
    if (kind === 'gust') {
      return [common, {
        label: '突風発生',
        fields: [
          checkboxField('once', '一度だけ', { defaultValue: false }),
          { key: 'triggerBy', label: '反応対象JSON', type: 'json' },
          numberField('vx', '吹き飛ばしX速度', { step: 10, defaultValue: -360 }),
          numberField('vy', '吹き飛ばしY速度', { step: 10, defaultValue: -230 }),
          numberField('cooldown', '再発生待ち時間', { step: 0.05, min: 0, defaultValue: 0.24 }),
          numberField('particleCount', '風粒数', { step: 1, min: 1, defaultValue: 26 }),
        ],
      }];
    }
    if (kind === 'deactivateGroup') {
      return [common, {
        label: '対象無効化',
        fields: [
          checkboxField('once', '一度だけ', { defaultValue: true }),
          textField('targetGroupId', '対象グループID'),
        ],
      }];
    }
    return [common, {
      label: 'なのちゃん救出',
      fields: [
        textField('configId', '設定ID'),
        numberField('hitbox.x', '命中判定X補正', { step: 8, defaultValue: 8 }),
        numberField('hitbox.y', '命中判定Y補正', { step: 8, defaultValue: 8 }),
        numberField('hitbox.w', '命中判定幅', { step: 8, min: 1, defaultValue: 48 }),
        numberField('hitbox.h', '命中判定高さ', { step: 8, min: 1, defaultValue: 56 }),
      ],
    }];
  }

  return [];
}

export function getResidentDefinitionValue(type, path) {
  const def = RESIDENT_DEFS[type] || RESIDENT_DEFS.macaron;
  return path.split('.').reduce((current, part) => current?.[part], def);
}
