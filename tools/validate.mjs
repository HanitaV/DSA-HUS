#!/usr/bin/env node
// Kiểm tra dữ liệu mảnh kiến thức và khóa học.
// Dùng: node tools/validate.mjs [--strict]
//   --strict : coi cảnh báo là lỗi (thoát mã 1).
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";

const rootArg = process.argv.indexOf('--root');
const ROOT = rootArg >= 0 ? process.argv[rootArg + 1] : join(dirname(fileURLToPath(import.meta.url)), "..");
const STRICT = process.argv.includes("--strict");
const TYPES = new Set(["concept", "theorem", "formula", "example", "exercise"]);
const RELATIONS = new Set(["prerequisite", "applies", "related"]);
const ID_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const errors = [];
const warnings = [];
const err = (m) => errors.push(m);
const warn = (m) => warnings.push(m);

function readJson(rel) {
  const path = join(ROOT, rel);
  if (!existsSync(path)) { err(`Không tìm thấy file ${rel}`); return null; }
  try { return JSON.parse(readFileSync(path, "utf8")); }
  catch (e) { err(`${rel}: JSON không hợp lệ (${e.message})`); return null; }
}

// ---------- pieces ----------
const data = readJson("data/pieces.json");
const pieces = Array.isArray(data?.pieces) ? data.pieces : [];
const edges = Array.isArray(data?.edges) ? data.edges : [];
if (data && !Array.isArray(data.pieces)) err("data/pieces.json: thiếu mảng \"pieces\"");
if (data && !Array.isArray(data.edges)) err("data/pieces.json: thiếu mảng \"edges\"");
if (!pieces.length) err('data/pieces.json: cần ít nhất một mảnh kiến thức');

const byId = new Map();
const docsPresent = existsSync(join(ROOT, "docs"));
for (const [i, p] of pieces.entries()) {
  const where = `mảnh #${i} (${p?.id ?? "không có id"})`;
  if (!p || typeof p !== "object") { err(`${where}: không phải object`); continue; }
  if (typeof p.id !== "string" || !ID_RE.test(p.id)) err(`${where}: id phải là chuỗi kebab-case chữ thường`);
  if (byId.has(p.id)) err(`Trùng id: "${p.id}"`);
  byId.set(p.id, p);
  if (!p.title || typeof p.title !== "string") err(`${where}: thiếu title`);
  if (!TYPES.has(p.type)) err(`${where}: type "${p.type}" không thuộc ${[...TYPES].join(" | ")}`);
  if (![1, 2, 3].includes(p.difficulty)) err(`${where}: difficulty phải là 1, 2 hoặc 3`);
  if (!p.summary || typeof p.summary !== "string") err(`${where}: thiếu summary`);
  else if ((p.summary.match(/(?<!\\)\$/g) || []).length % 2) err(`${where}: summary có số dấu $ lẻ (công thức KaTeX chưa đóng)`);
  if (!Array.isArray(p.tags)) err(`${where}: tags phải là mảng`);
  if (!Array.isArray(p.sources) || p.sources.length === 0) err(`${where}: mảnh không có nguồn`);
  else for (const src of p.sources) {
    if (typeof src?.file !== 'string' || !src.file || src.page === undefined || src.page === "") err(`${where}: nguồn thiếu "file" hoặc "page"`);
    else if (docsPresent && src.file.startsWith("docs/") && !existsSync(join(ROOT, src.file)))
      warn(`${where}: file nguồn không tồn tại: ${src.file}`);
  }
  if (p.source !== undefined && p.source !== "ngoài docs") err(`${where}: trường "source" chỉ nhận giá trị "ngoài docs"`);
  if (p.lesson === undefined) err(`${where}: thiếu trường lesson (để "" nếu chưa có bài học)`);
  else if (p.lesson && !existsSync(join(ROOT, p.lesson))) err(`${where}: không tìm thấy file bài học ${p.lesson}`);
}

// lesson files not referenced
const lessonDir = join(ROOT, "content/lessons");
if (existsSync(lessonDir)) {
  const referenced = new Set(pieces.map((p) => p.lesson).filter(Boolean));
  for (const f of readdirSync(lessonDir)) {
    if (f.endsWith(".md") && !referenced.has(`content/lessons/${f}`)) warn(`content/lessons/${f} không được mảnh nào tham chiếu`);
  }
}

// ---------- edges ----------
const seen = new Set();
const prereqOut = new Map();
for (const [i, e] of edges.entries()) {
  if (!e || typeof e !== 'object') { err(`cạnh #${i}: không phải object`); continue; }
  const where = `cạnh #${i} (${e?.source} → ${e?.target})`;
  if (!byId.has(e.source)) err(`${where}: source "${e.source}" không tồn tại`);
  if (!byId.has(e.target)) err(`${where}: target "${e.target}" không tồn tại`);
  if (!RELATIONS.has(e.relation)) err(`${where}: relation "${e.relation}" không thuộc ${[...RELATIONS].join(" | ")}`);
  if (e.source === e.target) err(`${where}: cạnh tự trỏ vào chính nó`);
  const key = `${e.source}|${e.target}|${e.relation}`;
  if (seen.has(key)) err(`${where}: cạnh ${e.relation} bị lặp`);
  seen.add(key);
  if (e.relation === "applies" && !e.note) warn(`${where}: cạnh applies nên có note nói cách áp dụng`);
  if (e.relation === "prerequisite") {
    if (!prereqOut.has(e.source)) prereqOut.set(e.source, []);
    prereqOut.get(e.source).push(e.target);
  }
}

