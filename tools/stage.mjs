// Copy only public learning materials into the GitHub Pages artifact.
import { cpSync, mkdirSync, rmSync } from 'node:fs';
import { resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = resolve(fileURLToPath(new URL('../', import.meta.url)));
const output = resolve(root, '.cache/pages');
if (output !== resolve(root, '.cache', 'pages') || !output.startsWith(root + sep)) throw new Error('Đường dẫn artifact không hợp lệ');
rmSync(output, { recursive: true, force: true });
mkdirSync(output, { recursive: true });
for (const file of ['index.html', 'lesson.html', '.nojekyll', 'css', 'js', 'assets', 'data', 'content/lessons', 'docs', 'DOCUMENTS.md', 'README.md', 'DESIGN.md', 'REVIEW.md', 'VALIDATION.md']) {
    cpSync(resolve(root, file), resolve(output, file), { recursive: true });
}
console.log(`Artifact: ${output}`);
