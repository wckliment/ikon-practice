const OpenDentalService = require('../services/openDentalService');
const { getKeysFromLocation, getLocationCodeById } = require('../utils/locationUtils');
const crypto = require('crypto');
const db = require('../config/db');
const { formTemplates } = require('../../frontend/src/data/formTemplates');


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

    // 3. Get SheetDef and patient info
    const sheetDefResult = await openDental.getSheetDef(Number(sheet_def_id));
    const sheetDef = Array.isArray(sheetDefResult)
      ? sheetDefResult.find(def => def.SheetDefNum === Number(sheet_def_id))
      : sheetDefResult;

    const patient = await openDental.getPatient(pat_num);

    // 4. Get template fields from SheetDef (to render inputs before submission)
    const rawDescription = sheetDef?.Description || '';
    const descKey = rawDescription.trim().toLowerCase();

    const matchedTemplate = Object.entries(formTemplates).find(
      ([key]) => key.trim().toLowerCase() === descKey
    )?.[1] || [];

    console.log('🧩 SheetDef.Description:', rawDescription);
    console.log('🔎 Normalized Description Key:', descKey);
    console.log('✅ Matched Template Fields:', matchedTemplate);

    // 5. Return all data to frontend
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

    // 3. Fetch SheetDef to determine SheetType
    const sheetDefResult = await openDental.getSheetDef(Number(sheet_def_id));
    const sheetDef = Array.isArray(sheetDefResult)
      ? sheetDefResult.find(def => def.SheetDefNum === Number(sheet_def_id))
      : sheetDefResult;

    const SheetType = sheetDef?.SheetType || 'Consent';
    const Description = sheetDef?.Description || 'Online Form';

    console.log("🧪 fieldResponses from frontend:");
    console.log(JSON.stringify(fieldResponses, null, 2));

    // 4. Filter out any reserved field names (optional)
    const reservedFieldNames = [
      'sheet.Description',
      'dateTime.Today',
      'patientName.FName',
      'patientName.LName',
      'birthdate'
    ];

    const fieldTypeMap = {
      InputField: 1,
      StaticText: 2,
      Image: 3,
      Line: 4,
      Rectangle: 5,
      CheckBox: 6,
      RadioButton: 7,
      ComboBox: 8,
      SigBox: 9,
    };

 const sheetFields = fieldResponses.map(field => {
  const FieldType = fieldTypeMap[field.FieldType] || 1;

  return {
    FieldType,
    FieldName: field.FieldName,
    FieldValue: field.FieldValue || '',
    IsRequired: field.IsRequired || false
  };
});


    // ✅ Inject the Description field to ensure it’s visible in UI
    sheetFields.push({
      FieldType: 1,
      FieldName: 'sheet.Description',
      FieldValue: Description,
      IsRequired: false
    });

    const fullSheetPayload = {
  PatNum: pat_num,
  SheetDefNum: sheetDef?.SheetDefNum,  // ✅ Add this line
  SheetType,
  Description,
  DateTimeSheet: new Date().toISOString(),
  SheetFields: sheetFields
};

    console.log("📤 Sending Sheet to Open Dental:");
    console.log(JSON.stringify(fullSheetPayload, null, 2));

    const createdSheet = await openDental.createSheet(fullSheetPayload);

    // 5. Mark as completed
    await db.query(
      `UPDATE forms_log SET status = 'completed', completed_at = NOW() WHERE id = ?`,
      [logEntry.id]
    );

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
