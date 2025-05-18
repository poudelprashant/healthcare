import express from 'express';
import { createPackage, deletePackage, getAllPackages, getPackageById, searchPackages, softDeletePackage, updatePackage } from '../controllers/packageController.js';
import authAdmin from '../middleware/authAdmin.js';
import upload from '../middleware/multer.js';


const packageRouter = express.Router();

// CRUD Routes
packageRouter.post('/packages',authAdmin,upload.single('image'), createPackage);
packageRouter.get('/packages', getAllPackages);
packageRouter.get('/packages/search', searchPackages);
packageRouter.get('/packages/:id', getPackageById);
packageRouter.put('/packages/:id',authAdmin,upload.single('image'), updatePackage);
packageRouter.delete('/packages/:id', deletePackage);
packageRouter.post('/change-package-status', authAdmin,softDeletePackage);

export default packageRouter;