import { describe, it, expect } from 'vitest';
import { cn } from '../../lib/utils';

describe('cn utility function', () => {
  /**
   * TEST 1: Merges multiple class names
   */
  it('should merge multiple class names', () => {
    expect(cn('foo', 'bar', 'baz')).toBe('foo bar baz');
  });

  /**
   * TEST 2: Filters out falsy values
   */
  it('should filter out falsy values', () => {
    expect(cn('foo', null, undefined, false, '', 'bar')).toBe('foo bar');
  });

  /**
   * TEST 3: Returns empty string when all inputs are falsy
   */
  it('should return empty string when all inputs are falsy', () => {
    expect(cn(null, undefined, false, '')).toBe('');
  });

  /**
   * TEST 4: Works with single class name
   */
  it('should work with a single class name', () => {
    expect(cn('only-class')).toBe('only-class');
  });
});
