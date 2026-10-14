import { describe, it, expect, vi, afterEach } from 'vitest';
import { api } from './api.js';

afterEach(() => vi.unstubAllGlobals());

describe('API client', () => {
  it('returns problem data for successful responses', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ problems: [{ id: 'parking-lot' }] }) }));
    await expect(api.problems()).resolves.toEqual({ problems: [{ id: 'parking-lot' }] });
  });
  it('surfaces validation errors with details', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, json: async () => ({ error: 'Submission validation failed', details: [{ field: 'classes' }] }) }));
    await expect(api.submit({})).rejects.toMatchObject({ message: 'Submission validation failed', details: [{ field: 'classes' }] });
  });
  it('keeps failed attempt responses available for retry UI', async () => {
    const attempt = { _id: 'abc', status: 'failed', errorMessage: 'provider timeout' };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, json: async () => ({ attempt }) }));
    await expect(api.submit({})).resolves.toEqual({ attempt });
  });
});
