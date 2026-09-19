import { Router } from 'express';
import { DeviceController } from '../controllers/device.controller';

const router = Router();
const deviceController = new DeviceController();

// Binding context để this bên trong controller không bị undefined
router.get('/', deviceController.getAllDevices.bind(deviceController));
router.post('/', deviceController.createDevice.bind(deviceController));
router.post('/scan', deviceController.scanNetwork.bind(deviceController)); // Endpoint quét mạng tự động

export default router;
