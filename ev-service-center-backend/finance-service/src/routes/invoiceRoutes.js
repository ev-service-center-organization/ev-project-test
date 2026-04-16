import { Router } from "express";
import { getInvoices, createInvoice, getInvoiceById, updateInvoice, deleteInvoice, recordPayment, createInvoiceWithPayment, getDashboardStats, getInvoiceByAppointmentId } from "../controllers/invoiceController.js";

const router = Router();

router.get("/", getInvoices);
router.get("/appointment/:appointmentId", getInvoiceByAppointmentId);
router.get("/:id", getInvoiceById);
router.get("/stats/dashboard", getDashboardStats);
router.post("/", createInvoice);
router.post("/payment", recordPayment);
router.post("/create-with-payment", createInvoiceWithPayment);
router.put("/:id", updateInvoice);
router.delete("/:id", deleteInvoice);

export default router;
