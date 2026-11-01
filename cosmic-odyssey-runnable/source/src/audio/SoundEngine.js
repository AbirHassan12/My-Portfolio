// Procedural ambient score + UI sounds (Web Audio, no files). OFF by default; starts only after a user click.
const CHORDS = [[55, 82.4, 110], [49, 73.4, 98], [65.4, 98, 130.8], [55, 82.4, 123.5], [43.7, 65.4, 87.3], [55, 69.3, 82.4]]   // one drone chord per story chapter
const PENTA = [1, 1.125, 1.25, 1.5, 1.667, 2]

export class SoundEngine {
  on = false; ctx = null; chapter = 0
  #init() {
    const c = this.ctx = new (window.AudioContext || window.webkitAudioContext)()
    this.master = c.createGain(); this.master.gain.value = 0; this.master.connect(c.destination)
    this.filter = c.createBiquadFilter(); this.filter.type = 'lowpass'; this.filter.frequency.value = 450; this.filter.Q.value = 3
    this.pan = c.createStereoPanner(); this.filter.connect(this.pan); this.pan.connect(this.master)
    this.voices = CHORDS[0].flatMap(f => ['sawtooth', 'sine'].map((type, j) => {
      const o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.value = f; o.detune.value = j ? 0 : 7; g.gain.value = j ? .07 : .018
      o.connect(g); g.connect(this.filter); o.start(); return o
    }))
    const lfo = c.createOscillator(), lg = c.createGain(); lfo.frequency.value = .07; lg.gain.value = 160; lfo.connect(lg); lg.connect(this.filter.frequency); lfo.start()
    const nb = c.createBuffer(1, c.sampleRate * 2, c.sampleRate), d = nb.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
    this.noiseBuf = nb; const ns = c.createBufferSource(); ns.buffer = nb; ns.loop = true
    const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1800; bp.Q.value = .6; const ng = c.createGain(); ng.gain.value = .01
    ns.connect(bp); bp.connect(ng); ng.connect(this.master); ns.start()
    this.timer = setInterval(() => this.#ping(), 5200)
  }
  async toggle() {
    if (!this.ctx) this.#init()
    this.on = !this.on; const now = this.ctx.currentTime
    if (this.on) { await this.ctx.resume(); this.master.gain.cancelScheduledValues(now); this.master.gain.setTargetAtTime(.55, now, 1.2) }
    else { this.master.gain.setTargetAtTime(0, now, .4); setTimeout(() => !this.on && this.ctx.suspend(), 1500) }
    return this.on
  }
  setChapter(i) {
    this.chapter = i; if (!this.on) return; const now = this.ctx.currentTime
    this.voices.forEach((o, j) => o.frequency.setTargetAtTime(CHORDS[i][j >> 1], now, 1.4)); this.tone(CHORDS[i][2] * 4, 1.8, 'sine', .05)
  }
  setProgress(p, v = 0) { if (this.on) this.filter.frequency.setTargetAtTime(350 + p * 900 + Math.min(Math.abs(v), 3000) / 3000 * 700, this.ctx.currentTime, .3) }
  setMouse(x) { if (this.on) this.pan.pan.setTargetAtTime(x * .6, this.ctx.currentTime, .2) }
  tone(f, dur = .15, type = 'sine', vol = .06, when = 0) {
    if (!this.on) return; const c = this.ctx, t = c.currentTime + when, o = c.createOscillator(), g = c.createGain()
    o.type = type; o.frequency.value = f; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + dur)
    o.connect(g); g.connect(this.master); o.start(t); o.stop(t + dur + .05)
  }
  #ping() { if (this.on && !document.hidden) this.tone(CHORDS[this.chapter][1] * 4 * PENTA[(Math.random() * PENTA.length) | 0], 2.5, 'sine', .035) }
  hover() { this.tone(1300, .06, 'sine', .035) }
  click() { this.tone(520, .14, 'triangle', .07) }
  chime() { [523, 659, 784, 1047].forEach((f, i) => this.tone(f, .5, 'sine', .06, i * .09)) }
  warp() {
    if (!this.on) return; const c = this.ctx, t = c.currentTime, s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain()
    s.buffer = this.noiseBuf; f.type = 'bandpass'; f.Q.value = 2; f.frequency.setValueAtTime(200, t); f.frequency.exponentialRampToValueAtTime(5000, t + .8)
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.35, t + .5); g.gain.exponentialRampToValueAtTime(.001, t + 1.5)
    s.connect(f); f.connect(g); g.connect(this.master); s.start(t); s.stop(t + 1.6); this.tone(60, 1.4, 'sine', .2)
  }
}
