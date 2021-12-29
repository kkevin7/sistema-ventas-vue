import routerx from 'express-promise-router';
import IngresoController from '../controllers/IngresoController';
import auth from '../middlewares/auth';

const router = routerx();

router.post('/add', auth.verifyAlmacenero, IngresoController.add);
router.get('/query', auth.verifyAlmacenero, IngresoController.query);
router.get('/list', auth.verifyAlmacenero, IngresoController.list);
router.put('/activate', auth.verifyAlmacenero, IngresoController.activate);
router.put('/deactivate', auth.verifyAlmacenero, IngresoController.deactivate);
router.get('/grafico12Meses', auth.verifyUsuario, IngresoController.grafico12Meses);
router.get('/consultaFechas', auth.verifyUsuario, IngresoController.consultaFechas);

export default router;