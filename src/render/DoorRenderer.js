/**
 * 責務: 複数扉の開閉状態に応じた描画を担当する。
 * 更新ルール: 開閉判定と衝突状態はSwitchTargetSystem/CollisionWorldBuilderへ置き、ここでは見た目だけを扱う。
 */
import { drawSprite, roundedRect } from './drawSprite.js';
import { isCarrotClockDoor } from '../stage/CarrotClockDoorSystem.js';
import { renderCarrotClockDoor } from './CarrotClockDoorRenderer.js';

export class DoorRenderer {
  constructor(app) {
    this.app = app;
  }

  render(ctx, doors = []) {
    for (const door of doors) this.renderDoor(ctx, door);
  }

  renderDoor(ctx, door) {
    if (isCarrotClockDoor(door)) {
      renderCarrotClockDoor(this, ctx, door);
      return;
    }
    const img = this.app.assets.getImage(door.imageKey || 'door_bow');
    ctx.save();
    ctx.globalAlpha = door.open ? 0.28 : 1;
    if (img) {
      const visualH = door.h + 18;
      const visualW = visualH * (img.width / img.height);
      const x = door.x + door.w / 2 - visualW / 2;
      const y = door.y + door.h - visualH;
      drawSprite(ctx, img, x, y, visualW, visualH);
    } else {
      roundedRect(ctx, door.x, door.y, door.w, door.h, 12);
      ctx.fillStyle = door.open ? '#d2f2d7' : '#f7d6e4';
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = door.open ? '#8bc89d' : '#dd95b2';
      ctx.stroke();
    }
    if (door.blockedByActor) {
      ctx.fillStyle = 'rgba(255,255,255,0.65)';
      roundedRect(ctx, door.x + 8, door.y + 8, door.w - 16, 8, 4);
      ctx.fill();
    }
    ctx.restore();
  }
}
