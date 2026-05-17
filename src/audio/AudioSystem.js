/**
 * 責務: ゲーム全体から使う音声APIの窓口として、BGM/SE/設定適用を各音声モジュールへ委譲する。
 * 更新ルール: playBgm/stopBgm/fadeOutBgm/playSfx/applySettings/resume/update を公開APIとして維持し、曲データと発音処理は専用ファイルへ分離する。
 * 更新ルール: 負荷詳細レポートはsetPerformanceReporterでBGM側へ渡し、通常再生中に取得関数呼び出しを挟まない。
 */
import { AudioContextGraph } from './AudioContextGraph.js';
import { BgmTrackPlayer } from './bgm/BgmTrackPlayer.js';
import { SfxPlayer } from './SfxPlayer.js';
import { resolveBgmTrack } from '../data/audio/bgmTrackDefs.js';

export class AudioSystem {
  constructor(save, performanceReporter = null) {
    this.save = save;
    this.graph = new AudioContextGraph(save);
    this.bgmPlayer = new BgmTrackPlayer(() => this.ctx, () => this.bgmGain, performanceReporter);
    this.sfxPlayer = new SfxPlayer(() => this.ctx, () => this.sfxGain);
  }

  get ctx() { return this.graph.ctx; }
  get master() { return this.graph.master; }
  get bgmGain() { return this.graph.bgmGain; }
  get sfxGain() { return this.graph.sfxGain; }

  ensure() { this.graph.ensure(); }

  setPerformanceReporter(performanceReporter = null) {
    this.bgmPlayer.setPerformanceReporter(performanceReporter);
  }

  resume() {
    this.ensure();
    const resumed = this.ctx?.resume?.();
    resumed?.catch?.(() => {});
  }

  applySettings(settingsOverride = null) { this.graph.applySettings(settingsOverride); }
  update() { this.bgmPlayer.update(); }
  playBgm(id) { this.resume(); this.bgmPlayer.play(resolveBgmTrack(id)); }
  stopBgm(fadeSeconds = undefined) { this.bgmPlayer.stop(fadeSeconds); }
  fadeOutBgm(fadeSeconds = undefined) { this.stopBgm(fadeSeconds); }

  playSfx(type = 'ui_decide') {
    this.resume();
    this.sfxPlayer.play(type);
  }
}
