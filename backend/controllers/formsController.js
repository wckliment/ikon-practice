const OpenDentalService = require('../services/openDentalService');
const { getKeysFromLocation, getLocationCodeById, getLocationIdByCode } = require('../utils/locationUtils');
const crypto = require('crypto');
const db = require('../config/db');
const { formTemplates } = require('../../frontend/src/data/formTemplates');
const { generateFormPdf } = require('../utils/pdfGenerator');
const { getDocCategory } = require('../utils/formToDocCategoryMap');
const { hasChanged } = require('../utils/reconcilliation');


// Fetch completed forms for a patient
const getFormsForPatient = async (req, res) => {
  try {
    const { patNum } = req.params;
    const locationId = req.user.location_id;

    const locationCode = await getLocationCodeById(locationId);
    const { devKey, custKey } = await getKeysFromLocation(locationCode);
    const openDental = new OpenDentalService(devKey, custKey);

    const completedForms = await openDental.getFormsByPatient(patNum);


  // Optional filters
const { method, status } = req.query;

let query = `SELECT id, sheet_def_id, method, sent_at, token, status FROM forms_log WHERE pat_num = ?`;
const queryParams = [patNum];

if (status === "pending") {
  query += ` AND status = 'pending'`;
} else if (status) {
  query += ` AND status = ?`;
  queryParams.push(status);
}

if (method) {
  query += ` AND method = ?`;
  queryParams.push(method);
}

query += ` ORDER BY sent_at DESC`;

const [pendingForms] = await db.query(query, queryParams);


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
    const { sheet_def_id, pat_num, location_id, patient_metadata } = logEntry;

    // 2. Get API keys from location
    const locationCode = await getLocationCodeById(location_id);
    const { devKey, custKey } = await getKeysFromLocation(locationCode);
    const openDental = new OpenDentalService(devKey, custKey);

    // 3. Get the SheetDef
    const result = await openDental.getSheetDef(Number(sheet_def_id));
    const sheetDef = Array.isArray(result)
      ? result.find(def => def.SheetDefNum === Number(sheet_def_id))
      : result;

    if (!sheetDef || !sheetDef.Description?.trim()) {
      return res.status(400).json({ error: `This form cannot be loaded because it lacks a description.` });
    }

    const descKey = sheetDef.Description.replace(/\s+/g, ' ').trim().toLowerCase();
    const matchedTemplate = Object.entries(formTemplates).find(
      ([key]) => key.replace(/\s+/g, ' ').trim().toLowerCase() === descKey
    )?.[1];

    if (!matchedTemplate) {
      return res.status(400).json({ error: `No matching form template found for: ${sheetDef.Description}` });
    }

    // 4. Get patient info
    let patient = null;

    if (pat_num) {
      // Normal case: patient exists in Open Dental
      patient = await openDental.getPatient(pat_num);
    } else if (patient_metadata) {
      // Fallback for public forms with no PatNum
      const parsed = typeof patient_metadata === 'string'
        ? JSON.parse(patient_metadata)
        : patient_metadata;

      patient = {
        PatNum: null,
        FName: parsed.name?.split(' ')[0] || '',
        LName: parsed.name?.split(' ').slice(1).join(' ') || '',
        Birthdate: null,
      };
    } else {
      return res.status(400).json({ error: "No patient information available for this form." });
    }

    // 5. Return everything to frontend
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

let sheetDef;

// Attempt normal fetch first
try {
  const result = await openDental.getSheetDef(Number(sheet_def_id));
  sheetDef = Array.isArray(result)
    ? result.find(def => def.SheetDefNum === Number(sheet_def_id))
    : result;
} catch (err) {
  console.warn(`⚠️ Failed to load SheetDefNum ${sheet_def_id} directly. Trying fallback by Description.`);
}

// Fallback: lookup by matching description (only if broken or not found)
if (!sheetDef || sheetDef.Description?.trim() === '') {
  console.log(`🔍 Attempting fallback SheetDef lookup by description...`);
  const allDefs = await openDental.getSheetDefs();

  const [fallbackRow] = await db.query(`SELECT description FROM forms_log WHERE id = ?`, [logEntry.id]);
  const fallbackDesc = fallbackRow?.description?.trim().toLowerCase();

  const fallbackMatch = allDefs.find(def =>
    def.Description?.trim().toLowerCase() === fallbackDesc
  );

  if (!fallbackMatch) {
    throw new Error(`❌ Could not find matching SheetDef by description "${fallbackDesc}"`);
  }

  sheetDef = fallbackMatch;
  console.log(`✅ Fallback resolved to SheetDefNum: ${sheetDef.SheetDefNum}`);
}


const rawDescription = sheetDef.Description || '';
if (!rawDescription.trim()) {
  throw new Error(`❌ SheetDef ${sheetDef.SheetDefNum} is missing a Description.`);
}


const Description = sheetDef.Description?.trim() || `Submitted Form ${sheetDef.SheetDefNum}`;
console.log("📄 Description from sheetDef:", Description);


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

// 5. Reconciliation (only if pat_num exists)
if (pat_num) {
  const currentPatient = await openDental.getPatient(pat_num);

  // Define which patient fields you want to track
  const trackableFields = [
    'Address', 'Address2', 'City', 'State', 'Zip',
    'HmPhone', 'WkPhone', 'WirelessPhone', 'Email'
  ];

  for (const field of sheetFields) {
    const { FieldName, FieldValue } = field;

    if (trackableFields.includes(FieldName)) {
      const currentValue = currentPatient[FieldName] || '';
      if (hasChanged(FieldValue, currentValue)) {
        await db.query(`
          INSERT INTO reconciled_form_data
            (patient_id, field_name, submitted_value, original_value, form_name)
          VALUES (?, ?, ?, ?, ?)`,
          [pat_num, FieldName, FieldValue, currentValue, Description]
        );
        console.log(`🔁 Queued for reconciliation: ${FieldName} = "${currentValue}" → "${FieldValue}"`);
      }
    }
  }
} else {
  console.log("📄 No PatNum — skipping reconciliation logic.");
}


    // 5. Submit to Open Dental
  const fullSheetPayload = {
  PatNum: pat_num,
    SheetDefNum: sheetDef.SheetDefNum,
   Description,
  DateTimeSheet: new Date().toISOString(),
  SheetFields: sheetFields,
};

    console.log("📤 Sending Sheet to Open Dental:");
    console.log(JSON.stringify(fullSheetPayload, null, 2));


if (pat_num) {
  createdSheet = await openDental.createSheet(fullSheetPayload);
} else {
  console.log("📭 No PatNum — skipping Open Dental Sheet creation for public form.");
}

    // 6. Mark as completed in ikonPractice
    await db.query(
      `UPDATE forms_log SET status = 'completed', completed_at = NOW() WHERE id = ?`,
      [logEntry.id]
    );

// 7. Generate PDF and upload to Open Dental Imaging (only if patNum exists)
if (pat_num) {
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
} else {
  console.log("📁 No PatNum — skipping upload to Open Dental Imaging for now.");
}

res.json({ message: 'Form submitted and saved successfully.' });

  } catch (error) {
    console.error('❌ Error in submitForm:', error);
    res.status(500).json({ error: error.message || 'Failed to submit form.' });
  }
};

