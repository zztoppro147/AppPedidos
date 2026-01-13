import React, { useState, useContext, useMemo } from 'react';
import { AppContext } from '../context/AppContext';
import { PedidoUnificado, Incidencia, StatusIncidencia } from '../types';

// --- Iconos para el Dashboard ---
const ShoppingCartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>;
const PackageIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><path d="M3.27 6.96L12 12.01l8.73-5.05"/><path d="M12 22.08V12"/></svg>;
const DollarSignIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>;
const ReceiptIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M16 8h-6a2 2 0 100 4h6"/><path d="M12 17.5v-11"/></svg>;
const AlertTriangleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>;
const FileClockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 22h2a2 2 0 002-2V7l-5-5H6a2 2 0 00-2 2v3"/><path d="M14 2v4a2 2 0 002 2h4"/><circle cx="8" cy="16" r="6"/><path d="M9.5 17.5L8 16V11"/></svg>;
const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>;
const PercentIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>;
// FIX: Corrected duplicate `x1` attribute in the SVG `line` element to `x2`.
const AlertOctagonIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7.86 2h8.28L22 7.86v8.28L16.14 22H7.86L2 16.14V7.86L7.86 2z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>;


const KpiCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; colorClass?: string; description?: string }> = ({ title, value, icon, colorClass = 'text-gray-900 dark:text-white', description }) => (
    <div className="bg-white dark:bg-b44-dark-alt p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 flex items-start space-x-4">
        <div className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center bg-b44-primary/10 text-b44-primary">
            {icon}
        </div>
        <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{title}</h3>
            <p className={`mt-1 text-3xl font-semibold ${colorClass}`}>{value}</p>
            {description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{description}</p>}
        </div>
    </div>
);

const AnalysisTableCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white dark:bg-b44-dark-alt p-4 rounded-lg shadow-md">
        <h3 className="font-bold mb-3 px-2 text-lg">{title}</h3>
        <div className="overflow-auto max-h-96">
            {children}
        </div>
    </div>
);

