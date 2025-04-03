
/**
 * A static map of human-readable frontend labels to actual Open Dental CDT ProcCodes
 */
const procedureCodeMap = {
  "Exam": {
    ProcCode: "T1356",
    Descript: "Exam",
  },
  "Prophy-Adult": {
    ProcCode: "T3541",
    Descript: "Prophy, Adult",
  },
  "Flo-Adult": {
    ProcCode: "T1254",
    Descript: "Fluoride",
  },
  "Fluoride": {
    ProcCode: "T1254",
    Descript: "Fluoride",
  },
  "PA": {
    ProcCode: "T1546",
    Descript: "Intraoral Periapical Film",
  },
  "2 BWX": {
    ProcCode: "T1632",
    Descript: "2 Bitewings",
  },
  "4 BWX": {
    ProcCode: "T1698",
    Descript: "4 Bitewings",
  },
  "Pano": {
    ProcCode: "T1665",
    Descript: "Panoramic",
  },
  "Office Visit": {
    ProcCode: "N4133",
    Descript: "Office Visit",
  },
};

/**
 * Special handling for compound codes like Ex.Pro.Flo
 */
const compoundProcedureMap = {
  "Ex.Pro.Flo": [
    {
      ProcCode: "T1356",
      Descript: "Exam"
    },
    {
      ProcCode: "T3541",
      Descript: "Prophy, Adult"
    },
    {
      ProcCode: "T1254",
      Descript: "Fluoride"
    }
  ]
};

/**
 * Looks up a single or multiple procedure code(s) based on frontend label
 * @param {string} label
 * @returns {Object|Object[]|null}
 */
function findProcedureCode(label) {
  if (!label) return null;

  if (compoundProcedureMap[label]) {
    return compoundProcedureMap[label];
  }

  return procedureCodeMap[label] || null;
}

module.exports = {
  findProcedureCode,
};
