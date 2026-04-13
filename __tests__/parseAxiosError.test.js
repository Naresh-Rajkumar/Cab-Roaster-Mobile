import { parseAxiosErrorMessage } from '../src/utils/parseAxiosError';

describe('parseAxiosErrorMessage', () => {
  it('returns a string for undefined error', () => {
    const msg = parseAxiosErrorMessage(undefined);
    expect(typeof msg).toBe('string');
    expect(msg.length).toBeGreaterThan(0);
  });

  it('extracts Nest-style validation array messages', () => {
    const err = {
      response: {
        data: { message: ['Field required', 'Invalid format'] },
      },
    };
    const msg = parseAxiosErrorMessage(err);
    expect(msg).toContain('Field required');
  });
});
