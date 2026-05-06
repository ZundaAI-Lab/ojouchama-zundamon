/**
 * 責務: BGMトラック定義で使うイベント生成補助を提供する。
 * 更新ルール: WebAudio発音やゲーム状態を持たず、純粋なイベント配列生成だけを扱う。
 */
export function line(bpb, instrument, rows) {
  return rows.map(([bar, beat, note, dur = 1, velocity = 0.75]) => ({
    t: bar * bpb + beat,
    n: note,
    d: dur,
    i: instrument,
    v: velocity,
  }));
}

export function chords(bpb, instrument, rows) {
  return rows.map(([bar, beat, notes, dur = 1, velocity = 0.42]) => ({
    t: bar * bpb + beat,
    n: notes,
    d: dur,
    i: instrument,
    v: velocity,
  }));
}

export function pulseBass(bpb, roots, instrument = 'bass', beats = [0, 2], dur = 0.72, velocity = 0.48) {
  return roots.flatMap((root, bar) => beats.map((beat, index) => ({
    t: bar * bpb + beat,
    n: Array.isArray(root) ? root[index % root.length] : root,
    d: dur,
    i: instrument,
    v: velocity,
  })));
}

export function waltzBass(roots, instrument = 'bass', velocity = 0.45) {
  return roots.flatMap((root, bar) => [
    { t: bar * 3, n: root, d: 0.72, i: instrument, v: velocity },
    { t: bar * 3 + 1, n: root.replace(/([0-9])$/, (_, octave) => String(Number(octave) + 1)), d: 0.42, i: instrument, v: velocity * 0.62 },
    { t: bar * 3 + 2, n: root.replace(/([0-9])$/, (_, octave) => String(Number(octave) + 1)), d: 0.42, i: instrument, v: velocity * 0.62 },
  ]);
}

export function arpeggio(bpb, chordList, instrument = 'arp', beats = [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5], dur = 0.26, velocity = 0.34) {
  return chordList.flatMap((notes, bar) => beats.map((beat, index) => ({
    t: bar * bpb + beat,
    n: notes[index % notes.length],
    d: dur,
    i: instrument,
    v: velocity,
  })));
}

export function drums4(bars, style = 'soft') {
  const events = [];
  for (let bar = 0; bar < bars; bar += 1) {
    events.push({ t: bar * 4, n: 'kick', d: 0.2, i: 'kick', v: style === 'battle' ? 0.8 : 0.45 });
    events.push({ t: bar * 4 + 2, n: 'snare', d: 0.2, i: 'snare', v: style === 'battle' ? 0.62 : 0.32 });
    if (style !== 'dream') {
      events.push({ t: bar * 4 + 1.5, n: 'hat', d: 0.08, i: 'hat', v: 0.16 });
      events.push({ t: bar * 4 + 3.5, n: 'hat', d: 0.08, i: 'hat', v: 0.18 });
    }
    if (style === 'battle') {
      events.push({ t: bar * 4 + 1, n: 'kick', d: 0.16, i: 'kick', v: 0.46 });
      events.push({ t: bar * 4 + 3, n: 'kick', d: 0.16, i: 'kick', v: 0.54 });
      events.push({ t: bar * 4 + 0.5, n: 'hat', d: 0.06, i: 'hat', v: 0.22 });
      events.push({ t: bar * 4 + 2.5, n: 'hat', d: 0.06, i: 'hat', v: 0.22 });
    }
  }
  return events;
}

export function waltzPerc(bars) {
  const events = [];
  for (let bar = 0; bar < bars; bar += 1) {
    events.push({ t: bar * 3, n: 'kick', d: 0.18, i: 'kick', v: 0.38 });
    events.push({ t: bar * 3 + 1, n: 'hat', d: 0.08, i: 'hat', v: 0.16 });
    events.push({ t: bar * 3 + 2, n: 'hat', d: 0.08, i: 'hat', v: 0.14 });
  }
  return events;
}

export function sorted(...groups) {
  return groups.flat().sort((a, b) => a.t - b.t);
}
