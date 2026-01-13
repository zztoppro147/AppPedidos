import React, { useState, useContext, useMemo } from 'react';
import { AppContext } from '../context/AppContext';
import { PedidoAgrupado, PedidoUnificado, Incidencia, StatusIncidencia, ChecklistItem, ManualIncidenciaType, MANUAL_INCIDENCIA_TYPES } from '../types';

interface ModalData {
    type: 'pedido' | 'producto';
    numpedido: string;
    linea?: PedidoUnificado;
    lineas?: PedidoUnificado[];
}

const ManualIncidenciaModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (type: ManualIncidenciaType, details: string) => void;
}> = ({ isOpen, onClose, onSubmit }) => {
    const [tipo, setTipo] = useState<ManualIncidenciaType | ''>('');
    const [detalle, setDetalle] = useState('');

    const handleSubmit = () => {
        if (tipo && detalle) {
            onSubmit(tipo, detalle);
            setTipo('');
            setDetalle('');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-b44-dark-alt rounded-lg shadow-xl p-6 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">Nueva Incidencia Manual</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium">Tipo de Incidencia</label>
                        <select value={tipo} onChange={e => setTipo(e.target.value as ManualIncidenciaType)} className="mt-1 block w-full p-2 border rounded bg-b44-light dark:bg-b44-dark dark:border-gray-600">
                            <option value="" disabled>Selecciona un tipo</option>
                            {MANUAL_INCIDENCIA_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Detalle de la Incidencia</label>
                        <textarea value={detalle} onChange={e => setDetalle(e.target.value)} rows={4} className="mt-1 block w-full p-2 border rounded bg-b44-light dark:bg-b44-dark dark:border-gray-600" />
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-4">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded hover:bg-gray-400">Cancelar</button>
                    <button onClick={handleSubmit} disabled={!tipo || !detalle} className="px-4 py-2 bg-b44-primary text-white rounded hover:bg-b44-primary/80 disabled:bg-gray-400">Guardar</button>
                </div>
            </div>
        </div>
    );
};


const Pedidos: React.FC = () => {
    const { pedidos, setIncidencias } = useContext(AppContext);
    const [expandedPedidos, setExpandedPedidos] = useState<Set<string>>(new Set());
    const [searchTerm, setSearchTerm] = useState('');
    const [emailFilter, setEmailFilter] = useState('');
    const [clubFilter, setClubFilter] = useState('Todos');
    const [productFilter, setProductFilter] = useState('Todos');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [modalData, setModalData] = useState<ModalData | null>(null);

    const togglePedido = (numpedido: string) => {
        const newSet = new Set(expandedPedidos);
        if (newSet.has(numpedido)) newSet.delete(numpedido);
        else newSet.add(numpedido);
        setExpandedPedidos(newSet);
    };

    const pedidosAgrupados = useMemo(() => {
        return pedidos.reduce<PedidoAgrupado>((acc, pedido) => {
            if (!acc[pedido.numpedido]) acc[pedido.numpedido] = [];
            acc[pedido.numpedido].push(pedido);
            return acc;
        }, {});
    }, [pedidos]);
    
    const uniqueFilters = useMemo(() => {
        const clubs = ['Todos', ...Array.from(new Set(pedidos.map(p => p.club).filter(Boolean)))];
        const products = ['Todos', ...Array.from(new Set(pedidos.map(p => p.producto).filter(Boolean)))];
        return { clubs, products };
    }, [pedidos]);

    const filteredPedidos = useMemo(() => {
        return Object.entries(pedidosAgrupados).filter(([numpedido, lineas]) => {
            const firstLine = lineas[0];
            if (!firstLine) return false;

            if (searchTerm && !numpedido.toLowerCase().includes(searchTerm.toLowerCase())) return false;
            if (emailFilter && !firstLine.email.toLowerCase().includes(emailFilter.toLowerCase())) return false;
            if (clubFilter !== 'Todos' && firstLine.club !== clubFilter) return false;
            if (productFilter !== 'Todos' && !lineas.some(l => l.producto === productFilter)) return false;
            
            const pedidoDate = new Date(firstLine.fecha_pedido);
            if (dateFrom && new Date(pedidoDate).setHours(0,0,0,0) < new Date(dateFrom).setHours(0,0,0,0)) return false;
            if (dateTo && new Date(pedidoDate).setHours(0,0,0,0) > new Date(dateTo).setHours(0,0,0,0)) return false;
            
            return true;
        });
    }, [pedidosAgrupados, searchTerm, emailFilter, clubFilter, productFilter, dateFrom, dateTo]);

    const handleOpenModal = (data: ModalData) => setModalData(data);

    const handleCreateIncidencia = (type: ManualIncidenciaType, details: string) => {
        if (!modalData) return;
        
        setIncidencias(prevIncidencias => {
            const { numpedido } = modalData;
            const newIncidencias = [...prevIncidencias];
            let existingIncidencia = newIncidencias.find(i => i.numpedido === numpedido);
            
            let newChecklistItemLabel = '';
            let newNote = '';
            const timestamp = `[${new Date().toLocaleString()}]`;

            if (modalData.type === 'pedido') {
                newChecklistItemLabel = `MANUAL - Pedido completo - ${type}`;
                newNote = `${timestamp} MANUAL (Pedido) | Tipo: ${type} | Detalle: ${details}\n`;
            } else if (modalData.type === 'producto' && modalData.linea) {
                const { producto, talla } = modalData.linea;
                newChecklistItemLabel = `MANUAL - ${producto} (${talla}) - ${type}`;
                newNote = `${timestamp} MANUAL (Producto: ${producto} | Talla: ${talla}) | Tipo: ${type} | Detalle: ${details}\n`;
            }

            if (existingIncidencia) {
                const checklistExists = existingIncidencia.checklist_items.some(item => item.label === newChecklistItemLabel);
                if (!checklistExists) {
                    existingIncidencia.checklist_items.push({ id: crypto.randomUUID(), label: newChecklistItemLabel, done: false });
                }
                existingIncidencia.notas = (existingIncidencia.notas || '') + newNote;
            } else {
                const pedidoLines = modalData.lineas!;
                const created_at = new Date();
                const due_date = new Date();
                due_date.setDate(created_at.getDate() + 7);
                
                const newIncidencia: Incidencia = {
                    incidencia_id: crypto.randomUUID(),
                    numpedido,
                    created_at,
                    due_date,
                    status: StatusIncidencia.EsperandoArreglo,
                    origen_manual: true,
                    pedido_encontrado: true,
                    email: pedidoLines[0].email,
                    club: pedidoLines[0].club,
                    productos_resumen: [...new Set(pedidoLines.map(p => p.producto))].join(', '),
                    tallas_resumen: [...new Set(pedidoLines.map(p => p.talla))].join(', '),
                    importe_total_pedido: pedidoLines.reduce((sum, p) => sum + p.precio, 0),
                    checklist_items: [{ id: crypto.randomUUID(), label: newChecklistItemLabel, done: false }],
                    notas: newNote,
                };
                newIncidencias.push(newIncidencia);
            }
            return newIncidencias;
        });

        setModalData(null);
    };

    return (
        <div className="container mx-auto">
             <ManualIncidenciaModal isOpen={!!modalData} onClose={() => setModalData(null)} onSubmit={handleCreateIncidencia} />
            <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Lista de Pedidos</h1>
            
            <div className="p-4 bg-white dark:bg-b44-dark-alt rounded-lg shadow mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                    <input type="text" placeholder="Buscar por nº de pedido..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="p-2 border rounded bg-b44-light dark:bg-b44-dark dark:border-gray-600"/>
                    <input type="text" placeholder="Buscar por email..." value={emailFilter} onChange={e => setEmailFilter(e.target.value)} className="p-2 border rounded bg-b44-light dark:bg-b44-dark dark:border-gray-600"/>
                    <select value={clubFilter} onChange={e => setClubFilter(e.target.value)} className="p-2 border rounded bg-b44-light dark:bg-b44-dark dark:border-gray-600">
                        {uniqueFilters.clubs.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <select value={productFilter} onChange={e => setProductFilter(e.target.value)} className="p-2 border rounded bg-b44-light dark:bg-b44-dark dark:border-gray-600">
                        {uniqueFilters.products.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="p-2 border rounded bg-b44-light dark:bg-b44-dark dark:border-gray-600"/>
                    <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="p-2 border rounded bg-b44-light dark:bg-b44-dark dark:border-gray-600"/>
                </div>
            </div>

            <div className="space-y-4">
                {filteredPedidos.length > 0 ? filteredPedidos.map(([numpedido, lineas]) => (
                    <div key={numpedido} className="bg-white dark:bg-b44-dark-alt rounded-lg shadow overflow-hidden">
                        <div className="p-4 flex justify-between items-center cursor-pointer hover:bg-b44-light-alt dark:hover:bg-gray-700" onClick={() => togglePedido(numpedido)}>
                            <div>
                                <p className="font-bold text-lg">Pedido: {numpedido}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{lineas[0].email} - {lineas[0].club} - {new Date(lineas[0].fecha_pedido).toLocaleDateString()} - {lineas.length} productos</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <button onClick={(e) => { e.stopPropagation(); handleOpenModal({ type: 'pedido', numpedido, lineas }); }} className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm">Crear incidencia (pedido)</button>
                                <span className={`transform transition-transform ${expandedPedidos.has(numpedido) ? 'rotate-180' : ''}`}>&#9660;</span>
                            </div>
                        </div>
                        {expandedPedidos.has(numpedido) && (
                            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                                <table className="w-full text-left text-sm">
                                    <thead className="border-b dark:border-gray-600"><tr><th className="py-2">Producto</th><th className="py-2">Talla</th><th className="py-2">Nombre Banda</th><th className="py-2">Número Banda</th><th className="py-2">Precio</th><th className="py-2"></th></tr></thead>
                                    <tbody>
                                        {lineas.map(linea => (
                                            <tr key={linea.line_id} className="border-b dark:border-gray-700 last:border-b-0">
                                                <td className="py-2">{linea.producto}</td>
                                                <td className="py-2">{linea.talla}</td>
                                                <td className="py-2">{linea.nombrebanda}</td>
                                                <td className="py-2">{linea.numerobanda}</td>
                                                <td className="py-2">{linea.precio.toFixed(2)}€</td>
                                                <td className="py-2 text-right">
                                                    <button onClick={() => handleOpenModal({ type: 'producto', numpedido, linea, lineas })} className="px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 text-xs">Crear incidencia (producto)</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )) : (
                    <div className="text-center py-10 bg-white dark:bg-b44-dark-alt rounded-lg shadow"><p>No se encontraron pedidos con los filtros seleccionados.</p></div>
                )}
            </div>
        </div>
    );
};

export default Pedidos;