import { Router } from 'express';
import { DeviceController } from '../controllers/device.controller';

const router = Router();
const deviceController = new DeviceController();

router.get('/', deviceController.getAllDevices.bind(deviceController));
router.post('/', deviceController.createDevice.bind(deviceController));
router.delete('/:id', deviceController.deleteDevice.bind(deviceController)); // Mở cổng API DELETE
router.patch('/:id/mute', deviceController.toggleMuteDevice.bind(deviceController));
router.post('/scan', deviceController.scanNetwork.bind(deviceController));
router.get('/:id/metrics', deviceController.getDeviceMetrics.bind(deviceController));
router.get('/:id/predict', deviceController.predictDeviceExhaustion.bind(deviceController));

export default router;
