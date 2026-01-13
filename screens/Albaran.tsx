
import React, { useState, useContext, useMemo } from 'react';
import { AppContext } from '../context/AppContext';
import { PedidoUnificado } from '../types';

declare var XLSX: any;

const Albaran: React.FC = () => {
    const { pedidos, setPedidos } = useContext(AppContext);
    const [filters, setFilters] = useState({
        numpedido: '',
        email: '',
        dateFrom: '',
        dateTo: '',
        producto: '',
        talla: '',
        club: '',
    });

    const uniqueValues = useMemo(() => {
        const productos = [...new Set(pedidos.map(p => p.producto))];
        const tallas = [...new Set(pedidos.map(p => p.talla))];
        const clubs = [...new Set(pedidos.map(p => p.club))];
        return { productos, tallas, clubs };
    }, [pedidos]);

    const filteredPedidos = useMemo(() => {
        return pedidos.filter(p => {
            if (filters.numpedido && !p.numpedido.toLowerCase().includes(filters.numpedido.toLowerCase())) return false;
            if (filters.email && !p.email.toLowerCase().includes(filters.email.toLowerCase())) return false;
            if (filters.producto && p.producto !== filters.producto) return false;
            if (filters.talla && p.talla !== filters.talla) return false;
            if (filters.club && p.club !== filters.club) return false;
            const pedidoDate = new Date(p.fecha_pedido);
            if (filters.dateFrom && new Date(pedidoDate).setHours(0,0,0,0) < new Date(filters.dateFrom).setHours(0,0,0,0)) return false;
            if (filters.dateTo && new Date(pedidoDate).setHours(0,0,0,0) > new Date(filters.dateTo).setHours(0,0,0,0)) return false;
            return true;
        });
    }, [pedidos, filters]);
    
    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleCheckChange = (line_id: string) => {
        setPedidos(prevPedidos => 
            prevPedidos.map(p => 
                p.line_id === line_id ? { ...p, check_albaran: !p.check_albaran } : p
            )
        );
    };

    const exportToXLSX = () => {
        const dataToExport = filteredPedidos.map(p => ({
            'Nº Pedido': p.numpedido,
            'Club': p.club,
            'Producto': p.producto,
            'Talla': p.talla,
            'Email': p.email,
            'Fecha Pedido': p.fecha_pedido.toLocaleDateString(),
            'Check': p.check_albaran ? '☑' : '☐',
        }));

        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Albaran");
        XLSX.writeFile(wb, "albaran.xlsx");
    };

    return (
        <div className="container mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Albarán</h1>
            <div className="p-4 bg-white dark:bg-b44-dark-alt rounded-lg shadow mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4 items-end">
                    <input type="text" name="numpedido" placeholder="Buscar por nº pedido" value={filters.numpedido} onChange={handleFilterChange} className="p-2 border rounded bg-b44-light dark:bg-b44-dark dark:border-gray-600"/>
                    <input type="text" name="email" placeholder="Buscar por email" value={filters.email} onChange={handleFilterChange} className="p-2 border rounded bg-b44-light dark:bg-b44-dark dark:border-gray-600"/>
                    <select name="club" value={filters.club} onChange={handleFilterChange} className="p-2 border rounded bg-b44-light dark:bg-b44-dark dark:border-gray-600">
                        <option value="">Todo Club</option>
                        {uniqueValues.clubs.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <select name="producto" value={filters.producto} onChange={handleFilterChange} className="p-2 border rounded bg-b44-light dark:bg-b44-dark dark:border-gray-600">
                        <option value="">Todo Producto</option>
                        {uniqueValues.productos.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <select name="talla" value={filters.talla} onChange={handleFilterChange} className="p-2 border rounded bg-b44-light dark:bg-b44-dark dark:border-gray-600">
                        <option value="">Toda Talla</option>
                        {uniqueValues.tallas.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <input type="date" name="dateFrom" value={filters.dateFrom} onChange={handleFilterChange} className="p-2 border rounded bg-b44-light dark:bg-b44-dark dark:border-gray-600"/>
                    <input type="date" name="dateTo" value={filters.dateTo} onChange={handleFilterChange} className="p-2 border rounded bg-b44-light dark:bg-b44-dark dark:border-gray-600"/>
                </div>
                 <div className="mt-4 text-right">
                     <button onClick={exportToXLSX} className="px-4 py-2 bg-b44-primary text-white rounded hover:bg-b44-primary/80">
                        Exportar XLSX
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-b44-dark-alt rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b dark:border-gray-600 bg-b44-light-alt dark:bg-b44-dark">
                            <tr>
                                <th className="p-3">Nº Pedido</th>
                                <th className="p-3">Club</th>
                                <th className="p-3">Producto</th>
                                <th className="p-3">Talla</th>
                                <th className="p-3">Email</th>
                                <th className="p-3">Fecha Pedido</th>
                                <th className="p-3 text-center">Check</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPedidos.map(pedido => (
                                <tr key={pedido.line_id} className="border-b dark:border-gray-700 last:border-b-0">
                                    <td className="p-3">{pedido.numpedido}</td>
                                    <td className="p-3">{pedido.club}</td>
                                    <td className="p-3">{pedido.producto}</td>
                                    <td className="p-3">{pedido.talla}</td>
                                    <td className="p-3">{pedido.email}</td>
                                    <td className="p-3">{new Date(pedido.fecha_pedido).toLocaleDateString()}</td>
                                    <td className="p-3 text-center">
                                        <input 
                                            type="checkbox" 
                                            checked={pedido.check_albaran}
                                            onChange={() => handleCheckChange(pedido.line_id)}
                                            className="h-5 w-5 rounded border-gray-300 text-b44-primary focus:ring-b44-primary cursor-pointer"
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Albaran;
