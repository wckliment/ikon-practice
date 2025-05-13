const PDFDocument = require('pdfkit');
const layoutHints = require('./layoutHints');
const formStaticContent = require('./formStaticContent');
const fieldLabels = require('./fieldLables');

function generateFormPdf(patient, formFields, formTitle = "Patient Form") {
  const doc = new PDFDocument({ margin: 50 });
  const chunks = [];

  doc.on('data', chunk => chunks.push(chunk));

  const cleanTitle = formTitle.replace(/\s+/g, ' ').trim();
  const layout = layoutHints[cleanTitle] || {};

  const getLabel = (fieldName) => fieldLabels[fieldName] || fieldName;

  // Title
  doc.font('Helvetica-Bold').fontSize(18).text(cleanTitle, { align: 'center' }).moveDown(2);

  // Patient Info Row
  if (layout.groupPatientInfoRow) {
    doc.font('Helvetica').fontSize(12);
    doc.text(`Last Name: ${patient.LName || ''}`, { continued: true });
    doc.text(`   First Name: ${patient.FName || ''}`, { continued: true });
    doc.text(`   Birthdate: ${patient.Birthdate || ''}`);
    doc.moveDown();
  }

  // Date
  if (layout.includeDate) {
    const today = new Date().toISOString().split("T")[0];
    doc.text(`Date: ${today}`).moveDown();
  }

  // Static text (top)
  if (layout.staticText && layout.staticTextPosition === "top") {
    const staticBlock = formStaticContent[cleanTitle];
    if (staticBlock) {
      doc.moveDown(1);
      doc.font('Helvetica').fontSize(12).text(staticBlock.trim(), {
        align: 'left',
        lineGap: 4
      }).moveDown(2);
    }
  }

  // Section-based rendering
  if (Array.isArray(layout.sections)) {
    layout.sections.forEach(section => {
      doc.font('Helvetica-Bold').fontSize(14).text(section.title).moveDown(0.5);

      if (section.note) {
        doc.font('Helvetica-Oblique').fontSize(11).fillColor('gray').text(section.note).fillColor('black').moveDown(0.5);
      }

      section.fields.forEach(fieldName => {
        if (fieldName.toLowerCase() === 'signature') return;

        const label = getLabel(fieldName);

        const field = formFields.find(f => f.FieldName === fieldName);
        const value = field?.FieldValue || '';

        const discontinuedField = formFields.find(f => f.FieldName === `${fieldName}_discontinued`);
        const isDiscontinued = discontinuedField?.FieldValue === true || discontinuedField?.FieldValue === 'true';

        if (discontinuedField) {
          const box = isDiscontinued ? '[X]' : '[ ]';
          doc.font('Helvetica').fontSize(12).text(`${box} ${label}: ${value}`);
        } else {
          doc.font('Helvetica-Bold').fontSize(12).text(`${label}:`, { continued: true });
          doc.font('Helvetica').text(` ${value}`);
        }

        doc.moveDown(0.75);
      });

      doc.moveDown(1);
    });
  } else {
    // Fallback: flat list
    formFields
      .filter(f => (f.FieldName || '').toLowerCase() !== 'signature')
      .forEach(field => {
        const label = getLabel(field.FieldName);
        const value = field.FieldValue || '';

        doc.font('Helvetica-Bold').fontSize(12).text(label + ':', { continued: true });
        doc.font('Helvetica').text(` ${value}`);
        doc.moveDown(1);
      });
  }

  // Static content (bottom)
  if (layout.staticText && layout.staticTextPosition === "bottom") {
    const staticBlock = formStaticContent[cleanTitle];
    if (staticBlock) {
      doc.moveDown(2);
      doc.font('Helvetica').fontSize(12).text(staticBlock.trim(), {
        align: 'left',
        lineGap: 4
      });
    }
  }

  // Signature field
  const signatureField = formFields.find(f => (f.FieldName || '').toLowerCase() === 'signature');
  if (signatureField) {
    doc.moveDown(1.5);
    doc.font('Helvetica-Bold').fontSize(12).text('Signature:').moveDown(0.5);

    if (signatureField.FieldValue?.startsWith('data:image/png;base64,')) {
      try {
        const base64Data = signatureField.FieldValue.replace(/^data:image\/png;base64,/, '');
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
  }

  doc.end();

  return new Promise((resolve) => {
    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(chunks);
      resolve(pdfBuffer);
    });
  });
}

module.exports = { generateFormPdf };

