import test from 'node:test';
import assert from 'node:assert/strict';
import { stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createSeedState, getEpisode, getMetrics } from '../data.js';

test('a late publication preserves the experience day and clears that episode from the backlog', () => {
  const state = createSeedState();
  const episode = getEpisode(state, 'ep-10');
  const original = { day: episode.day, experienceDate: episode.experienceDate, plannedPublishDate: episode.plannedPublishDate };
  const before = getMetrics(state);

  // Day 10 is published on day 12: the publication date must not renumber it.
  episode.status = 'published';
  episode.publishedAt = '2026-11-06T20:00:00+05:30';
  episode.publicationEvidence = 'manual';
  const after = getMetrics(state);

  assert.deepEqual({ day: episode.day, experienceDate: episode.experienceDate, plannedPublishDate: episode.plannedPublishDate }, original);
  assert.equal(episode.experienceDate, '2026-11-04');
  assert.equal(after.date, '2026-11-06');
  assert.equal(after.due, before.due);
  assert.equal(after.overdue, before.overdue - 1);
  assert.equal(after.pending, before.pending - 1);
  assert.equal(after.publishedDue, before.publishedDue + 1);
});

test('recording publication updates progress once and does not count an exported episode as published', () => {
  const state = createSeedState();
  const before = getMetrics(state);
  const episode = getEpisode(state, 'ep-12');

  // Preparing an export leaves the real publication step pending.
  episode.status = 'ready';
  assert.equal(getMetrics(state).published, before.published);

  episode.status = 'published';
  episode.publishedAt = '2026-11-06T21:00:00+05:30';
  episode.publicationEvidence = 'manual';
  const after = getMetrics(state);
  assert.equal(after.published, before.published + 1);
  assert.equal(after.pending, before.pending - 1);
  assert.equal(after.overdue, before.overdue, 'publishing today does not settle a different overdue episode');
  assert.equal(after.progress, 33);
  assert.equal(after.completion, 83);

  // Repeated/imported records of the same episode must not inflate the goal.
  state.episodes.push(structuredClone(episode));
  assert.equal(getMetrics(state).published, after.published);
  assert.equal(getMetrics(state).total, after.total);
});

test('closing a series and empty or exceeded goals keep honest counts and finite ratios', () => {
  for (const goal of [0, -1, 'invalid', undefined]) {
    const metrics = getMetrics({ series: { startDate: '2026-11-01', currentDay: 1, status: 'closed', goal }, episodes: [] });
    for (const key of ['progress', 'completion', 'remaining', 'goal']) {
      assert.equal(Number.isFinite(metrics[key]), true, `${key} must be finite for an empty series`);
      assert.equal(metrics[key], 0);
    }
  }

  const state = createSeedState();
  state.series.goal = 5;
  const before = getMetrics(state);
  state.series.status = 'closed';
  const closed = getMetrics(state);
  assert.equal(closed.published, before.published, 'closing preserves publication history');
  assert.equal(closed.published, 9, 'the actual count remains visible even above a smaller goal');
  assert.equal(closed.progress, 100);
  assert.equal(closed.remaining, 0);
  assert.equal(Number.isFinite(closed.completion), true);
});

test('every seeded video and poster resolves to a nonempty bundled asset', async () => {
  const state = createSeedState();
  const root = new URL('../', import.meta.url);
  const ids = state.episodes.map(episode => episode.id);
  assert.equal(new Set(ids).size, ids.length, 'episode routes need unique IDs');
  const resources = [...new Set(state.episodes.flatMap(episode => episode.clips.flatMap(clip => [clip.src, clip.poster])))];
  assert.ok(resources.length > 0, 'the demonstration needs playable seed material');

  await Promise.all(resources.map(async resource => {
    assert.match(resource, /^\.\/assets\//, 'seed media must be bundled, not an unverified remote dependency');
    const url = new URL(resource, root);
    assert.ok(url.href.startsWith(root.href), 'asset paths must remain inside the project');
    const info = await stat(fileURLToPath(url));
    assert.equal(info.isFile(), true, `${resource} must be a file`);
    assert.ok(info.size > 0, `${resource} must not be empty`);
  }));
});
