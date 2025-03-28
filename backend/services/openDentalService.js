const axios = require('axios');

class OpenDentalService {
  constructor(developerKey, customerKey) {
    this.baseUrl = 'https://api.opendental.com/api/v1';
    this.headers = {
      'Authorization': `ODFHIR ${developerKey}/${customerKey}`
    };
  }

  // Get appointments within a date range
  async getAppointments(startDate, endDate, providerId = null) {
    try {
      console.log(`Fetching appointments from ${startDate} to ${endDate}`);

      const params = new URLSearchParams();
      params.append('dateStart', this._formatDate(startDate));
      params.append('dateEnd', this._formatDate(endDate));

      if (providerId) {
        params.append('ProvNum', providerId);
      }

      console.log('Request params:', params.toString());

      const response = await axios.get(`${this.baseUrl}/appointments`, {
        headers: this.headers,
        params
      });

      console.log(`Received ${response.data.length} appointments from API`);
      return this._transformAppointments(response.data);
    } catch (error) {
      console.error('Open Dental API Error:', error.message);
      throw new Error(`Failed to fetch appointments: ${error.message}`);
    }
  }

  // Get a single appointment by ID
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

  // Get patient information
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

  // Helper methods
  _formatDate(date) {
    try {
      if (date instanceof Date) {
        // Format as YYYY-MM-DD
        return date.toISOString().split('T')[0];
      }

      // If it's a string, ensure it's in the correct format
      if (typeof date === 'string') {
        // Try to parse the date
        const parsedDate = new Date(date);
        if (isNaN(parsedDate.getTime())) {
          console.error('Invalid date string:', date);
          throw new Error('Invalid date format');
        }
        return parsedDate.toISOString().split('T')[0];
      }

      // If it's neither a Date nor a string, treat it as invalid
      console.error('Invalid date type:', typeof date);
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
      // Based on the Open Dental API documentation, map the fields correctly
      return {
        id: apt.AptNum,
        patientId: apt.PatNum,
        patientName: apt.PatientName || `Patient #${apt.PatNum}`,
        providerId: apt.ProvNum,
        providerName: apt.provAbbr || `Provider #${apt.ProvNum}`,
        startTime: apt.AptDateTime,
        endTime: this._calculateEndTime(apt.AptDateTime, apt.Pattern),
        operatoryId: apt.Op,
        status: apt.AptStatus,
        notes: apt.Note || '',
        isHygiene: apt.IsHygiene === 'true',
        isNewPatient: apt.IsNewPatient === 'true',
        procedureDescription: apt.ProcDescript || '',
        // Add other fields as needed
      };
    } catch (error) {
      console.error('Error transforming appointment:', error, apt);
      // Return a minimal object to avoid breaking the UI
      return {
        id: apt.AptNum || 0,
        startTime: apt.AptDateTime || new Date().toISOString(),
        status: 'Unknown'
      };
    }
  }

  _calculateEndTime(startTime, pattern) {
    try {
      // Make sure startTime is a valid date
      const start = new Date(startTime);
      if (isNaN(start.getTime())) {
        console.error('Invalid start time:', startTime);
        // Return a default end time 30 minutes later from now
        return new Date(Date.now() + 30 * 60000).toISOString();
      }

      // Calculate duration from pattern
      // Pattern is like "//XXXX//" where each character represents 5 minutes
      let durationMinutes = 30; // Default 30 mins

      if (pattern && typeof pattern === 'string') {
        // Count the 'X' characters in the pattern, each representing 5 minutes
        const xCount = (pattern.match(/X/g) || []).length;
        if (xCount > 0) {
          durationMinutes = xCount * 5;
        } else {
          // If no X characters, each character represents 5 minutes
          durationMinutes = pattern.length * 5;
        }
      }

      // Calculate end time
      const end = new Date(start.getTime() + durationMinutes * 60000);
      return end.toISOString();
    } catch (error) {
      console.error('Error calculating end time:', error);
      // Return a default end time 30 minutes from now
      return new Date(Date.now() + 30 * 60000).toISOString();
    }
  }
}

module.exports = OpenDentalService;
