import { describe, expect, test } from 'vitest';
import {
  buildNavigateUrl,
  canCallLocation,
  copyTextToClipboard,
  filterLocations,
  getRecentLocations,
  pushRecentLocation,
  readRecentIds,
  writeRecentIds,
  type DataCollection,
} from './location-helpers.js';

const sampleData: DataCollection = {
  stand401: {
    name: 'Stand 401',
    location: 'Main Hall West',
    help: false,
  },
  mscp1: {
    name: 'Multi story car park 1',
    location: 'By the cars',
    help: true,
  },
};

describe('filterLocations', () => {
  test('returns empty array for blank query', () => {
    expect(filterLocations(sampleData, '   ')).toEqual([]);
  });

  test('matches by key, name, and location (case-insensitive)', () => {
    expect(filterLocations(sampleData, 'stand').map(result => result.key)).toEqual(['stand401']);
    expect(filterLocations(sampleData, 'multi story').map(result => result.key)).toEqual(['mscp1']);
    expect(filterLocations(sampleData, 'cars').map(result => result.key)).toEqual(['mscp1']);
  });
});

describe('pushRecentLocation', () => {
  test('dedupes selected id and limits list to 5 most recent', () => {
    const current = ['a', 'b', 'c', 'd', 'e'];
    const movedExisting = pushRecentLocation(current, 'c');
    expect(movedExisting).toEqual(['c', 'a', 'b', 'd', 'e']);

    const withNew = pushRecentLocation(movedExisting, 'f');
    expect(withNew).toEqual(['f', 'c', 'a', 'b', 'd']);
  });
});

describe('buildNavigateUrl', () => {
  test('builds encoded Google Maps URL', () => {
    expect(buildNavigateUrl('By the cars & gate')).toBe(
      'https://www.google.com/maps/search/?api=1&query=By%20the%20cars%20%26%20gate',
    );
  });
});

describe('canCallLocation', () => {
  test('returns false for undefined or blank values', () => {
    expect(canCallLocation()).toBe(false);
    expect(canCallLocation('   ')).toBe(false);
  });

  test('returns true for non-empty values', () => {
    expect(canCallLocation('+441234567890')).toBe(true);
  });
});

describe('recent storage helpers', () => {
  test('readRecentIds returns [] when storage is unavailable or invalid', () => {
    expect(readRecentIds(null, 'recent-location-ids')).toEqual([]);

    const invalidStorage = {
      getItem: () => 'not-json',
      setItem: () => undefined,
    };

    expect(readRecentIds(invalidStorage, 'recent-location-ids')).toEqual([]);
  });

  test('writeRecentIds stores JSON and returns true on success', () => {
    const store = new Map<string, string>();

    const storage = {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => {
        store.set(key, value);
      },
    };

    const result = writeRecentIds(storage, 'recent-location-ids', ['a', 'b']);
    expect(result).toBe(true);
    expect(store.get('recent-location-ids')).toBe('["a","b"]');
  });
});

describe('getRecentLocations', () => {
  test('returns locations in recency order and skips unknown ids', () => {
    const ordered = getRecentLocations(sampleData, ['mscp1', 'missing', 'stand401']);
    expect(ordered.map(result => result.key)).toEqual(['mscp1', 'stand401']);
  });
});

describe('copyTextToClipboard', () => {
  test('returns success when clipboard write resolves', async () => {
    const navigatorLike = {
      clipboard: {
        writeText: async () => undefined,
      },
    };

    await expect(copyTextToClipboard(navigatorLike, 'stand401')).resolves.toEqual({ ok: true });
  });

  test('returns failure when clipboard is unavailable', async () => {
    await expect(copyTextToClipboard({}, 'stand401')).resolves.toEqual({ ok: false });
  });
});
