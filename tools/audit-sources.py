"""Check citation ranges and produce a local review bundle from extracted documents."""
import json
import re
from pathlib import Path

root = Path(__file__).resolve().parent.parent
docs = {d['file']: d for d in json.loads((root / 'data/documents.json').read_text(encoding='utf-8'))}
data = json.loads((root / 'data/pieces.json').read_text(encoding='utf-8'))
bundle = []
problems = []
for p in data['pieces']:
    section = ['# ' + p['id'], p['summary']]
    for source in p['sources']:
        d = docs.get(source['file'])
        if not d:
            problems.append([p['id'], 'missing file', source])
            continue
        pages = json.loads((root / '.cache/documents' / d['cache']).read_text(encoding='utf-8'))
        nums = list(map(int, re.findall(r'\d+', str(source['page']))))
        indexes = range(nums[0], nums[-1] + 1) if nums else []
        for n in indexes:
            if n < 1 or n > len(pages):
                problems.append([p['id'], 'invalid page', n])
                continue
            section.append(f"\n## {Path(source['file']).name} — trang {n}\n{pages[n-1]}")
    bundle.append('\n'.join(section))
(root / '.cache/source-review.txt').write_text('\n\n'.join(bundle), encoding='utf-8')
print(json.dumps({'citations': sum(len(p['sources']) for p in data['pieces']), 'problems': problems}, ensure_ascii=False))
