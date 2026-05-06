/**
 * 責務: StageRuntimeが持つ実行状態をHUD表示用のstateへ変換する。
 * 更新ルール: HUDの表示項目追加はここで集約し、update本体に表示用オブジェクト生成を戻さない。
 */
export function updateStageHud(runtime) {
  runtime.hud.update({
    hp: runtime.player.hp,
    maxHp: runtime.player.maxHp,
    coins: runtime.coins,
    teacups: runtime.teacups,
    time: runtime.elapsed,
    magicRate: runtime.player.magic.readyRate,
    magicReady: runtime.player.magic.cooldown <= 0,
    bowRate: runtime.player.bow.readyRate,
    bowReady: runtime.player.bow.cooldown <= 0,
    teaRate: runtime.player.tea.readyRate,
    teaReady: runtime.player.tea.cooldown <= 0 && runtime.teacups > 0,
    teaBoosting: runtime.player.tea.boostTimer > 0,
    balloonRide: runtime.balloonRideSystem?.getHudState?.(),
    stageName: `${runtime.stage.name}`,
  });
}
