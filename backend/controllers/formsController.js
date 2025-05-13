const OpenDentalService = require('../services/openDentalService');
const { getKeysFromLocation, getLocationCodeById } = require('../utils/locationUtils');
const crypto = require('crypto');
const db = require('../config/db');
const { formTemplates } = require('../../frontend/src/data/formTemplates');
const { generateFormPdf } = require('../utils/pdfGenerator');
const { getDocCategory } = require('../utils/formToDocCategoryMap');

// Fetch completed forms for a patient
const getFormsForPatient = async (req, res) => {
  try {
    const { patNum } = req.params;
    const locationId = req.user.location_id;

    const locationCode = await getLocationCodeById(locationId);
    const { devKey, custKey } = await getKeysFromLocation(locationCode);
    const openDental = new OpenDentalService(devKey, custKey);

    const completedForms = await openDental.getFormsByPatient(patNum);


    const [pendingForms] = await db.query(
      `SELECT * FROM forms_log WHERE pat_num = ? AND status = 'pending' ORDER BY sent_at DESC`,
      [patNum]
    );


    res.json({
      completed: completedForms,
      pending: pendingForms
    });
  } catch (error) {
    console.error('Error fetching forms by patient:', error);
    res.status(500).json({ error: error.message });
  }
};


const getFieldsForForm = async (req, res) => {
  try {
    const { sheetNum } = req.params;
    const locationId = req.user.location_id;

    const locationCode = await getLocationCodeById(locationId);
    const { devKey, custKey } = await getKeysFromLocation(locationCode);
    const openDental = new OpenDentalService(devKey, custKey);

    const fields = await openDental.getFormFields(sheetNum);

    res.json(fields);
  } catch (error) {
    console.error('Error fetching form fields:', error);
    res.status(500).json({ error: error.message });
  }
};

const sendForm = async (req, res) => {
  try {
    const { patNum, sheetDefId, method } = req.body;
    const userId = req.user.id;
    const locationId = req.user.location_id;

    const allowedMethods = ['website', 'sms', 'tablet'];
    if (!allowedMethods.includes(method)) {
      return res.status(400).json({ error: 'Invalid method' });
    }

    const token = crypto.randomUUID();
    const sentAt = new Date();

    await db.query(
      `INSERT INTO forms_log
       (pat_num, sheet_def_id, method, status, sent_at, token, created_by, location_id)
       VALUES (?, ?, ?, 'pending', ?, ?, ?, ?)`,
      [patNum, sheetDefId, method, sentAt, token, userId, locationId]
    );

   const origin = req.headers.origin || process.env.APP_BASE_URL || "http://localhost:5173";
const fullLink = `${origin}/forms/fill/${token}`;
res.json({ success: true, link: fullLink });

  } catch (err) {
    console.error("❌ Error sending form:", err);
    res.status(500).json({ error: err.message });
  }
};

const getSheetDefs = async (req, res) => {
  try {
    const locationId = req.user.location_id;
    const locationCode = await getLocationCodeById(locationId);
    const { devKey, custKey } = await getKeysFromLocation(locationCode);
    const openDental = new OpenDentalService(devKey, custKey);

    const sheetDefs = await openDental.getSheetDefs();
    res.json(sheetDefs);
  } catch (error) {
    console.error("❌ Failed to fetch SheetDefs:", error);
    res.status(500).json({ error: error.message });
  }
};

