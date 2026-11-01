import * as THREE from 'three'
import gsap from 'gsap'
import { stepSpring } from '../utils/spring.js'
import { makePlanet, makeStars, makeDust, makeBlackHole, makeShip, makeWorlds, makeNebulae } from './objects.js'

const UI = 'a,button,input,textarea,.glass,svg,nav,#rail'
const TINTS = ['#7C5CFF', '#B18CFF', '#00D9FF', '#B18CFF', '#7C5CFF', '#00D9FF']   // light colour per story chapter
// Camera spline: one waypoint per chapter (home → about → skills → projects → experience → contact)
const PATH = [[0, 0, 14], [-2, .6, 6], [1, -.4, -14], [-2, .8, -30], [2, 0, -42], [-1, .5, -58], [0, 0, -72]]

export class Universe {
  constructor(canvas, { mobile: MOB, reduced: RM, onHover, onWarp }) {
    const R = new THREE.WebGLRenderer({ canvas, antialias: !MOB, powerPreference: 'high-performance' })
    let dpr = Math.min(devicePixelRatio, MOB ? 1.25 : 2); R.setPixelRatio(dpr); R.setClearColor(0x03040B)
    const S = new THREE.Scene(), C = new THREE.PerspectiveCamera(55, 1, .1, 600)
    const resize = () => { R.setSize(innerWidth, innerHeight, false); C.aspect = innerWidth / innerHeight; C.updateProjectionMatrix() }; resize()

    const planet = makePlanet(MOB), stars = makeStars(MOB), dust = makeDust(MOB), bh = makeBlackHole(MOB), ship = makeShip(), worlds = makeWorlds(), neb = makeNebulae()
    S.add(planet.group, stars.group, dust.points, bh.group, ship.group, worlds.group, ...neb)
    const dl = new THREE.DirectionalLight(0xffffff, 3); dl.position.set(-1, .6, .8).normalize().multiplyScalar(10)
    const bl = new THREE.PointLight(0x7C5CFF, 120, 60); bl.position.set(-7, -1, -44)
    S.add(dl, new THREE.AmbientLight(0x6644aa, 1.4), bl)

    // --- input ---
    const mouse = { x: 0, y: 0, px: 0, py: 0, t: 0 }; let ui = false, hov = null, sp = 0, raf = 0, rt = 0
    const offs = [], on = (t, e, f, o) => { t.addEventListener(e, f, o); offs.push(() => t.removeEventListener(e, f, o)) }
    on(window, 'resize', () => { cancelAnimationFrame(rt); rt = requestAnimationFrame(resize) })
    on(window, 'pointermove', e => { mouse.x = e.clientX / innerWidth * 2 - 1; mouse.y = -(e.clientY / innerHeight * 2 - 1); mouse.px = e.clientX; mouse.py = e.clientY; mouse.t = performance.now(); ui = !!e.target.closest(UI) }, { passive: true })
    const ray = new THREE.Raycaster(), mv = new THREE.Vector2()
    const targets = [{ o: planet.core, k: 'planet', n: 'ORIGIN PLANET // ABIR HASSAN' }, { o: bh.hit, k: 'bh', n: 'BLACK HOLE // CLICK TO WARP FORWARD' }], tObj = targets.map(t => t.o)
    const pick = () => { mv.set(mouse.x, mouse.y); ray.setFromCamera(mv, C); const h = ray.intersectObjects(tObj); return h.length ? targets.find(t => t.o === h[0].object) : null }
    const W = { v: 0 }, intro = { v: RM ? 0 : 1 }
    const warp = () => gsap.timeline().to(W, { v: 50, duration: .5, ease: 'power2.in' }).to(W, { v: 0, duration: 1, ease: 'power3.out' })
    on(window, 'click', e => { if (e.target.closest(UI)) return; const h = pick(); if (h && h.k === 'bh') { warp(); onWarp && onWarp() } })
    gsap.to(intro, { v: 0, duration: 4, ease: 'power3.out', delay: .5 })      // opening fly-in

    // --- story hooks ---
    const tint = new THREE.Color(TINTS[0])
    this.setProgress = p => { sp = p }
    this.setChapter = i => { const c = new THREE.Color(TINTS[i]); gsap.to(tint, { r: c.r, g: c.g, b: c.b, duration: 2 }) }

    // --- state ---
    const path = new THREE.CatmullRomCurve3(PATH.map(p => new THREE.Vector3(...p)), false, 'catmullrom', .5)
    const sm = { x: 0, y: 0, vx: 0, vy: 0 }, pr = { x: 0, y: 0, vx: 0, vy: 0 }, sS = { x: 0, v: 0 }
    const cA = new THREE.Color(0xffffff), cB = new THREE.Color(0x9fe8ff), bg1 = new THREE.Color(0x03040B), bg2 = new THREE.Color(0x0a0820), tmp = new THREE.Color()
    const pp = new THREE.Vector3(), lk = new THREE.Vector3(), fw = new THREE.Vector3(), cw = new THREE.Vector3()
    const clock = new THREE.Clock(); let frame = 0, acc = 0, fr = 0, tipName = ''

    const loop = () => {
      raf = requestAnimationFrame(loop); if (document.hidden) return
      const dt = Math.min(clock.getDelta(), .05), t = clock.elapsedTime, k = RM ? 0 : 1; frame++
      const idle = performance.now() - mouse.t > 3500, tx = idle ? Math.sin(t * .3) * .25 * k : mouse.x, ty = idle ? Math.cos(t * .23) * .15 * k : mouse.y
      stepSpring(sm, tx, ty, dt, 26); stepSpring(pr, -ty * .3, tx * .3, dt, 10)
      sS.v += ((sp - sS.x) * 22 - sS.v * 8) * dt; sS.x = Math.min(1, Math.max(0, sS.x + sS.v * dt)); const cs = sS.x
      path.getPointAt(cs, pp); path.getTangentAt(cs, fw); lk.copy(pp).addScaledVector(fw, 10)
      C.position.set(pp.x + sm.x * 1.5, pp.y + sm.y, pp.z + intro.v * 26); C.lookAt(lk.x + sm.x * 2, lk.y + sm.y * 1.2, lk.z); C.rotateZ(-sm.x * .03 - sS.v * .05 * k); C.updateMatrixWorld()
      const fv = 55 + W.v + intro.v * 15 + Math.min(Math.abs(sS.v) * 40, 9) * k; if (Math.abs(fv - C.fov) > .05) { C.fov = fv; C.updateProjectionMatrix() }

      const hp = hov && hov.k === 'planet', hb = hov && hov.k === 'bh'
      planet.update(t, dt, k, hp, pr.x, pr.y); stars.update(t, sm.x, sm.y); bh.update(t, dt, k, hb); worlds.update(t, dt, k, sm.x)
      dust.points.position.set(C.position.x, C.position.y, C.position.z - 14); mv.set(sm.x, sm.y); ray.setFromCamera(mv, C)
      cw.copy(ray.ray.origin).addScaledVector(ray.ray.direction, 18).sub(dust.points.position); dust.update(dt, t, k, cw)
      neb.forEach((m, i) => { m.lookAt(C.position); m.rotation.z = t * .01 * (i + 1) })
      dl.color.copy(cA).lerp(cB, cs); bl.color.copy(tint); bl.intensity = 120 + cs * 300; planet.rings[1].material.color.copy(tint)
      R.setClearColor(tmp.copy(bg1).lerp(bg2, Math.sin(cs * Math.PI)))
      ship.update(dt, t, k, C.position, fw, sm, cs, MOB)

      if (frame % 3 === 0) hov = ui ? null : pick()
      const nm = hov ? hov.n : ''; if (nm !== tipName || hov) { tipName = nm; onHover && onHover(nm, mouse.px, mouse.py) }
      R.render(S, C)
      // adaptive quality: lower pixel ratio when average frame time > 26ms
      acc += dt; if (++fr === 90) { if (acc / 90 > .026 && dpr > 1) { dpr = Math.max(1, dpr - .25); R.setPixelRatio(dpr); resize() } acc = 0; fr = 0 }
    }
    loop()
    canvas.addEventListener('webglcontextlost', e => { e.preventDefault(); cancelAnimationFrame(raf); canvas.style.display = 'none'; document.body.classList.add('nogl') })
    this.dispose = () => { cancelAnimationFrame(raf); offs.forEach(f => f()); S.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => m.dispose()) }); R.dispose() }
  }
}
