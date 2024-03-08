import express from 'express';
import homeController from '../controller/homeController.js';
import { forgotPasswordController, loginController, registerController, resetPasswordController } from '../controller/authController.js';
const router = express.Router();


router.get('/',homeController)
router.post('/register',registerController)
router.post('/login',loginController);
router.post('/forgot-password',forgotPasswordController);
router.post('/reset-password/:token',resetPasswordController);

export default router;