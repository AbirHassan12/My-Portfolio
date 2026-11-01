import { profile as P } from '../data/profile.js'
import { skills } from '../data/skills.js'
import { timeline } from '../data/timeline.js'
export const $ = s => document.querySelector(s)
export const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))
const tl = a => a.map(x => `<div class="n"><small>${esc(x.k)}</small><h3>${esc(x.t)}</h3><p>${esc(x.d)}</p></div>`).join('')
const HOLO0 = '<span class="hint">Select a planet to open its holographic panel.</span>'

export function renderContent(audio) {
  $('#hname').textContent = P.heroName; $('#htag').textContent = P.tagline; $('#hdesc').textContent = P.description
  $('#hchips').innerHTML = P.focusAreas.map(x => `<span>${esc(x)}</span>`).join('')
  $('#abt').innerHTML = P.about.map(p => `<p>${esc(p)}</p>`).join('') + '<p class="sg" style="color:var(--cy)">Name: Abir Hassan.</p>'
  $('#focus').innerHTML = P.focus.map(f => `<div class="glass rv"><h3>${esc(f.t)}</h3><p>${esc(f.d)}</p></div>`).join('')
  $('#aboutTl').innerHTML = tl(timeline.slice(0, 2)); $('#expTl').innerHTML = tl(timeline)
  $('#yr').textContent = new Date().getFullYear()

  // skills: one planet per category
  const holo = $('#holo'); holo.innerHTML = HOLO0
  $('#planets').innerHTML = skills.map((s, i) => `<button class="pl" aria-pressed="false" data-i="${i}" style="--a:${s.a};--b:${s.b};--g:${s.a}88;animation-delay:${-i * .8}s">${esc(s.t)}</button>`).join('')
  $('#planets').onclick = e => {
    const b = e.target.closest('.pl'); if (!b) return
    document.querySelectorAll('.pl').forEach(x => { x.classList.toggle('sel', x === b); x.setAttribute('aria-pressed', x === b) })
    const s = skills[b.dataset.i]; audio.chime()
    holo.innerHTML = `<h3>${esc(s.t)}</h3>` + s.i.map(x => `<span class="tchip">${esc(x)}</span>`).join('') + '<br><button class="btn" id="back" style="margin-top:16px;padding:8px 18px">CLOSE</button>'
    $('#back').onclick = () => { b.classList.remove('sel'); b.setAttribute('aria-pressed', 'false'); holo.innerHTML = HOLO0 }
  }

  // contact (no backend: opens visitor's mail app, never claims a send happened)
  $('#links').innerHTML = '<h3>CHANNELS</h3>' + (P.email ? `<a href="mailto:${esc(P.email)}">✉ ${esc(P.email)}</a>` : '<span class="hint">✉ Email: set it in src/data/profile.js</span>') +
    P.social.map(s => s.u ? `<a href="${esc(s.u)}" target="_blank" rel="noopener">↗ ${esc(s.l)}</a>` : `<span class="hint">↗ ${esc(s.l)}: set URL in profile.js</span>`).join('')
  $('#cv').onclick = e => { if (P.cv) { $('#cv').href = P.cv; $('#cv').download = 'Abir-Hassan-CV' } else { e.preventDefault(); alert('No CV file configured yet. Put it in /public and set cv in src/data/profile.js.') } }
  $('#form').onsubmit = e => {
    e.preventDefault(); const v = Object.fromEntries(new FormData(e.target)), er = $('#err'), m = $('#msg'); er.textContent = ''; m.textContent = ''
    if (!v.name.trim() || !v.subject.trim() || v.message.trim().length < 5) return er.textContent = 'Please fill in name, subject and a message.'
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.email)) return er.textContent = 'Enter a valid email address.'
    if (!P.email) return er.textContent = 'Contact email is not configured yet (src/data/profile.js).'
    const b = $('#send'); b.textContent = 'OPENING MAIL APP…'
    setTimeout(() => { b.textContent = 'SEND TRANSMISSION'; audio.chime(); location.href = `mailto:${P.email}?subject=${encodeURIComponent(v.subject)}&body=${encodeURIComponent(v.message + '\n\n— ' + v.name + ' (' + v.email + ')')}`; m.textContent = 'Your mail app should open with the message ready. Press send there to deliver it.'; m.style.color = 'var(--cy)' }, 500)
  }
}
