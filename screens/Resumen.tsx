
import React, { useState, useContext, useMemo } from 'react';
import { AppContext } from '../context/AppContext';
import { PedidoUnificado } from '../types';

const Diseño: React.FC = () => {
    const { pedidos } = useContext(AppContext);
    const [filters, setFilters] = useState({
        dateFrom: '',
        dateTo: '',
        club: '',
        producto: '',
        talla: 'Todas',
    });

    const uniqueValues = useMemo(() => {
        const clubs = [...new Set(pedidos.map(p => p.club))];
        const productos = [...new Set(pedidos.map(p => p.producto))];
        const tallas = ['Todas', ...new Set(pedidos.map(p => p.talla))];
        return { clubs, productos, tallas };
    }, [pedidos]);

    const filteredPedidos = useMemo(() => {
        return pedidos.filter(p => {
            const pedidoDate = new Date(p.fecha_pedido);
            if (filters.dateFrom && pedidoDate < new Date(filters.dateFrom)) return false;
            if (filters.dateTo && pedidoDate > new Date(filters.dateTo)) return false;
            if (filters.club && p.club !== filters.club) return false;
            if (filters.producto && p.producto !== filters.producto) return false;
            if (filters.talla !== 'Todas' && p.talla !== filters.talla) return false;
            return true;
        });
    }, [pedidos, filters]);

    const uniqueTallasFiltered = useMemo(() => {
        const tallas = new Set(filteredPedidos.map(p => p.talla || 'SIN_TALLA'));
        return Array.from(tallas).sort();
    }, [filteredPedidos]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const createAndDownloadCSV = (data: {nombrebanda: string, numerobanda: string}[], filename: string) => {
        if (data.length === 0) return;
        const csvContent = "data:text/csv;charset=utf-8," 
            + "nombrebanda,numerobanda\n"
            + data.map(e => `"${e.nombrebanda}","${e.numerobanda}"`).join("\n");
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExportForTalla = (talla: string) => {
        const clubNameForFile = (filters.club || 'Todos_Clubs').replace(/\s+/g, '_');
        const dataForTalla = filteredPedidos.filter(p => (p.talla || 'SIN_TALLA') === talla);
        const dataForCSV = dataForTalla.map(({ nombrebanda, numerobanda }) => ({ nombrebanda, numerobanda }));
        const tallaForFile = talla.replace(/\s+/g, '_');
        createAndDownloadCSV(dataForCSV, `${clubNameForFile}_${tallaForFile}.csv`);
    };

    return (
        <div className="container mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Diseño</h1>

            <div className="p-4 bg-white dark:bg-b44-dark-alt rounded-lg shadow mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                    <input type="date" name="dateFrom" value={filters.dateFrom} onChange={handleFilterChange} className="p-2 border rounded bg-b44-light dark:bg-b44-dark dark:border-gray-600"/>
                    <input type="date" name="dateTo" value={filters.dateTo} onChange={handleFilterChange} className="p-2 border rounded bg-b44-light dark:bg-b44-dark dark:border-gray-600"/>
                    <select name="club" value={filters.club} onChange={handleFilterChange} className="p-2 border rounded bg-b44-light dark:bg-b44-dark dark:border-gray-600">
                        <option value="">Todo Club</option>
                        {uniqueValues.clubs.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <select name="producto" value={filters.producto} onChange={handleFilterChange} className="p-2 border rounded bg-b44-light dark:bg-b44-dark dark:border-gray-600">
                        <option value="">Todo Producto</option>
                        {uniqueValues.productos.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <select name="talla" value={filters.talla} onChange={handleFilterChange} className="p-2 border rounded bg-b44-light dark:bg-b44-dark dark:border-gray-600">
                        {uniqueValues.tallas.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
                <div className="mt-4 border-t pt-4 dark:border-gray-700">
                    <h3 className="text-md font-semibold mb-2">Opciones de Exportación:</h3>
                    <div className="flex justify-start flex-wrap gap-2">
                        {uniqueTallasFiltered.length > 0 ? (
                            uniqueTallasFiltered.map(talla => (
                                <button
                                    key={talla}
                                    onClick={() => handleExportForTalla(talla)}
                                    className="px-3 py-2 bg-b44-primary text-white rounded hover:bg-b44-primary/80 text-sm transition-colors"
                                >
                                    Exportar Talla {talla}
                                </button>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400">No hay datos para exportar con los filtros actuales.</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-b44-dark-alt rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b dark:border-gray-600 bg-b44-light-alt dark:bg-b44-dark">
                            <tr>
                                <th className="p-3">Producto</th>
                                <th className="p-3">Club</th>
                                <th className="p-3">Nombre Banda</th>
                                <th className="p-3">Número Banda</th>
                                <th className="p-3">Precio</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPedidos.map(pedido => (
                                <tr key={pedido.line_id} className="border-b dark:border-gray-700 last:border-b-0">
                                    <td className="p-3">{pedido.producto}</td>
                                    <td className="p-3">{pedido.club}</td>
                                    <td className="p-3">{pedido.nombrebanda}</td>
                                    <td className="p-3">{pedido.numerobanda}</td>
                                    <td className="p-3">{pedido.precio.toFixed(2)}€</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Diseño;
