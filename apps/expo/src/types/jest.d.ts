import { jest } from '@jest/globals';

declare global {
  const afterEach: typeof jest.afterEach;
  const beforeEach: typeof jest.beforeEach;
  const afterAll: typeof jest.afterAll;
  const beforeAll: typeof jest.beforeAll;
  const describe: typeof jest.describe;
  const expect: typeof jest.expect;
  const it: typeof jest.it;
  const test: typeof jest.test;

  namespace NodeJS {
    interface Global {
      fetch: jest.Mock;
      console: Console & {
        warn: jest.Mock;
        error: (...args: any[]) => void;
      };
    }
  }

  interface Console {
    warn: jest.Mock;
    error: (...args: any[]) => void;
  }
}

declare module '@jest/globals' {
  interface Mock<T = any, Y extends any[] = any> {
    (...args: Y): T;
    mockImplementation(fn: (...args: Y) => T): this;
    mockReturnValue(value: T): this;
    mockReturnThis(): this;
    mockResolvedValue(value: Awaited<T>): this;
    mockRejectedValue(value: any): this;
    mockClear(): this;
    mockReset(): this;
    mockRestore(): this;
  }
}