const cancelForm = async (req, res) => {
  try {
    const { formId } = req.params;

    const [result] = await db.query(
      `UPDATE forms_log SET status = 'cancelled' WHERE id = ? AND status = 'pending'`,
      [formId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Form not found or already cancelled" });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("❌ Error cancelling form:", error);
    res.status(500).json({ error: error.message });
  }
};


const getFormByToken = async (req, res) => {
  try {
    const { token } = req.params;

    // 1. Find pending form from ikon DB
    const [rows] = await db.query(
      `SELECT * FROM forms_log WHERE token = ? AND status = 'pending'`,
      [token]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Invalid or expired form token.' });
    }

    const logEntry = rows[0];
    const { sheet_def_id, pat_num, location_id } = logEntry;

    // 2. Get API keys from location
    const locationCode = await getLocationCodeById(location_id);
    const { devKey, custKey } = await getKeysFromLocation(locationCode);
    const openDental = new OpenDentalService(devKey, custKey);

// 3. Get the actual SheetDef by ID (directly)

const result = await openDental.getSheetDef(Number(sheet_def_id));

const sheetDef = Array.isArray(result)
  ? result.find(def => def.SheetDefNum === Number(sheet_def_id))
  : result;

if (!sheetDef) {
  console.warn(`❌ No SheetDef found for ID: ${sheet_def_id}`);
  return res.status(400).json({ error: `This form could not be located.` });
}

console.log("📄 Matched SheetDef:", sheetDef);

const rawDescription = sheetDef.Description;

if (!rawDescription || !rawDescription.trim()) {
  console.warn(`❌ SheetDef ${sheetDef.SheetDefNum} is missing a Description.`);
  return res.status(400).json({ error: `This form cannot be loaded because it lacks a description.` });
}


if (!rawDescription || !rawDescription.trim()) {
  console.warn(`❌ SheetDef ${sheetDef.SheetDefNum} is missing a Description.`);
  return res.status(400).json({ error: `This form cannot be loaded because it lacks a description.` });
}

const descKey = rawDescription.replace(/\s+/g, ' ').trim().toLowerCase();

// 4. Match form template from formTemplates using cleaned description
const matchedTemplate = Object.entries(formTemplates).find(
  ([key]) => key.replace(/\s+/g, ' ').trim().toLowerCase() === descKey
)?.[1];

if (!matchedTemplate) {
  console.warn(`⚠️ No formTemplates match for description: "${rawDescription}" (normalized: "${descKey}")`);
  console.warn("✅ Available formTemplates:", Object.keys(formTemplates));
  return res.status(400).json({ error: `No matching form template found for: ${rawDescription}` });
}

    // 5. Fetch patient data
    const patient = await openDental.getPatient(pat_num);

    // 6. Return all data to frontend
    res.json({
      token,
      form: {
        sheetDef,
        sheetFieldsTemplate: matchedTemplate
      },
      patient: {
        patNum: patient.PatNum,
        firstName: patient.FName,
        lastName: patient.LName,
        birthdate: patient.Birthdate
      }
    });

  } catch (error) {
    console.error('❌ Error in getFormByToken:', error);
    res.status(500).json({ error: 'Server error while loading form.' });
  }
};



const submitForm = async (req, res) => {
  try {
    const { token } = req.params;
    const { fieldResponses } = req.body;

    // 1. Look up the pending form entry
    const [rows] = await db.query(
      `SELECT * FROM forms_log WHERE token = ? AND status = 'pending'`,
      [token]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Invalid or expired form token.' });
    }

    const logEntry = rows[0];
    const { sheet_def_id, pat_num, location_id } = logEntry;

    // 2. Get API keys from location
    const locationCode = await getLocationCodeById(location_id);
    const { devKey, custKey } = await getKeysFromLocation(locationCode);
    const openDental = new OpenDentalService(devKey, custKey);

    // 3. Fetch SheetDef
const result = await openDental.getSheetDef(Number(sheet_def_id));
const sheetDef = Array.isArray(result)
  ? result.find(def => def.SheetDefNum === Number(sheet_def_id))
  : result;

if (!sheetDef) {
  throw new Error(`❌ Could not load SheetDef for ID: ${sheet_def_id}`);
}

const rawDescription = sheetDef.Description || '';
if (!rawDescription.trim()) {
  throw new Error(`❌ SheetDef ${sheetDef.SheetDefNum} is missing a Description.`);
}

const SheetType = sheetDef.SheetType || 'Consent';
const Description = sheetDef.Description;

    console.log("🧪 fieldResponses from frontend:");
    console.log(JSON.stringify(fieldResponses, null, 2));

    // 4. Map fields
    const fieldTypeMap = {
      InputField: 1, StaticText: 2, Image: 3, Line: 4, Rectangle: 5,
      CheckBox: 6, RadioButton: 7, ComboBox: 8, SigBox: 9,
    };

    const sheetFields = fieldResponses.map(field => ({
      FieldType: fieldTypeMap[field.FieldType] || 1,
      FieldName: field.FieldName,
      FieldValue: field.FieldValue || '',
      IsRequired: field.IsRequired || false,
    }));


    // 5. Submit to Open Dental
    const fullSheetPayload = {
      PatNum: pat_num,
      SheetDefNum: sheetDef?.SheetDefNum,
      SheetType,
      Description,
      DateTimeSheet: new Date().toISOString(),
      SheetFields: sheetFields,
    };

    console.log("📤 Sending Sheet to Open Dental:");
    console.log(JSON.stringify(fullSheetPayload, null, 2));

    const createdSheet = await openDental.createSheet(fullSheetPayload);

    // 6. Mark as completed in ikonPractice
    await db.query(
      `UPDATE forms_log SET status = 'completed', completed_at = NOW() WHERE id = ?`,
      [logEntry.id]
    );

    // 7. Generate PDF and upload to Open Dental Imaging
    const patient = await openDental.getPatient(pat_num);
    const pdfBuffer = await generateFormPdf(patient, sheetFields, Description);
    const base64Pdf = pdfBuffer.toString('base64');

  const docCategory = getDocCategory(Description);

await openDental.uploadPdfToImaging({
  PatNum: pat_num,
  rawBase64: base64Pdf,
  extension: '.pdf',
  Description: `${Description} (Submitted Online)`,
  DocCategory: docCategory,
});

    console.log(`✅ PDF generated and uploaded for PatNum ${pat_num}`);
    res.json({ message: 'Form submitted and saved successfully.' });

  } catch (error) {
    console.error('❌ Error in submitForm:', error);
    res.status(500).json({ error: error.message || 'Failed to submit form.' });
  }
};





module.exports = {
  getFormsForPatient,
  getFieldsForForm,
  sendForm,
  getSheetDefs,
  cancelForm,
  getFormByToken,
  submitForm
};
