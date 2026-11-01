import * as THREE from 'three'
import * as SH from './shaders.js'
const { Mesh, Group, SphereGeometry, TorusGeometry, ShaderMaterial, MeshBasicMaterial, MeshStandardMaterial, AdditiveBlending } = THREE
const LIGHT = new THREE.Vector3(-1, .6, .8).normalize()

function points(n, size, color, spread, z0, z1) {
  const g = new THREE.BufferGeometry(), p = new Float32Array(n * 3)
  for (let i = 0; i < n; i++) { p[i * 3] = (Math.random() - .5) * spread; p[i * 3 + 1] = (Math.random() - .5) * spread; p[i * 3 + 2] = z0 - Math.random() * (z0 - z1) }
  g.setAttribute('position', new THREE.BufferAttribute(p, 3))
  return new THREE.Points(g, new THREE.PointsMaterial({ size, color, transparent: true, opacity: .9, depthWrite: false, blending: AdditiveBlending }))
}

/* Hero planet: procedural surface, clouds, atmosphere, rings, orbiters */
export function makePlanet(mob) {
  const group = new Group(); group.position.set(mob ? 0 : 4.2, 0, 0)
  const u = () => ({ t: { value: 0 }, L: { value: LIGHT } })
  const pm = new ShaderMaterial({ uniforms: u(), vertexShader: SH.vs, fragmentShader: SH.noise + SH.planet })
  const core = new Mesh(new SphereGeometry(2.2, 64, 64), pm)
  const cm = new ShaderMaterial({ uniforms: u(), transparent: true, depthWrite: false, vertexShader: SH.vs, fragmentShader: SH.noise + SH.cloud })
  const clouds = new Mesh(new SphereGeometry(2.27, 48, 48), cm)
  const am = new ShaderMaterial({ uniforms: { k: { value: 1 } }, transparent: true, side: THREE.BackSide, blending: AdditiveBlending, depthWrite: false, vertexShader: SH.vs, fragmentShader: SH.atm })
  const rings = [3.3, 4.1].map((r, i) => { const m = new Mesh(new TorusGeometry(r, .015 + i * .01, 8, 128), new MeshBasicMaterial({ color: i ? 0x00D9FF : 0xB18CFF, transparent: true, opacity: .6 })); m.rotation.set(1.3 + i * .25, .3, 0); return m })
  const orbs = [0xB18CFF, 0x00D9FF, 0xff9bd6, 0x9fffd0].map((c, i) => ({ m: new Mesh(new SphereGeometry(.18 + i * .05, 24, 24), new MeshStandardMaterial({ color: c, emissive: 0x221155, roughness: .5 })), r: 3.4 + i * .55, s: .5 / (i + 1) + .15, o: i * 1.7, tilt: i * .35 }))
  group.add(core, clouds, new Mesh(new SphereGeometry(2.7, 48, 48), am), ...rings, ...orbs.map(o => o.m))
  return {
    group, core, rings,
    update(t, dt, k, hover, tiltX, tiltZ) {
      pm.uniforms.t.value = cm.uniforms.t.value = t
      group.rotation.y += dt * .12 * k; clouds.rotation.y += dt * .04 * k; group.rotation.x = tiltX; group.rotation.z = tiltZ
      am.uniforms.k.value += ((hover ? 2.6 : 1) - am.uniforms.k.value) * Math.min(1, dt * 5)
      rings.forEach((r, i) => r.rotation.z += dt * (.1 + i * .08) * k)
      orbs.forEach(o => { const a = t * o.s * k + o.o; o.m.position.set(Math.cos(a) * o.r, Math.sin(a * 1.3) * o.tilt * o.r * .3, Math.sin(a) * o.r); o.m.rotation.y += dt })
    }
  }
}

/* Two star layers with twinkle + parallax */
export function makeStars(mob) {
  const N = mob ? 900 : 2600, s1 = points(N, .12, 0xffffff, 300, 20, -260), s2 = points(N / 2, .2, 0xB18CFF, 200, 20, -260)
  const group = new Group(); group.add(s1, s2)
  return { group, update(t, sx, sy) { s1.position.set(-sx * .6, -sy * .4, 0); s2.position.set(-sx * 1.4, -sy * .9, 0); s1.material.opacity = .7 + .3 * Math.sin(t * 2); s2.material.opacity = .6 + .3 * Math.sin(t * 1.3 + 1) } }
}

/* Dust: each particle is repelled by the cursor and springs back */
export function makeDust(mob) {
  const pts = points(mob ? 160 : 420, .07, 0x00D9FF, 50, 6, -34), dp = pts.geometry.attributes.position, N = dp.count
  const base = Float32Array.from(dp.array), off = new Float32Array(N * 3), vel = new Float32Array(N * 3); pts.frustumCulled = false
  return {
    points: pts,
    update(dt, t, k, c) {
      for (let i = 0; i < N; i++) {
        const j = i * 3, dx = base[j] + off[j] - c.x, dy = base[j + 1] + off[j + 1] - c.y, dz = base[j + 2] + off[j + 2] - c.z, d2 = dx * dx + dy * dy + dz * dz
        if (d2 < 36) { const f = (1 - d2 / 36) * 60 * dt / (Math.sqrt(d2) + .3) * k; vel[j] += dx * f; vel[j + 1] += dy * f; vel[j + 2] += dz * f }
        for (let a = 0; a < 3; a++) { vel[j + a] += (-off[j + a] * 6 - vel[j + a] * 2.5) * dt; off[j + a] += vel[j + a] * dt; dp.array[j + a] = base[j + a] + off[j + a] }
        dp.array[j + 1] += Math.sin(t * .4 + i) * .1 * k
      }
      dp.needsUpdate = true
    }
  }
}

