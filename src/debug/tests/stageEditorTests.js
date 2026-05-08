/**
 * 責務: ステージエディタ用スキーマ、検証、出力、プレビュー受け渡しの最小整合性テストを担当する。
 * 更新ルール: DOM操作は含めず、エディタのデータ層だけを検証する。
 * 更新ルール: ゴール種類のエディタ解決はgoalDefs経由の画像キーとして検証する。
 */
import { createTest } from '../TestRunner.js';
import { STAGES } from '../../data/stages.js';
import { PLATFORM_KINDS } from '../../data/platformDefs.js';
import { createEditorStage } from '../../editor/stageEditorSchema.js';
import { hasValidationErrors, validateEditorStage } from '../../editor/stageEditorValidation.js';
import { parseStageJson, serializeStageToJsModule, serializeStageToJson } from '../../editor/stageEditorSerializer.js';
import { readStageEditorPreview, STAGE_EDITOR_PREVIEW_STORAGE_KEY, writeStageEditorPreview } from '../../editor/stageEditorPreviewBridge.js';
import { EDITOR_CATEGORY_DEFS, EDITOR_DIALOGUE_DEFS, EDITOR_DIALOGUE_PORTRAIT_OPTIONS, EDITOR_OBJECT_PRESETS, getEditorFieldGroupsForObject } from '../../editor/stageEditorCatalog.js';
import { createEditorDialogueLine, getEditorDialogueSummary, moveEditorDialogueLine, normalizeEditorDialogueLine } from '../../editor/StageEditorDialoguePanel.js';
import { EDITOR_CANVAS_OUTSIDE_MARGIN, EDITOR_CANVAS_ZOOM, canResizeEditorObject, getEditorCanvasViewBounds, getEditorVisibleStageRect, getNextEditorCanvasScale, isEditorResizeHandleHit } from '../../editor/stageEditorGeometry.js';
import { getEditorHitTestCategoryOrder, createEditorSelectionKey } from '../../editor/stageEditorSelection.js';
import { getEditorItemMetrics, getEditorObjectImageKey, getEditorResidentMetrics } from '../../editor/stageEditorObjectMetrics.js';
import { EDITOR_DUPLICATE_OFFSET, moveEditorObjectByDelta, placeEditorObjectInVisibleRect } from '../../editor/stageEditorObjectMutation.js';

