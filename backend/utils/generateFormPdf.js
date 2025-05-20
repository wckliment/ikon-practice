const PDFDocument = require('pdfkit');

/**
 * Generates a PDF buffer from a custom form submission.
 * @param {Object} submission - Metadata about the submission
 * @param {Array} answers - List of submitted answers, each with label, field_type, value, section_title, etc.
 * @param {String} formTitle - Optional title to display on the PDF
 * @returns {Promise<Buffer>}
 */
function generateFormPdf(submission, answers, formTitle = 'Submitted Form') {
  const doc = new PDFDocument({ margin: 50 });
  const chunks = [];

  doc.on('data', chunk => chunks.push(chunk));
  doc.on('end', () => {});

  // Title
  doc.font('Helvetica-Bold').fontSize(18).text(formTitle, { align: 'center' }).moveDown(1.5);

  // Submission metadata
  doc.font('Helvetica').fontSize(12);
  doc.text(`Submission ID: ${submission.id}`);
  doc.text(`Patient ID: ${submission.patient_id || 'N/A'}`);
  doc.text(`Submitted At: ${new Date(submission.submitted_at).toLocaleString()}`);
  doc.moveDown();

  // Group answers by section_title
const grouped = answers.reduce((acc, field) => {
  const section = !field.section_title || field.section_title === 'null' ? 'General' : field.section_title;
  if (!acc[section]) acc[section] = [];
  acc[section].push(field);
  return acc;
}, {});


  // Render grouped sections

  for (const [sectionTitle, fields] of Object.entries(grouped)) {
    doc.font('Helvetica-Bold').fontSize(14).text(sectionTitle).moveDown(0.5);

    fields.sort((a, b) => a.field_order - b.field_order);

    fields.forEach((field) => {
      const { label, value, field_type } = field;

      if (!label) return;

      if (field_type === 'static_text') {
        doc.moveDown(0.5);
        doc.font('Helvetica-Oblique').fontSize(10).fillColor('gray').text(label, {
          width: 500,
        }).fillColor('black');
        return;
      }

      if (field_type === 'signature' && value?.startsWith('data:image/png;base64,')) {
        doc.moveDown(1.5);
        doc.font('Helvetica-Bold').fontSize(12).text(`${label}:`).moveDown(0.5);

        try {
          const base64Data = value.replace(/^data:image\/png;base64,/, '');
          const imageBuffer = Buffer.from(base64Data, 'base64');
          doc.image(imageBuffer, {
            fit: [300, 80],
            align: 'left'
          }).moveDown(1);
        } catch (err) {
          console.warn("⚠️ Signature image failed:", err.message);
          doc.font('Helvetica').text('[Signed]').moveDown(1);
        }
          } else if ((field_type === 'checkbox' || field_type === 'radio') && field.options?.length) {
  doc.font('Helvetica-Bold').fontSize(12).text(`${label}:`);
  const values = typeof value === 'string' ? value.split(",").map(v => v.trim()) : [];
  field.options.forEach(opt => {
    const isSelected = values.includes(opt);
    doc.font('Helvetica').text(`  [${isSelected ? 'X' : ' '}] ${opt}`);
  });
  doc.moveDown();
}   else {
        doc.font('Helvetica-Bold').fontSize(12).text(`${label}:`, { continued: true });
        doc.font('Helvetica').text(` ${value || ''}`).moveDown(1);
      }

    });

    doc.moveDown();
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