const generateFormToken = async (req, res) => {
  try {
    const { formName, method = "website", patientMetadata = {} } = req.body;

    console.log("📥 generateFormToken called with:", {
      formName,
      method,
      patientMetadata,
    });

    // Use Relaxation Dental’s location code
    const locationCode = "relaxation";
    const { devKey, custKey } = await getKeysFromLocation(locationCode);
    const location_id = await getLocationIdByCode(locationCode); // ✅ Dynamic lookup

    const openDental = new OpenDentalService(devKey, custKey);

    const sheetDefs = await openDental.getSheetDefs();
    const match = sheetDefs.find(
      def => def.Description?.trim().toLowerCase() === formName.trim().toLowerCase()
    );

    if (!match) {
      console.warn(`❌ No matching form found for: ${formName}`);
      return res.status(404).json({ error: `No matching form found in Open Dental for: ${formName}` });
    }

    const sheetDefId = match.SheetDefNum;
    const token = crypto.randomUUID();
    const sentAt = new Date();

    const patNum = null;
    const createdBy = null;

    console.log("🧪 About to insert into forms_log with:", {
      patNum,
      sheetDefId,
      method,
      sentAt,
      token,
      createdBy,
      location_id,
      patientMetadata,
    });

    await db.query(
      `INSERT INTO forms_log
        (pat_num, sheet_def_id, method, status, sent_at, token, created_by, location_id, patient_metadata)
       VALUES (?, ?, ?, 'pending', ?, ?, ?, ?, ?)`,
      [
        patNum,
        sheetDefId,
        method,
        sentAt,
        token,
        createdBy,
        location_id,
        JSON.stringify(patientMetadata),
      ]
    );

    const fullLink = `http://127.0.0.1:5500/forms/fill/index.html?token=${token}`;
    console.log("✅ Token generated:", token);

    res.json({ token, link: fullLink });
  } catch (err) {
    console.error("❌ Error generating public form token:", err);
    res.status(500).json({ error: err.message });
  }
};

const getPendingTabletFormsPublic = async (req, res) => {
  try {
    const { patNum } = req.params;

    // Get all pending tablet forms for this patient
    const [rows] = await db.query(
      `SELECT token, sheet_def_id, location_id
       FROM forms_log
       WHERE pat_num = ? AND method = 'tablet' AND status = 'pending'
       ORDER BY sent_at DESC`,
      [patNum]
    );

    if (rows.length === 0) return res.json([]);

    // Get Open Dental keys from first matching location (assuming all forms are same location)
    const locationId = rows[0].location_id;
    const locationCode = await getLocationCodeById(locationId);
    const { devKey, custKey } = await getKeysFromLocation(locationCode);
    const openDental = new OpenDentalService(devKey, custKey);

    // Fetch all SheetDefs once
    const allDefs = await openDental.getSheetDefs();

    // Map forms with matched descriptions
    const results = rows.map(row => {
      const match = allDefs.find(def => def.SheetDefNum === row.sheet_def_id);
      return {
        token: row.token,
        description: match?.Description || "Unknown Form"
      };
    });

    res.json(results);
  } catch (error) {
    console.error("❌ Error fetching tablet forms (public):", error);
    res.status(500).json({ error: error.message });
  }
};




module.exports = {
  getFormsForPatient,
  getFieldsForForm,
  sendForm,
  getSheetDefs,
  cancelForm,
  getFormByToken,
  submitForm,
  generateFormToken,
  getPendingTabletFormsPublic
};
