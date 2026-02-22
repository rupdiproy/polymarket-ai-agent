import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('Utility Functions - cn', () => {
    it('merges tailwind classes properly', () => {
        expect(cn('p-2', 'p-4')).toBe('p-4');
    });

    it('handles conditional class arrays', () => {
        const isTrue = true;
        const isFalse = false;

        expect(cn('base-class', isTrue && 'active', isFalse && 'inactive')).toBe('base-class active');
    });

    it('resolves conflicting tailwind properties based on the latest input', () => {
        expect(cn('bg-red-500 text-white', 'bg-blue-500')).toBe('text-white bg-blue-500');
    });
});
