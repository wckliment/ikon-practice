const OpenDentalService = require('../services/openDentalService');
const { getKeysFromLocation, getLocationCodeById } = require('../utils/locationUtils');

// Fetch completed forms for a patient
const getFormsForPatient = async (req, res) => {
  try {
    const { patNum } = req.params;
    const locationId = req.user.location_id;

    const locationCode = await getLocationCodeById(locationId);
    const { devKey, custKey } = await getKeysFromLocation(locationCode);
    const openDental = new OpenDentalService(devKey, custKey);

    const forms = await openDental.getFormsByPatient(patNum);

    res.json(forms);
  } catch (error) {
    console.error('Error fetching forms by patient:', error);
    res.status(500).json({ error: error.message });
  }
};

// 🛠️ FIX: properly declare the function (don't attach to exports directly)
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

// ✅ Now this will work correctly:
module.exports = {
  getFormsForPatient,
  getFieldsForForm,
};

