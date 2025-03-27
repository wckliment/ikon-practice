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
      const params = new URLSearchParams();
      params.append('startDate', this._formatDate(startDate));
      params.append('endDate', this._formatDate(endDate));
      if (providerId) params.append('providerId', providerId);

      const response = await axios.get(`${this.baseUrl}/appointments`, {
        headers: this.headers,
        params
      });

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
    if (date instanceof Date) {
      return date.toISOString().split('T')[0];
    }
    return date;
  }

  _transformAppointments(apiAppointments) {
    if (!Array.isArray(apiAppointments)) {
      return [];
    }

    return apiAppointments.map(apt => this._transformAppointment(apt));
  }

  _transformAppointment(apt) {
    return {
      id: apt.AppointmentNum,
      patientId: apt.PatNum,
      patientName: apt.PatientName,
      providerId: apt.ProvNum,
      providerName: apt.ProvName,
      startTime: apt.AptDateTime,
      endTime: this._calculateEndTime(apt.AptDateTime, apt.Pattern),
      operatoryId: apt.Op,
      status: apt.AptStatus,
      notes: apt.Note,
      // Add other fields as needed
    };
  }

  _calculateEndTime(startTime, pattern) {
    // Logic to calculate end time based on appointment pattern
    const start = new Date(startTime);
    const durationMinutes = pattern ? parseInt(pattern, 10) : 30; // Default 30 mins
    const end = new Date(start.getTime() + durationMinutes * 60000);
    return end.toISOString();
  }
}

module.exports = OpenDentalService;
