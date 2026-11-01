// Damped spring used for every "physics-like" motion (mouse, tilt, scroll).
export const spring = (v = 0) => ({ x: v, y: v, vx: 0, vy: 0 })
export function stepSpring(o, tx, ty, dt, K = 26) {
  const c = 1.7 * Math.sqrt(K)
  o.vx += ((tx - o.x) * K - o.vx * c) * dt; o.vy += ((ty - o.y) * K - o.vy * c) * dt
  o.x += o.vx * dt; o.y += o.vy * dt
}
