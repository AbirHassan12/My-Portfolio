import gsap from 'gsap'
// Story layer: chapter rail, typed narration caption, chapter title cards.
export function initStory(chapters, { onChapter, reduced }) {
  const rail = document.getElementById('rail'), cap = document.getElementById('cap'), card = document.getElementById('card')
  rail.innerHTML = chapters.map((c, i) => `<button data-i="${i}" aria-label="Chapter ${c.num}: ${c.title}"><span>${c.num}</span></button>`).join('')
  rail.onclick = e => { const b = e.target.closest('button'); if (b) document.getElementById(chapters[b.dataset.i].id).scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' }) }
  document.querySelectorAll('section[data-ch] .lab').forEach(l => { const c = chapters[l.closest('section').dataset.ch]; l.textContent = `CHAPTER ${c.num} // ${c.title.toUpperCase()}` })
  let cur = -1
  const set = i => {
    if (i === cur) return; cur = i; const c = chapters[i]
    ;[...rail.children].forEach((b, j) => b.classList.toggle('on', j === i))
    gsap.killTweensOf(cap); cap.textContent = ''
    reduced ? (cap.textContent = c.line) : gsap.to(cap, { duration: Math.min(2.4, c.line.length * .035), text: c.line, ease: 'none' })
    if (!reduced) { card.querySelector('small').textContent = `CHAPTER ${c.num}`; card.querySelector('b').textContent = c.title.toUpperCase(); gsap.killTweensOf(card); gsap.timeline().fromTo(card, { opacity: 0, scale: .96 }, { opacity: 1, scale: 1, duration: .7, ease: 'power2.out' }).to(card, { opacity: 0, duration: 1, delay: .7 }) }
    onChapter(i)
  }
  const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) set(+en.target.dataset.ch) }), { threshold: .5 })
  document.querySelectorAll('section[data-ch]').forEach(s => io.observe(s))
}
