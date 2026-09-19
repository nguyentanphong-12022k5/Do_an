import { Router } from 'express';
import { DeviceController } from '../controllers/device.controller';

const router = Router();
const deviceController = new DeviceController();

router.get('/', deviceController.getAllDevices.bind(deviceController));
router.post('/', deviceController.createDevice.bind(deviceController));
router.post('/scan', deviceController.scanNetwork.bind(deviceController));
router.get('/:id/predict', deviceController.predictDeviceExhaustion.bind(deviceController)); // API AI Dự báo

export default router;
