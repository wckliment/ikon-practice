const db = require('../config/db');



exports.createFormTemplate = async (req, res) => {
  const { name, description, created_by, fields } = req.body;

  if (!name || !Array.isArray(fields)) {
    return res.status(400).json({ error: "Form name and fields are required." });
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Insert into custom_forms
    const [formResult] = await connection.query(
      `INSERT INTO custom_forms (name, description, created_by) VALUES (?, ?, ?)`,
      [name, description || null, created_by || null]
    );

    const formId = formResult.insertId;

    // 2. Insert each field into custom_form_fields
    const fieldPromises = fields.map(field => {
      const { label, field_type, is_required, field_order, options, section_title } = field;


      return connection.query(
        `INSERT INTO custom_form_fields
         (form_id, label, field_type, is_required, field_order, options, section_title)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          formId,
          label,
          field_type,
          is_required ? 1 : 0,
          field_order || 0,
          options ? JSON.stringify(options) : null,
          section_title || null
        ]
      );
    });

    await Promise.all(fieldPromises);

    await connection.commit();
    res.status(201).json({ success: true, form_id: formId });
  } catch (err) {
    await connection.rollback();
    console.error("Error creating form template:", err);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    connection.release();
  }
};

exports.getAllFormTemplates = async (req, res) => {
  try {
    const [results] = await db.query(`SELECT id, name, description, created_at FROM custom_forms ORDER BY created_at DESC`);
    res.json(results);
  } catch (err) {
    console.error("Error fetching form templates:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getFormTemplateById = async (req, res) => {
  const formId = req.params.id;

  try {
    const [[form]] = await db.query(`SELECT * FROM custom_forms WHERE id = ?`, [formId]);
    if (!form) return res.status(404).json({ error: "Form not found" });

    const [fields] = await db.query(
      `SELECT id, label, field_type, is_required, field_order, options, section_title
       FROM custom_form_fields
       WHERE form_id = ?
       ORDER BY field_order ASC`,
      [formId]
    );

    // Parse options JSON if exists
    const parsedFields = fields.map(f => ({
      ...f,
      options: f.options ? JSON.parse(f.options) : null
    }));

    res.json({ form, fields: parsedFields });
  } catch (err) {
    console.error("Error fetching form by ID:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
