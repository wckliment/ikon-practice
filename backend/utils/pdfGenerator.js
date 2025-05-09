const PDFDocument = require('pdfkit');
const layoutHints = require('./layoutHints');
const formStaticContent = require('./formStaticContent');


function generateFormPdf(patient, formFields, formTitle = "Patient Form") {
  const doc = new PDFDocument({ margin: 50 });
  const chunks = [];

  doc.on('data', chunk => chunks.push(chunk));

  const layout = layoutHints[formTitle] || {};

  // -- Title
  doc.font('Helvetica-Bold').fontSize(18).text(formTitle, { align: 'center' }).moveDown(2);

  // -- Patient Info Row
  if (layout.groupPatientInfoRow) {
    doc.font('Helvetica').fontSize(12);
    doc.text(`Last Name: ${patient.LName || ''}`, { continued: true });
    doc.text(`   First Name: ${patient.FName || ''}`, { continued: true });
    doc.text(`   Birthdate: ${patient.Birthdate || ''}`);
    doc.moveDown();
  }

  // -- Date
  if (layout.includeDate) {
    const today = new Date().toISOString().split("T")[0];
    doc.text(`Date: ${today}`).moveDown();
  }

  // -- Static content (top)
  if (layout.staticText && layout.staticTextPosition === "top") {
    const staticBlock = formStaticContent[formTitle];
    if (staticBlock) {
      doc.moveDown(1);
      doc.font('Helvetica').fontSize(12).text(staticBlock.trim(), {
        align: 'left',
        lineGap: 4
      }).moveDown(2);
    }
  }

// -- Render non-signature fields first
formFields
  .filter(f => (f.FieldName || '').toLowerCase() !== 'signature')
  .forEach(field => {
    doc.font('Helvetica').fontSize(12);
    const label = `${field.FieldName}: `;
    const value = field.FieldValue || '';

    // Underlined value
    const labelWidth = doc.widthOfString(label);
    const valueWidth = doc.widthOfString(value);
    const lineLength = 300;

    doc.text(label, { continued: true });
    doc.text(value);
    doc.moveTo(doc.x - valueWidth, doc.y) // underline under value
       .lineTo(doc.x - valueWidth + Math.max(valueWidth, lineLength * 0.5), doc.y)
       .stroke();

    doc.moveDown(1.5);
  });

// -- Static content (bottom)
if (layout.staticText && layout.staticTextPosition === "bottom") {
  const staticBlock = formStaticContent[formTitle];
  if (staticBlock) {
    doc.moveDown(2);
    doc.font('Helvetica').fontSize(12).text(staticBlock.trim(), {
      align: 'left',
      lineGap: 4
    });
  }
}

// -- Render signature field(s) last
formFields
  .filter(f => (f.FieldName || '').toLowerCase() === 'signature')
  .forEach(field => {
    doc.moveDown(1.5);
    doc.font('Helvetica-Bold').fontSize(12).text('Signature:').moveDown(0.5);

    if (field.FieldValue?.startsWith('data:image/png;base64,')) {
      try {
        const base64Data = field.FieldValue.replace(/^data:image\/png;base64,/, '');
        const imageBuffer = Buffer.from(base64Data, 'base64');

        doc.image(imageBuffer, {
          fit: [300, 80],
          align: 'left',
        }).moveDown(1);
      } catch (err) {
        console.warn("⚠️ Failed to render signature image:", err.message);
        doc.text('[Signed]').moveDown(1);
      }
    } else {
      doc.text('[Signed]').moveDown(1);
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
