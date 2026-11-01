import gsap from 'gsap'
import { projects } from '../data/projects.js'
import { $, esc } from './content.js'
// Constellation + filters + card list + detail modal (prev/next, focus trap, Esc to close).
const POS = [[130, 90], [300, 220], [450, 90], [620, 230], [690, 80], [200, 300], [540, 310], [380, 330]]
export function initProjects(audio, reduced) {
  let filter = null, cur = 0, lastF = null; const svg = $('#const'), modal = $('#modal')
  const ok = p => !filter || p.t.includes(filter)
  const draw = () => {
    const L = projects.map((p, i) => ({ p, i, x: POS[i % 8][0], y: POS[i % 8][1], on: ok(p) }))
    svg.innerHTML = L.slice(0, -1).map((o, i) => `<line data-a="${i}" data-b="${i + 1}" x1="${o.x}" y1="${o.y}" x2="${L[i + 1].x}" y2="${L[i + 1].y}"/>`).join('') +
      L.map(o => `<g class="s" tabindex="0" role="button" aria-label="Open project: ${esc(o.p.n)}" data-i="${o.i}" opacity="${o.on ? 1 : .2}"><circle cx="${o.x}" cy="${o.y}" r="8" fill="${o.i % 2 ? '#00D9FF' : '#B18CFF'}"/><text x="${o.x}" y="${o.y - 18}" text-anchor="middle">${esc(o.p.n)}</text></g>`).join('')
    $('#cards').innerHTML = projects.map((p, i) => ok(p) ? `<button class="glass card" data-i="${i}"><small>PROJECT ${String(i + 1).padStart(2, '0')}</small><h3>${esc(p.n)}</h3><p>${p.t.map(esc).join(' · ')}</p></button>` : '').join('')
    const all = [...new Set(projects.flatMap(p => p.t))]
    $('#chips').innerHTML = ['ALL', ...all].map(t => `<button class="chip ${(t === 'ALL' && !filter) || t === filter ? 'on' : ''}" data-t="${esc(t)}">${esc(t)}</button>`).join('')
  }
  const closeM = () => { modal.classList.remove('open'); lastF && lastF.focus && lastF.focus() }
  const show = i => {
    const n = projects.length; cur = (i + n) % n; const p = projects[cur]
    $('#mbox').innerHTML = `<div class="lab">PROJECT ${String(cur + 1).padStart(2, '0')}</div><h3 style="font-size:28px">${esc(p.n)}</h3><p style="color:var(--cy)">${esc(p.status)}</p>` +
      (p.shot ? `<img src="${esc(p.shot)}" alt="" style="width:100%;border-radius:12px">` : '<div class="ph">Screenshot not added yet</div>') +
      `<p style="color:var(--tx2)">${esc(p.desc || 'Add a description in src/data/projects.js.')}</p><p>${p.t.map(t => `<span class="chip on">${esc(t)}</span> `).join('')}</p>` +
      `<div class="row">${p.github ? `<a class="btn" target="_blank" rel="noopener" href="${esc(p.github)}">GITHUB</a>` : ''}${p.demo ? `<a class="btn alt" target="_blank" rel="noopener" href="${esc(p.demo)}">LIVE DEMO</a>` : ''}${!p.github && !p.demo ? '<span class="hint">No links added yet.</span>' : ''}</div>` +
      '<div class="row" style="justify-content:space-between"><button class="chip" id="pv">← PREV</button><button class="chip" id="cl">CLOSE</button><button class="chip" id="nx">NEXT →</button></div>'
    if (!modal.classList.contains('open')) lastF = document.activeElement
    modal.classList.add('open'); $('#cl').focus(); $('#pv').onclick = () => show(cur - 1); $('#nx').onclick = () => show(cur + 1); $('#cl').onclick = closeM
    audio.chime(); if (!reduced) gsap.from('#mbox', { y: 30, opacity: 0, duration: .4 })
  }
  $('#chips').onclick = e => { const c = e.target.closest('.chip'); if (c) { filter = c.dataset.t === 'ALL' ? null : c.dataset.t; draw() } }
  $('#cards').onclick = e => { const c = e.target.closest('.card'); if (c) show(+c.dataset.i) }
  const open = e => { const g = e.target.closest('.s'); if (g) show(+g.dataset.i) }
  svg.addEventListener('click', open); svg.addEventListener('keydown', e => { if (e.key === 'Enter') open(e) })
  svg.addEventListener('mouseover', e => { const g = e.target.closest('.s'); if (g) svg.querySelectorAll('line').forEach(l => l.classList.toggle('hot', +l.dataset.a === +g.dataset.i || +l.dataset.b === +g.dataset.i)) })
  svg.addEventListener('mouseout', () => svg.querySelectorAll('line').forEach(l => l.classList.remove('hot')))
  modal.onclick = e => { if (e.target === modal) closeM() }
  addEventListener('keydown', e => {
    if (!modal.classList.contains('open')) return; if (e.key === 'Escape') closeM()
    if (e.key === 'Tab') { const f = [...$('#mbox').querySelectorAll('a,button')]; if (!f.length) return; const a = f[0], z = f[f.length - 1]; if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus() } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus() } }
  })
  draw()
}
