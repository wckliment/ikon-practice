const PDFDocument = require('pdfkit');

/* Converts form answers into a Buffer-based PDF */

function generateFormPdf(patient, formFields, formTitle = "Patient Form") {
  const doc = new PDFDocument();
  const chunks = [];

  doc.on('data', chunk => chunks.push(chunk));

  doc.fontSize(16).text(formTitle, { align: 'center' }).moveDown();
 doc.fontSize(12).text(`Name: ${patient.FName} ${patient.LName || ''}`);
doc.text(`DOB: ${patient.Birthdate || 'Not Available'}`).moveDown();

  formFields.forEach(field => {
    if (field.FieldType !== 'SigBox') {
      doc.text(`${field.FieldName}: ${field.FieldValue}`);
    }
  });

  doc.end();

  return new Promise((resolve) => {
    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(chunks);
      resolve(pdfBuffer);
    });
  });
}

module.exports = { generateFormPdf };
