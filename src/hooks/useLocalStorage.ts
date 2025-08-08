
import { ref, watch, onMounted, Ref } from 'vue';

interface UseLocalStorage<T> {
    storedValue: Ref<T>;
    setValue: (newValue: T) => void;
}

export default function useLocalStorage<T>(key: string, defaultValue: T): UseLocalStorage<T> {
  const storedValue = ref(defaultValue) as Ref<T>;

  const readValue = () => {
    if (typeof window === 'undefined') {
        return;
    }

    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        storedValue.value = JSON.parse(item);
      } else {
        storedValue.value = defaultValue;
        window.localStorage.setItem(key, JSON.stringify(defaultValue));
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      storedValue.value = defaultValue;
    }
  };

  const setValue = (newValue: T) => {
    if (typeof window === 'undefined') {
        console.warn(`Tried to set localStorage key "${key}" on the server.`);
        return;
    }
    try {
      const stringifiedValue = JSON.stringify(newValue);
      window.localStorage.setItem(key, stringifiedValue);
      storedValue.value = newValue;
      // Dispatch event to notify other tabs/windows
      window.dispatchEvent(new StorageEvent('storage', { key, newValue: stringifiedValue }));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };
  
  onMounted(() => {
      readValue();
  });

  // Note: Watching and setting in the same component can cause loops.
  // This hook is designed for one-way binding (read on mount) and a function to update.
  // A deep watch that also sets the value can be computationally expensive.
  // The component using this hook should call `setValue` explicitly.
  // watch(storedValue, setValue, { deep: true });

  return { storedValue, setValue };
}
