import { Request, Response } from "express";
import { registerErrorLogApp } from "../@core/libs/winston.log";
import { messageTypes } from "../@core/interfaces/messageTypes";
import AppServer from "../@core/app-server";
import { QueryResult } from "pg";
import { ISaldoDisponible } from "../@core/interfaces/saldo_disponible.interface";
import { IConsumoSaldo } from "../@core/interfaces/consumo_saldo.interface";
import { ResolveTask } from "../@core/interfaces/resolve_task.interface";

export const onTaskCtrl = async ( req: Request, res: Response ) => {
    try {
        
        const { codproducto = '' } = req.params;

        const server = AppServer.instance;

        const getConsumoByProduct: QueryResult<IConsumoSaldo> = await server.db.query(`
            SELECT * FROM consumosaldo
            WHERE ccodigoproducto = '${ codproducto }'
            ORDER BY nloteconsumir DESC;
        `);

        if( getConsumoByProduct.rowCount == 0 ) {
            return res.status(404).send({
                error: 404,
                message: `No se encontró consumo para este producto`,
            });
        }

        const resolves: ResolveTask[] = [];

        for (const consumo of getConsumoByProduct.rows ) {

            console.log('consumo ::: ', consumo);
            
            const { nalmacen, nloteconsumir, ncantidadconsumir } = consumo;

            let newCantidadConsumir = ncantidadconsumir;

            /*if ( nloteconsumir != 0 ) {

                const resolveSaldoDisponible: QueryResult<ISaldoDisponible> = await server.db.query(`
                    SELECT * FROM saldodisponible
                    WHERE ccodigoproducto = '${ codproducto }' AND nlote = ${ nloteconsumir }
                    ORDER BY 
                        tfechalote ASC,
                        nlote ASC;
                `);

                for (const saldo of resolveSaldoDisponible.rows) {
                    const { nalmacen, nlote, ncantidad, nsoles, ccodigoproducto  } = saldo;
                    
                    const cost = ( nsoles * ncantidadconsumir ) / ncantidad;

                    resolves.push(
                        new ResolveTask( nalmacen, ccodigoproducto, nlote, ncantidadconsumir, cost )
                    );

                }

            } else {

                const resolveSaldoDisponible: QueryResult<ISaldoDisponible> = await server.db.query(`
                    SELECT * FROM saldodisponible
                    WHERE ccodigoproducto = '${ codproducto }'
                    ORDER BY 
                        tfechalote ASC,
                        nlote ASC;
                `);
    
                for (const saldo of resolveSaldoDisponible.rows) {
                    const { nalmacen, nlote, ncantidad, nsoles, ccodigoproducto  } = saldo;
                    
                    const cost = ( nsoles * ncantidadconsumir ) / ncantidad;
    
                    resolves.push(
                        new ResolveTask( nalmacen, ccodigoproducto, nlote, ncantidadconsumir, cost )
                    );
    
                }

            }*/

            const resolveSaldoDisponible: QueryResult<ISaldoDisponible> = await onGetSaldos( codproducto, nloteconsumir ) ;

            for (const saldo of resolveSaldoDisponible.rows) {
                const { nalmacen, nlote, ncantidad, nsoles, ccodigoproducto  } = saldo;

                let cost = ( nsoles * newCantidadConsumir ) / ncantidad;

                let consumido = newCantidadConsumir;

                if( newCantidadConsumir > ncantidad ) {
                    cost = ( nsoles * ncantidad ) / ncantidad;
                    newCantidadConsumir -= ncantidad;
                    consumido = ncantidad;
                } else {
                    consumido = ncantidad - newCantidadConsumir;
                    
                    resolves.push(
                        new ResolveTask( nalmacen, ccodigoproducto, nlote, newCantidadConsumir, cost )
                    );
                        
                    newCantidadConsumir -= newCantidadConsumir;
                    break;
                }

                console.log('newCantidadConsumir ::: ', newCantidadConsumir);
                
                if( newCantidadConsumir > 0 ) {
                    resolves.push(
                        new ResolveTask( nalmacen, ccodigoproducto, nlote, consumido, cost )
                    );
                }

            }
            

        }

        return res.json({
            data: getConsumoByProduct.rows,
            resolves
        });

    } catch (error) {
        registerErrorLogApp(error);

        return res.status(400).json({
            ok: false,
            error: {
                message: messageTypes.errorMessageBadRequest,
                error,
            },
        });
    }
}

const onGetSaldos = async ( codproducto: string, nloteconsumir: number ): Promise<QueryResult<ISaldoDisponible>> => {
    const server = AppServer.instance;

    let andLote = nloteconsumir != 0 ? `AND nlote = ${ nloteconsumir }` : '';

     return await server.db.query(`
        SELECT * FROM saldodisponible
        WHERE ccodigoproducto = '${ codproducto }' ${ andLote }
        ORDER BY 
            tfechalote ASC,
            nlote ASC;
    `);
}