/**
 * 責務: ゲーム本体から参照するBGMトラックIDと曲データの対応、場面別の既定曲を定義する。
 * 更新ルール: 曲の実イベントは bgm/tracks/ に置き、Scene/Stage側はここで公開するIDと解決関数だけを参照する。
 */
import world1CandyForest from './bgm/tracks/world1_candy_forest.js';
import world2TeacupCastle from './bgm/tracks/world2_teacup_castle.js';
import world3RibbonGarden from './bgm/tracks/world3_ribbon_garden.js';
import world4PlushCloudSky from './bgm/tracks/world4_plush_cloud_sky.js';
import world5MidnightStoryHall from './bgm/tracks/world5_midnight_story_hall.js';
import world6DreamingBeanstalk from './bgm/tracks/world6_dreaming_beanstalk.js';
import bossBattle from './bgm/tracks/boss_battle.js';
import finalBossBattle from './bgm/tracks/final_boss_battle.js';
import nanoTheme from './bgm/tracks/nano_theme.js';
import titleTheme from './bgm/tracks/title_theme.js';
import stageSelect from './bgm/tracks/stage_select.js';

export const TITLE_BGM_ID = 'title-theme';
export const MENU_BGM_ID = 'stage-select';
export const BOSS_BGM_ID = 'boss-battle';
export const FINAL_BOSS_BGM_ID = 'final-boss-battle';
export const NANO_THEME_BGM_ID = 'nano-theme';

const TRACKS = [
  titleTheme,
  stageSelect,
  world1CandyForest,
  world2TeacupCastle,
  world3RibbonGarden,
  world4PlushCloudSky,
  world5MidnightStoryHall,
  world6DreamingBeanstalk,
  nanoTheme,
  bossBattle,
  finalBossBattle,
];

export const BGM_TRACK_DEFS = Object.freeze(Object.fromEntries(TRACKS.map(track => [track.id, track])));
export const BGM_IDS = Object.freeze(TRACKS.map(track => track.id));

export const STAGE_BGM_BY_WORLD_INDEX = Object.freeze({
  0: 'world1-candy-forest',
  1: 'world2-teacup-castle',
  2: 'world3-ribbon-garden',
  3: 'world4-plush-cloud-sky',
  4: 'world5-midnight-story-hall',
  5: 'world6-dreaming-beanstalk',
});

export function resolveBgmTrack(id = MENU_BGM_ID) {
  return BGM_TRACK_DEFS[id] || BGM_TRACK_DEFS[MENU_BGM_ID];
}

export function resolveStageBgmId(stage = {}) {
  if (stage.bgm && BGM_TRACK_DEFS[stage.bgm]) return stage.bgm;
  return STAGE_BGM_BY_WORLD_INDEX[stage.worldIndex] || STAGE_BGM_BY_WORLD_INDEX[0];
}

export function resolveBossBgmId(stage = {}) {
  return stage.worldIndex === 5 ? FINAL_BOSS_BGM_ID : BOSS_BGM_ID;
}
