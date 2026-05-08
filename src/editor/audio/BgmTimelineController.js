/**
 * 責務: BGMイベントタイムラインのHTML生成とドラッグ編集を管理する。
 * 更新ルール: 楽曲フォーム全体の保存処理はBgmEditorPanelへ置く。
 */
import { $, escapeHtml, eventLabel, noteText, roundToGrid, sectionBeatLength, timelineInstrumentIds } from './audioEditorFormUtils.js';

export const bgmTimelineControllerMethods = {
renderBgmTimeline(track) {
    const sectionName = this.selectedSectionName;
    const events = track.sections?.[sectionName] || [];
    const instruments = timelineInstrumentIds(track);
    const totalBeats = sectionBeatLength(track, sectionName);
    const beats = Array.from({ length: Math.ceil(totalBeats) + 1 }, (_, beat) => beat);
    const lanes = instruments.map(instrumentId => {
      const laneEvents = events.map((event, index) => ({ event, index })).filter(item => item.event.i === instrumentId);
      return `<div class="timeline-lane" data-lane="${escapeHtml(instrumentId)}">
        <div class="timeline-lane-label">${escapeHtml(instrumentId)}</div>
        <div class="timeline-lane-track">
          ${laneEvents.map(({ event, index }) => {
            const left = Math.max(0, Math.min(100, (Number(event.t) / totalBeats) * 100));
            const width = Math.max(1.5, Math.min(100 - left, (Number(event.d) / totalBeats) * 100));
            return `<button type="button" class="timeline-event${index === this.selectedEventIndex ? ' is-selected' : ''}" data-event-index="${index}" style="left:${left}%;width:${width}%" title="${escapeHtml(eventLabel(event))}">
              <span>${escapeHtml(noteText(event.n))}</span>
            </button>`;
          }).join('')}
        </div>
      </div>`;
    }).join('');

    return `<div class="bgm-timeline-shell">
      <div class="bgm-timeline-ruler" aria-hidden="true">
        <div class="timeline-lane-label">beat</div>
        <div class="timeline-lane-track">
          ${beats.map(beat => `<span class="timeline-beat" style="left:${Math.min(100, (beat / totalBeats) * 100)}%">${beat}</span>`).join('')}
        </div>
      </div>
      <div class="bgm-timeline" data-total-beats="${totalBeats}">${lanes}</div>
    </div>`;
  },

startTimelineDrag(pointerEvent, button) {
    if (pointerEvent.button !== 0) return;
    const trackEl = button.closest('.timeline-lane-track');
    const totalBeats = Number(button.closest('.bgm-timeline')?.dataset.totalBeats || 1);
    const index = Number(button.dataset.eventIndex);
    const events = this.currentBgmDef().sections?.[this.selectedSectionName] || [];
    const event = events[index];
    if (!trackEl || !event) return;
    this.timelineDrag = {
      button,
      index,
      startX: pointerEvent.clientX,
      originalT: Number(event.t) || 0,
      width: Math.max(1, trackEl.getBoundingClientRect().width),
      totalBeats,
      moved: false,
    };
    button.setPointerCapture(pointerEvent.pointerId);
    const move = moveEvent => this.moveTimelineDrag(moveEvent);
    const up = upEvent => {
      this.endTimelineDrag(upEvent);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  },

moveTimelineDrag(pointerEvent) {
    const drag = this.timelineDrag;
    if (!drag) return;
    const delta = pointerEvent.clientX - drag.startX;
    if (Math.abs(delta) > 3) drag.moved = true;
    const grid = Number($('[name="eventGrid"]', this.root)?.value || 0.25);
    const nextT = roundToGrid(drag.originalT + (delta / drag.width) * drag.totalBeats, grid);
    const events = this.currentBgmDef().sections?.[this.selectedSectionName] || [];
    if (!events[drag.index]) return;
    events[drag.index].t = Math.min(Math.max(0, nextT), drag.totalBeats);
    this.selectedEventIndex = drag.index;
    const left = Math.max(0, Math.min(100, (events[drag.index].t / drag.totalBeats) * 100));
    drag.button.style.left = `${left}%`;
    const timeInput = $('[name="eventTime"]', this.root);
    if (timeInput) timeInput.value = String(events[drag.index].t);
  },

endTimelineDrag() {
    const drag = this.timelineDrag;
    if (!drag) return;
    drag.button.dataset.dragged = drag.moved ? '1' : '0';
    this.timelineDrag = null;
    this.commitBgmForm();
    this.renderListsAndValidation();
  }
};
