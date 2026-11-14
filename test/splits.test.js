const test = require('node:test');
const assert = require('node:assert/strict');
const { buildSplits } = require('../support/load-core');

const close = (actual, expected, tol = 0.01) =>
  assert.ok(Math.abs(actual - expected) <= tol, `expected ${actual} to be within ${tol} of ${expected}`);

test('even pacing: 5K in 25:00 with 1 km splits gives a row per km, ending at the finish', () => {
  const rows = buildSplits(1500, 5, 1, false);

  assert.deepEqual(
    rows.map(r => [r.km, r.elapsed, r.segment, r.finish]),
    [
      [1, 300, 300, false],
      [2, 600, 300, false],
      [3, 900, 300, false],
      [4, 1200, 300, false],
      [5, 1500, 300, true],
    ]
  );
});

test('marathon in 3:45:00 with 5 km splits: 5 km at 26:40 and a partial final segment of 11:42', () => {
  const rows = buildSplits(13500, 42.195, 5, false);

  assert.equal(rows.length, 9); // 5, 10, ... 40 km, then the finish
  assert.equal(rows[0].km, 5);
  assert.equal(Math.round(rows[0].elapsed), 26 * 60 + 40);

  const last = rows[rows.length - 1];
  assert.equal(last.finish, true);
  assert.equal(last.km, 42.195);
  assert.equal(last.elapsed, 13500);
  assert.equal(Math.round(last.segment), 11 * 60 + 42); // the 2.195 km left after 40 km
});

test('a distance that is an exact multiple of the interval has no duplicate row before the finish', () => {
  const rows = buildSplits(2000, 10, 5, false);

  assert.deepEqual(rows.map(r => [r.km, r.finish]), [[5, false], [10, true]]);
});

test('a distance shorter than the interval gives only the finish row', () => {
  const rows = buildSplits(30, 0.1, 1, false);

  assert.equal(rows.length, 1);
  assert.deepEqual([rows[0].km, rows[0].elapsed, rows[0].segment, rows[0].finish], [0.1, 30, 30, true]);
});

test('400 m splits on a 1500 m run in 4:05.3 keep fractional seconds', () => {
  const rows = buildSplits(245.3, 1.5, 0.4, false);

  assert.deepEqual(rows.map(r => r.km), [0.4, 0.8, 1.2, 1.5]);
  close(rows[0].elapsed, 65.4133);
  close(rows[1].elapsed, 130.8267);
  close(rows[2].elapsed, 196.24);
  close(rows[3].segment, 49.06);
  assert.equal(rows[3].elapsed, 245.3);
});

test('segments add back up to the target time with no drift over many small splits', () => {
  const rows = buildSplits(13500, 42.195, 0.4, false);

  assert.equal(rows.length, 106); // 105 marks of 400 m up to 42.0 km, plus the finish
  const sum = rows.reduce((acc, r) => acc + r.segment, 0);
  close(sum, 13500, 1e-6);
});

test('negative split: 2nd half is 3% faster, so a 10 km in 2000 s reaches halfway in 2000/1.97 s', () => {
  const rows = buildSplits(2000, 10, 5, true);

  close(rows[0].elapsed, 1015.228, 0.001);        // first half
  close(rows[1].segment, 984.772, 0.001);         // second half
  close(rows[1].segment / rows[0].segment, 0.97, 1e-4);
  assert.equal(rows[1].elapsed, 2000);            // finish time is unchanged
  assert.equal(rows[1].finish, true);
});

test('negative split: each 1 km segment is faster than the one before and the finish time is unchanged', () => {
  const rows = buildSplits(2000, 10, 1, true);

  assert.equal(rows.length, 10);
  for (let i = 1; i < rows.length; i++) {
    assert.ok(rows[i].segment < rows[i - 1].segment, `segment ${i + 1} should be faster than segment ${i}`);
    assert.ok(rows[i].elapsed > rows[i - 1].elapsed);
  }
  assert.equal(rows[9].elapsed, 2000);
  close(rows.reduce((acc, r) => acc + r.segment, 0), 2000, 1e-6);
});
