const OpenDentalService = require('../services/openDentalService');
const { getKeysFromLocation, getLocationCodeById } = require('./locationUtils');
const { getDocCategory } = require('./formToDocCategoryMap');

/**
 * Uploads a base64 PDF buffer to Open Dental Imaging Module
 * @param {Object} config - Upload config
 * @param {number} config.patNum - Open Dental patient ID
 * @param {number} config.locationId - Location ID in ikonPractice
 * @param {Buffer} config.buffer - Raw PDF buffer
 * @param {string} config.description - Description of the form
 * @param {string} [config.docCategoryName] - Optional fallback category name
 * @returns {Promise<Object>} - Open Dental API response
 */


async function uploadToImaging({ patNum, locationId, buffer, description, docCategoryName = 'Submitted Forms' }) {
  if (!patNum || !locationId || !buffer) {
    throw new Error('Missing required data for imaging upload.');
  }

  const locationCode = await getLocationCodeById(locationId);
  const { devKey, custKey } = await getKeysFromLocation(locationCode);
  const openDental = new OpenDentalService(devKey, custKey);

  const rawBase64 = buffer.toString('base64');
  const docCategory = getDocCategory(description) || docCategoryName;

  const result = await openDental.uploadPdfToImaging({
    PatNum: patNum,
    rawBase64,
    extension: '.pdf',
    Description: `${description} (Submitted Online)`,
    DocCategory: docCategory
  });

  return result;
}

module.exports = { uploadToImaging };
