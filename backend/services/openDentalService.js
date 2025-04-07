const axios = require('axios');
const { findProcedureCode } = require('../../common/utils/procedureCodeMapper');


class OpenDentalService {
  constructor(developerKey, customerKey) {
    this.baseUrl = 'https://api.opendental.com/api/v1';
    this.headers = {
      'Authorization': `ODFHIR ${developerKey}/${customerKey}`
    };
  }

  async getAppointments(startDate, endDate, providerId = null) {
    try {
      console.log(`Fetching appointments from ${startDate} to ${endDate}`);

      const params = {
        startDate: this._formatDate(startDate),
        endDate: this._formatDate(endDate),
      };

      if (providerId) {
        params.ProvNum = providerId;
      }

      console.log('Request params:', params);

      const response = await axios.get(`${this.baseUrl}/appointments`, {
        headers: this.headers,
        params
      });

      console.log(`Received ${response.data.length} appointments from API`);
      return this._transformAppointments(response.data);
    } catch (error) {
      this._handleError('appointments', error);
      throw new Error(`Failed to fetch appointments: ${error.message}`);
    }
  }

async createAppointment(appointmentData) {
  try {
    console.log('Creating appointment in Open Dental:', appointmentData);

    // Normalize AptStatus
    if (typeof appointmentData.AptStatus === 'number') {
      switch (appointmentData.AptStatus) {
        case 1:
          appointmentData.AptStatus = "Scheduled";
          break;
        case 2:
          appointmentData.AptStatus = "Complete";
          break;
        case 3:
          appointmentData.AptStatus = "UnschedList";
          break;
        case 4:
          appointmentData.AptStatus = "Broken";
          break;
        case 5:
          appointmentData.AptStatus = "Planned";
          break;
        default:
          appointmentData.AptStatus = "Scheduled";
      }
    }

    // Step 1: Create the appointment
    const response = await axios.post(`${this.baseUrl}/appointments`, appointmentData, {
      headers: this.headers
    });

    const createdAppointment = response.data;
    console.log('✅ Appointment created:', createdAppointment);

    // Step 2: If a procedure was passed, map and create procedure log
    const procLabel = appointmentData.ProcDescript || appointmentData.description;
if (procLabel) {
  const mapped = findProcedureCode(procLabel);

  if (Array.isArray(mapped)) {
    for (const proc of mapped) {
      const procedureLog = {
        AptNum: createdAppointment.AptNum,
        PatNum: createdAppointment.PatNum,
        ProcCode: proc.ProcCode,
        ProcStatus: "TP",
        ProcDate: createdAppointment.AptDateTime.split("T")[0],
        Note: proc.Descript
      };
      console.log("🧾 Creating procedure log for compound procedure:", procedureLog);
      await this.createProcedureLog(procedureLog);
    }
  } else if (mapped) {
    const procedureLog = {
      AptNum: createdAppointment.AptNum,
      PatNum: createdAppointment.PatNum,
      ProcCode: mapped.ProcCode,
      ProcStatus: "TP",
      ProcDate: createdAppointment.AptDateTime.split("T")[0],
      Note: mapped.Descript
    };
    console.log("🧾 Creating procedure log:", procedureLog);
    await this.createProcedureLog(procedureLog);
  } else {
    console.warn(`⚠️ No CDT match found for: "${procLabel}" — skipping procedure log`);
  }
}

    // Return transformed result
    return this._transformAppointment(createdAppointment);
  } catch (error) {
    this._handleError('create appointment', error);
    throw new Error(`Failed to create appointment: ${error.message}`);
  }
}

  async getAllProcedureCodes() {
  try {
    console.log("📦 Fetching all procedure codes from Open Dental");

    const response = await axios.get(`${this.baseUrl}/procedurecodes`, {
      headers: this.headers
    });

    return response.data;
  } catch (error) {
    this._handleError('procedurecodes', error);
    throw new Error(`Failed to fetch procedure codes: ${error.message}`);
  }
  }



