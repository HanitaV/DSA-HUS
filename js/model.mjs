export const TYPES = { concept: 'Khái niệm', theorem: 'Định lý', formula: 'Công thức', example: 'Ví dụ', exercise: 'Bài tập' };
export const normalize = text => String(text).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
export const prerequisites = (id, edges) => edges.filter(e => e.relation === 'prerequisite' && e.target === id).map(e => e.source);
export const ready = (id, edges, learned) => prerequisites(id, edges).every(p => learned.has(p));
export const courseIds = course => course.chapters.flatMap(ch => ch.pieces);
export function recommend(course, edges, learned) {
    return courseIds(course).find(id => !learned.has(id) && ready(id, edges, learned)) || null;
}
export function loadProgress(storage) {
    try {
        const value = JSON.parse(storage.getItem('hus.learned.v1') || '[]');
        return { learned: new Set(Array.isArray(value) ? value.filter(x => typeof x === 'string') : []), available: true };
    } catch { return { learned: new Set(), available: false }; }
}
export function saveProgress(storage, learned) {
    try { storage.setItem('hus.learned.v1', JSON.stringify([...learned])); return true; }
    catch { return false; }
}
export function readRoute(hash = '') {
    const params = new URLSearchParams(hash.replace(/^#/, ''));
    return { piece: params.get('piece'), course: params.get('course') };
}
export function route({ piece, course }, page = '') {
    const params = new URLSearchParams();
    if (course) params.set('course', course);
    if (piece) params.set('piece', piece);
    return `${page}#${params}`;
}
