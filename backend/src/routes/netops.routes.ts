import { Router } from 'express';
import { NetopsController } from '../controllers/netops.controller';

const router = Router();
const netopsController = new NetopsController();

// API: Chạy kịch bản / lệnh bash từ xa qua SSH
router.post('/execute', netopsController.executeRemoteCommand.bind(netopsController));

export default router;