const Dashboard: React.FC = () => {
    const { pedidos, incidencias } = useContext(AppContext);

    const [filters, setFilters] = useState({
        dateFrom: '',
        dateTo: '',
        club: 'Todos',
    });

    const filterOptions = useMemo(() => ({
        clubs: ['Todos', ...Array.from(new Set(pedidos.map(p => p.club).filter(Boolean)))],
    }), [pedidos]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const filteredPedidos = useMemo(() => {
        const from = filters.dateFrom ? new Date(filters.dateFrom).setHours(0, 0, 0, 0) : 0;
        const to = filters.dateTo ? new Date(filters.dateTo).setHours(23, 59, 59, 999) : Infinity;

        return pedidos.filter(p => {
            const pedidoDate = new Date(p.fecha_pedido).getTime();
            if (pedidoDate < from || pedidoDate > to) return false;
            if (filters.club !== 'Todos' && p.club !== filters.club) return false;
            return true;
        });
    }, [pedidos, filters]);
    
    const filteredIncidencias = useMemo(() => {
        const from = filters.dateFrom ? new Date(filters.dateFrom).setHours(0, 0, 0, 0) : 0;
        const to = filters.dateTo ? new Date(filters.dateTo).setHours(23, 59, 59, 999) : Infinity;
        
        return incidencias.filter(i => {
            const incidenciaDate = new Date(i.created_at).getTime();
            if (incidenciaDate < from || incidenciaDate > to) return false;
            if (filters.club !== 'Todos' && i.club !== filters.club) return false;
            return true;
        });
    }, [incidencias, filters]);

    const kpisPedidos = useMemo(() => {
        const totalLineas = filteredPedidos.length;
        const importeTotal = filteredPedidos.reduce((sum, p) => sum + p.precio, 0);
        const totalPedidosUnicos = new Set(filteredPedidos.map(p => p.numpedido)).size;
        return {
            totalPedidos: totalPedidosUnicos,
            totalLineas,
            importeTotal: importeTotal.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' }),
            ticketMedio: (totalPedidosUnicos > 0 ? importeTotal / totalPedidosUnicos : 0).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' }),
        };
    }, [filteredPedidos]);

    const kpisIncidencias = useMemo(() => {
        const totalIncidencias = filteredIncidencias.length;
        if (totalIncidencias === 0) {
            return { total: 0, abiertas: 0, vencidas: 0, finalizadas: 0, porcentajeResolucion: '0.00%' };
        }
        const activas = filteredIncidencias.filter(i => i.status === StatusIncidencia.EsperandoArreglo || i.status === StatusIncidencia.Arreglando);
        const vencidas = activas.filter(i => new Date(i.due_date) < new Date()).length;
        const finalizadas = filteredIncidencias.filter(i => i.status === StatusIncidencia.Finalizado).length;
        const porcentajeResolucion = ((finalizadas / (finalizadas + activas.length)) * 100 || 0).toFixed(2) + '%';
        return { total: totalIncidencias, abiertas: activas.length, vencidas, finalizadas, porcentajeResolucion };
    }, [filteredIncidencias]);
    
    const topClubsByRevenue = useMemo(() => {
        const revenueByClub = filteredPedidos.reduce((acc, p) => {
            if (p.club) {
                acc[p.club] = (acc[p.club] || 0) + p.precio;
            }
            return acc;
        }, {} as Record<string, number>);
        return Object.entries(revenueByClub).sort(([, a], [, b]) => b - a).slice(0, 10);
    }, [filteredPedidos]);

    const topProductos = useMemo(() => {
        const counts = filteredPedidos.reduce((acc, p) => {
            acc[p.producto] = (acc[p.producto] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        return Object.entries(counts).sort(([, a], [, b]) => b - a).slice(0, 10);
    }, [filteredPedidos]);
    
    const topTiposIncidencia = useMemo(() => {
        const counts = filteredIncidencias.reduce((acc, i) => {
            i.checklist_items.forEach(item => {
                let type = item.label.split(' - ').pop() || item.label;
                acc[type] = (acc[type] || 0) + 1;
            });
            return acc;
        }, {} as Record<string, number>);
        const sorted = Object.entries(counts).sort(([, a], [, b]) => b - a).slice(0, 10);
        const max = sorted.length > 0 ? sorted[0][1] : 0;
        return { sorted, max };
    }, [filteredIncidencias]);

    const incidenciasPorClub = useMemo(() => {
        const statsByClub = filteredIncidencias.reduce((acc, i) => {
            const club = i.club || 'Sin Club';
            if (!acc[club]) {
                acc[club] = { total: 0, abiertas: 0, vencidas: 0, finalizadas: 0 };
            }

            acc[club].total++;
            const isActiva = i.status === StatusIncidencia.EsperandoArreglo || i.status === StatusIncidencia.Arreglando;
            if (isActiva) {
                acc[club].abiertas++;
                if (new Date(i.due_date) < new Date()) {
                    acc[club].vencidas++;
                }
            }
            if (i.status === StatusIncidencia.Finalizado) {
                acc[club].finalizadas++;
            }
            return acc;
        }, {} as Record<string, { total: number; abiertas: number; vencidas: number; finalizadas: number; }>);

        return Object.entries(statsByClub)
            .map(([club, stats]) => ({ club, ...stats }))
            .sort((a, b) => b.total - a.total);
    }, [filteredIncidencias]);

    const recentIncidencias = useMemo(() => {
        return [...filteredIncidencias]
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 10);
    }, [filteredIncidencias]);

    const getStatusPill = (status: StatusIncidencia) => {
        const styles: Record<StatusIncidencia, string> = {
            [StatusIncidencia.EsperandoArreglo]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
            [StatusIncidencia.Arreglando]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
            [StatusIncidencia.Finalizado]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
            [StatusIncidencia.Archivado]: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
        };
        const labels: Record<StatusIncidencia, string> = {
            [StatusIncidencia.EsperandoArreglo]: 'Esperando',
            [StatusIncidencia.Arreglando]: 'Arreglando',
            [StatusIncidencia.Finalizado]: 'Finalizado',
            [StatusIncidencia.Archivado]: 'Archivado',
        };
        return <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[status]}`}>{labels[status]}</span>;
    };
    
    return (
        <div className="container mx-auto space-y-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Panel de Control</h1>

            <div className="p-4 bg-white dark:bg-b44-dark-alt rounded-lg shadow-md flex flex-col md:flex-row gap-4 items-center">
                <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input type="date" name="dateFrom" value={filters.dateFrom} onChange={handleFilterChange} className="p-2 border rounded bg-b44-light dark:bg-b44-dark dark:border-gray-600 w-full"/>
                    <input type="date" name="dateTo" value={filters.dateTo} onChange={handleFilterChange} className="p-2 border rounded bg-b44-light dark:bg-b44-dark dark:border-gray-600 w-full"/>
                    <select name="club" value={filters.club} onChange={handleFilterChange} className="p-2 border rounded bg-b44-light dark:bg-b44-dark dark:border-gray-600 w-full">
                        {filterOptions.clubs.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KpiCard title="Ingresos Totales" value={kpisPedidos.importeTotal} icon={<DollarSignIcon />} colorClass="text-green-500" description="Basado en filtros"/>
                <KpiCard title="Pedidos Únicos" value={kpisPedidos.totalPedidos} icon={<ShoppingCartIcon />} description={`${kpisPedidos.totalLineas} líneas de pedido`}/>
                <KpiCard title="Ticket Medio" value={kpisPedidos.ticketMedio} icon={<ReceiptIcon />}/>
                <KpiCard title="Incidencias Totales" value={kpisIncidencias.total} icon={<AlertTriangleIcon />}/>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 <KpiCard title="Incidencias Abiertas" value={kpisIncidencias.abiertas} icon={<FileClockIcon />} colorClass="text-yellow-500"/>
                <KpiCard title="Incidencias Vencidas" value={kpisIncidencias.vencidas} icon={<AlertOctagonIcon />} colorClass="text-red-500" description="De las abiertas"/>
                <KpiCard title="Incidencias Finalizadas" value={kpisIncidencias.finalizadas} icon={<CheckCircleIcon />} colorClass="text-green-500"/>
                <KpiCard title="% Resolución" value={kpisIncidencias.porcentajeResolucion} icon={<PercentIcon />} colorClass="text-green-500" description="Finalizadas vs Abiertas"/>
            </div>

            {/* Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AnalysisTableCard title="Top 10 Clubs por Ingresos">
                    <table className="w-full text-sm">
                        <tbody>{topClubsByRevenue.map(([club, revenue]) => <tr key={club} className="border-b dark:border-gray-700 odd:bg-gray-50 dark:odd:bg-white/5"><td className="p-2 font-medium">{club}</td><td className="p-2 text-right font-semibold text-green-600">{revenue.toLocaleString('es-ES', {style: 'currency', currency: 'EUR'})}</td></tr>)}</tbody>
                    </table>
                </AnalysisTableCard>

                <AnalysisTableCard title="Resumen de Incidencias por Club">
                    <table className="w-full text-sm">
                         <thead className="border-b dark:border-gray-600 text-left">
                            <tr>
                                <th className="p-2 font-semibold">Club</th>
                                <th className="p-2 font-semibold text-center">Total</th>
                                <th className="p-2 font-semibold text-center">Abiertas</th>
                                <th className="p-2 font-semibold text-center">Vencidas</th>
                                <th className="p-2 font-semibold text-center">Finalizadas</th>
                            </tr>
                        </thead>
                        <tbody>
                            {incidenciasPorClub.map(item => (
                                <tr key={item.club} className="border-b dark:border-gray-700 odd:bg-gray-50 dark:odd:bg-white/5">
                                    <td className="p-2 font-medium">{item.club}</td>
                                    <td className="p-2 text-center font-bold">{item.total}</td>
                                    <td className="p-2 text-center font-bold text-yellow-500">{item.abiertas}</td>
                                    <td className="p-2 text-center font-bold text-red-500">{item.vencidas}</td>
                                    <td className="p-2 text-center font-bold text-green-500">{item.finalizadas}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </AnalysisTableCard>

                <AnalysisTableCard title="Top 10 Productos Vendidos">
                     <table className="w-full text-sm">
                        <tbody>{topProductos.map(([producto, count]) => <tr key={producto} className="border-b dark:border-gray-700 odd:bg-gray-50 dark:odd:bg-white/5"><td className="p-2">{producto}</td><td className="p-2 text-right font-bold">{count}</td></tr>)}</tbody>
                    </table>
                </AnalysisTableCard>

                <AnalysisTableCard title="Top 10 Tipos de Incidencia">
                    <div className="space-y-3 p-2">
                        {topTiposIncidencia.sorted.map(([type, count]) => (
                            <div key={type}>
                                <div className="flex justify-between mb-1 text-sm"><span className="font-medium">{type}</span><span>{count}</span></div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2"><div className="bg-b44-primary h-2 rounded-full" style={{width: `${(count/topTiposIncidencia.max)*100}%`}}></div></div>
                            </div>
                        ))}
                    </div>
                </AnalysisTableCard>
            </div>

            {/* Recent Incidents */}
            <div>
                 <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Últimas Incidencias</h2>
                <div className="bg-white dark:bg-b44-dark-alt rounded-lg shadow-md overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b dark:border-gray-600 bg-b44-light-alt dark:bg-b44-dark">
                            <tr>
                                <th className="p-3">Nº Pedido</th>
                                <th className="p-3">Club</th>
                                <th className="p-3">Creada</th>
                                <th className="p-3">Vence</th>
                                <th className="p-3">Vencida</th>
                                <th className="p-3">Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentIncidencias.map(inc => {
                                const isOverdue = new Date(inc.due_date) < new Date() && inc.status !== StatusIncidencia.Finalizado && inc.status !== StatusIncidencia.Archivado;
                                return (
                                    <tr key={inc.incidencia_id} className="border-b dark:border-gray-700 last:border-b-0">
                                        <td className="p-3 font-bold">{inc.numpedido}</td>
                                        <td className="p-3">{inc.club}</td>
                                        <td className="p-3">{new Date(inc.created_at).toLocaleDateString()}</td>
                                        <td className="p-3">{new Date(inc.due_date).toLocaleDateString()}</td>
                                        <td className={`p-3 font-bold ${isOverdue ? 'text-red-500' : 'text-green-500'}`}>{isOverdue ? 'Sí' : 'No'}</td>
                                        <td className="p-3">{getStatusPill(inc.status)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;