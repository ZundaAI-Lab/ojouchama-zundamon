/**
 * 責務: ステージ定義からRuntimeで使うActor、カメラ、描画系を生成する。
 * 更新ルール: 進行判定や入力処理はRuntime/Scene側に置く。なのちゃんは加入済み判定後に専用Actorとして生成する。
 * 更新ルール: 縦長ステージ開始時も初期スポーンが画面内に入るよう、生成直後のカメラ初期位置だけはここで同期する。
 * 更新ルール: 夢のしずく取得済み表示はSaveSystemのdreamDropsを参照してActor初期状態へ注入し、取得保存はClearServiceへ任せる。
 */
import { Camera } from '../core/Camera.js';
import { GAME_VIEW } from '../config/view.js';
import { clamp } from '../utils/math.js';
import { PhysicsSystem } from '../systems/PhysicsSystem.js';
import { RenderSystem } from '../render/RenderSystem.js';
import { Player } from '../actors/player/Player.js';
import { ResidentFactory } from '../actors/resident/ResidentFactory.js';
import { BossFactory } from '../actors/boss/BossFactory.js';
import { Item } from '../actors/item/Item.js';
import { Goal } from '../actors/Goal.js';
import { NanoCompanion } from '../actors/nano/NanoCompanion.js';

export class StageFactory {
  static createRuntimeObjects(app, stage, difficulty, spawnPoint, saveData) {
    const camera = new Camera();
    camera.setWorldSize(stage.width, stage.height);

    const physics = new PhysicsSystem(app.performanceReporter);
    const renderer = new RenderSystem(app);
    const player = new Player({
      ...spawnPoint,
      input: app.input,
      upgrades: saveData.upgrades,
      baseHp: difficulty.playerBaseHp,
    });
    const nano = saveData.storyFlags?.nanoJoined
      ? StageFactory.createNanoCompanion(app, player)
      : null;
    camera.follow(player);
    camera.x = clamp(player.x + player.w / 2 - GAME_VIEW.WIDTH / 2, 0, Math.max(0, stage.width - GAME_VIEW.WIDTH));
    camera.y = clamp(player.y + player.h / 2 - GAME_VIEW.HEIGHT / 2, 0, Math.max(0, stage.height - GAME_VIEW.HEIGHT));

    const dreamDropAcquired = !!saveData.dreamDrops?.[stage.id];
    const goal = new Goal(stage.goal);
    goal.dreamDropAcquired = dreamDropAcquired && stage.areaRole === 'boss';

    return {
      camera,
      physics,
      renderer,
      player,
      nano,
      residents: ResidentFactory.createAll(stage.residents || [], difficulty.residentSpeed, difficulty.residentHpBonus),
      items: (stage.items || []).map(item => new Item({
        ...item,
        acquired: item.kind === 'dreamDrop' && dreamDropAcquired,
        collectDisabled: item.kind === 'dreamDrop' && dreamDropAcquired,
      })),
      goal,
      boss: BossFactory.create(stage.boss, difficulty.damageScale),
      projectiles: [],
    };
  }

  static createNanoCompanion(app, player) {
    return new NanoCompanion({ player, input: app.input });
  }
}
