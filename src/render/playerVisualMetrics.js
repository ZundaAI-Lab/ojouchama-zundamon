/**
 * 責務: プレイヤー描画で使う歩行フレーム・描画サイズ・上下揺れ量を共通計算する。
 * 更新ルール: プレイヤーの見た目に連動する別キャラはこの関数を参照し、Rendererごとに同じ上下揺れ・左右反転を重複実装しない。特定アセットだけの反転特例は置かず、画像向きはアセット側でそろえる。
 */
import { PLAYER_CONFIG } from '../config/playerConfig.js';
import { clamp } from '../utils/math.js';

export const PLAYER_WALK_FRAMES = ['hero_walk_1', 'hero_walk_2', 'hero_walk_3', 'hero_walk_4', 'hero_walk_3', 'hero_walk_2'];

export function getPlayerVisualMetrics(scene, player) {
  const baseImageKey = player.stateMachine.imageKey;
  const isWalking = player.stateMachine.current === 'walk' && player.onGround;
  const walkSpeedRate = clamp(Math.abs(player.vx) / PLAYER_CONFIG.MOVE_SPEED, 0.45, 1.15);
  const walkFrameIndex = isWalking ? Math.floor(scene.elapsed * 9.5 * walkSpeedRate) % PLAYER_WALK_FRAMES.length : 0;
  const imgKey = isWalking ? PLAYER_WALK_FRAMES[walkFrameIndex] : baseImageKey;
  const drawW = baseImageKey === 'hero_tea' ? 76 : player.drawW;
  const drawH = baseImageKey === 'hero_tea' ? 72 : player.drawH;
  const walkBob = isWalking ? Math.abs(Math.sin(scene.elapsed * 9.5 * walkSpeedRate * Math.PI)) * -1.15 : 0;
  const idleBob = player.onGround && !isWalking ? Math.sin(scene.elapsed * 10) * 0.5 : 0;
  const bobY = walkBob + idleBob;
  const flipX = player.facing < 0;
  const damageAlpha = player.invincibleTimer > 0 && Math.floor(player.invincibleTimer * 14) % 2 === 0 ? 0.45 : 1;
  return {
    baseImageKey,
    isWalking,
    walkSpeedRate,
    walkFrameIndex,
    imgKey,
    drawW,
    drawH,
    bobY,
    flipX,
    damageAlpha,
    drawX: player.x - (drawW - player.w) / 2,
    drawY: player.y - (drawH - player.h) + bobY,
  };
}
