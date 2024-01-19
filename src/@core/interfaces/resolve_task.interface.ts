export class ResolveTask {

    nAlmacen: number;
    cCodigoProducto: string;
    nLote: number;
    nCantidad: number;
    nSoles: number;

    constructor(
        nAlmacen: number,
        cCodigoProducto: string,
        nLote: number,
        nCantidad: number,
        nSoles: number,
    ) {

        this.nAlmacen = nAlmacen;
        this.cCodigoProducto = cCodigoProducto;
        this.nLote = nLote;
        this.nCantidad = nCantidad;
        this.nSoles = nSoles;
        
    }
}