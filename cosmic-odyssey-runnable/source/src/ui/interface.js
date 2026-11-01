import gsap from 'gsap'
// Navigation (burger, active link), custom cursor, magnetic buttons, hover sounds.
export function initInterface(audio) {
  const $ = s => document.querySelector(s), burger = $('#burger'), menu = $('#menu'), links = [...document.querySelectorAll('nav a')]
  burger.onclick = () => burger.setAttribute('aria-expanded', menu.classList.toggle('open'))
  menu.onclick = e => { if (e.target.tagName === 'A') { menu.classList.remove('open'); burger.setAttribute('aria-expanded', 'false') } }
  const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) links.forEach(a => { const on = a.getAttribute('href') === '#' + en.target.id; a.classList.toggle('on', on); on ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current') }) }), { threshold: .4 })
  document.querySelectorAll('section').forEach(s => io.observe(s))
  const cur = $('#cur'), fine = matchMedia('(pointer:fine)').matches, HOT = 'a,button,.s,input,textarea'
  addEventListener('pointermove', e => { if (fine) { cur.style.left = e.clientX + 'px'; cur.style.top = e.clientY + 'px' } audio.setMouse(e.clientX / innerWidth * 2 - 1) }, { passive: true })
  document.addEventListener('pointerover', e => { const h = e.target.closest(HOT); document.body.classList.toggle('hv2', !!h); if (h && h !== initInterface.last) audio.hover(); initInterface.last = h })
  document.addEventListener('click', e => { if (e.target.closest(HOT)) audio.click() })
  document.querySelectorAll('.mag').forEach(b => { b.addEventListener('pointermove', e => { const r = b.getBoundingClientRect(); b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .2}px,${(e.clientY - r.top - r.height / 2) * .3}px)` }); b.addEventListener('pointerleave', () => b.style.transform = '') })
}
