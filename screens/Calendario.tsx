
import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Incidencia, StatusIncidencia } from '../types';

const Calendario: React.FC = () => {
    const { incidencias } = useContext(AppContext);
    const [currentDate, setCurrentDate] = useState(new Date());

    const startOfWeek = (date: Date) => {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
        return new Date(d.setDate(diff));
    };

    const addDays = (date: Date, days: number) => {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    };
    
    const weekStart = startOfWeek(currentDate);
    const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));

    const isSameDay = (d1: Date, d2: Date) => 
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();

    const changeWeek = (amount: number) => {
        setCurrentDate(addDays(currentDate, amount * 7));
    };

    return (
        <div className="container mx-auto flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Calendario Semanal</h1>
                <div className="flex items-center gap-4">
                    <button onClick={() => changeWeek(-1)} className="px-4 py-2 bg-b44-primary text-white rounded">&lt; Anterior</button>
                    <span className="font-semibold">{weekStart.toLocaleDateString()} - {addDays(weekStart, 6).toLocaleDateString()}</span>
                    <button onClick={() => changeWeek(1)} className="px-4 py-2 bg-b44-primary text-white rounded">Siguiente &gt;</button>
                </div>
            </div>
            
            <div className="flex-grow grid grid-cols-1 md:grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                {weekDays.map(day => (
                    <div key={day.toISOString()} className="bg-b44-light dark:bg-b44-dark flex flex-col">
                        <div className="p-2 text-center font-bold border-b border-gray-200 dark:border-gray-700">
                            {day.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric' })}
                        </div>
                        <div className="p-2 flex-grow space-y-2 overflow-y-auto">
                            {incidencias.map(incidencia => {
                                const createdAt = new Date(incidencia.created_at);
                                const dueDate = new Date(incidencia.due_date);
                                const isCreated = isSameDay(createdAt, day);
                                const isDue = isSameDay(dueDate, day);
                                const isOverdue = dueDate < new Date() && incidencia.status !== StatusIncidencia.Finalizado;

                                if (!isCreated && !isDue) return null;

                                return (
                                    <div key={incidencia.incidencia_id} className="text-xs p-1.5 rounded-md text-white">
                                        {isCreated && (
                                            <div className="bg-blue-500 p-1 rounded">
                                                <p className="font-semibold">Creada:</p>
                                                <p>{incidencia.numpedido}</p>
                                            </div>
                                        )}
                                        {isDue && (
                                            <div className={`mt-1 p-1 rounded ${isOverdue ? 'bg-red-600' : 'bg-yellow-600'}`}>
                                                <p className="font-semibold">Vence:</p>
                                                <p>{incidencia.numpedido}</p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Calendario;
