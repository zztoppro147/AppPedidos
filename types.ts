export interface PedidoUnificado {
    line_id: string;
    numpedido: string;
    email: string;
    fecha_pedido: Date;
    club: string;
    producto: string;
    talla: string;
    precio: number;
    nombrebanda: string;
    numerobanda: string;
    check_albaran: boolean;
    batch_id: string;
    imported_at: Date;
}

export interface IncidenciaFormRaw {
    marca_temporal_raw: string;
    marca_temporal: Date | null;
    numpedido: string;
    tipo_incidencia_producto: string;
    row_hash: string;
    loaded_at: Date;
    date_parse_ok: boolean;
    date_parse_error: string;
}

export enum StatusIncidencia {
    EsperandoArreglo = 'esperando_arreglo',
    Arreglando = 'arreglando',
    Finalizado = 'finalizado',
    Archivado = 'archivado',
}

export interface ChecklistItem {
    id: string;
    label: string;
    done: boolean;
}

export interface Incidencia {
    incidencia_id: string;
    numpedido: string;
    created_at: Date;
    due_date: Date;
    status: StatusIncidencia;
    pedido_encontrado: boolean;
    email: string;
    club: string;
    productos_resumen: string;
    tallas_resumen: string;
    importe_total_pedido: number;
    checklist_items: ChecklistItem[];
    origen_manual: boolean;
    notas: string;
}

export type Screen = 'dashboard' | 'importar-pedidos' | 'diseño' | 'albaran' | 'pedidos' | 'importar-incidencias' | 'incidencias' | 'calendario';

export const MANUAL_INCIDENCIA_TYPES = ['Color', 'Nombres', 'Tallaje', 'Sublimación', 'Otro'] as const;
export type ManualIncidenciaType = typeof MANUAL_INCIDENCIA_TYPES[number];

export type PedidoAgrupado = {
    [numpedido: string]: PedidoUnificado[];
};