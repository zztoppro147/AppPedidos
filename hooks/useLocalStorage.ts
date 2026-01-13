
import { useState, useEffect } from 'react';

function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
    const [storedValue, setStoredValue] = useState<T>(() => {
        if (typeof window === "undefined") {
            return initialValue;
        }
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item, (k, v) => {
                // JSON.parse doesn't automatically convert date strings to Date objects
                if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(v)) {
                    return new Date(v);
                }
                return v;
            }) : initialValue;
        } catch (error) {
            console.error(error);
            return initialValue;
        }
    });

    const setValue = (value: T | ((val: T) => T)) => {
        try {
            // Use the functional update form of useState's setter to ensure we have the latest state.
            setStoredValue(prevValue => {
                const valueToStore = value instanceof Function ? value(prevValue) : value;
                if (typeof window !== "undefined") {
                    window.localStorage.setItem(key, JSON.stringify(valueToStore));
                }
                return valueToStore;
            });
        } catch (error) {
            console.error("Could not save to local storage", error);
        }
    };

    return [storedValue, setValue];
}

export default useLocalStorage;