/**
 * 責務: StageRuntimeが持つ実行状態をHUD表示用のstateへ変換する。
 * 更新ルール: HUDの常時更新項目はここで集約し、ステージ名など一度きりの演出タイミングはRuntime初期化側で制御する。
 */
export function updateStageHud(runtime) {
  const perf = runtime.app.performanceReporter;
  const startedAt = perf ? performance.now() : 0;
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
  });
  if (perf) perf.recordPhase('hud.update', performance.now() - startedAt);
}
