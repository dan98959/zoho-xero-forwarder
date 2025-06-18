import express from 'express';
import multer from 'multer';
import nodemailer from 'nodemailer';
import fs from 'fs';

const app = express();
const upload = multer({ dest: 'uploads/' });

const PORT = process.env.PORT || 3000;

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "465"),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

app.post('/zoho', upload.any(), async (req, res) => {
  try {
    const subject = req?.body?.subject || 'Zoho Invoice';
    const content = req?.body?.content || 'Forwarded message from Zoho';
    const attachments = [];

    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files) {
        attachments.push({
          filename: file.originalname,
          path: file.path
        });
      }
    }

    await transporter.sendMail({
      from: `"Zoho Forwarder" <${process.env.SMTP_USER}>`,
      to: 'bills.o96mxb.wf4amrdhwpdzgo7u@xerofiles.com',
      subject,
      html: content,
      attachments
    });

    if (req.files) {
      req.files.forEach(file => fs.unlinkSync(file.path));
    }

    res.sendStatus(200); // ✅ Always tell Zoho “we’re alive”
  } catch (err) {
    console.error('Webhook processing error:', err);
    res.sendStatus(200); // ✅ Still tell Zoho we’re OK so it saves config
  }
});

app.listen(PORT, () => {
  console.log(`Zoho Forwarder listening on port ${PORT}`);
});
