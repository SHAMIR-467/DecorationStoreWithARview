// routes/contactRoutes.js
import express from 'express';
import  { 
  submitContactForm, 
  getContacts, 
  getContactById 
} from '../controllers/contactController.js';

const router = express.Router();

router.route('/')
  .post(submitContactForm)
  .get(getContacts);

router.route('/:id')
  .get(getContactById);

export default router;