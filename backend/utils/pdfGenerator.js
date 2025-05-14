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
  const staticBlock = formStaticContent[cleanTitle];

  console.log("🧪 Injecting static text for:", cleanTitle);
  console.log("🧪 Static Text Found:", !!staticBlock);
  console.log("🧪 Static Text Preview:", staticBlock?.substring?.(0, 100));

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

  // Section-based rendering
  if (Array.isArray(layout.sections)) {
    layout.sections.forEach(section => {
      if (section.title === "Signature") return; // defer signature section for now

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

    // ✅ Inject static text before the Signature section
    if (layout.staticText && ["top", "middle"].includes(layout.staticTextPosition)) {
      console.log("📄 Injecting static text for:", cleanTitle);
      console.log("📄 Static block exists?", !!staticBlock);

      if (typeof staticBlock === "string") {
        doc.font('Helvetica').fontSize(12).text(staticBlock.trim(), {
          align: 'left',
          lineGap: 4
        }).moveDown(2);
      }

      if (Array.isArray(staticBlock)) {
        staticBlock.forEach(block => {
          if (typeof block.text === "string") {
            doc.font('Helvetica').fontSize(12).text(block.text.trim(), {
              align: 'left',
              lineGap: 4
            }).moveDown(1);
          }
        });
      }

      if (!staticBlock) {
        console.warn(`⚠️ No static text found for ${cleanTitle}`);
      }
    }

    // Signature Section Heading (if defined)
    const signatureSection = layout.sections.find(s => s.title === "Signature");
    if (signatureSection) {
      doc.font('Helvetica-Bold').fontSize(14).text(signatureSection.title).moveDown(0.5);
    }
  } else {
    // Fallback layout (flat list of fields)
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

  // Signature rendering
  console.log("🧾 Available formFields:", formFields.map(f => f.FieldName));
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
