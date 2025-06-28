// controllers/contactController.js
import Contact from '../models/contact.js';
import { asyncHandler } from '../utils/asyncHandler.js'; // Make sure to include .js extension

// Get all contacts
export const getContacts = asyncHandler(async (req, res) => {
  const contacts = await Contact.find({}).select('name message createdAt');
  
  res.status(200).json({
    success: true,
    count: contacts.length,
    data: contacts
  });
});

// Get contact by ID
export const getContactById = asyncHandler(async (req, res) => {
  const contact = await Contact.findById(req.params.id).select('name message');
  
  if (!contact) {
    res.status(404);
    throw new Error('Contact submission not found');
  }
  
  res.status(200).json({
    success: true,
    data: contact
  });
});

// Submit contact form
export const submitContactForm = asyncHandler(async (req, res) => {
  const { name, email, subject, message } = req.body;
  
  // Validate input
  if (!name || !email || !subject || !message) {
    res.status(400);
    throw new Error('Please fill in all fields');
  }
  
  // Create new contact entry
  const contact = await Contact.create({
    name,
    email,
    subject,
    message
  });
  
  if (contact) {
    res.status(201).json({
      success: true,
      message: 'Contact form submitted successfully',
      data: {
        name: contact.name,
        message: contact.message
      }
    });
  } else {
    res.status(400);
    throw new Error('Invalid contact data');
  }
});