// ---------- prerequisite cycles (DFS ba màu, in ra chu trình) ----------
{
  const color = new Map();
  const stack = [];
  const reported = new Set();
  const visit = (u) => {
    color.set(u, 1); stack.push(u);
    for (const v of prereqOut.get(u) ?? []) {
      if (color.get(v) === 1) {
        const cyc = stack.slice(stack.indexOf(v)).concat(v);
        const key = [...cyc].sort().join(",");
        if (!reported.has(key)) { reported.add(key); err(`Chu trình tiên quyết: ${cyc.join(" → ")}`); }
      } else if (!color.get(v)) visit(v);
    }
    stack.pop(); color.set(u, 2);
  };
  for (const id of prereqOut.keys()) if (!color.get(id)) visit(id);
}

// ---------- courses ----------
const index = readJson("data/courses/index.json");
const listed = new Set(Array.isArray(index?.courses) ? index.courses : []);
const courseDir = join(ROOT, "data/courses");
const onDisk = existsSync(courseDir) ? readdirSync(courseDir).filter((f) => f.endsWith(".json") && f !== "index.json").map((f) => basename(f, ".json")) : [];
for (const c of onDisk) if (!listed.has(c)) warn(`data/courses/${c}.json không có trong data/courses/index.json nên site sẽ không hiển thị`);
if (listed.size === 0) err("data/courses/index.json: cần ít nhất một khóa học");

const inCourse = new Map();
const prereqIn = new Map();
for (const e of edges) if (e.relation === "prerequisite") {
  if (!prereqIn.has(e.target)) prereqIn.set(e.target, []);
  prereqIn.get(e.target).push(e.source);
}
for (const cid of listed) {
  if (typeof cid !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(cid)) { err('Mã khóa học không hợp lệ'); continue; }
  const c = readJson(`data/courses/${cid}.json`);
  if (!c) continue;
  const where = `khóa ${cid}`;
  if (c.id !== cid) err(`${where}: id trong file ("${c.id}") khác tên file`);
  for (const f of ["name", "aim"]) if (!c[f]) err(`${where}: thiếu ${f}`);
  if (!Array.isArray(c.outcomes) || !c.outcomes.length) err(`${where}: thiếu outcomes`);
  if (!Array.isArray(c.chapters) || !c.chapters.length) { err(`${where}: thiếu chapters`); continue; }
  const order = new Map();
  const chapterIds = new Set();
  let k = 0;
  for (const ch of c.chapters) {
    if (!ch.id || !ch.title) err(`${where}: chương thiếu id hoặc title`);
    if (chapterIds.has(ch.id)) err(`${where}: trùng id chương "${ch.id}"`);
    chapterIds.add(ch.id);
    for (const pid of ch.pieces ?? []) {
      if (!byId.has(pid)) { err(`${where}, chương ${ch.id}: tham chiếu mảnh không tồn tại "${pid}"`); continue; }
      if (order.has(pid)) err(`${where}: mảnh "${pid}" xuất hiện hai lần`);
      order.set(pid, k++);
      if (!inCourse.has(pid)) inCourse.set(pid, []);
      inCourse.get(pid).push(cid);
    }
  }
  for (const [pid, pos] of order) {
    for (const pre of prereqIn.get(pid) ?? []) {
      if (order.has(pre) && order.get(pre) > pos) warn(`${where}: "${pid}" đứng trước mảnh tiên quyết "${pre}" của nó`);
    }
  }
}
for (const p of pieces) if (!inCourse.has(p.id)) warn(`mảnh "${p.id}" chưa thuộc khóa học nào (vẫn hiện ở chế độ Khám phá)`);

// ---------- report ----------
const ext = pieces.filter((p) => p.source === "ngoài docs").length;
console.log(`Mảnh: ${pieces.length} · Cạnh: ${edges.length} · Khóa học: ${listed.size} · Bài học: ${pieces.filter((p) => p.lesson).length} · Đánh dấu "ngoài docs": ${ext}`);
if (!docsPresent) console.log("(Không có thư mục docs/ nên bỏ qua kiểm tra file nguồn tồn tại.)");
for (const w of warnings) console.log(`  cảnh báo: ${w}`);
for (const e of errors) console.log(`  LỖI: ${e}`);
const fail = errors.length > 0 || (STRICT && warnings.length > 0);
console.log(fail ? `\n✗ ${errors.length} lỗi, ${warnings.length} cảnh báo` : `\n✓ Dữ liệu hợp lệ (${warnings.length} cảnh báo)`);
process.exit(fail ? 1 : 0);
