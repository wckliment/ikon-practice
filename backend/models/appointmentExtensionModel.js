const db = require('../config/db');

class AppointmentExtension {
  // Create a new appointment extension
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
      console.error('❌ Error creating appointment extension:', error);
      throw error;
    }
  }

  // Find a single extension by appointment ID and location
  static async findByAppointmentAndLocation(appointmentId, locationId) {
    try {
      const [rows] = await db.execute(
        `SELECT * FROM appointment_extensions
         WHERE open_dental_appointment_id = ? AND location_id = ?`,
        [appointmentId, locationId]
      );

      if (rows.length === 0) return null;

      const row = rows[0];
      return {
        ...row,
        customTags: row.custom_tags ? JSON.parse(row.custom_tags) : [],
        followupRequired: row.followup_required === 1,
      };
    } catch (error) {
      console.error('❌ Error finding appointment extension:', error);
      throw error;
    }
  }

  // ✅ Find multiple extensions by appointment IDs and location
  static async findByAppointmentsAndLocation(appointmentIds, locationId) {
    if (!appointmentIds.length) return [];

    if (!locationId) {
      console.warn('⚠️ Missing locationId in findByAppointmentsAndLocation');
      return [];
    }

    console.log('🔍 Looking up appointment extensions with:');
    console.log('appointmentIds:', appointmentIds);
    console.log('locationId:', locationId);

    try {
      const placeholders = appointmentIds.map(() => '?').join(',');

      const sql = `
        SELECT * FROM appointment_extensions
        WHERE open_dental_appointment_id IN (${placeholders}) AND location_id = ?
      `;

      const values = [...appointmentIds, locationId];
      const [rows] = await db.query(sql, values); // ✅ CORRECTED THIS LINE

      return rows.map(row => {
        return {
          ...row,
          customTags: row.custom_tags ? JSON.parse(row.custom_tags) : [],
          followupRequired: row.followup_required === 1,
        };
      });
    } catch (error) {
      console.error('❌ Error finding appointment extensions:', error);
      throw error;
    }
  }

  // Update an appointment extension
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

      if (!setClause.length) return false;

      const [result] = await db.execute(
        `UPDATE appointment_extensions
         SET ${setClause.join(', ')}
         WHERE open_dental_appointment_id = ? AND location_id = ?`,
        [...values, appointmentId, locationId]
      );

      return result.affectedRows > 0;
    } catch (error) {
      console.error('❌ Error updating appointment extension:', error);
      throw error;
    }
  }
}

module.exports = AppointmentExtension;