/* Black hole: event horizon, shader accretion disk, particle stream */
export function makeBlackHole(mob) {
  const group = new Group(); group.position.set(-7, -1, -48)
  const hit = new Mesh(new SphereGeometry(2.4, 32, 32), new MeshBasicMaterial({ color: 0x000000 }))
  const dm = new ShaderMaterial({ uniforms: { t: { value: 0 }, k: { value: 1 } }, transparent: true, side: THREE.DoubleSide, blending: AdditiveBlending, depthWrite: false, vertexShader: SH.diskVert, fragmentShader: SH.disk })
  const disk = new Mesh(new THREE.RingGeometry(2.5, 7, 96, 1), dm); disk.rotation.x = 1.25
  const halo = new Mesh(new TorusGeometry(2.6, .05, 8, 96), new MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .8 }))
  const ps = points(mob ? 150 : 400, .1, 0xB18CFF, 1, 0, 0); ps.frustumCulled = false
  const A = [...Array(ps.geometry.attributes.position.count)].map(() => [Math.random() * 6.28, 3 + Math.random() * 4])
  group.add(hit, disk, halo, ps)
  return {
    group, hit,
    update(t, dt, k, hover) {
      dm.uniforms.t.value = t; dm.uniforms.k.value += ((hover ? 2.2 : 1) - dm.uniforms.k.value) * Math.min(1, dt * 5)
      const bp = ps.geometry.attributes.position, f = hover ? 3 : 1
      for (let i = 0; i < bp.count; i++) { A[i][0] += dt * (1.2 / A[i][1]) * k * f; A[i][1] -= dt * .03; if (A[i][1] < 2.6) A[i][1] = 7; bp.setXYZ(i, Math.cos(A[i][0]) * A[i][1], Math.sin(A[i][0]) * A[i][1] * .35, Math.sin(A[i][0]) * A[i][1] * .35) }
      bp.needsUpdate = true; disk.rotation.z += dt * .2 * k; group.rotation.y = Math.sin(t * .2) * .3
    }
  }
}

/* Procedural spaceship: glides ahead of the camera, trailing the cursor */
export function makeShip() {
  const group = new Group(), body = new Mesh(new THREE.ConeGeometry(.22, .9, 6), new MeshStandardMaterial({ color: 0xddddee, metalness: .8, roughness: .3 })); body.rotation.x = -Math.PI / 2
  const wing = new Mesh(new THREE.BoxGeometry(.9, .03, .3), new MeshStandardMaterial({ color: 0x7C5CFF })); wing.position.z = .2
  const eng = new Mesh(new SphereGeometry(.1, 12, 12), new MeshBasicMaterial({ color: 0x00D9FF })); eng.position.z = .55
  group.add(body, wing, eng)
  return {
    group,
    update(dt, t, k, cam, fw, sm, cs, mob) {
      const a = 1 - Math.exp(-dt * 3), p = group.position
      p.x += (cam.x + fw.x * 8 + sm.x * 2.4 + (mob ? 0 : -1.8) + Math.sin(cs * 14) * 1.2 - p.x) * a
      p.y += (cam.y + sm.y * 1.4 - 1.7 + Math.sin(t * 1.5) * .15 - p.y) * a
      p.z += (cam.z + fw.z * 8 - p.z) * a
      group.rotation.z = -sm.x * .5; group.rotation.x = sm.y * .2; group.rotation.y += (-fw.x * .8 - group.rotation.y) * a; eng.scale.setScalar(1 + .3 * Math.sin(t * 20))
    }
  }
}

/* Extra worlds that enter and leave the view along the camera path */
export function makeWorlds() {
  const mk = (r, c, x, y, z, ring) => { const g = new Group(); g.position.set(x, y, z); g.add(new Mesh(new SphereGeometry(r, 40, 40), new MeshStandardMaterial({ color: c, roughness: .8, emissive: c, emissiveIntensity: .08 }))); if (ring) { const m = new Mesh(new TorusGeometry(r * 1.7, r * .05, 6, 96), new MeshBasicMaterial({ color: 0xffd6a8, transparent: true, opacity: .5 })); m.rotation.x = 1.2; g.add(m) } return g }
  const gas = mk(2.6, 0xd98a5a, 8, 2, -24, true), moon = mk(1.2, 0x6f86c9, -8, -3, -37), group = new Group(); group.add(gas, moon)
  return { group, update(t, dt, k, sx) { gas.rotation.y += dt * .05 * k; gas.position.x = 8 - sx * .9; moon.position.x = -8 + sx * 1.4; moon.position.y = -3 + Math.sin(t * .4) * .4 * k } }
}

/* Procedural nebula billboards */
export function makeNebulae() {
  return [[0x7C5CFF, -20, 10, -60, 70], [0x00D9FF, 25, -12, -110, 80], [0xB18CFF, -30, -8, -170, 90]].map(([c, x, y, z, s]) => {
    const m = new Mesh(new THREE.PlaneGeometry(s, s), new ShaderMaterial({ uniforms: { c: { value: new THREE.Color(c) } }, transparent: true, depthWrite: false, blending: AdditiveBlending, vertexShader: SH.nebVert, fragmentShader: SH.noise + SH.nebula }))
    m.position.set(x, y, z); return m
  })
}
