import { Router } from 'express';
import { DeviceController } from '../controllers/device.controller';

const router = Router();
const deviceController = new DeviceController();

router.get('/', deviceController.getAllDevices.bind(deviceController));
router.post('/', deviceController.createDevice.bind(deviceController));
router.post('/scan', deviceController.scanNetwork.bind(deviceController));
router.get('/:id/metrics', deviceController.getDeviceMetrics.bind(deviceController)); // API Lấy Dữ liệu vẽ Biểu đồ
router.get('/:id/predict', deviceController.predictDeviceExhaustion.bind(deviceController));

export default router;
