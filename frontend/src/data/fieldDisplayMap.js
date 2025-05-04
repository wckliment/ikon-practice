const fieldDisplayMap = {
  "dateTime.Today": "Date",
  "patient.nameFL": "Patient Name",
  "toothNum": "Tooth Number(s)",       // ✅ correct FieldName from DB
  "Signature": "Signature Label",
  "": "Signature"                      // ✅ maps the blank FieldName used for SigBox
};

export default fieldDisplayMap;
