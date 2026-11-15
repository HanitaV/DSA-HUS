import { escape } from './common.js';
import { TYPES } from './model.mjs';

const NS = 'http://www.w3.org/2000/svg';
const CARD_W = 208;
const CARD_H = 62;
const CHAPTER_W = 240;
const CHAPTER_H = 62;

function el(tag, attrs = {}, text) {
  const node = document.createElementNS(NS, tag);
  for (const [key, value] of Object.entries(attrs)) {
    node.setAttribute(key, String(value));
  }
  if (text !== undefined) node.textContent = text;
  return node;
}

/**
 * Wrap a title into at most two legible SVG text lines inside the card width.
 */
function wrapTitle(title, maxChars = 25, maxLines = 2) {
  const words = String(title || '').trim().split(/\s+/).filter(Boolean);
  if (!words.length) return [''];
  const lines = [];
  let current = '';
  for (let i = 0; i < words.length; i += 1) {
    const word = words[i];
    const next = current ? `${current} ${word}` : word;
    if (next.length <= maxChars || !current) {
      if (word.length > maxChars && !current) {
        current = `${word.slice(0, maxChars - 1)}…`;
      } else {
        current = next;
      }
    } else {
      lines.push(current);
      if (lines.length === maxLines - 1) {
        const rest = words.slice(i).join(' ');
        lines.push(rest.length > maxChars ? `${rest.slice(0, maxChars - 1).trimEnd()}…` : rest);
        return lines;
      }
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines.slice(0, maxLines);
}

/**
 * Assign longest-path topological ranks and run barycenter sweeps to reduce crossings.
 */
function computeDagLayers(pieceList, prereqEdges) {
  const ids = new Set(pieceList.map(p => p.id));
  const incoming = new Map([...ids].map(id => [id, []]));
  const outgoing = new Map([...ids].map(id => [id, []]));

  for (const edge of prereqEdges) {
    if (edge.source === edge.target) continue;
    if (!ids.has(edge.source) || !ids.has(edge.target)) continue;
    outgoing.get(edge.source).push(edge.target);
    incoming.get(edge.target).push(edge.source);
  }

  const standalone = [];
  const connected = [];
  for (const piece of pieceList) {
    if (incoming.get(piece.id).length === 0 && outgoing.get(piece.id).length === 0) {
      standalone.push(piece);
    } else {
      connected.push(piece);
    }
  }

  const rank = new Map();
  const visiting = new Set();
  const getRank = id => {
    if (rank.has(id)) return rank.get(id);
    if (visiting.has(id)) return 0;
    visiting.add(id);
    let r = 0;
    for (const parent of incoming.get(id) || []) {
      r = Math.max(r, getRank(parent) + 1);
    }
    visiting.delete(id);
    rank.set(id, r);
    return r;
  };

  let maxRank = 0;
  for (const piece of connected) {
    maxRank = Math.max(maxRank, getRank(piece.id));
  }

  const layers = Array.from({ length: maxRank + 1 }, () => []);
  for (const piece of connected) {
    layers[rank.get(piece.id)].push(piece);
  }

  const orderIndex = new Map();
  const updateOrder = () => {
    layers.forEach(layer => layer.forEach((p, idx) => orderIndex.set(p.id, idx)));
  };
  updateOrder();

  const sortByNeighbors = (layer, neighborMap) => {
    layer.sort((a, b) => {
      const na = neighborMap.get(a.id) || [];
      const nb = neighborMap.get(b.id) || [];
      const ba = na.length
        ? na.reduce((sum, id) => sum + (orderIndex.get(id) ?? 0), 0) / na.length
        : (orderIndex.get(a.id) ?? 0);
      const bb = nb.length
        ? nb.reduce((sum, id) => sum + (orderIndex.get(id) ?? 0), 0) / nb.length
        : (orderIndex.get(b.id) ?? 0);
      if (Math.abs(ba - bb) > 0.05) return ba - bb;
      return (outgoing.get(b.id).length - outgoing.get(a.id).length) || a.title.localeCompare(b.title, 'vi');
    });
  };

  for (let pass = 0; pass < 3; pass += 1) {
    for (let l = 1; l < layers.length; l += 1) {
      sortByNeighbors(layers[l], incoming);
      updateOrder();
    }
    for (let l = layers.length - 2; l >= 0; l -= 1) {
      sortByNeighbors(layers[l], outgoing);
      updateOrder();
    }
  }

  return { layers, standalone, rank, incoming, outgoing };
}

/**
 * Pure SVG interactive DAG & course swimlane graph renderer.
 */
export class KnowledgeGraph {
  constructor(host, onSelect, options = {}) {
    this.host = host;
    this.onSelect = onSelect;
    this.minimapSvg = options.minimap || null;
    this.svg = el('svg', {
      role: 'group',
      'aria-label': 'Đồ thị kiến thức tương tác',
    });
    this.host.append(this.svg);

    this.pos = new Map();
    this.sizes = new Map();
    this.chapterNodes = [];
    this.nodeEls = new Map();
    this.edgeEls = [];
    this.view = { x: 0, y: 0, w: 1200, h: 800 };
    this.bounds = { x: 0, y: 0, w: 1200, h: 800 };
    this.drag = null;
    this.pinch = null;
    this.activePointers = new Map();
    this.lastWheelPanAt = 0;
    this.gestureScale = 1;
    this.moved = false;
    this.rendered = false;
    this.direction = 'LR';
    this.visibleRelations = new Set(['prerequisite']);

    this.setupInteraction();
    this.setupMinimap();
  }

  panBy(dxPx, dyPx) {
    const scale = this.view.w / Math.max(1, this.svg.clientWidth || 1);
    this.view.x += dxPx * scale;
    this.view.y += dyPx * scale;
    this.applyView();
  }

  setupInteraction() {
    this.svg.addEventListener('pointerdown', e => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      this.activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (this.activePointers.size === 1) {
        this.pinch = null;
        this.drag = {
          startX: e.clientX,
          startY: e.clientY,
          lastX: e.clientX,
          lastY: e.clientY,
          captured: false,
        };
        this.moved = false;
      } else if (this.activePointers.size === 2) {
        this.drag = null;
        this.moved = true;
        const pts = [...this.activePointers.values()];
        this.pinch = {
          dist: Math.max(1, Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y)),
          midX: (pts[0].x + pts[1].x) / 2,
          midY: (pts[0].y + pts[1].y) / 2,
        };
      }
    });

    this.svg.addEventListener('pointermove', e => {
      if (this.activePointers.has(e.pointerId)) {
        this.activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      }
      if (this.activePointers.size === 2 && this.pinch) {
        const pts = [...this.activePointers.values()];
        const dist = Math.max(1, Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y));
        const midX = (pts[0].x + pts[1].x) / 2;
        const midY = (pts[0].y + pts[1].y) / 2;
        this.panBy(this.pinch.midX - midX, this.pinch.midY - midY);
        const factor = dist / this.pinch.dist;
        if (Math.abs(factor - 1) > 0.002) {
          this.zoom(factor, { clientX: midX, clientY: midY });
        }
        this.pinch = { dist, midX, midY };
        return;
      }
      if (!this.drag) return;
      const totalDist = Math.hypot(e.clientX - this.drag.startX, e.clientY - this.drag.startY);
      if (!this.moved && totalDist > 5) {
        this.moved = true;
        if (!this.drag.captured) {
          this.drag.captured = true;
          this.svg.classList.add('dragging');
          try {
            this.svg.setPointerCapture?.(e.pointerId);
          } catch { /* pointer may be synthetic or already released */ }
        }
      }
      if (this.moved) {
        this.panBy(this.drag.lastX - e.clientX, this.drag.lastY - e.clientY);
      }
      this.drag.lastX = e.clientX;
      this.drag.lastY = e.clientY;
    });

    const endDrag = e => {
      this.activePointers.delete(e.pointerId);
      if (this.activePointers.size < 2) this.pinch = null;
      if (this.activePointers.size === 0) {
        this.drag = null;
        this.svg.classList.remove('dragging');
        if (this.moved) setTimeout(() => { this.moved = false; }, 0);
      }
    };
    this.svg.addEventListener('pointerup', endDrag);
    this.svg.addEventListener('pointercancel', endDrag);
    window.addEventListener('blur', () => {
      this.activePointers.clear();
      this.drag = null;
      this.pinch = null;
      this.moved = false;
      this.svg.classList.remove('dragging');
    });

    this.svg.addEventListener(
      'wheel',
      e => {
        e.preventDefault();
        const linePx = 32;
        const pagePx = this.host.clientHeight || 600;
        const mult = e.deltaMode === 1 ? linePx : e.deltaMode === 2 ? pagePx : 1;
        const dx = e.deltaX * mult;
        const dy = e.deltaY * mult;

        if (e.ctrlKey || e.metaKey) {
          const factor = Math.exp(-Math.max(-80, Math.min(80, dy)) * 0.009);
          this.zoom(factor, { clientX: e.clientX, clientY: e.clientY });
          return;
        }
        if (e.shiftKey) {
          this.panBy(dy || dx, 0);
          return;
        }

        const absX = Math.abs(dx);
        const absY = Math.abs(dy);
        const now = performance.now();
        const isTrackpadPan =
          absX > 0 ||
          !Number.isInteger(dy) ||
          (e.deltaMode === 0 && absY > 0 && absY < 48) ||
          (typeof e.wheelDeltaY === 'number' && Math.abs(e.wheelDeltaY) % 120 !== 0) ||
          (now - this.lastWheelPanAt < 260 && e.deltaMode === 0);

        if (isTrackpadPan) {
          this.lastWheelPanAt = now;
          this.panBy(dx, dy);
        } else {
          const factor = Math.exp(-Math.max(-180, Math.min(180, dy)) * 0.0022);
          this.zoom(factor, { clientX: e.clientX, clientY: e.clientY });
        }
      },
      { passive: false }
    );

    this.svg.addEventListener(
      'gesturestart',
      e => {
        e.preventDefault();
        this.gestureScale = 1;
      },
      { passive: false }
    );
    this.svg.addEventListener(
      'gesturechange',
      e => {
        e.preventDefault();
        const ratio = e.scale / Math.max(0.05, this.gestureScale);
        this.gestureScale = e.scale;
        this.zoom(ratio, { clientX: e.clientX, clientY: e.clientY });
      },
      { passive: false }
    );

    this.svg.addEventListener('keydown', e => {
      const node = e.target.closest('.graph-node');
      if (!node) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.onSelect(node.dataset.id);
      }
    });

    this.svg.addEventListener('focusin', e => {
      const node = e.target.closest('.graph-node');
      if (node) this.ensureVisible(node.dataset.id);
    });

    new ResizeObserver(() => this.applyView()).observe(this.host);
  }

  setupMinimap() {
    if (!this.minimapSvg) return;
    let draggingMini = false;
    const moveToPointer = e => {
      const rect = this.minimapSvg.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const rx = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const ry = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
      const targetX = this.bounds.x + rx * this.bounds.w;
      const targetY = this.bounds.y + ry * this.bounds.h;
      this.view.x = targetX - this.view.w / 2;
      this.view.y = targetY - this.view.h / 2;
      this.applyView();
    };
    this.minimapSvg.addEventListener('pointerdown', e => {
      draggingMini = true;
      this.minimapSvg.setPointerCapture?.(e.pointerId);
      moveToPointer(e);
    });
    this.minimapSvg.addEventListener('pointermove', e => {
      if (draggingMini) moveToPointer(e);
    });
    const endMini = () => {
      draggingMini = false;
    };
    this.minimapSvg.addEventListener('pointerup', endMini);
    this.minimapSvg.addEventListener('pointercancel', endMini);
  }

  layout(pieces, allEdges, chapters, direction = 'LR') {
    this.pos = new Map();
    this.sizes = new Map();
    this.chapterNodes = [];
    this.direction = direction;

    if (!pieces.length) return;

    const visibleIds = new Set(pieces.map(p => p.id));
    const prereqEdges = allEdges.filter(
      e => e.relation === 'prerequisite' && visibleIds.has(e.source) && visibleIds.has(e.target)
    );

    if (chapters?.length) {
      this.layoutCourseLanes(pieces, prereqEdges, chapters, direction);
    } else {
      this.layoutExplorerDag(pieces, prereqEdges, direction);
    }
  }

  layoutExplorerDag(pieces, prereqEdges, direction) {
    const { layers, standalone } = computeDagLayers(pieces, prereqEdges);
    const splitBands = (list, maxPerBand = 10) => {
      if (list.length <= maxPerBand) return [list];
      const count = Math.ceil(list.length / maxPerBand);
      const size = Math.ceil(list.length / count);
      const result = [];
      for (let i = 0; i < list.length; i += size) result.push(list.slice(i, i + size));
      return result;
    };
    const bands = layers.flatMap(layer => (layer.length ? splitBands(layer, 10) : []));

    if (direction === 'TB') {
      const tbStepX = CARD_W + 28;
      const tbStepY = CARD_H + 80;
      const maxRowWidth = Math.max(...bands.map(b => b.length), standalone.length, 1) * tbStepX - 28;

      let cursorY = 40;
      bands.forEach(band => {
        const rowWidth = band.length * tbStepX - 28;
        const startX = 40 + (maxRowWidth - rowWidth) / 2;
        band.forEach((piece, idx) => {
          this.pos.set(piece.id, { x: startX + idx * tbStepX, y: cursorY });
          this.sizes.set(piece.id, { w: CARD_W, h: CARD_H });
        });
        cursorY += tbStepY;
      });

      if (standalone.length) {
        const cols = Math.min(standalone.length, Math.max(3, Math.floor((maxRowWidth + 28) / tbStepX)));
        const standaloneY = bands.length ? cursorY + 24 : 40;
        const rows = Math.ceil(standalone.length / cols);
        for (let r = 0; r < rows; r += 1) {
          const slice = standalone.slice(r * cols, (r + 1) * cols);
          const rowW = slice.length * tbStepX - 28;
          const startX = 40 + (maxRowWidth - rowW) / 2;
          slice.forEach((piece, c) => {
            this.pos.set(piece.id, { x: startX + c * tbStepX, y: standaloneY + r * (CARD_H + 24) });
            this.sizes.set(piece.id, { w: CARD_W, h: CARD_H });
          });
        }
      }
      return;
    }

    const gapX = 90;
    const gapY = 24;
    const stepX = CARD_W + gapX;
    const stepY = CARD_H + gapY;
    const maxColHeight = Math.max(...bands.map(b => b.length), 1) * stepY - gapY;
    const baseDagWidth = Math.max(4, bands.length) * stepX - gapX;

    bands.forEach((band, depth) => {
      const colHeight = band.length * stepY - gapY;
      const startY = 40 + (maxColHeight - colHeight) / 2;
      band.forEach((piece, idx) => {
        this.pos.set(piece.id, {
          x: 40 + depth * stepX,
          y: startY + idx * stepY,
        });
        this.sizes.set(piece.id, { w: CARD_W, h: CARD_H });
      });
    });

    if (standalone.length) {
      const tbStepX = CARD_W + 28;
      const cols = Math.min(standalone.length, Math.max(3, Math.floor((baseDagWidth + 28) / tbStepX)));
      const startY = bands.length ? 40 + maxColHeight + 68 : 40;
      const rows = Math.ceil(standalone.length / cols);
      for (let r = 0; r < rows; r += 1) {
        const slice = standalone.slice(r * cols, (r + 1) * cols);
        const rowW = slice.length * tbStepX - 28;
        const startX = 40 + Math.max(0, (baseDagWidth - rowW) / 2);
        slice.forEach((piece, c) => {
          this.pos.set(piece.id, { x: startX + c * tbStepX, y: startY + r * (CARD_H + 24) });
          this.sizes.set(piece.id, { w: CARD_W, h: CARD_H });
        });
      }
    }
  }

  layoutCourseLanes(pieces, prereqEdges, chapters, direction) {
    const byId = new Map(pieces.map(p => [p.id, p]));
    const assigned = new Set();
    const groups = [];

    chapters.forEach((chapter, index) => {
      const chapterPieces = (chapter.pieces || [])
        .map(id => byId.get(id))
        .filter(p => p && !assigned.has(p.id));
      chapterPieces.forEach(p => assigned.add(p.id));
      if (chapterPieces.length) {
        groups.push({ chapter, index, pieces: chapterPieces });
      }
    });

    const leftovers = pieces.filter(p => !assigned.has(p.id));
    if (leftovers.length) {
      groups.push({
        chapter: { id: 'extra', title: 'Kiến thức liên quan' },
        index: groups.length,
        pieces: leftovers,
      });
    }

    if (direction === 'TB') {
      let laneX = 40;
      groups.forEach(group => {
        const laneIds = new Set(group.pieces.map(p => p.id));
        const lanePrereqs = prereqEdges.filter(e => laneIds.has(e.from) && laneIds.has(e.to));
        const { layers, standalone } = computeDagLayers(group.pieces, lanePrereqs);
        const allRows = layers.filter(l => l.length > 0);
        if (standalone.length) allRows.push(standalone);

        const maxCols = Math.max(...allRows.map(r => Math.min(r.length, 3)), 1);
        const laneWidth = Math.max(CHAPTER_W, maxCols * CARD_W + (maxCols - 1) * 24);
        const pillX = laneX + (laneWidth - CHAPTER_W) / 2;
        const pillY = 40;

        this.chapterNodes.push({
          id: group.chapter.id,
          index: group.index + 1,
          title: group.chapter.title,
          x: pillX,
          y: pillY,
          w: CHAPTER_W,
          h: CHAPTER_H,
          entryIds: (allRows[0] || []).map(p => p.id),
        });

        let cursorY = pillY + CHAPTER_H + 56;
        allRows.forEach(row => {
          const perRow = Math.min(row.length, 3);
          for (let i = 0; i < row.length; i += perRow) {
            const slice = row.slice(i, i + perRow);
            const sliceW = slice.length * CARD_W + (slice.length - 1) * 24;
            const startX = laneX + (laneWidth - sliceW) / 2;
            slice.forEach((piece, idx) => {
              this.pos.set(piece.id, { x: startX + idx * (CARD_W + 24), y: cursorY });
              this.sizes.set(piece.id, { w: CARD_W, h: CARD_H });
            });
            cursorY += CARD_H + 46;
          }
        });

        laneX += laneWidth + 72;
      });
      return;
    }

    let laneY = 40;
    groups.forEach(group => {
      const laneIds = new Set(group.pieces.map(p => p.id));
      const lanePrereqs = prereqEdges.filter(e => laneIds.has(e.from) && laneIds.has(e.to));
      const { layers, standalone } = computeDagLayers(group.pieces, lanePrereqs);
      const columns = layers.filter(l => l.length > 0);
      if (standalone.length) {
        for (let i = 0; i < standalone.length; i += 3) {
          columns.push(standalone.slice(i, i + 3));
        }
      }

      const maxRows = Math.max(...columns.map(c => c.length), 1);
      const laneHeight = Math.max(CHAPTER_H, maxRows * CARD_H + (maxRows - 1) * 20);
      const pillY = laneY + (laneHeight - CHAPTER_H) / 2;
      const pillX = 40;

      this.chapterNodes.push({
        id: group.chapter.id,
        index: group.index + 1,
        title: group.chapter.title,
        x: pillX,
        y: pillY,
        w: CHAPTER_W,
        h: CHAPTER_H,
        entryIds: (columns[0] || []).map(p => p.id),
      });

      let cursorX = pillX + CHAPTER_W + 64;
      columns.forEach(col => {
        const colHeight = col.length * CARD_H + (col.length - 1) * 20;
        const startY = laneY + (laneHeight - colHeight) / 2;
        col.forEach((piece, idx) => {
          this.pos.set(piece.id, { x: cursorX, y: startY + idx * (CARD_H + 20) });
          this.sizes.set(piece.id, { w: CARD_W, h: CARD_H });
        });
        cursorX += CARD_W + 76;
      });

      laneY += laneHeight + 30;
    });
  }

  buildDefs() {
    const defs = el('defs');
    const mkArrow = (id, cls) => {
      const marker = el('marker', {
        id,
        viewBox: '0 0 10 10',
        refX: 8.5,
        refY: 5,
        markerWidth: 6,
        markerHeight: 6,
        orient: 'auto-start-reverse',
      });
      marker.append(el('path', { d: 'M 0 1.4 L 9 5 L 0 8.6 z', class: `arrow-head ${cls}` }));
      defs.append(marker);
    };
    mkArrow('arrow-prerequisite', 'prerequisite');
    mkArrow('arrow-applies', 'applies');
    mkArrow('arrow-active', 'active');
    return defs;
  }

  buildEdgePath(a, b, sizeA, sizeB, edgeIndex = 0) {
    if (this.direction === 'TB') {
      const sx = a.x + sizeA.w / 2;
      const sy = a.y + sizeA.h;
      const tx = b.x + sizeB.w / 2;
      const ty = b.y;
      const dy = ty - sy;
      if (dy >= 16) {
        const tension = Math.max(34, dy * 0.48);
        const skipShift = dy > CARD_H * 2.5 && Math.abs(sx - tx) < CARD_W * 0.5
          ? (edgeIndex % 2 === 0 ? 44 : -44)
          : 0;
        return `M ${sx} ${sy} C ${sx + skipShift} ${sy + tension}, ${tx + skipShift} ${ty - tension}, ${tx} ${ty}`;
      }
      if (Math.abs(a.y - b.y) < sizeA.h * 0.6) {
        const dir = edgeIndex % 2 === 0 ? -1 : 1;
        const archY = Math.max(48, Math.min(96, Math.abs(tx - sx) * 0.14 + 42)) * dir;
        const yEdgeA = dir < 0 ? a.y : a.y + sizeA.h;
        const yEdgeB = dir < 0 ? b.y : b.y + sizeB.h;
        return `M ${sx} ${yEdgeA} C ${sx} ${yEdgeA + archY}, ${tx} ${yEdgeB + archY}, ${tx} ${yEdgeB}`;
      }
      const arc = Math.max(54, Math.min(130, Math.abs(tx - sx) * 0.35 + 48)) * (edgeIndex % 2 === 0 ? 1 : -1);
      const syLoop = a.y + sizeA.h / 2;
      const tyLoop = b.y + sizeB.h / 2;
      return `M ${sx + (arc > 0 ? sizeA.w / 2 : -sizeA.w / 2)} ${syLoop} C ${sx + arc * 1.4} ${syLoop}, ${tx + arc * 1.4} ${tyLoop}, ${tx + (arc > 0 ? sizeB.w / 2 : -sizeB.w / 2)} ${tyLoop}`;
    }

    const sx = a.x + sizeA.w;
    const sy = a.y + sizeA.h / 2;
    const tx = b.x;
    const ty = b.y + sizeB.h / 2;
    const dx = tx - sx;
    if (dx >= 16) {
      const tension = Math.max(38, dx * 0.46);
      const skipShift = dx > CARD_W * 1.8 && Math.abs(sy - ty) < CARD_H * 0.55
        ? (edgeIndex % 2 === 0 ? -38 : 38)
        : 0;
      return `M ${sx} ${sy} C ${sx + tension} ${sy + skipShift}, ${tx - tension} ${ty + skipShift}, ${tx} ${ty}`;
    }

    if (Math.abs(a.x - b.x) < sizeA.w * 0.6) {
      const dir = edgeIndex % 2 === 0 ? -1 : 1;
      const archX = Math.max(48, Math.min(96, Math.abs(ty - sy) * 0.22 + 44)) * dir;
      const xEdgeA = dir < 0 ? a.x : a.x + sizeA.w;
      const xEdgeB = dir < 0 ? b.x : b.x + sizeB.w;
      return `M ${xEdgeA} ${sy} C ${xEdgeA + archX} ${sy}, ${xEdgeB + archX} ${ty}, ${xEdgeB} ${ty}`;
    }

    const loopY = Math.max(52, Math.min(120, Math.abs(dyFrom(a, b)) * 0.35 + 46)) * (edgeIndex % 2 === 0 ? -1 : 1);
    const topOrBottomA = loopY < 0 ? a.y : a.y + sizeA.h;
    const topOrBottomB = loopY < 0 ? b.y : b.y + sizeB.h;
    return `M ${a.x + sizeA.w / 2} ${topOrBottomA} C ${a.x + sizeA.w / 2} ${topOrBottomA + loopY}, ${b.x + sizeB.w / 2} ${topOrBottomB + loopY}, ${b.x + sizeB.w / 2} ${topOrBottomB}`;
  }

  render(pieces, allEdges, {
    selected,
    learned,
    chapters,
    direction = 'LR',
    visibleRelations = ['prerequisite'],
  }) {
    this.visibleRelations = new Set(visibleRelations);
    this.layout(pieces, allEdges, chapters, direction);
    this.svg.textContent = '';
    this.nodeEls.clear();
    this.edgeEls = [];

    if (!pieces.length) {
      this.bounds = { x: 0, y: 0, w: 960, h: 600 };
      this.view = { ...this.bounds };
      this.applyView();
      this.renderMinimap();
      return;
    }

    this.svg.append(this.buildDefs());
    const ids = new Set(pieces.map(p => p.id));
    const edgeLayer = el('g', { class: 'edges' });
    const chapterLayer = el('g', { class: 'chapters' });
    const nodeLayer = el('g', { class: 'nodes' });

    // Chapter pill nodes and leader connectors
    for (const ch of this.chapterNodes) {
      const chGroup = el('g', { class: 'chapter-node', 'data-chapter': ch.id });
      chGroup.append(el('rect', { class: 'chapter-pill', x: ch.x, y: ch.y, width: ch.w, height: ch.h, rx: 12 }));
      chGroup.append(el('text', { class: 'chapter-kicker', x: ch.x + 14, y: ch.y + 18 }, `Chương ${ch.index}`));
      const chLines = wrapTitle(ch.title, 28, 2);
      const chTitleEl = el('text', { class: 'chapter-title', x: ch.x + 14, y: chLines.length === 1 ? ch.y + 42 : ch.y + 36 });
      chLines.forEach((line, lineIdx) => {
        chTitleEl.append(el('tspan', { x: ch.x + 14, dy: lineIdx === 0 ? 0 : 15 }, line));
      });
      chGroup.append(chTitleEl);
      const chTitleTip = el('title');
      chTitleTip.textContent = `Chương ${ch.index}: ${ch.title}`;
      chGroup.append(chTitleTip);
      chapterLayer.append(chGroup);

      for (const targetId of ch.entryIds) {
        const targetPos = this.pos.get(targetId);
        const targetSize = this.sizes.get(targetId);
        if (!targetPos || !targetSize) continue;
        const d = this.buildEdgePath(ch, targetPos, { w: ch.w, h: ch.h }, targetSize, 0);
        edgeLayer.append(el('path', { d, class: 'edge-chapter' }));
      }
    }

    // Edges between currently visible nodes (shown/hidden dynamically by relation filter)
    const activeEdges = allEdges.filter(e => ids.has(e.source) && ids.has(e.target));
    activeEdges.forEach((edge, idx) => {
      const a = this.pos.get(edge.source);
      const b = this.pos.get(edge.target);
      const sizeA = this.sizes.get(edge.source);
      const sizeB = this.sizes.get(edge.target);
      if (!a || !b) return;
      const attrs = {
        d: this.buildEdgePath(a, b, sizeA, sizeB, idx),
        class: `edge ${edge.relation}`,
      };
      if (edge.relation === 'prerequisite') attrs['marker-end'] = 'url(#arrow-prerequisite)';
      else if (edge.relation === 'applies') attrs['marker-end'] = 'url(#arrow-applies)';

      const path = el('path', attrs);
      path.dataset.from = edge.source;
      path.dataset.to = edge.target;
      path.dataset.relation = edge.relation;
      this.edgeEls.push(path);
      edgeLayer.append(path);
    });

    // Piece card nodes
    for (const piece of pieces) {
      const p = this.pos.get(piece.id);
      if (!p) continue;
      const typeLabel = TYPES[piece.type] || piece.type;
      const isLearned = learned.has(piece.id);
      const g = el('g', {
        class: `graph-node type-${piece.type}${isLearned ? ' learned' : ''}`,
        transform: `translate(${p.x} ${p.y})`,
        'data-id': piece.id,
        'data-type': piece.type,
        tabindex: '0',
        role: 'button',
        'aria-label': `${piece.title} (${typeLabel}${isLearned ? ', đã học' : ''})`,
      });

      g.append(el('rect', { class: 'hit-area', x: -4, y: -4, width: CARD_W + 8, height: CARD_H + 8, rx: 12 }));
      g.append(el('rect', { class: 'node-card', x: 0, y: 0, width: CARD_W, height: CARD_H, rx: 10 }));
      g.append(el('circle', { class: 'node-dot', cx: 15, cy: 17, r: 4 }));
      g.append(el('text', { class: 'node-type', x: 25, y: 20.5 }, typeLabel));

      const checkGroup = el('g', { class: 'node-check', transform: `translate(${CARD_W - 22} 9)` });
      checkGroup.append(el('circle', { cx: 7, cy: 7, r: 7 }));
      checkGroup.append(el('path', { d: 'M 4 7.2 L 6.1 9.3 L 10.2 4.8', class: 'node-check-mark' }));
      g.append(checkGroup);

      const lines = wrapTitle(piece.title, 25, 2);
      const titleEl = el('text', { class: 'node-title', x: 13, y: lines.length === 1 ? 43 : 36.5 });
      lines.forEach((line, lineIdx) => {
        titleEl.append(el('tspan', { x: 13, dy: lineIdx === 0 ? 0 : 14.5 }, line));
      });
      g.append(titleEl);

      const titleTip = el('title');
      titleTip.textContent = `${piece.title} — ${typeLabel}`;
      g.append(titleTip);

      g.addEventListener('click', () => {
        if (!this.moved) this.onSelect(piece.id);
      });

      this.nodeEls.set(piece.id, g);
      nodeLayer.append(g);
    }

    this.svg.append(edgeLayer, chapterLayer, nodeLayer);
    this.bounds = this.computeBounds();
    this.rendered = true;
    this.fit();
    this.update(selected, learned, allEdges, [...this.visibleRelations]);
  }

  computeBounds() {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const [id, p] of this.pos.entries()) {
      const s = this.sizes.get(id) || { w: CARD_W, h: CARD_H };
      minX = Math.min(minX, p.x);
      minY = Math.min(minY, p.y);
      maxX = Math.max(maxX, p.x + s.w);
      maxY = Math.max(maxY, p.y + s.h);
    }
    for (const ch of this.chapterNodes) {
      minX = Math.min(minX, ch.x);
      minY = Math.min(minY, ch.y);
      maxX = Math.max(maxX, ch.x + ch.w);
      maxY = Math.max(maxY, ch.y + ch.h);
    }

    if (!Number.isFinite(minX)) return { x: 0, y: 0, w: 960, h: 600 };
    const pad = 48;
    return {
      x: minX - pad,
      y: minY - pad,
      w: Math.max(480, maxX - minX + pad * 2),
      h: Math.max(360, maxY - minY + pad * 2),
    };
  }

  renderMinimap() {
    if (!this.minimapSvg) return;
    this.minimapSvg.textContent = '';
    const b = this.bounds;
    this.minimapSvg.setAttribute('viewBox', `${b.x} ${b.y} ${b.w} ${b.h}`);

    for (const ch of this.chapterNodes) {
      this.minimapSvg.append(el('rect', {
        x: ch.x,
        y: ch.y,
        width: ch.w,
        height: ch.h,
        rx: 8,
        class: 'minimap-chapter',
      }));
    }
    for (const [id, p] of this.pos.entries()) {
      const s = this.sizes.get(id) || { w: CARD_W, h: CARD_H };
      const nodeEl = this.nodeEls.get(id);
      const isSelected = nodeEl?.classList.contains('selected');
      const isLearned = nodeEl?.classList.contains('learned');
      this.minimapSvg.append(el('rect', {
        x: p.x,
        y: p.y,
        width: s.w,
        height: s.h,
        rx: 6,
        class: `minimap-node${isSelected ? ' selected' : ''}${isLearned ? ' learned' : ''}`,
      }));
    }

    this.minimapViewport = el('rect', { class: 'minimap-viewport' });
    this.minimapSvg.append(this.minimapViewport);
    this.syncMinimapViewport();
  }

  syncMinimapViewport() {
    if (!this.minimapViewport) return;
    this.minimapViewport.setAttribute('x', this.view.x);
    this.minimapViewport.setAttribute('y', this.view.y);
    this.minimapViewport.setAttribute('width', this.view.w);
    this.minimapViewport.setAttribute('height', this.view.h);
  }

  update(selected, learned, edges, visibleRelations) {
    if (visibleRelations) this.visibleRelations = new Set(visibleRelations);

    const neighbors = new Set();
    if (selected) {
      neighbors.add(selected);
      for (const e of edges) {
        if (!this.visibleRelations.has(e.relation)) continue;
        if (e.source === selected) neighbors.add(e.target);
        if (e.target === selected) neighbors.add(e.source);
      }
    }

    for (const [id, elNode] of this.nodeEls.entries()) {
      elNode.classList.toggle('learned', learned.has(id));
      elNode.classList.toggle('selected', id === selected);
      elNode.classList.toggle('neighbor', Boolean(selected && id !== selected && neighbors.has(id)));
      elNode.classList.toggle('dimmed', Boolean(selected && !neighbors.has(id)));
    }

    for (const path of this.edgeEls) {
      const relation = path.dataset.relation;
      const visible = this.visibleRelations.has(relation);
      path.style.display = visible ? '' : 'none';
      const active = Boolean(visible && selected && (path.dataset.from === selected || path.dataset.to === selected));
      path.classList.toggle('active', active);
      path.classList.toggle('dimmed', Boolean(visible && selected && !active));
      if (relation === 'prerequisite' || relation === 'applies') {
        path.setAttribute('marker-end', active ? 'url(#arrow-active)' : `url(#arrow-${relation})`);
      }
    }

    this.renderMinimap();
  }

  center(id) {
    const p = this.pos.get(id);
    if (!p) return;
    const s = this.sizes.get(id) || { w: CARD_W, h: CARD_H };
    const ratio = (this.host.clientHeight || 600) / Math.max(1, this.host.clientWidth || 1000);
    const idealW = Math.max(460, Math.min((this.host.clientWidth || 960) * 1.25, 920));
    const targetW = this.view.w > idealW * 1.15 ? idealW : this.view.w;
    const targetH = targetW * ratio;
    const cx = p.x + s.w / 2;
    const cy = p.y + s.h / 2;
    this.view = {
      x: cx - targetW / 2,
      y: cy - targetH / 2,
      w: targetW,
      h: targetH,
    };
    this.applyView();
  }

  ensureVisible(id) {
    const p = this.pos.get(id);
    if (!p) return;
    const s = this.sizes.get(id) || { w: CARD_W, h: CARD_H };
    const pad = 36;
    if (p.x - pad < this.view.x) this.view.x = p.x - pad;
    if (p.x + s.w + pad > this.view.x + this.view.w) this.view.x = p.x + s.w + pad - this.view.w;
    if (p.y - pad < this.view.y) this.view.y = p.y - pad;
    if (p.y + s.h + pad > this.view.y + this.view.h) this.view.y = p.y + s.h + pad - this.view.h;
    this.applyView();
  }

  fit() {
    const b = this.bounds;
    const hostW = this.host.clientWidth || 1000;
    const hostH = this.host.clientHeight || 620;
    const hostRatio = hostW / Math.max(1, hostH);
    const boxRatio = b.w / Math.max(1, b.h);

    let w = b.w;
    let h = b.h;
    if (hostRatio > boxRatio) {
      w = h * hostRatio;
    } else {
      h = w / hostRatio;
    }

    this.view = {
      x: b.x - (w - b.w) / 2,
      y: b.y - (h - b.h) / 2,
      w,
      h,
    };
    this.applyView();
  }

  zoom(factor, clientPoint) {
    const oldW = this.view.w;
    const oldH = this.view.h;
    const nextW = Math.max(320, Math.min(this.bounds.w * 2.4, oldW / factor));
    const nextH = nextW * (oldH / Math.max(1, oldW));

    let anchorX = 0.5;
    let anchorY = 0.5;
    if (clientPoint) {
      const rect = this.svg.getBoundingClientRect();
      if (rect.width && rect.height) {
        anchorX = Math.max(0, Math.min(1, (clientPoint.clientX - rect.left) / rect.width));
        anchorY = Math.max(0, Math.min(1, (clientPoint.clientY - rect.top) / rect.height));
      }
    }

    this.view = {
      x: this.view.x + (oldW - nextW) * anchorX,
      y: this.view.y + (oldH - nextH) * anchorY,
      w: nextW,
      h: nextH,
    };
    this.applyView();
  }

  applyView() {
    const hostW = Math.max(1, this.host.clientWidth || 1000);
    const hostH = Math.max(1, this.host.clientHeight || 620);
    const ratio = hostH / hostW;
    this.view.h = this.view.w * ratio;
    if (this.rendered) {
      const b = this.bounds;
      const minX = b.x - this.view.w * 0.82;
      const maxX = b.x + b.w - this.view.w * 0.18;
      const minY = b.y - this.view.h * 0.82;
      const maxY = b.y + b.h - this.view.h * 0.18;
      this.view.x = Math.max(minX, Math.min(maxX, this.view.x));
      this.view.y = Math.max(minY, Math.min(maxY, this.view.y));
    }
    this.svg.setAttribute('viewBox', `${this.view.x} ${this.view.y} ${this.view.w} ${this.view.h}`);
    this.syncMinimapViewport();
  }
}

function dyFrom(a, b) {
  return (b?.y ?? 0) - (a?.y ?? 0);
}

export { escape };
