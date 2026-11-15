"""Inventory and extract local teaching sources. pip install pymupdf python-docx python-pptx"""
from pathlib import Path
import json
import zipfile
import re
import hashlib
import pymupdf
from docx import Document
from pptx import Presentation

ROOT = Path(__file__).resolve().parent.parent
CACHE = ROOT / '.cache' / 'documents'
CACHE.mkdir(parents=True, exist_ok=True)
records = []
for path in sorted((ROOT / 'docs').rglob('*')):
    if not path.is_file():
        continue
    rel = path.relative_to(ROOT).as_posix()
    ext = path.suffix.lower()
    record = {'file': rel, 'type': ext.lstrip('.') or 'binary', 'course': path.relative_to(ROOT / 'docs').parts[0],
              'chapter': path.parent.name, 'pages': None, 'status': 'read', 'emptyPages': []}
    pages = []
    try:
        if ext == '.pdf':
            with pymupdf.open(path) as doc:
                pages = [page.get_text() for page in doc]
                record['pages'] = len(pages)
                record['emptyPages'] = [i + 1 for i, text in enumerate(pages) if len(text.strip()) < 40]
        elif ext == '.pptx':
            slides = Presentation(path).slides
            pages = ['\n'.join(s.text for s in slide.shapes if s.has_text_frame) for slide in slides]
            record['pages'] = len(pages)
        elif ext == '.docx':
            doc = Document(path)
            pages = ['\n'.join([p.text for p in doc.paragraphs] + [' | '.join(c.text for c in row.cells) for t in doc.tables for row in t.rows])]
            record['status'] = 'read-no-stable-pagination'
        elif ext == '.zip':
            with zipfile.ZipFile(path) as archive:
                record['entries'] = len(archive.infolist())
                for item in archive.infolist():
                    if not item.is_dir() and Path(item.filename).suffix.lower() in {'.java', '.txt', '.csv', '.md'}:
                        pages.append(item.filename + '\n' + archive.read(item).decode('utf-8', errors='replace'))
            record['status'] = 'archive-indexed-text-read'
        elif ext in {'.java', '.txt', '.csv'}:
            pages = [path.read_text(encoding='utf-8', errors='replace')]
        else:
            path.read_bytes()
            record['status'] = 'binary-read-no-teaching-text'
        key = hashlib.sha256(rel.encode()).hexdigest()[:16]
        record['cache'] = key + '.json'
        record['characters'] = sum(map(len, pages))
        (CACHE / record['cache']).write_text(json.dumps(pages, ensure_ascii=False), encoding='utf-8')
    except Exception as exc:
        record['status'] = 'error'
        record['error'] = str(exc)
    records.append(record)
    if len(records) % 100 == 0:
        print(f'Read {len(records)} files', flush=True)
(ROOT / 'data/documents.json').write_text(json.dumps(records, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
lines = ['# Danh mục tài liệu', '', 'Danh mục được tạo bằng `python tools/inventory.py`. Số trang là thứ tự trang PDF (bắt đầu từ 1), số slide cho PPTX. DOCX không có phân trang ổn định; mã nguồn và tệp nén không có số trang. Mọi trang PDF và slide đã được trích xuất tự động; việc này không thay thế thẩm định nội dung từng trang. Xem REVIEW.md về phạm vi biên soạn.', '', '| Tài liệu | Loại | Trang / slide | Môn | Chương / thư mục | Trạng thái |', '|---|---|---:|---|---|---|']
for r in records:
    name = Path(r['file']).name.replace('|', '\\|')
    link = r['file'].replace(' ', '%20').replace('(', '%28').replace(')', '%29')
    lines.append(f"| [{name}]({link}) | {r['type']} | {r['pages'] if r['pages'] is not None else '—'} | {r['course']} | {r['chapter']} | {r['status']}" + (f"; {len(r['emptyPages'])} trang ít chữ" if r['emptyPages'] else '') + ' |')
(ROOT / 'DOCUMENTS.md').write_text('\n'.join(lines) + '\n', encoding='utf-8')
print(json.dumps({'files': len(records), 'pages': sum(r['pages'] or 0 for r in records), 'errors': [r for r in records if r['status'] == 'error']}, ensure_ascii=False))
