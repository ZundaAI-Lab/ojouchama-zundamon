/**
 * 責務: なのちゃん救出イベントの設定IDごとの演出、会話定義を担当する。
 * 更新ルール: 救出イベントのトリガー座標はステージデータのspecialEventsで管理し、この設定では呼び出された後の演出・会話だけを扱う。
 */

export const NANO_RESCUE_STORY_FLAG = 'nanoJoined';

export const NANO_RESCUE_EVENT_CONFIGS = {
  candyDomeNanoRescue: {
    id: 'candyDomeNanoRescue',
    trappedImageKey: 'event_nano_candy_dome_trapped',
    brokenImageKey: 'event_nano_candy_dome_broken',
    breakingTime: 0.62,
    revealWaitTime: 0.5,
    revealJumpTime: 0.36,
    revealJumpHoldTime: 0.5,
    meetDialogueWaitTime: 1.0,
    mountTime: 0.74,
    mountHoldTime: 1.0,
    releasedRunSpeed: 285,
    meetSpeed: 210,
    nanoDraw: {
      w: 36,
      h: 36,
    },
    revealDialogue: [
      { portrait: 'portrait_nano_surprise', speaker: '？？？', text: 'なのだ！' },
    ],
    preMountDialogue: [
      { portrait: 'portrait_smile', speaker: 'お嬢ちゃまずんだもん', text: 'あなたは、だあれ？' },
      { portrait: 'portrait_nano_surprise', speaker: '？？？', text: 'なのだ！' },
      { portrait: 'portrait_surprise', speaker: 'お嬢ちゃまずんだもん', text: 'なのだ……？' },
      { portrait: 'portrait_gentle', speaker: 'お嬢ちゃまずんだもん', text: 'そう！あなたは、なのちゃんね！' },
      { portrait: 'portrait_nano_neutral', speaker: 'なのちゃん？', text: 'なのだ？' },
      { portrait: 'portrait_smile', speaker: 'お嬢ちゃまずんだもん', text: 'ずんだもんはね、ずんだもんなの。' },
      { portrait: 'portrait_determined', speaker: 'お嬢ちゃまずんだもん', text: 'これから困っている人たちを助けに行くの！' },
      { portrait: 'portrait_nano_laugh', speaker: 'なのちゃん？', text: 'なのだ！' },
    ],
    postMountDialogue: [
      { portrait: 'portrait_gentle', speaker: 'お嬢ちゃまずんだもん', text: 'あなたも一緒に行くの？ふふ、よろしくね！' },
    ],
  },
};

export function getNanoRescueEventConfig(configId) {
  return NANO_RESCUE_EVENT_CONFIGS[configId] || null;
}
