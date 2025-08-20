import { renderHook, act } from '@testing-library/react';
import useLocalStorage from '../hooks/useLocalStorage';

describe('useLocalStorage', () => {
  it('stores and retrieves a value', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));
    const [value, setValue] = result.current;
    expect(value).toBe('default');
    act(() => setValue('updated'));
    const [newValue] = result.current;
    expect(newValue).toBe('updated');
  });
});
