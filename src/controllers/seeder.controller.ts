import { Request, Response } from "express";
import { registerErrorLogApp } from "../@core/libs/winston.log";
import { messageTypes } from "../@core/interfaces/messageTypes";
import AppServer from "../@core/app-server";
import { QueryResult } from "pg";

export const onRunSeedsCtrl = async ( req: Request, res: Response ) => {
    try {

        const server = AppServer.instance;

        const resolveSaldoDisponible: QueryResult = await server.db.query(`
            CREATE TABLE SaldoDisponible(
                PK_SaldoDisponible uuid DEFAULT gen_random_uuid(),
                nAlmacen smallint,
                cCodigoProducto varchar(10),
                nLote int,
                tFechaLote timestamp,
                nCantidad int,
                nSoles float,
                PRIMARY KEY (PK_SaldoDisponible)
            );
        `);

        const resolveConsumoSaldo: QueryResult = await server.db.query(`
            CREATE TABLE ConsumoSaldo(
                PK_SConsumoSaldo uuid DEFAULT gen_random_uuid(),
                nAlmacen smallint,
                cCodigoProducto varchar(10),
                nLoteConsumir int,
                nCantidadConsumir float,
                PRIMARY KEY (PK_SConsumoSaldo)
            );
        `);

        const resolveSaldoDisponibleData: QueryResult = await server.db.query(`
        INSERT INTO SaldoDisponible (
            nAlmacen,
            cCodigoProducto,
            nLote,
            tFechaLote,
            nCantidad,
            nSoles
        ) VALUES
            (1,'1010101010',1,'20230101 12:00',10,5),
            (1,'1010101010',2,'20230101 15:00',10,5),
            (1,'1010101010',3,'20230101 14:00',50,25),
            (1,'1010101010',4,'20230101 13:00',40,20),
        
            (1,'2020202020',1,'20230101 09:00',50,50),
            (1,'2020202020',2,'20230101 11:00',25,25),
            (1,'2020202020',3,'20230101 13:00',30,30),
            
            (2,'3030303030',1,'20230101 12:00',200,50);
        
        `);


        const resolveConsumoSaldoData: QueryResult = await server.db.query(`
        INSERT INTO ConsumoSaldo
        (
            nAlmacen,
            cCodigoProducto,
            nLoteConsumir,
            nCantidadConsumir
        ) VALUES
            (1,'1010101010',0,98),
            (1,'2020202020',2,20),
            (1,'2020202020',0,82),
            (2,'3030303030',0,104);
        
        `);

        return res.json({
            data: resolveSaldoDisponible
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