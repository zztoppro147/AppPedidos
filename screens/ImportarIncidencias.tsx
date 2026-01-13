import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { IncidenciaFormRaw, Incidencia, StatusIncidencia, ChecklistItem } from '../types';

declare var XLSX: any;

const ImportarIncidencias: React.FC = () => {
    const { incidenciasRaw, setIncidenciasRaw, setIncidencias, pedidos } = useContext(AppContext);
    
    const [fileData, setFileData] = useState<any[]>([]);
    const [headers, setHeaders] = useState<string[]>([]);
    const [mapping, setMapping] = useState<{ [key: string]: string }>({});
    const [feedback, setFeedback] = useState('');

    const REQUIRED_FIELDS = ['numpedido', 'tipo_incidencia_producto'];

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            const bstr = evt.target?.result;
            const wb = XLSX.read(bstr, { type: 'binary' });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

            if (data.length > 0) {
                const fileHeaders = (data[0] as string[]).map(h => String(h));
                setHeaders(fileHeaders);
                setFileData(data.slice(1));

                const newMapping: { [key: string]: string } = {};
                const fieldMap: {[key: string]: string[]} = {
                    'numpedido': ['pedido', 'número de pedido', 'numpedido'],
                    'tipo_incidencia_producto': ['incidencia', 'tipo', 'producto', 'tipo de incidencia + producto']
                }

                REQUIRED_FIELDS.forEach(field => {
                    const searchTerms = fieldMap[field] || [field];
                    const foundHeader = fileHeaders.find(h => 
                        searchTerms.some(term => h.toLowerCase().replace(/ /g, '').includes(term))
                    );
                    if (foundHeader) {
                        newMapping[field] = foundHeader;
                    }
                });
                setMapping(newMapping);
            }
        };
        reader.readAsBinaryString(file);
    };
    
    const handleImport = () => {
        if (!REQUIRED_FIELDS.every(field => mapping[field] && mapping[field] !== '')) {
            setFeedback('Error: Por favor, mapea todas las columnas requeridas.');
            return;
        }

        let newImports = 0;
        let duplicates = 0;
        const existingHashes = new Set(incidenciasRaw.map(i => i.row_hash));
        const importedIncidencias: IncidenciaFormRaw[] = [...incidenciasRaw];

        fileData.forEach(row => {
            const rowObject: { [key: string]: any } = {};
            headers.forEach((header, index) => {
                rowObject[header] = row[index];
            });

            const numpedido = String(rowObject[mapping['numpedido']] || '').trim();
            const tipo_incidencia_producto = String(rowObject[mapping['tipo_incidencia_producto']] || '').trim();

            if (!numpedido || !tipo_incidencia_producto) {
                return; // Skip if required fields are missing
            }
            
            const row_hash = `${numpedido}-${tipo_incidencia_producto}`;

            if(existingHashes.has(row_hash)) {
                duplicates++;
                return;
            }
            
            importedIncidencias.push({
                marca_temporal_raw: '', // Not imported anymore
                numpedido,
                tipo_incidencia_producto,
                row_hash,
                loaded_at: new Date(),
                marca_temporal: null, // No date to parse
                date_parse_ok: true, // Considered OK as no parsing is needed
                date_parse_error: '',
            });
            existingHashes.add(row_hash);
            newImports++;
        });

        setIncidenciasRaw(importedIncidencias);
        setFeedback(`${newImports} nuevas filas de incidencias importadas. ${duplicates} duplicados omitidos.`);
        setFileData([]);
        setHeaders([]);
        setMapping({});
    };

    const handleGenerateIncidents = () => {
        const groupedByPedido = incidenciasRaw.reduce((acc, item) => {
            if (!acc[item.numpedido]) {
                acc[item.numpedido] = [];
            }
            acc[item.numpedido].push(item);
            return acc;
        }, {} as { [key: string]: IncidenciaFormRaw[] });

        let createdCount = 0;
        let updatedCount = 0;

        setIncidencias(prevIncidencias => {
            const newIncidenciasMap = new Map(prevIncidencias.map(i => [i.numpedido, JSON.parse(JSON.stringify(i))])); // Deep copy

            Object.entries(groupedByPedido).forEach(([numpedido, items]) => {
                const validDates = items.map(i => i.marca_temporal).filter(d => d !== null) as Date[];
                const createdAt = validDates.length > 0 ? new Date(Math.min(...validDates.map(d => d.getTime()))) : new Date();
                const dueDate = new Date(createdAt);
                dueDate.setDate(dueDate.getDate() + 7);

                const checklistLabels = [...new Set(items.map(i => i.tipo_incidencia_producto.trim()))];
                
                const pedidoData = pedidos.filter(p => p.numpedido === numpedido);
                
                let existingIncidencia = newIncidenciasMap.get(numpedido);

                if (existingIncidencia) { // Update
                    const existingLabels = new Set(existingIncidencia.checklist_items.map(item => item.label));
                    let changed = false;
                    checklistLabels.forEach(label => {
                        if(!existingLabels.has(label)) {
                            existingIncidencia!.checklist_items.push({ id: crypto.randomUUID(), label, done: false });
                            changed = true;
                        }
                    });
                    if (changed) updatedCount++;
                } else { // Create
                    const newChecklistItems: ChecklistItem[] = checklistLabels.map(label => ({ id: crypto.randomUUID(), label, done: false }));

                    let pedidoEncontrado = false;
                    let email = '', club = '', productos_resumen = '', tallas_resumen = '', importe_total_pedido = 0;

                    if (pedidoData.length > 0) {
                        pedidoEncontrado = true;
                        email = pedidoData[0].email;
                        club = pedidoData[0].club;
                        productos_resumen = [...new Set(pedidoData.map(p => p.producto))].join(', ');
                        tallas_resumen = [...new Set(pedidoData.map(p => p.talla))].join(', ');
                        importe_total_pedido = pedidoData.reduce((sum, p) => sum + p.precio, 0);
                    }

                    existingIncidencia = {
                        incidencia_id: crypto.randomUUID(),
                        numpedido,
                        created_at: createdAt,
                        due_date: dueDate,
                        status: StatusIncidencia.EsperandoArreglo,
                        pedido_encontrado: pedidoEncontrado,
                        email, club, productos_resumen, tallas_resumen, importe_total_pedido,
                        checklist_items: newChecklistItems,
                        origen_manual: false,
                        notas: '',
                    };
                    newIncidenciasMap.set(numpedido, existingIncidencia);
                    createdCount++;
                }
            });
            return Array.from(newIncidenciasMap.values());
        });
        
        setFeedback(`${createdCount} incidencias creadas y ${updatedCount} actualizadas.`);
    };

    return (
        <div className="container mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Importar y Generar Incidencias</h1>
            <div className="p-6 bg-white dark:bg-b44-dark-alt rounded-lg shadow space-y-6">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        1. Sube tu archivo XLSX de incidencias
                    </label>
                    <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-b44-primary file:text-white hover:file:bg-b44-primary/80" />
                </div>

                {headers.length > 0 && (
                     <>
                        <div>
                            <h2 className="text-lg font-semibold mb-2">2. Mapeo de Columnas</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Asigna las columnas de tu archivo a los campos requeridos.</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {REQUIRED_FIELDS.map(field => (
                                    <div key={field}>
                                        <label className="block text-sm font-medium capitalize">{field.replace(/_/g, ' ')}</label>
                                        <select
                                            value={mapping[field] || ''}
                                            onChange={e => setMapping({ ...mapping, [field]: e.target.value })}
                                            className="mt-1 block w-full p-2 border rounded bg-b44-light dark:bg-b44-dark dark:border-gray-600"
                                        >
                                            <option value="">-- Seleccionar --</option>
                                            {headers.map(header => (
                                                <option key={header} value={header}>{header}</option>
                                            ))}
                                        </select>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="text-right">
                            <button onClick={handleImport} className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition">
                                Cargar Datos Crudos
                            </button>
                        </div>
                    </>
                )}
                
                <hr className="dark:border-gray-600"/>

                <div>
                    <h2 className="text-lg font-semibold mb-2">3. Generar Incidencias</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        Este proceso analizará los datos crudos importados, los agrupará por pedido y creará o actualizará las tarjetas de incidencia correspondientes.
                    </p>
                    <button onClick={handleGenerateIncidents} disabled={incidenciasRaw.length === 0} className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition disabled:bg-gray-400 disabled:cursor-not-allowed">
                        Generar Incidencias Automáticas
                    </button>
                </div>

                {feedback && <p className="mt-4 text-center p-3 rounded bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">{feedback}</p>}

                 <div className="mt-8">
                    <h3 className="text-lg font-semibold mb-2">Datos Crudos Importados ({incidenciasRaw.length} filas)</h3>
                    <div className="overflow-auto max-h-96 border dark:border-gray-700 rounded-lg">
                        <table className="min-w-full text-sm text-left">
                            <thead className="bg-b44-light-alt dark:bg-b44-dark sticky top-0">
                                <tr>
                                    <th className="p-2">Nº Pedido</th>
                                    <th className="p-2">Tipo Incidencia</th>
                                    <th className="p-2">Cargado en</th>
                                </tr>
                            </thead>
                            <tbody>
                                {incidenciasRaw.slice(-100).reverse().map((row) => ( // Show last 100
                                    <tr key={row.row_hash} className="border-b dark:border-gray-700">
                                        <td className="p-2">{row.numpedido}</td>
                                        <td className="p-2">{row.tipo_incidencia_producto}</td>
                                        <td className="p-2">{row.loaded_at?.toLocaleString() ?? 'N/A'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImportarIncidencias;