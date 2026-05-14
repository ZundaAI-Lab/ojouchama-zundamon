/**
 * 責務: sound-editor.htmlのサウンドエディタUIを統括し、BGM/SE編集パネルと入出力処理を接続する。
 * 更新ルール: BGMフォーム、BGMタイムライン、SFXフォーム、一覧表示、共通フォーム変換は責務別モジュールへ委譲する。
 */
import { BGM_TRACK_DEFS } from '../../data/audio/bgmTrackDefs.js';
import { SFX_DEFS } from '../../data/audio/sfxDefs.js';
import { deepClone } from '../../data/audio/audioSchema.js';
import { AudioEditorPreviewBridge } from './audioEditorPreviewBridge.js';
import { bgmTrackOutputPath, downloadText, serializeBgmTrackDef, serializeSfxCategoryDefs, sfxCategoryOutputPath } from './audioEditorSerializer.js';
import { bgmEditorPanelMethods } from './BgmEditorPanel.js';
import { bgmTimelineControllerMethods } from './BgmTimelineController.js';
import { audioEditorListPanelMethods } from './AudioEditorListPanel.js';
import { sfxEditorPanelMethods } from './SfxEditorPanel.js';
import { $, ensureBgmShape, firstInstrumentId, firstSectionName } from './audioEditorFormUtils.js';
import { createSfxCategoryMap, defsForSfxCategory, sfxCategoryForId } from './audioEditorSfxCategories.js';


export class AudioEditorApp {
  constructor(root) {
    this.root = root;
    this.mode = 'bgm';
    this.bgmDefs = Object.fromEntries(Object.entries(BGM_TRACK_DEFS).map(([id, track]) => [id, ensureBgmShape(track)]));
    this.sfxDefs = deepClone(SFX_DEFS);
    this.sfxCategoryById = createSfxCategoryMap();
    this.selectedBgmId = Object.keys(this.bgmDefs)[0];
    this.selectedSfxId = Object.keys(this.sfxDefs)[0];
    this.selectedSectionName = firstSectionName(this.currentBgmDef());
    this.selectedInstrumentId = firstInstrumentId(this.currentBgmDef());
    this.selectedEventIndex = 0;
    this.selectedVoiceIndex = 0;
    this.timelineDrag = null;
    this.preview = new AudioEditorPreviewBridge();
  }

  init() {
    this.bindStaticActions();
    this.render();
  }

  bindStaticActions() {
    $('#tab-bgm', this.root).addEventListener('click', () => this.switchMode('bgm'));
    $('#tab-sfx', this.root).addEventListener('click', () => this.switchMode('sfx'));
    $('#new-audio-btn', this.root).addEventListener('click', () => this.createCurrent());
    $('#clone-audio-btn', this.root).addEventListener('click', () => this.cloneCurrent());
    $('#delete-audio-btn', this.root).addEventListener('click', () => this.deleteCurrent());
    $('#preview-audio-btn', this.root).addEventListener('click', () => this.previewCurrent());
    $('#stop-preview-btn', this.root).addEventListener('click', () => this.preview.stop());
    $('#export-bgm-btn', this.root).addEventListener('click', () => this.exportBgm());
    $('#export-sfx-btn', this.root).addEventListener('click', () => this.exportSfx());
    $('#download-output-btn', this.root).addEventListener('click', () => this.downloadOutput());
    $('#copy-output-btn', this.root).addEventListener('click', () => navigator.clipboard?.writeText($('#audio-export-output', this.root).value));
  }

  switchMode(mode) {
    if (this.mode === mode) return;
    this.commitCurrentForm();
    this.mode = mode;
    this.preview.stop();
    this.render();
  }

  currentBgmDef() {
    return this.bgmDefs[this.selectedBgmId];
  }

  currentSfxDef() {
    return this.sfxDefs[this.selectedSfxId];
  }

  currentDef() {
    return this.mode === 'bgm' ? this.currentBgmDef() : this.currentSfxDef();
  }

  createCurrent() {
    if (this.mode === 'bgm') return this.createBgm();
    return this.createSfx();
  }

  cloneCurrent() {
    if (this.mode === 'bgm') return this.cloneBgm();
    return this.cloneSfx();
  }

  deleteCurrent() {
    if (this.mode === 'bgm') return this.deleteBgm();
    return this.deleteSfx();
  }

  previewCurrent() {
    this.commitCurrentForm();
    if (this.mode === 'bgm') this.preview.playBgm(this.currentBgmDef(), this.selectedSectionName);
    else this.preview.playSfx(this.currentSfxDef());
  }

  previewSelectedTimelineEvent() {
    this.commitBgmForm();
    const track = this.currentBgmDef();
    const events = track?.sections?.[this.selectedSectionName] || [];
    if (this.selectedEventIndex === null || !events[this.selectedEventIndex]) return;
    this.preview.playBgmEvent(track, this.selectedSectionName, this.selectedEventIndex);
  }

  exportBgm() {
    this.commitCurrentForm();
    const track = this.currentBgmDef();
    $('#audio-export-path', this.root).textContent = bgmTrackOutputPath(track);
    $('#audio-export-output', this.root).value = serializeBgmTrackDef(track);
  }

  exportSfx() {
    this.commitCurrentForm();
    const categoryId = sfxCategoryForId(this.sfxCategoryById, this.selectedSfxId);
    const categoryDefs = defsForSfxCategory(this.sfxDefs, this.sfxCategoryById, categoryId);
    $('#audio-export-path', this.root).textContent = sfxCategoryOutputPath(categoryId);
    $('#audio-export-output', this.root).value = serializeSfxCategoryDefs(categoryId, categoryDefs);
  }

  downloadOutput() {
    const output = $('#audio-export-output', this.root).value;
    const path = $('#audio-export-path', this.root).textContent;
    if (!output || !path) return;
    downloadText(path.split('/').pop(), output);
  }

  commitCurrentForm() {
    if (this.mode === 'bgm') this.commitBgmForm();
    else this.commitSfxForm();
    this.renderListsAndValidation();
  }

  render() {
    $('#tab-bgm', this.root).classList.toggle('is-active', this.mode === 'bgm');
    $('#tab-sfx', this.root).classList.toggle('is-active', this.mode === 'sfx');
    $('#tab-bgm', this.root).setAttribute('aria-selected', String(this.mode === 'bgm'));
    $('#tab-sfx', this.root).setAttribute('aria-selected', String(this.mode === 'sfx'));
    this.renderListsAndValidation();
    if (this.mode === 'bgm') this.renderBgmEditor();
    else this.renderSfxEditor();
  }


}

Object.assign(
  AudioEditorApp.prototype,
  audioEditorListPanelMethods,
  bgmTimelineControllerMethods,
  bgmEditorPanelMethods,
  sfxEditorPanelMethods,
);
