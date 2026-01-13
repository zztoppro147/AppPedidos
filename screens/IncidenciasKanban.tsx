
import React, { useState, useContext, useMemo, useCallback } from 'react';
import { AppContext } from '../context/AppContext';
import { Incidencia, StatusIncidencia, ChecklistItem } from '../types';

const IncidenciaCard: React.FC<{ 
    incidencia: Incidencia; 
    onUpdate: (updatedIncidencia: Incidencia) => void;
    onArchive: (incidenciaId: string) => void;
    onRestore: (incidenciaId: string) => void;
}> = ({ incidencia, onUpdate, onArchive, onRestore }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleChecklistItem = (itemId: string) => {
        const updatedItems = incidencia.checklist_items.map(item =>
            item.id === itemId ? { ...item, done: !item.done } : item
        );
        onUpdate({ ...incidencia, checklist_items: updatedItems });
    };

    const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onUpdate({ ...incidencia, notas: e.target.value });
    };

    const handleArchiveClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onArchive(incidencia.incidencia_id);
    };

    const handleRestoreClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onRestore(incidencia.incidencia_id);
    }
    
    const dueDate = new Date(incidencia.due_date);
    const isOverdue = dueDate < new Date() && incidencia.status !== StatusIncidencia.Finalizado && incidencia.status !== StatusIncidencia.Archivado;

    const isArchived = incidencia.status === StatusIncidencia.Archivado;

    return (
        <div 
            draggable={!isArchived} 
            onDragStart={(e) => !isArchived && e.dataTransfer.setData("incidencia_id", incidencia.incidencia_id)}
            className={`bg-white dark:bg-b44-dark-alt rounded-lg shadow-md p-4 mb-4 transition-all ${isArchived ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'}`}
        >
            <div className="flex items-start gap-4" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="w-full cursor-pointer">
                    <div className="flex justify-between items-start">
                        <p className="font-bold text-gray-800 dark:text-gray-200">{incidencia.numpedido}</p>
                        <span className={`px-2 py-1 text-xs rounded-full ${isOverdue ? 'bg-red-200 text-red-800' : 'bg-gray-200 dark:bg-gray-600'}`}>
                           Vence: {dueDate.toLocaleDateString()}
                        </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{incidencia.club}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">{incidencia.email}</p>
                     {!incidencia.pedido_encontrado && <p className="text-xs text-red-500 font-semibold mt-1">Pedido no encontrado en los datos</p>}
                </div>
            </div>

            {isExpanded && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="font-semibold mb-2">Checklist</h4>
                    <ul className="space-y-1 text-sm mb-4">
                        {incidencia.checklist_items.map(item => (
                            <li key={item.id} className="flex items-center">
                                <input type="checkbox" checked={item.done} onChange={() => toggleChecklistItem(item.id)} className="mr-2 h-4 w-4 rounded border-gray-300 text-b44-primary focus:ring-b44-primary"/>
                                <span className={item.done ? 'line-through text-gray-500' : ''}>{item.label}</span>
                            </li>
                        ))}
                    </ul>
                    <h4 className="font-semibold mb-2">Notas</h4>
                    <textarea value={incidencia.notas} onChange={handleNotesChange} className="w-full h-24 p-2 border rounded bg-b44-light dark:bg-b44-dark dark:border-gray-600 text-sm" placeholder="Añadir notas..."/>
                     <div className="mt-4 flex justify-between items-center">
                        <p className="text-xs text-gray-500">Creada: {new Date(incidencia.created_at).toLocaleString()}</p>
                        {isArchived ? (
                             <button onClick={handleRestoreClick} className="text-xs text-green-500 hover:text-green-700">Restaurar</button>
                        ) : (
                             <button onClick={handleArchiveClick} className="text-xs text-yellow-600 hover:text-yellow-800">Archivar</button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const IncidenciasKanban: React.FC = () => {
    const { incidencias, setIncidencias } = useContext(AppContext);
    const [clubFilter, setClubFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('activas');

    const clubs = useMemo(() => [...new Set(incidencias.map(i => i.club).filter(Boolean))], [incidencias]);
    
    const activeColumns: { id: StatusIncidencia, title: string }[] = [
        { id: StatusIncidencia.EsperandoArreglo, title: 'Esperando Arreglo' },
        { id: StatusIncidencia.Arreglando, title: 'Arreglando' },
        { id: StatusIncidencia.Finalizado, title: 'Finalizado' },
    ];
    const archivedColumn = [{ id: StatusIncidencia.Archivado, title: 'Archivados' }];

    const visibleColumns = statusFilter === 'activas' ? activeColumns : archivedColumn;

    const filteredIncidencias = useMemo(() => {
        return clubFilter ? incidencias.filter(i => i.club === clubFilter) : incidencias;
    }, [incidencias, clubFilter]);

    const handleUpdate = useCallback((updatedIncidencia: Incidencia) => {
        setIncidencias(prev => prev.map(i => i.incidencia_id === updatedIncidencia.incidencia_id ? updatedIncidencia : i));
    }, [setIncidencias]);

    const handleArchive = useCallback((incidenciaId: string) => {
        setIncidencias(prev => prev.map(i => 
            i.incidencia_id === incidenciaId ? { ...i, status: StatusIncidencia.Archivado } : i
        ));
    }, [setIncidencias]);

    const handleRestore = useCallback((incidenciaId: string) => {
        setIncidencias(prev => prev.map(i => 
            i.incidencia_id === incidenciaId ? { ...i, status: StatusIncidencia.EsperandoArreglo } : i
        ));
    }, [setIncidencias]);

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>, status: StatusIncidencia) => {
        e.preventDefault();
        const incidenciaId = e.dataTransfer.getData("incidencia_id");
        setIncidencias(prev => prev.map(inc => {
            if (inc.incidencia_id === incidenciaId) {
                return { ...inc, status: status };
            }
            return inc;
        }));
    }, [setIncidencias]);

    return (
        <div className="flex flex-col h-full">
            <div className="p-4 bg-white dark:bg-b44-dark-alt rounded-lg shadow mb-6 flex justify-between items-center flex-wrap gap-4">
                <div className="flex items-center gap-4">
                    <div>
                        <label htmlFor="clubFilter" className="font-semibold mr-2">Filtrar por Club:</label>
                        <select id="clubFilter" value={clubFilter} onChange={e => setClubFilter(e.target.value)} className="p-2 border rounded bg-b44-light dark:bg-b44-dark dark:border-gray-600">
                            <option value="">Todos los clubs</option>
                            {clubs.map(club => <option key={club} value={club}>{club}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="statusFilter" className="font-semibold mr-2">Filtrar por Estado:</label>
                        <select id="statusFilter" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="p-2 border rounded bg-b44-light dark:bg-b44-dark dark:border-gray-600">
                            <option value="activas">Activas</option>
                            <option value="archivadas">Archivadas</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className={`flex-grow grid grid-cols-1 ${statusFilter === 'activas' ? 'md:grid-cols-3' : 'md:grid-cols-1'} gap-6`}>
                {visibleColumns.map(column => (
                    <div key={column.id} className="bg-b44-light-alt dark:bg-b44-dark-alt/50 rounded-lg flex flex-col">
                        <h3 className="p-4 text-lg font-bold border-b dark:border-gray-700">{column.title}</h3>
                        <div 
                            onDragOver={(e) => statusFilter === 'activas' && e.preventDefault()}
                            onDrop={(e) => statusFilter === 'activas' && handleDrop(e, column.id)}
                            className="p-4 flex-grow overflow-y-auto"
                        >
                            {filteredIncidencias
                                .filter(i => i.status === column.id)
                                .sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                                .map(incidencia => (
                                    <IncidenciaCard 
                                        key={incidencia.incidencia_id} 
                                        incidencia={incidencia} 
                                        onUpdate={handleUpdate}
                                        onArchive={handleArchive}
                                        onRestore={handleRestore}
                                    />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default IncidenciasKanban;