 async createProcedureLog(procedureData) {
  try {
    // 🔍 Step 1: Log the incoming data
    console.log("🔨 Creating procedure log with the following data:");
    console.log(`  - AptNum: ${procedureData.AptNum}`);
    console.log(`  - PatNum: ${procedureData.PatNum}`);
    console.log(`  - ProcCode: ${procedureData.ProcCode}`);
    console.log(`  - ProvNum: ${procedureData.ProvNum}`);
    console.log(`  - Descript: ${procedureData.Descript}`);
    console.log(`  - Status: ${procedureData.status}`);
    console.log(`  - API Endpoint: ${this.baseUrl}/procedurelogs`);

    // 🛰️ Send the request
    const response = await axios.post(`${this.baseUrl}/procedurelogs`, procedureData, {
      headers: this.headers
    });

    // ✅ Step 2: Log the success response
    console.log("✅ Open Dental API response:", response.data);

    return response.data;
  } catch (error) {
    // ❌ Step 3: Log the failure in detail
    console.error("❌ Failed to create procedure log:", error.response?.data || error.message);
    this._handleError('create procedure log', error);
    throw new Error(`Failed to create procedure log: ${error.message}`);
  }
}

  async getProviders() {
    try {
      console.log("🌐 Fetching providers from Open Dental");
      const response = await axios.get(`${this.baseUrl}/providers`, {
        headers: this.headers
      });

      console.log(`✅ Received ${response.data.length} providers`);
      return response.data;
    } catch (error) {
      this._handleError('providers', error);
      throw new Error(`Failed to fetch providers: ${error.message}`);
    }
  }

  async getAppointment(appointmentId) {
    try {
      const response = await axios.get(`${this.baseUrl}/appointments/${appointmentId}`, {
        headers: this.headers
      });
      return this._transformAppointment(response.data);
    } catch (error) {
      console.error('Open Dental API Error:', error.message);
      throw new Error(`Failed to fetch appointment: ${error.message}`);
    }
  }

  async getPatient(patientId) {
    try {
      const response = await axios.get(`${this.baseUrl}/patients/${patientId}`, {
        headers: this.headers
      });
      return response.data;
    } catch (error) {
      console.error('Open Dental API Error:', error.message);
      throw new Error(`Failed to fetch patient: ${error.message}`);
    }
  }

  // New method for searching patients
async searchPatients(searchTerm) {
  try {
    console.log(`Searching for patients with term: ${searchTerm}`);

    // Split search term into first name and last name
    const [LName, FName] = searchTerm.split(" "); // This assumes the search term is in "LastName FirstName" format

    const url = `${this.baseUrl}/patients`;

    const response = await axios.get(url, {
      headers: this.headers,
      params: {
        LName: LName,  // Last Name
        FName: FName,  // First Name

      },
    });

    if (!response.data || response.data.length === 0) {
      console.log('No patients found');
      return [];
    }

    console.log(`✅ Found ${response.data.length} patients`);
    return response.data;
  } catch (error) {
    console.error('❌ Error searching for patients:', error.response ? error.response.data : error.message);
    throw new Error(`Failed to search patients: ${error.message}`);
  }
}

  async updateAppointment(appointmentId, updateData) {
  try {
    console.log(`Updating appointment ${appointmentId} with exact data sent to API:`, JSON.stringify(updateData));

    // Make the PUT request to Open Dental API
    const response = await axios.put(
      `${this.baseUrl}/appointments/${appointmentId}`,
      updateData,
      { headers: this.headers }
    );

    console.log('Open Dental API update response:', JSON.stringify(response.data));

    // Transform and return the updated appointment data
    return this._transformAppointment(response.data);
  } catch (error) {
    this._handleError('update appointment', error);
    throw new Error(`Failed to update appointment: ${error.message}`);
  }
  }

