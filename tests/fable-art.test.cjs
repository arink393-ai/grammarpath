const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

test('every fable has a cover and a distinct illustration for each story scene', () => {
  const data = html.slice(html.indexOf('const FABLES = '), html.indexOf('STORIES.push.apply(STORIES, FABLES)'));
  const art = html.slice(html.indexOf('function fableIllustration('), html.indexOf('const storyById'));
  const result = vm.runInNewContext(data + art + '; ({fables:FABLES,covers:FABLE_ART,scenes:FABLE_SCENE_ART})');
  assert.equal(result.fables.length, 12);
  for (const story of result.fables) {
    const scenes = result.scenes[story.id];
    assert.equal(scenes.length, story.scenes.length);
    assert.ok(scenes.length <= 3);
    assert.equal(new Set([result.covers[story.id], ...scenes]).size, scenes.length + 1);
    assert.match(result.covers[story.id], /background-position:0% 0%/);
    assert.match(scenes[0], /background-position:100% 0%/);
    const image = fs.readFileSync(path.join(root, 'art/fables', story.id + '.webp'));
    assert.equal(image.subarray(0,4).toString(), 'RIFF');
    assert.equal(image.subarray(8,12).toString(), 'WEBP');
    // VP8 (lossy) 影格：寬高在 chunk 起點後第 14、16 位元組（14 bit）
    assert.equal(image.subarray(12,16).toString(), 'VP8 ');
    const w = image.readUInt16LE(26) & 0x3fff, h = image.readUInt16LE(28) & 0x3fff;
    assert.equal(w / h, 1.5);
  }
});
