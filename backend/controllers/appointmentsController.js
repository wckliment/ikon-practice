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

// Create a new appointment
const createAppointment = async (req, res) => {
  try {
    const appointmentData = req.body;
    console.log('Creating appointment with data:', appointmentData);

    // Basic validation
    if (!appointmentData.PatNum || !appointmentData.ProvNum || !appointmentData.AptDateTime) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: PatNum, ProvNum, and AptDateTime are required'
      });
    }

    // Ensure valid status
    const validStatuses = ["Scheduled", "Complete", "UnschedList", "ASAP", "Broken", "Planned", "PtNote", "PtNoteCompleted"];
    if (!appointmentData.AptStatus || !validStatuses.includes(appointmentData.AptStatus)) {
      appointmentData.AptStatus = "Scheduled";
    }

    // ✅ Use service, which now handles both appointment + procedure creation
    const createdAppointment = await req.openDentalService.createAppointment(appointmentData);

    res.status(201).json({
      success: true,
      data: createdAppointment
    });

  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create appointment'
    });
  }
};

// Get a single appointment by ID
const getAppointment = async (req, res) => {
  try {
    const appointmentId = req.params.id;

    // Fetch appointment from Open Dental
    const appointment = await req.openDentalService.getAppointment(appointmentId);

     // 🔥 Fetch procedures linked to this specific appointment
    const procedures = await req.openDentalService.getProceduresByAppointment(appointmentId);

    // Fetch any extension for this appointment
    const extension = await AppointmentExtension.findByAppointmentAndLocation(
      appointmentId,
      req.user.location_id
    );

     // Combine everything together
    const enhancedAppointment = {
      ...appointment,
      procedureLogs:procedures, // 👈 now you'll get procedure data in the response
      ...(extension && {
        customTags: extension.customTags,
        internalNotes: extension.internal_notes,
        followupRequired: extension.followupRequired,
        followupDate: extension.followup_date,
      }),
    };

    res.json({
      success: true,
      data: enhancedAppointment
    });
  } catch (error) {
    console.error('Error fetching appointment:', error.message, error.stack);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch appointment'
    });
  }
};


// Update an appointment
const updateAppointment = async (req, res) => {
  try {
    // Add these debugging logs
    console.log("Request params:", req.params);
    const appointmentId = req.params.id;
    console.log("Extracted appointmentId:", appointmentId);

    const updateData = req.body;
    console.log(`Updating appointment ${appointmentId} with data:`, updateData);

    // Validate required appointment ID
    if (!appointmentId) {
      return res.status(400).json({
        success: false,
        error: 'Appointment ID is required'
      });
    }

    // Call Open Dental API to update the appointment
    const updatedAppointment = await req.openDentalService.updateAppointment(appointmentId, updateData);

    // Return the updated appointment
    res.json({
      success: true,
      data: updatedAppointment
    });
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update appointment: ' + (error.message || 'Unknown error')
    });
  }
};

const getAppointmentProcedures = async (req, res) => {
  try {
    // This is incorrectly accessing req.params.id as if it were an object
    // const { appointmentId } = req.params.id;  <-- This is wrong

    // This is the correct way to access it
    const appointmentId = req.params.id;

    if (!appointmentId) {
      return res.status(400).json({
        success: false,
        error: 'Appointment ID is required'
      });
    }

    const procedures = await req.openDentalService.getProceduresByAppointment(appointmentId);

    res.json({
      success: true,
      data: procedures
    });
  } catch (error) {
    console.error('Error fetching procedures:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch procedures: ' + error.message
    });
  }
};

const updateProcedure = async (req, res) => {
  try {
    const { procNum } = req.params;
    const updateData = req.body;

    console.log(`Updating procedure ${procNum} with data:`, updateData);

    if (!procNum) {
      return res.status(400).json({
        success: false,
        error: 'Procedure number (ProcNum) is required'
      });
    }

    // 🧠 If description is provided but no ProcCode, try to map it
    if (updateData.Descript && !updateData.ProcCode) {
      console.log(`Attempting to map procedure description: "${updateData.Descript}"`);

      const match = await req.openDentalService.mapProcedureDescriptionToCode(updateData.Descript);

      if (match) {
        console.log(`✅ Matched description to code: ${match.ProcCode} (${match.Descript})`);
        updateData.ProcCode = match.ProcCode;
        updateData.ProcCat = match.ProcCat; // Optional, helps Open Dental categorize
      } else {
        console.warn(`❌ No match found for description: "${updateData.Descript}"`);
        return res.status(400).json({
          success: false,
          error: `No matching procedure code found for description: "${updateData.Descript}"`
        });
      }
    }

    // 🚀 Update procedure with Open Dental
    const updatedProcedure = await req.openDentalService.updateProcedureLog(procNum, updateData);

    res.json({
      success: true,
      data: updatedProcedure
    });
  } catch (error) {
    console.error('Error updating procedure:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update procedure: ' + error.message
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
  updateAppointmentExtension,
  createAppointment,
  updateAppointment,
  getAppointmentProcedures,
  updateProcedure
};
