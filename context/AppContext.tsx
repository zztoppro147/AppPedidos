import React, { createContext, useState, ReactNode } from 'react';
import { PedidoUnificado, IncidenciaFormRaw, Incidencia } from '../types';
import useLocalStorage from '../hooks/useLocalStorage';

interface AppContextType {
    pedidos: PedidoUnificado[];
    // FIX: Updated type to allow function updates for state setters, aligning with React's `useState` and the `useLocalStorage` hook's return type.
    setPedidos: React.Dispatch<React.SetStateAction<PedidoUnificado[]>>;
    incidenciasRaw: IncidenciaFormRaw[];
    // FIX: Updated type to allow function updates for state setters.
    setIncidenciasRaw: React.Dispatch<React.SetStateAction<IncidenciaFormRaw[]>>;
    incidencias: Incidencia[];
    // FIX: Updated type to allow function updates for state setters. This fixes the root cause of the errors in IncidenciasKanban.tsx.
    setIncidencias: React.Dispatch<React.SetStateAction<Incidencia[]>>;
    darkMode: boolean;
    toggleDarkMode: () => void;
}

export const AppContext = createContext<AppContextType>({
    pedidos: [],
    setPedidos: () => {},
    incidenciasRaw: [],
    setIncidenciasRaw: () => {},
    incidencias: [],
    setIncidencias: () => {},
    darkMode: false,
    toggleDarkMode: () => {},
});

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [pedidos, setPedidos] = useLocalStorage<PedidoUnificado[]>('pedidos_unificados', []);
    const [incidenciasRaw, setIncidenciasRaw] = useLocalStorage<IncidenciaFormRaw[]>('incidencias_form_raw', []);
    const [incidencias, setIncidencias] = useLocalStorage<Incidencia[]>('incidencias', []);
    const [darkMode, setDarkMode] = useLocalStorage<boolean>('darkMode', false);

    const toggleDarkMode = () => {
        setDarkMode(prev => !prev);
    };

    return (
        <AppContext.Provider value={{ 
            pedidos, setPedidos, 
            incidenciasRaw, setIncidenciasRaw,
            incidencias, setIncidencias,
            darkMode, toggleDarkMode
        }}>
            {children}
        </AppContext.Provider>
    );
};
