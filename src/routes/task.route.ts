import { Router } from "express";
import { onTaskCtrl } from "../controllers/task.controller";

const taskRouter = Router();

const _module = '/task/:codproducto';

taskRouter.post( `${ _module }`, [], onTaskCtrl )


export default taskRouter;