  async getProceduresByAppointment(appointmentId) {
  try {
    console.log(`Fetching procedures for appointment ${appointmentId}`);

    // This URL should be adjusted to match your OpenDental API
    const response = await axios.get(`${this.baseUrl}/procedurelogs`, {
      headers: this.headers,
      params: { AptNum: appointmentId }
    });

    console.log(`Found ${response.data.length} procedures for appointment`);
    return response.data;
  } catch (error) {
    this._handleError('get procedures', error);
    throw new Error(`Failed to fetch procedures: ${error.message}`);
  }
  }

  async updateProcedureLog(procNum, procedureData) {
  try {
    console.log(`Updating procedure log ${procNum} with data:`, procedureData);

    const response = await axios.put(
      `${this.baseUrl}/procedurelogs/${procNum}`,
      procedureData,
      { headers: this.headers }
    );

    console.log('Open Dental API procedure update response:', response.data);
    return response.data;
  } catch (error) {
    this._handleError('update procedure', error);
    throw new Error(`Failed to update procedure: ${error.message}`);
  }
}


  _formatDate(date) {
    try {
      if (date instanceof Date) {
        return date.toISOString().split('T')[0];
      }

      if (typeof date === 'string') {
        const parsedDate = new Date(date);
        if (isNaN(parsedDate.getTime())) {
          throw new Error('Invalid date format');
        }
        return parsedDate.toISOString().split('T')[0];
      }

      throw new Error('Invalid date type');
    } catch (error) {
      console.error('Error formatting date:', error);
      throw error;
    }
  }

  _transformAppointments(apiAppointments) {
    if (!Array.isArray(apiAppointments)) {
      console.warn('API did not return an array of appointments');
      return [];
    }

    console.log(`Transforming ${apiAppointments.length} appointments`);
    return apiAppointments.map(apt => this._transformAppointment(apt));
  }

  _transformAppointment(apt) {
    try {
      return {
        id: apt.AptNum,
        patientId: apt.PatNum,
        patientName: apt.PatientName || `Patient #${apt.PatNum}`,
        providerId: apt.ProvNum,
        providerName: apt.provAbbr || `Provider #${apt.ProvNum}`,
        startTime: apt.AptDateTime,
        endTime: this._calculateEndTime(apt.AptDateTime, apt.Pattern),
        pattern: apt.Pattern,
        operatoryId: apt.Op,
        status: apt.AptStatus,
        notes: apt.Note || '',
        isHygiene: apt.IsHygiene === 'true',
        isNewPatient: apt.IsNewPatient === 'true',
        procedureDescription: apt.ProcDescript || '',
        Confirmed: apt.Confirmed,
      };
    } catch (error) {
      console.error('Error transforming appointment:', error, apt);
      return {
        id: apt.AptNum || 0,
        startTime: apt.AptDateTime || new Date().toISOString(),
        status: 'Unknown'
      };
    }
  }

  _calculateEndTime(startTime, pattern) {
    try {
      const start = new Date(startTime);
      if (isNaN(start.getTime())) {
        return new Date(Date.now() + 30 * 60000).toISOString();
      }

      const durationMinutes = pattern && typeof pattern === 'string'
        ? pattern.length * 5
        : 60;

      const end = new Date(start.getTime() + durationMinutes * 60000);
      return end.toISOString();
    } catch (error) {
      console.error('Error calculating end time:', error);
      return new Date(Date.now() + 30 * 60000).toISOString();
    }
  }

  _handleError(resource, error) {
    if (error.response) {
      console.error(`🔴 Open Dental API Response Error for ${resource}:`, {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      });
    } else if (error.request) {
      console.error(`🔴 Open Dental API No Response for ${resource}:`, error.request);
    } else {
      console.error(`🔴 Open Dental API Other Error for ${resource}:`, error.message);
    }
  }
}

module.exports = OpenDentalService;
