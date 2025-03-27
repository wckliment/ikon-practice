const AppointmentExtension = require('../models/appointmentExtensionModel');

// Get appointments for current user's location
const getAppointments = async (req, res) => {
  try {
    // Ensure Open Dental service is attached
    if (!req.openDentalService) {
      return res.status(400).json({
        success: false,
        error: 'No Open Dental configuration found for this location'
      });
    }

    // Parse date range parameters
    const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date();
    const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();

    // Default to showing 1 month if no end date specified
    if (!req.query.endDate) {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    // Optional provider filter
    const providerId = req.query.providerId || null;

    // Fetch appointments from Open Dental
    const appointments = await req.openDentalService.getAppointments(
      startDate,
      endDate,
      providerId
    );

    // If no appointments found, return empty array
    if (!appointments.length) {
      return res.json({
        success: true,
        count: 0,
        data: []
      });
    }

    // Extract appointment IDs for fetching extensions
    const appointmentIds = appointments.map(apt => apt.id);

    // Fetch any extensions for these appointments
    const extensions = await AppointmentExtension.findByAppointmentsAndLocation(
      appointmentIds,
      req.user.locationId
    );

    // Create lookup map for quick access
    const extensionMap = {};
    extensions.forEach(ext => {
      extensionMap[ext.open_dental_appointment_id] = ext;
    });

    // Combine appointments with extensions
    const enhancedAppointments = appointments.map(apt => {
      const extension = extensionMap[apt.id];
      if (extension) {
        return {
          ...apt,
          customTags: extension.customTags,
          internalNotes: extension.internal_notes,
          followupRequired: extension.followupRequired,
          followupDate: extension.followup_date,
          // Add other extension fields as needed
        };
      }
      return apt;
    });

    // Return enhanced appointments to client
    res.json({
      success: true,
      count: enhancedAppointments.length,
      data: enhancedAppointments
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch appointments'
    });
  }
};

// Get a single appointment by ID
const getAppointment = async (req, res) => {
  try {
    if (!req.openDentalService) {
      return res.status(400).json({
        success: false,
        error: 'No Open Dental configuration found for this location'
      });
    }

    const appointmentId = req.params.id;

    // Fetch appointment from Open Dental
    const appointment = await req.openDentalService.getAppointment(appointmentId);

    // Fetch any extension for this appointment
    const extension = await AppointmentExtension.findByAppointmentAndLocation(
      appointmentId,
      req.user.locationId
    );

    // Combine appointment with extension if exists
    let enhancedAppointment = appointment;
    if (extension) {
      enhancedAppointment = {
        ...appointment,
        customTags: extension.customTags,
        internalNotes: extension.internal_notes,
        followupRequired: extension.followupRequired,
        followupDate: extension.followup_date,
        // Add other extension fields as needed
      };
    }

    res.json({
      success: true,
      data: enhancedAppointment
    });
  } catch (error) {
    console.error('Error fetching appointment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch appointment'
    });
  }
};

// Add or update appointment extension
const updateAppointmentExtension = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { customTags, internalNotes, followupRequired, followupDate } = req.body;

    // Find existing extension
    const extension = await AppointmentExtension.findByAppointmentAndLocation(
      appointmentId,
      req.user.locationId
    );

    let result;
    if (extension) {
      // Update existing extension
      result = await AppointmentExtension.update(
        appointmentId,
        req.user.locationId,
        {
          customTags,
          internalNotes,
          followupRequired,
          followupDate
        }
      );
    } else {
      // Create new extension
      result = await AppointmentExtension.create({
        openDentalAppointmentId: appointmentId,
        userId: req.user.id,
        locationId: req.user.locationId,
        customTags,
        internalNotes,
        followupRequired,
        followupDate
      });
    }

    // Fetch the updated/created extension
    const updatedExtension = await AppointmentExtension.findByAppointmentAndLocation(
      appointmentId,
      req.user.locationId
    );

    res.json({
      success: true,
      data: updatedExtension
    });
  } catch (error) {
    console.error('Error updating appointment extension:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update appointment extension'
    });
  }
};

module.exports = {
  getAppointments,
  getAppointment,
  updateAppointmentExtension
};
