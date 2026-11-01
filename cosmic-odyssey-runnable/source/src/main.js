import './styles/main.css'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { TextPlugin } from 'gsap/TextPlugin'
import { Universe } from './scene/Universe.js'
import { SoundEngine } from './audio/SoundEngine.js'
import { chapters } from './data/story.js'
import { renderContent, $ } from './ui/content.js'
import { initProjects } from './ui/projects.js'
import { initStory } from './ui/story.js'
import { initInterface } from './ui/interface.js'
gsap.registerPlugin(ScrollTrigger, TextPlugin)

const RM = matchMedia('(prefers-reduced-motion:reduce)').matches, MOB = innerWidth < 820
const audio = new SoundEngine(); let universe = null
renderContent(audio); initProjects(audio, RM); initInterface(audio)
initStory(chapters, { reduced: RM, onChapter: i => { universe && universe.setChapter(i); audio.setChapter(i) } })

// 3D universe (falls back to a gradient if WebGL is unavailable)
try {
  const t = document.createElement('canvas'); if (!(t.getContext('webgl2') || t.getContext('webgl'))) throw 0
  const tip = $('#tip')
  universe = new Universe($('#c'), {
    mobile: MOB, reduced: RM,
    onHover: (name, x, y) => { tip.textContent = name; tip.style.opacity = name ? 1 : 0; document.body.classList.toggle('hv', !!name); if (name) tip.style.transform = `translate(${x + 14}px,${y + 14}px)` },
    onWarp: () => { audio.warp(); setTimeout(() => $('#experience').scrollIntoView({ behavior: 'smooth' }), 450) }
  })
} catch (e) { document.body.classList.add('nogl'); $('#c').style.display = 'none' }

// scroll → camera, progress bar, ambient filter
ScrollTrigger.create({ start: 0, end: 'max', onUpdate: s => { universe && universe.setProgress(s.progress); $('#prog').style.transform = `scaleX(${s.progress})`; audio.setProgress(s.progress, s.getVelocity()) } })

// sound toggle (disabled by default; browsers require a click to start audio)
const snd = $('#snd')
snd.onclick = async () => { const on = await audio.toggle(); snd.setAttribute('aria-pressed', on); snd.textContent = on ? '♪ SOUND ON' : '♪ SOUND OFF'; if (on) audio.setChapter(audio.chapter) }

// loader + entrance
gsap.to('#loadbar i', { width: '100%', duration: 1.6, ease: 'power1.inOut' })
addEventListener('load', () => setTimeout(() => {
  $('#load').style.opacity = 0; setTimeout(() => $('#load').remove(), 900)
  if (RM) return
  gsap.from('.hero .rv', { y: 50, opacity: 0, filter: 'blur(10px)', stagger: .14, duration: 1.2, ease: 'power3.out', delay: .3, clearProps: 'filter' })
  document.querySelectorAll('section:not(.hero) .rv').forEach(el => gsap.from(el, { y: 50, opacity: 0, filter: 'blur(8px)', duration: 1, ease: 'power3.out', clearProps: 'filter', scrollTrigger: { trigger: el, start: 'top 88%' } }))
}, 1700))
