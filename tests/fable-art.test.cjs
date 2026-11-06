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
    const image = fs.readFileSync(path.join(root, 'art/fables', story.id + '.png'));
    assert.equal(image.subarray(1,4).toString(), 'PNG');
    assert.equal(image.readUInt32BE(16) / image.readUInt32BE(20), 1.5);
  }
});