export const stageEditorTests = [
  createTest('stageEditor', '既存ステージはエディタ保存前検証でerrorにならない', ({ assert }) => {
    const failed = Object.values(STAGES).flatMap(stage => {
      const messages = validateEditorStage(createEditorStage(stage));
      return hasValidationErrors(messages) ? [stage.id] : [];
    });
    assert(failed.length === 0, `検証error: ${failed.join(', ')}`);
  }),

  createTest('stageEditor', 'JSON/JS出力は正規化済みステージを含む', ({ assert }) => {
    const stage = createEditorStage(STAGES.candy_forest_area_1);
    const json = serializeStageToJson(stage);
    const parsed = parseStageJson(json);
    assert(parsed.platforms.every(platform => platform.kind && typeof platform.active === 'boolean'), '足場の明示フィールドが出力されていません');
    const js = serializeStageToJsModule(stage);
    assert(js.includes('export default stage;'), 'JS module形式で出力されていません');
  }),



  createTest('stageEditor', 'キャンバス選択は選択中カテゴリを優先しareasは通常クリック対象にしない', ({ equal, assert }) => {
    const platformOrder = getEditorHitTestCategoryOrder('platforms');
    equal(platformOrder[0], 'platforms');
    assert(!platformOrder.includes('areas'), 'areasはエリア編集中以外のヒット判定へ含めません');
    const areaOrder = getEditorHitTestCategoryOrder('areas');
    equal(areaOrder[0], 'areas');
  }),



  createTest('stageEditor', '矩形リサイズハンドルは枠外側も掴める', ({ assert }) => {
    const bounds = { x: 100, y: 120, w: 64, h: 24 };
    assert(canResizeEditorObject('platforms', { x: 100, y: 120, w: 64, h: 24, kind: 'normal' }), '足場はリサイズ対象です');
    assert(!canResizeEditorObject('residents', { x: 100, y: 120, type: 'macaron' }), '住民はリサイズ対象ではありません');
    assert(isEditorResizeHandleHit(168, 148, bounds), '右下枠外側のハンドル領域もヒット対象です');
  }),



  createTest('stageEditor', '足場追加プリセットの初期高さは16になる', ({ assert }) => {
    assert(EDITOR_OBJECT_PRESETS.platforms.length > 0, '足場プリセットがありません');
    assert(EDITOR_OBJECT_PRESETS.platforms.every(preset => preset.value.h === 16), '足場追加時の初期高さが16ではありません');
  }),

  createTest('stageEditor', '蔓の足場は通常の矩形足場として追加できる', ({ assert, equal }) => {
    const preset = EDITOR_OBJECT_PRESETS.platforms.find(item => item.value.kind === PLATFORM_KINDS.VINE_PLATFORM);
    assert(!!preset, '蔓の足場プリセットがありません');
    equal(preset.label, '蔓の足場');
    assert(preset.value.active === true, '蔓の足場は初期状態で有効です');
    const groups = getEditorFieldGroupsForObject('platforms', preset.value);
    const fields = groups.flatMap(group => group.fields);
    const keys = fields.map(field => field.key);
    assert(['x', 'y', 'w', 'h', 'kind', 'active'].every(key => keys.includes(key)), '蔓の足場を矩形足場の共通項目で編集できません');
    const styleField = fields.find(field => field.key === 'vineStyle');
    assert(!!styleField, '蔓の足場スタイルを編集できません');
    assert(styleField.options.some(option => option.value === 'rose'), '薔薇の蔓スタイル候補がありません');
  }),


  createTest('stageEditor', '未知の蔓足場スタイルは保存前検証でerrorになる', ({ assert }) => {
    const stage = createEditorStage({
      id: 'vine_style_test',
      platforms: [{ x: 0, y: 200, w: 96, h: 16, kind: PLATFORM_KINDS.VINE_PLATFORM, active: true, vineStyle: 'unknown' }],
    });
    const messages = validateEditorStage(stage);
    assert(hasValidationErrors(messages), '未知の蔓足場スタイルがerrorになっていません');
  }),



  createTest('stageEditor', '通常床スタイルを編集できる', ({ assert }) => {
    const groups = getEditorFieldGroupsForObject('platforms', { kind: PLATFORM_KINDS.NORMAL });
    const fields = groups.flatMap(group => group.fields);
    const styleField = fields.find(field => field.key === 'platformStyle');
    assert(!!styleField, '通常床スタイルを編集できません');
    assert(styleField.options.some(option => option.value === 'normal' && option.label === '通常'), '通常スタイル候補がありません');
    assert(styleField.options.some(option => option.value === 'dreamTree'), '夢みる豆の木スタイル候補がありません');
  }),

  createTest('stageEditor', '未知の通常床スタイルは保存前検証でerrorになる', ({ assert }) => {
    const stage = createEditorStage({
      id: 'platform_style_test',
      platforms: [{ x: 0, y: 200, w: 96, h: 16, kind: PLATFORM_KINDS.NORMAL, active: true, platformStyle: 'unknown' }],
    });
    const messages = validateEditorStage(stage);
    assert(hasValidationErrors(messages), '未知の通常床スタイルがerrorになっていません');
  }),




  createTest('stageEditor', 'リボンスイッチは足場ではなくスイッチとして追加・編集する', ({ assert }) => {
    assert(!EDITOR_OBJECT_PRESETS.platforms.some(preset => preset.value.kind === 'ribbonSwitch'), '足場プリセットにribbonSwitchが残っています');
    assert(EDITOR_OBJECT_PRESETS.switchGimmicks.some(preset => preset.value.kind === 'ribbonSwitch'), 'スイッチプリセットにribbonSwitchがありません');
    const keys = getEditorFieldGroupsForObject('switchGimmicks', { kind: 'ribbonSwitch' }).flatMap(group => group.fields.map(field => field.key));
    assert(keys.includes('targetGroup'), 'リボンスイッチの起動対象グループを編集できません');
  }),

  createTest('stageEditor', '種類別プロパティは足場kindに応じて切り替わる', ({ assert }) => {
    const spoonKeys = getEditorFieldGroupsForObject('platforms', { kind: 'spoon' }).flatMap(group => group.fields.map(field => field.key));
    const pageKeys = getEditorFieldGroupsForObject('platforms', { kind: 'page' }).flatMap(group => group.fields.map(field => field.key));
    const wishLeafKeys = getEditorFieldGroupsForObject('platforms', { kind: 'wishLeaf' }).flatMap(group => group.fields.map(field => field.key));
    const ribbonBridgeKeys = getEditorFieldGroupsForObject('platforms', { kind: 'ribbonBridge' }).flatMap(group => group.fields.map(field => field.key));
    assert(spoonKeys.includes('slopeDir'), 'spoon足場はslopeDirを表示します');
    assert(!spoonKeys.includes('phase'), 'spoon足場にpage用phaseを表示しません');
    assert(pageKeys.includes('phase'), 'page足場はphaseを表示します');
    assert(pageKeys.includes('activeDuration'), 'page足場は有効時間を表示します');
    assert(wishLeafKeys.includes('activeDuration'), 'wishLeaf足場は有効時間を表示します');
    assert(ribbonBridgeKeys.includes('activeDuration'), 'ribbonBridge足場は有効時間を表示します');
    assert(!pageKeys.includes('slopeDir'), 'page足場にspoon用slopeDirを表示しません');
  }),

  createTest('stageEditor', '種類別プロパティは住民typeに応じて切り替わる', ({ assert }) => {
    const macaronKeys = getEditorFieldGroupsForObject('residents', { type: 'macaron' }).flatMap(group => group.fields.map(field => field.key));
    const cloudKeys = getEditorFieldGroupsForObject('residents', { type: 'cloud' }).flatMap(group => group.fields.map(field => field.key));
    const cloudImpKeys = getEditorFieldGroupsForObject('residents', { type: 'cloudImp' }).flatMap(group => group.fields.map(field => field.key));
    assert(!macaronKeys.includes('behaviorParams.emit.cooldown'), 'macaronに射撃設定を表示しません');
    assert(cloudKeys.includes('behaviorParams.emit.cooldown'), 'cloudは発射間隔を表示します');
    assert(!cloudKeys.includes('shotSpeed'), '通常射撃敵には現行Runtimeで未接続のshotSpeedを表示しません');
    assert(cloudImpKeys.includes('fireEvery'), '風船ライド射撃敵はfireEveryを表示します');
    assert(cloudImpKeys.includes('shotSpeed'), '風船ライド射撃敵は現行Runtimeで有効なshotSpeedを表示します');
  }),


  createTest('stageEditor', 'キャンバスズームはホイール方向で拡大縮小し範囲内に収まる', ({ assert }) => {
    const zoomIn = getNextEditorCanvasScale(2, -100);
    const zoomOut = getNextEditorCanvasScale(2, 100);
    assert(zoomIn > 2, '上方向ホイールで拡大します');
    assert(zoomOut < 2, '下方向ホイールで縮小します');
    assert(getNextEditorCanvasScale(EDITOR_CANVAS_ZOOM.max, -100) <= EDITOR_CANVAS_ZOOM.max, '最大倍率を超えません');
    assert(getNextEditorCanvasScale(EDITOR_CANVAS_ZOOM.min, 100) >= EDITOR_CANVAS_ZOOM.min, '最小倍率を下回りません');
  }),

  createTest('stageEditor', 'ステージ範囲外を含むキャンバス表示範囲を解決できる', ({ assert }) => {
    const stage = createEditorStage(STAGES.candy_forest_area_1);
    stage.platforms.push({ x: -320, y: -64, w: 64, h: 24, kind: 'normal', active: true });
    const bounds = getEditorCanvasViewBounds(stage);
    assert(bounds.x <= -320 - EDITOR_CANVAS_OUTSIDE_MARGIN, '負方向の範囲外オブジェクトを表示範囲へ含めます');
    assert(bounds.w > stage.width, 'ステージ幅より広い編集用キャンバスを作ります');
  }),

  createTest('stageEditor', '表示中画面の中央へ新規オブジェクトを配置できる', ({ equal, assert }) => {
    const viewBounds = { x: -240, y: -240, w: 2880, h: 750 };
    const visible = getEditorVisibleStageRect(480, 160, 960, 540, 2, viewBounds);
    const platform = placeEditorObjectInVisibleRect('platforms', { x: 0, y: 0, w: 128, h: 24, kind: 'normal', active: true }, visible);
    assert(platform.x >= visible.x && platform.x <= visible.x + visible.w, '表示中画面内のXへ配置されます');
    assert(platform.y >= visible.y && platform.y <= visible.y + visible.h, '表示中画面内のYへ配置されます');
    equal(Math.abs(platform.x % 8), 0);
    equal(Math.abs(platform.y % 8), 0);
  }),

  createTest('stageEditor', '一括選択キーと一括移動用オブジェクト複製を扱える', ({ equal }) => {
    equal(createEditorSelectionKey('platforms', 2), 'platforms:2');
    const resident = moveEditorObjectByDelta('residents', { x: 40, y: 80, type: 'macaron', minX: 8, maxX: 96 }, EDITOR_DUPLICATE_OFFSET, EDITOR_DUPLICATE_OFFSET);
    equal(resident.x, 56);
    equal(resident.y, 96);
    equal(resident.minX, 24);
    equal(resident.maxX, 112);
  }),

  createTest('stageEditor', '特殊イベントはエディタで配置と矩形編集ができる', ({ equal, assert }) => {
    assert(!!EDITOR_CATEGORY_DEFS.specialEvents, '特殊イベントカテゴリがありません');
    assert(EDITOR_OBJECT_PRESETS.specialEvents.some(preset => preset.value.kind === 'nanoRescue'), 'なのちゃん救出イベントのプリセットがありません');
    const keys = getEditorFieldGroupsForObject('specialEvents', { kind: 'nanoRescue' }).flatMap(group => group.fields.map(field => field.key));
    assert(['configId', 'x', 'y', 'w', 'h', 'hitbox.x', 'hitbox.y', 'hitbox.w', 'hitbox.h'].every(key => keys.includes(key)), '特殊イベントの設定ID・座標・命中判定を編集できません');
    equal(getEditorObjectImageKey('specialEvents', { kind: 'nanoRescue' }), 'event_nano_candy_dome_trapped');
  }),

  createTest('stageEditor', '実画像表示対象の画像キーと当たり判定メトリクスを解決できる', ({ equal, assert }) => {
    equal(getEditorObjectImageKey('items', { kind: 'scone' }), 'icon_scone');
    equal(getEditorObjectImageKey('residents', { type: 'toyKnight' }), 'resident_toy_knight');
    equal(getEditorObjectImageKey('doors', {}), 'door_bow');
    equal(getEditorObjectImageKey('points', { key: 'goal', variant: 'sign_arrow' }), 'goal_sign_arrow');
    equal(getEditorObjectImageKey('points', { key: 'goal', variant: 'sign_board' }), 'goal_sign_board');
    equal(getEditorObjectImageKey('switchTargets', { kind: 'teaChair', variant: 'wing' }), 'switch_target_chair_wing');
    equal(getEditorObjectImageKey('switchGimmicks', { kind: 'glassRose', color: 'blue' }), 'switch_glass_rose_blue');
    equal(getEditorObjectImageKey('switchGimmicks', { kind: 'ribbonSwitch' }), 'gimmick_ribbon_switch');
    assert(getEditorItemMetrics({ kind: 'largeBeanCoin' }).hitboxSize > getEditorItemMetrics({ kind: 'coin' }).hitboxSize, 'アイテム当たり判定サイズを種類から解決します');
    assert(getEditorResidentMetrics({ type: 'cloudImp' }).drawW > getEditorResidentMetrics({ type: 'macaron' }).w, '住民の表示サイズを種類から解決します');
  }),

  createTest('stageEditor', '会話編集対象と顔アイコン候補を解決できる', ({ assert }) => {
    const dialogueKeys = EDITOR_DIALOGUE_DEFS.map(def => def.key);
    assert(dialogueKeys.includes('introDialogue'), '開始時会話が編集対象に含まれていません');
    assert(dialogueKeys.includes('bossDefeatDialogue'), 'ボス撃破時会話が編集対象に含まれていません');
    assert(EDITOR_DIALOGUE_PORTRAIT_OPTIONS.some(option => option.value === 'portrait_smile'), 'ずんだもん顔アイコン候補がありません');
    assert(EDITOR_DIALOGUE_PORTRAIT_OPTIONS.some(option => option.value === 'npc_candy_maid'), 'NPC顔アイコン候補がありません');
    assert(EDITOR_DIALOGUE_PORTRAIT_OPTIONS.some(option => option.value === 'boss_cupcake_queen'), 'ボス顔アイコン候補がありません');
  }),

  createTest('stageEditor', '会話ウィンドウは正規化と並び替えができる', ({ equal, assert }) => {
    const line = normalizeEditorDialogueLine({ text: 'ごきげんよう' });
    equal(line.portrait, 'portrait_smile');
    equal(line.speaker, 'お嬢ちゃまずんだもん');
    const created = createEditorDialogueLine({ portrait: 'portrait_nano_smile', speaker: 'なのちゃん' });
    equal(created.text, '');
    const moved = moveEditorDialogueLine([
      { portrait: 'portrait_smile', speaker: 'A', text: '1' },
      { portrait: 'portrait_nano_smile', speaker: 'B', text: '2' },
    ], 0, 1);
    equal(moved[1].speaker, 'A');
    assert(getEditorDialogueSummary({ speaker: 'A', text: '  こんにちは   なの  ' }, 2).includes('3. A：こんにちは なの'), '会話一覧用の要約を作れません');
  }),

  createTest('stageEditor', 'プレビュー受け渡しはtestStage化してrouteを切る', ({ equal, assert }) => {
    const preview = writeStageEditorPreview(STAGES.candy_forest_area_1);
    equal(preview.testStage, true);
    equal(preview.route, null);
    assert(!!localStorage.getItem(STAGE_EDITOR_PREVIEW_STORAGE_KEY), 'プレビュー用localStorageに保存されていません');
    const read = readStageEditorPreview('?editorPreview=1');
    equal(read.testStage, true);
    equal(read.route, null);
  }),
];
