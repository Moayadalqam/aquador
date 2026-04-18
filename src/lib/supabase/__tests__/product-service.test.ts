/**
 * Gender filter contract test for `getProductsByGender`.
 *
 * v3.7 widened the query so `men` and `women` pages include `unisex` products.
 * The `unisex` page remains focused (unisex-only).
 *
 * This test locks the `.in('gender', [...])` contract so a future refactor
 * can't silently narrow the query back.
 */

// React `cache()` is used elsewhere in product-service.ts — stub it in Jest env.
jest.mock('react', () => {
  const actual = jest.requireActual('react');
  return { ...actual, cache: <T,>(fn: T) => fn };
});

// Captured calls to `.in(col, values)` for assertion.
const inCalls: Array<{ column: string; values: unknown[] }> = [];
// Captured calls to `.or(filter)` for assertion.
const orCalls: string[] = [];

interface MockChain {
  select: jest.Mock;
  in: jest.Mock;
  eq: jest.Mock;
  or: jest.Mock;
  order: jest.Mock;
  then: (resolve: (value: { data: unknown[]; error: null }) => void) => void;
}

// Minimal chain mirroring the Supabase client surface used by `getProductsByGender`.
function buildChain(): MockChain {
  const chain: MockChain = {
    select: jest.fn(() => chain),
    in: jest.fn((column: string, values: unknown[]) => {
      inCalls.push({ column, values });
      return chain;
    }),
    eq: jest.fn(() => chain),
    or: jest.fn((filter: string) => {
      orCalls.push(filter);
      return chain;
    }),
    order: jest.fn(() => chain),
    then: (resolve) => resolve({ data: [], error: null }),
  };
  return chain;
}

jest.mock('@/lib/supabase/public', () => ({
  createPublicClient: jest.fn(() => ({
    from: jest.fn(() => buildChain()),
  })),
}));

jest.mock('@sentry/nextjs', () => ({
  addBreadcrumb: jest.fn(),
}));

// Import under test AFTER mocks
import { getProductsByGender } from '../product-service';

describe('getProductsByGender — gender filter widening (v3.7)', () => {
  beforeEach(() => {
    inCalls.length = 0;
    orCalls.length = 0;
  });

  it('men page includes both "men" and "unisex"', async () => {
    await getProductsByGender('men');

    expect(inCalls).toHaveLength(1);
    expect(inCalls[0].column).toBe('gender');
    expect(inCalls[0].values).toEqual(['men', 'unisex']);
  });

  it('women page includes both "women" and "unisex"', async () => {
    await getProductsByGender('women');

    expect(inCalls).toHaveLength(1);
    expect(inCalls[0].column).toBe('gender');
    expect(inCalls[0].values).toEqual(['women', 'unisex']);
  });

  it('unisex page remains focused — only "unisex"', async () => {
    await getProductsByGender('unisex');

    expect(inCalls).toHaveLength(1);
    expect(inCalls[0].column).toBe('gender');
    expect(inCalls[0].values).toEqual(['unisex']);
  });

  it('restricts all gender pages to Aquad\'or brand (null or ilike %aquad%)', async () => {
    await getProductsByGender('men');
    expect(orCalls).toEqual(['brand.is.null,brand.ilike.%aquad%']);

    orCalls.length = 0;
    await getProductsByGender('women');
    expect(orCalls).toEqual(['brand.is.null,brand.ilike.%aquad%']);

    orCalls.length = 0;
    await getProductsByGender('unisex');
    expect(orCalls).toEqual(['brand.is.null,brand.ilike.%aquad%']);
  });
});
