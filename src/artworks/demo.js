const layers = [
  { anchor: .34, phase: 0 },
  { anchor: .46, phase: Math.PI * .5 },
  { anchor: .54, phase: Math.PI },
  { anchor: .66, phase: Math.PI * 1.5 },
];

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

function createBranch(level, length, width, turn, attachment) {
  const branch = {
    length, width, turn, attachment,
    bend: (Math.random() - .5) * .42,
    bias: Math.random(),
    phase: Math.random() * Math.PI * 2,
    children: [],
  };

  if (level > 0) {
    const side = Math.random() < .5 ? -1 : 1;
    branch.children.push(
      createBranch(level - 1, length * (.71 + Math.random() * .13), width * .74, side * (.14 + Math.random() * .3), 1),
      createBranch(level - 1, length * (.49 + Math.random() * .23), width * .58, -side * (.52 + Math.random() * .44), .62 + Math.random() * .25),
    );
    if (level >= 3 && Math.random() < .6) {
      branch.children.push(createBranch(level - 2, length * .53, width * .44, side * .85, .48));
    }
  }

  return branch;
}

function pointOnBranch(start, control, end, progress) {
  const rest = 1 - progress;
  return rest * rest * start + 2 * rest * progress * control + progress * progress * end;
}

function drawBranch(ctx, branch, x, y, direction, growth, shape) {
  const extent = Math.min(growth, 1);
  const fork = branch.attachment === 1 ? 1 : shape.spread;
  const sway = Math.sin(shape.phase + branch.phase);
  const heading = direction * .79 + branch.turn * fork + shape.lean + sway * shape.sway;
  const length = branch.length * shape.size * (1 + sway * .12);
  const cx = x + Math.sin(heading - branch.bend) * length * .49;
  const cy = y - Math.cos(heading - branch.bend) * length * .49;
  const ex = x + Math.sin(heading + branch.bend) * length;
  const ey = y - Math.cos(heading + branch.bend) * length;
  const tipX = pointOnBranch(x, cx, ex, extent);
  const tipY = pointOnBranch(y, cy, ey, extent);

  ctx.lineWidth = Math.max(.35, branch.width * shape.size) * Math.min(1, extent * 3);
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x + (cx - x) * extent, y + (cy - y) * extent, tipX, tipY);
  ctx.stroke();

  for (const child of branch.children) {
    // Side branches unfold at different times as the pointer moves across the field.
    const pulse = Math.sin(shape.phase * .83 + child.phase);
    const delay = child.attachment + child.bias * shape.forkDelay + pulse * .23;
    const childGrowth = (growth - delay) * 1.13;
    if (childGrowth <= 0 || extent < child.attachment) continue;
    const jointX = pointOnBranch(x, cx, ex, child.attachment);
    const jointY = pointOnBranch(y, cy, ey, child.attachment);
    drawBranch(ctx, child, jointX, jointY, heading, childGrowth, shape);
  }
}

export function startDemo(mount, onExit) {
  const artwork = document.createElement('div');
  artwork.className = 'terminal-artwork terminal-output';
  artwork.innerHTML = '<canvas aria-label="Ветвящаяся структура. Проведите мышью или пальцем, чтобы перестроить ветви."></canvas>';
  const canvas = artwork.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas недоступен');
  const trees = layers.map((layer, index) => ({
    ...layer,
    trunk: createBranch(9, .23, .014, (index - 1.5) * .12, 1),
  }));

  let width = 0;
  let height = 0;
  let frame = 0;
  let active = true;
  let previousTime;
  let previousPoint;
  let motion = 0;
  let phase = 0;
  let focusX = 0;
  let focusY = 0;
  let targetX = 0;
  let targetY = 0;

  function resize() {
    const bounds = canvas.getBoundingClientRect();
    width = bounds.width;
    height = bounds.height;
    const ratio = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.lineCap = 'round';
    requestDraw();
  }

  function move(event) {
    if (!event.isPrimary || !width || !height) return;
    const point = { x: event.offsetX / width, y: event.offsetY / height };
    targetX = clamp(point.x * 2 - 1, -1, 1);
    targetY = clamp(point.y * 2 - 1, -1, 1);
    const distance = previousPoint ? Math.hypot(point.x - previousPoint.x, point.y - previousPoint.y) : .04;
    motion = Math.min(1, motion + distance * 3.5);
    previousPoint = point;
    requestDraw();
  }

  function requestDraw() {
    if (active && !frame) frame = requestAnimationFrame(draw);
  }

  function draw(time) {
    frame = 0;
    const elapsed = previousTime === undefined ? 16 : Math.min(48, time - previousTime);
    previousTime = time;
    const ease = 1 - Math.exp(-elapsed / 155);

    focusX += (targetX - focusX) * ease;
    focusY += (targetY - focusY) * ease;
    motion *= Math.exp(-elapsed / 1300);
    phase += elapsed * (.00055 + motion * .0017);

    ctx.clearRect(0, 0, width, height);
    const size = Math.min(height, width * 1.25);
    const ordered = trees.map((tree) => {
      const angle = phase * .53 + tree.phase + focusX * 1.4;
      return { tree, angle, depth: Math.sin(angle) };
    }).sort((a, b) => a.depth - b.depth);
    for (const { tree, angle, depth } of ordered) {
      const cycle = phase + tree.phase + focusY * 1.8;
      const shape = {
        size: size * (.86 + depth * .13),
        lean: focusX * (.12 + depth * .08) + Math.cos(cycle) * .21,
        spread: 1.15 + focusY * .4 + Math.sin(cycle) * .26,
        forkDelay: .22 + focusY * .18 - focusX * depth * .13,
        phase: cycle,
        sway: .1 + motion * .16,
      };
      const shade = Math.round(16 + (1 - depth) * 60);
      ctx.strokeStyle = `rgb(${shade} ${shade} ${shade})`;
      drawBranch(
        ctx, tree.trunk,
        width * tree.anchor + size * (Math.cos(angle) * .18 - focusX * depth * .17),
        height * .97 - size * (1 - depth) * .045,
        0, 5.15 + Math.sin(cycle * .9) * 1.35 + motion * 1.5, shape,
      );
    }

    requestDraw();
  }

  function stop() {
    if (!active) return;
    active = false;
    cancelAnimationFrame(frame);
    window.removeEventListener('resize', resize);
    window.removeEventListener('keydown', exitOnEscape);
    artwork.remove();
    onExit?.();
  }

  function exitOnEscape(event) {
    if (event.key === 'Escape') stop();
  }

  canvas.addEventListener('pointerdown', (event) => {
    previousPoint = undefined;
    move(event);
  });
  canvas.addEventListener('pointermove', move);
  canvas.addEventListener('pointerleave', () => { previousPoint = undefined; });
  window.addEventListener('resize', resize);
  window.addEventListener('keydown', exitOnEscape);
  mount.append(artwork);
  resize();
  return stop;
}
