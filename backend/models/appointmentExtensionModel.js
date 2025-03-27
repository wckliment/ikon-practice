const db = require('../config/db');

class AppointmentExtension {
  // Method to create a new appointment extension
  static async create(extension) {
    try {
      const [result] = await db.execute(
        `INSERT INTO appointment_extensions
         (open_dental_appointment_id, user_id, location_id,
          custom_tags, internal_notes, followup_required, followup_date)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          extension.openDentalAppointmentId,
          extension.userId,
          extension.locationId,
          extension.customTags ? JSON.stringify(extension.customTags) : null,
          extension.internalNotes,
          extension.followupRequired ? 1 : 0,
          extension.followupDate
        ]
      );

      return result.insertId;
    } catch (error) {
      console.error('Error creating appointment extension:', error);
      throw error;
    }
  }

  // Method to find an extension by appointment ID and location
  static async findByAppointmentAndLocation(appointmentId, locationId) {
    try {
      const [rows] = await db.execute(
        `SELECT * FROM appointment_extensions
         WHERE open_dental_appointment_id = ? AND location_id = ?`,
        [appointmentId, locationId]
      );

      if (rows.length === 0) {
        return null;
      }

      // Parse JSON string back to array
      if (rows[0].custom_tags) {
        rows[0].customTags = JSON.parse(rows[0].custom_tags);
      } else {
        rows[0].customTags = [];
      }

      // Convert MySQL boolean (0/1) to JavaScript boolean
      rows[0].followupRequired = rows[0].followup_required === 1;

      return rows[0];
    } catch (error) {
      console.error('Error finding appointment extension:', error);
      throw error;
    }
  }

  // Method to find extensions for multiple appointment IDs
  static async findByAppointmentsAndLocation(appointmentIds, locationId) {
    if (!appointmentIds.length) {
      return [];
    }

    try {
      // Create placeholders for the IN clause
      const placeholders = appointmentIds.map(() => '?').join(',');

      const [rows] = await db.execute(
        `SELECT * FROM appointment_extensions
         WHERE open_dental_appointment_id IN (${placeholders}) AND location_id = ?`,
        [...appointmentIds, locationId]
      );

      // Parse JSON strings and convert booleans
      return rows.map(row => {
        if (row.custom_tags) {
          row.customTags = JSON.parse(row.custom_tags);
        } else {
          row.customTags = [];
        }

        row.followupRequired = row.followup_required === 1;

        return row;
      });
    } catch (error) {
      console.error('Error finding appointment extensions:', error);
      throw error;
    }
  }

  // Method to update an extension
  static async update(appointmentId, locationId, updates) {
    try {
      const setClause = [];
      const values = [];

      if (updates.customTags !== undefined) {
        setClause.push('custom_tags = ?');
        values.push(JSON.stringify(updates.customTags));
      }

      if (updates.internalNotes !== undefined) {
        setClause.push('internal_notes = ?');
        values.push(updates.internalNotes);
      }

      if (updates.followupRequired !== undefined) {
        setClause.push('followup_required = ?');
        values.push(updates.followupRequired ? 1 : 0);
      }

      if (updates.followupDate !== undefined) {
        setClause.push('followup_date = ?');
        values.push(updates.followupDate);
      }

      if (setClause.length === 0) {
        return false; // Nothing to update
      }

      const [result] = await db.execute(
        `UPDATE appointment_extensions
         SET ${setClause.join(', ')}
         WHERE open_dental_appointment_id = ? AND location_id = ?`,
        [...values, appointmentId, locationId]
      );

      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating appointment extension:', error);
      throw error;
    }
  }
}

module.exports = AppointmentExtension;
