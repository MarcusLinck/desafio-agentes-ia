import { Router } from 'express';
import {
  getOrderById,
  cancelOrder,
  getOrders,
  createOrder,
  updateOrderStatus,
} from '../controllers/orderController.js';

const router = Router();

router.get('/orders', getOrders);
router.get('/orders/:id', getOrderById);
router.post('/orders', createOrder);
router.patch('/orders/:id/status', updateOrderStatus);
router.post('/orders/:id/cancel', cancelOrder);

export default router;