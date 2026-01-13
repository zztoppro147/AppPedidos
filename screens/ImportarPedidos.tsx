
import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { PedidoUnificado } from '../types';

declare var XLSX: any;

const ImportarPedidos: React.FC = () => {
    const { pedidos, setPedidos } = useContext(AppContext);
    const [fileData, setFileData] = useState<any[]>([]);
    const [headers, setHeaders] = useState<string[]>([]);
    const [mapping, setMapping] = useState<{ [key: string]: string }>({});
    const [feedback, setFeedback] = useState('');

    const REQUIRED_FIELDS = ['numpedido', 'email', 'fecha_pedido', 'club', 'producto', 'talla', 'precio', 'nombrebanda', 'numerobanda'];

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            const bstr = evt.target?.result;
            const wb = XLSX.read(bstr, { type: 'binary', cellDates: true });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

            if (data.length > 0) {
                const fileHeaders = data[0] as string[];
                setHeaders(fileHeaders);
                setFileData(data.slice(1));

                // Auto-mapping suggestion
                const newMapping: { [key: string]: string } = {};
                REQUIRED_FIELDS.forEach(field => {
                    const foundHeader = fileHeaders.find(h => h.toLowerCase().replace(/ /g, '').includes(field.toLowerCase()));
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

        let newPedidos = 0;
        let duplicates = 0;
        const batchId = `batch-${Date.now()}`;
        const existingLineIds = new Set(pedidos.map(p => p.line_id));

        const importedPedidos: PedidoUnificado[] = [...pedidos];

        fileData.forEach(row => {
            const pedidoRow: { [key: string]: any } = {};
            headers.forEach((header, index) => {
                pedidoRow[header] = row[index];
            });

            const numpedido = String(pedidoRow[mapping['numpedido']] || '').trim();
            const producto = String(pedidoRow[mapping['producto']] || '').trim();
            const talla = String(pedidoRow[mapping['talla']] || '').trim();
            const nombrebanda = String(pedidoRow[mapping['nombrebanda']] || '').trim();
            const numerobanda = String(pedidoRow[mapping['numerobanda']] || '').trim();

            if (!numpedido || !producto) return;

            const line_id = `${numpedido}-${producto}-${talla}-${nombrebanda}-${numerobanda}`.toLowerCase().replace(/\s+/g, '-');

            if (existingLineIds.has(line_id)) {
                duplicates++;
                return;
            }

            const newPedido: PedidoUnificado = {
                line_id,
                numpedido,
                producto,
                talla,
                nombrebanda,
                numerobanda,
                email: String(pedidoRow[mapping['email']] || ''),
                fecha_pedido: new Date(pedidoRow[mapping['fecha_pedido']]),
                club: String(pedidoRow[mapping['club']] || ''),
                precio: Number(pedidoRow[mapping['precio']] || 0),
                check_albaran: false,
                batch_id: batchId,
                imported_at: new Date(),
            };
            
            importedPedidos.push(newPedido);
            existingLineIds.add(line_id);
            newPedidos++;
        });

        setPedidos(importedPedidos);
        setFeedback(`${newPedidos} pedidos nuevos importados. ${duplicates} duplicados omitidos.`);
        setFileData([]);
        setHeaders([]);
    };

    return (
        <div className="container mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Importar Pedidos</h1>
            <div className="p-6 bg-white dark:bg-b44-dark-alt rounded-lg shadow space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        1. Sube tu archivo XLSX de pedidos
                    </label>
                    <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-b44-primary file:text-white hover:file:bg-b44-primary/80" />
                </div>

                {headers.length > 0 && (
                    <>
                        <div>
                            <h2 className="text-lg font-semibold mb-2">2. Mapeo de Columnas</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Asigna las columnas de tu archivo a los campos de la aplicación.</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

                        <div>
                             <h3 className="text-lg font-semibold mb-2">3. Previsualización de Datos (primeras 5 filas)</h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm text-left">
                                    <thead className="bg-b44-light-alt dark:bg-b44-dark">
                                        <tr>
                                            {headers.map(h => <th key={h} className="p-2 border-b dark:border-gray-700">{h}</th>)}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {fileData.slice(0, 5).map((row, i) => (
                                            <tr key={i} className="border-b dark:border-gray-700">
                                                {row.map((cell: any, j: number) => <td key={j} className="p-2">{cell instanceof Date ? cell.toLocaleDateString() : String(cell)}</td>)}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="text-right">
                            <button onClick={handleImport} className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition">
                                Importar Pedidos
                            </button>
                        </div>
                    </>
                )}

                {feedback && <p className="mt-4 text-center p-3 rounded bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">{feedback}</p>}
            </div>
        </div>
    );
};

export default ImportarPedidos;
