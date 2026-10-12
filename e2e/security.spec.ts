import { test, expect } from '@playwright/test';
import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join } from 'path';

function walk(dir: string, out: string[] = []): string[] {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

// TC-013: no secret may ever land in the built bundle or prerendered HTML.
test('TC-013: no secrets in built output', async () => {
  const dist = join(process.cwd(), 'dist');
  test.skip(!existsSync(dist), 'dist not built yet');
  const files = walk(dist).filter((f) => /\.(js|html|css|json|xml)$/.test(f));
  expect(files.length).toBeGreaterThan(0);
  const forbidden = ['ANTHROPIC_API_KEY', 'sk-ant-'];
  for (const f of files) {
    if (f.endsWith('temples-meta.json')) continue;
    const content = readFileSync(f, 'utf8');
    for (const secret of forbidden) {
      expect(content, `${f} must not contain ${secret}`).not.toContain(secret);
    }
  }
});

// TC-029: no local filesystem paths in built output.
test('TC-029: no local filesystem paths in built output', async () => {
  const dist = join(process.cwd(), 'dist');
  test.skip(!existsSync(dist), 'dist not built yet');
  const files = walk(dist).filter((f) => /\.(js|html)$/.test(f));
  for (const f of files) {
    const content = readFileSync(f, 'utf8');
    expect(content, `${f} must not contain /Users/ paths`).not.toContain('/Users/');
  }
});
