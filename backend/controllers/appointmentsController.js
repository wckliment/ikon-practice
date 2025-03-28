const AppointmentExtension = require('../models/appointmentExtensionModel');

// Get appointments for current user's location
const getAppointments = async (req, res) => {
  try {
    // OpenDentalService should be attached by middleware
    const { startDate, endDate, providerId } = req.query;

    // Parse date parameters
    const start = startDate ? new Date(startDate) : new Date();
    const end = endDate ? new Date(endDate) : new Date(start);
    if (!endDate) {
      end.setMonth(end.getMonth() + 1); // Default to 1 month range
    }

    // Fetch appointments from Open Dental
    const appointments = await req.openDentalService.getAppointments(
      start,
      end,
      providerId || null
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
      req.user.location_id
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
    const appointmentId = req.params.id;

    // Fetch appointment from Open Dental
    const appointment = await req.openDentalService.getAppointment(appointmentId);

    // Fetch any extension for this appointment
    const extension = await AppointmentExtension.findByAppointmentAndLocation(
      appointmentId,
      req.user.location_id
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
      req.user.location_id
    );

    let result;
    if (extension) {
      // Update existing extension
      result = await AppointmentExtension.update(
        appointmentId,
        req.user.location_id,
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
        userId: req.user.userId,
        locationId: req.user.location_id,
        customTags,
        internalNotes,
        followupRequired,
        followupDate
      });
    }

    // Fetch the updated/created extension
    const updatedExtension = await AppointmentExtension.findByAppointmentAndLocation(
      appointmentId,
      req.user.location_id
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
