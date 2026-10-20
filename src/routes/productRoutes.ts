import { Router } from 'express';
import { getExternalProducts, getExternalProductById } from '../controllers/productController';

const router = Router();

router.get('/external-products', getExternalProducts);
router.get('/external-products/:id', getExternalProductById);

export const productRoutes = router;