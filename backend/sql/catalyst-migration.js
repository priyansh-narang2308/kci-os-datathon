const catalyst = require("@zmc/catalyst");

const TABLES = [
  // ── Lookup Tables ──
  {
    name: "State",
    columns: [
      { column_name: "StateID", data_type: "INTEGER" },
      { column_name: "StateName", data_type: "VARCHAR(100)" },
      { column_name: "NationalityID", data_type: "INTEGER" },
      { column_name: "Active", data_type: "BIT" },
    ],
  },
  {
    name: "District",
    columns: [
      { column_name: "DistrictID", data_type: "INTEGER" },
      { column_name: "DistrictName", data_type: "VARCHAR(100)" },
      { column_name: "StateID", data_type: "INTEGER" },
      { column_name: "Active", data_type: "BIT" },
    ],
  },
  {
    name: "UnitType",
    columns: [
      { column_name: "UnitTypeID", data_type: "INTEGER" },
      { column_name: "UnitTypeName", data_type: "VARCHAR(100)" },
      { column_name: "CityDistState", data_type: "VARCHAR(50)" },
      { column_name: "Hierarchy", data_type: "INTEGER" },
      { column_name: "Active", data_type: "BIT" },
    ],
  },
  {
    name: "Unit",
    columns: [
      { column_name: "UnitID", data_type: "INTEGER" },
      { column_name: "UnitName", data_type: "VARCHAR(200)" },
      { column_name: "TypeID", data_type: "INTEGER" },
      { column_name: "ParentUnit", data_type: "INTEGER" },
      { column_name: "StateID", data_type: "INTEGER" },
      { column_name: "DistrictID", data_type: "INTEGER" },
      { column_name: "Active", data_type: "BIT" },
    ],
  },
  {
    name: "Rank",
    columns: [
      { column_name: "RankID", data_type: "INTEGER" },
      { column_name: "RankName", data_type: "VARCHAR(100)" },
      { column_name: "Hierarchy", data_type: "INTEGER" },
      { column_name: "Active", data_type: "BIT" },
    ],
  },
  {
    name: "Designation",
    columns: [
      { column_name: "DesignationID", data_type: "INTEGER" },
      { column_name: "DesignationName", data_type: "VARCHAR(100)" },
      { column_name: "Active", data_type: "BIT" },
      { column_name: "SortOrder", data_type: "INTEGER" },
    ],
  },
  {
    name: "Employee",
    columns: [
      { column_name: "EmployeeID", data_type: "INTEGER" },
      { column_name: "DistrictID", data_type: "INTEGER" },
      { column_name: "UnitID", data_type: "INTEGER" },
      { column_name: "RankID", data_type: "INTEGER" },
      { column_name: "DesignationID", data_type: "INTEGER" },
      { column_name: "KGID", data_type: "VARCHAR(50)" },
      { column_name: "FirstName", data_type: "VARCHAR(100)" },
      { column_name: "EmployeeDOB", data_type: "DATE" },
      { column_name: "GenderID", data_type: "INTEGER" },
      { column_name: "BloodGroupID", data_type: "INTEGER" },
      { column_name: "PhysicallyChallenged", data_type: "BIT" },
      { column_name: "AppointmentDate", data_type: "DATE" },
    ],
  },
  {
    name: "CaseCategory",
    columns: [
      { column_name: "CaseCategoryID", data_type: "INTEGER" },
      { column_name: "LookupValue", data_type: "VARCHAR(50)" },
    ],
  },
  {
    name: "GravityOffence",
    columns: [
      { column_name: "GravityOffenceID", data_type: "INTEGER" },
      { column_name: "LookupValue", data_type: "VARCHAR(50)" },
    ],
  },
  {
    name: "CrimeHead",
    columns: [
      { column_name: "CrimeHeadID", data_type: "INTEGER" },
      { column_name: "CrimeGroupName", data_type: "VARCHAR(200)" },
      { column_name: "Active", data_type: "BIT" },
    ],
  },
  {
    name: "CrimeSubHead",
    columns: [
      { column_name: "CrimeSubHeadID", data_type: "INTEGER" },
      { column_name: "CrimeHeadID", data_type: "INTEGER" },
      { column_name: "CrimeHeadName", data_type: "VARCHAR(200)" },
      { column_name: "SeqID", data_type: "INTEGER" },
    ],
  },
  {
    name: "Act",
    columns: [
      { column_name: "ActCode", data_type: "VARCHAR(20)" },
      { column_name: "ActDescription", data_type: "VARCHAR(500)" },
      { column_name: "ShortName", data_type: "VARCHAR(100)" },
      { column_name: "Active", data_type: "BIT" },
    ],
  },
  {
    name: "Section",
    columns: [
      { column_name: "ActCode", data_type: "VARCHAR(20)" },
      { column_name: "SectionCode", data_type: "VARCHAR(20)" },
      { column_name: "SectionDescription", data_type: "VARCHAR(500)" },
      { column_name: "Active", data_type: "BIT" },
    ],
  },
  {
    name: "CrimeHeadActSection",
    columns: [
      { column_name: "CrimeHeadID", data_type: "INTEGER" },
      { column_name: "ActCode", data_type: "VARCHAR(20)" },
      { column_name: "SectionCode", data_type: "VARCHAR(20)" },
    ],
  },
  {
    name: "CaseStatusMaster",
    columns: [
      { column_name: "CaseStatusID", data_type: "INTEGER" },
      { column_name: "CaseStatusName", data_type: "VARCHAR(100)" },
    ],
  },
  {
    name: "Court",
    columns: [
      { column_name: "CourtID", data_type: "INTEGER" },
      { column_name: "CourtName", data_type: "VARCHAR(200)" },
      { column_name: "DistrictID", data_type: "INTEGER" },
      { column_name: "StateID", data_type: "INTEGER" },
      { column_name: "Active", data_type: "BIT" },
    ],
  },
  {
    name: "CasteMaster",
    columns: [
      { column_name: "caste_master_id", data_type: "INTEGER" },
      { column_name: "caste_master_name", data_type: "VARCHAR(100)" },
    ],
  },
  {
    name: "ReligionMaster",
    columns: [
      { column_name: "ReligionID", data_type: "INTEGER" },
      { column_name: "ReligionName", data_type: "VARCHAR(100)" },
    ],
  },
  {
    name: "OccupationMaster",
    columns: [
      { column_name: "OccupationID", data_type: "INTEGER" },
      { column_name: "OccupationName", data_type: "VARCHAR(100)" },
    ],
  },
  // ── Main Data Tables ──
  {
    name: "CaseMaster",
    columns: [
      { column_name: "CaseMasterID", data_type: "INTEGER" },
      { column_name: "CrimeNo", data_type: "VARCHAR(50)" },
      { column_name: "CaseNo", data_type: "VARCHAR(50)" },
      { column_name: "CrimeRegisteredDate", data_type: "DATE" },
      { column_name: "PolicePersonID", data_type: "INTEGER" },
      { column_name: "PoliceStationID", data_type: "INTEGER" },
      { column_name: "CaseCategoryID", data_type: "INTEGER" },
      { column_name: "GravityOffenceID", data_type: "INTEGER" },
      { column_name: "CrimeMajorHeadID", data_type: "INTEGER" },
      { column_name: "CrimeMinorHeadID", data_type: "INTEGER" },
      { column_name: "CaseStatusID", data_type: "INTEGER" },
      { column_name: "CourtID", data_type: "INTEGER" },
      { column_name: "IncidentFromDate", data_type: "TIMESTAMP" },
      { column_name: "IncidentToDate", data_type: "TIMESTAMP" },
      { column_name: "InfoReceivedPSDate", data_type: "TIMESTAMP" },
      { column_name: "latitude", data_type: "DECIMAL(10,7)" },
      { column_name: "longitude", data_type: "DECIMAL(10,7)" },
      { column_name: "BriefFacts", data_type: "TEXT" },
    ],
  },
  {
    name: "ComplainantDetails",
    columns: [
      { column_name: "ComplainantID", data_type: "INTEGER" },
      { column_name: "CaseMasterID", data_type: "INTEGER" },
      { column_name: "ComplainantName", data_type: "VARCHAR(200)" },
      { column_name: "AgeYear", data_type: "INTEGER" },
      { column_name: "OccupationID", data_type: "INTEGER" },
      { column_name: "ReligionID", data_type: "INTEGER" },
      { column_name: "CasteID", data_type: "INTEGER" },
      { column_name: "GenderID", data_type: "INTEGER" },
    ],
  },
  {
    name: "Victim",
    columns: [
      { column_name: "VictimMasterID", data_type: "INTEGER" },
      { column_name: "CaseMasterID", data_type: "INTEGER" },
      { column_name: "VictimName", data_type: "VARCHAR(200)" },
      { column_name: "AgeYear", data_type: "INTEGER" },
      { column_name: "GenderID", data_type: "INTEGER" },
      { column_name: "VictimPolice", data_type: "VARCHAR(10)" },
    ],
  },
  {
    name: "Accused",
    columns: [
      { column_name: "AccusedMasterID", data_type: "INTEGER" },
      { column_name: "CaseMasterID", data_type: "INTEGER" },
      { column_name: "AccusedName", data_type: "VARCHAR(200)" },
      { column_name: "AgeYear", data_type: "INTEGER" },
      { column_name: "GenderID", data_type: "INTEGER" },
      { column_name: "PersonID", data_type: "VARCHAR(10)" },
    ],
  },
  {
    name: "ActSectionAssociation",
    columns: [
      { column_name: "AssocID", data_type: "INTEGER" },
      { column_name: "CaseMasterID", data_type: "INTEGER" },
      { column_name: "ActID", data_type: "VARCHAR(20)" },
      { column_name: "SectionID", data_type: "VARCHAR(20)" },
      { column_name: "ActOrderID", data_type: "INTEGER" },
      { column_name: "SectionOrderID", data_type: "INTEGER" },
    ],
  },
  {
    name: "ArrestSurrender",
    columns: [
      { column_name: "ArrestSurrenderID", data_type: "INTEGER" },
      { column_name: "CaseMasterID", data_type: "INTEGER" },
      { column_name: "ArrestSurrenderTypeID", data_type: "INTEGER" },
      { column_name: "ArrestSurrenderDate", data_type: "DATE" },
      { column_name: "ArrestSurrenderStateId", data_type: "INTEGER" },
      { column_name: "ArrestSurrenderDistrictId", data_type: "INTEGER" },
      { column_name: "PoliceStationID", data_type: "INTEGER" },
      { column_name: "IOID", data_type: "INTEGER" },
      { column_name: "CourtID", data_type: "INTEGER" },
      { column_name: "AccusedMasterID", data_type: "INTEGER" },
      { column_name: "IsAccused", data_type: "BIT" },
      { column_name: "IsComplainantAccused", data_type: "BIT" },
    ],
  },
  {
    name: "ChargesheetDetails",
    columns: [
      { column_name: "CSID", data_type: "INTEGER" },
      { column_name: "CaseMasterID", data_type: "INTEGER" },
      { column_name: "csdate", data_type: "TIMESTAMP" },
      { column_name: "cstype", data_type: "CHAR(1)" },
      { column_name: "PolicePersonID", data_type: "INTEGER" },
    ],
  },
];

async function migrate() {
  try {
    const catalystApp = catalyst.initialize({});
    const datastore = catalystApp.datastore();

    for (const table of TABLES) {
      try {
        await datastore.createTable(table.name, table.columns, true);
        console.log(`[✓] Created table: ${table.name} (${table.columns.length} columns)`);
      } catch (err) {
        if (err.message && err.message.includes("already exists")) {
          console.log(`[~] Table already exists: ${table.name}`);
        } else {
          console.log(`[✗] Failed to create ${table.name}: ${err.message}`);
        }
      }
    }
    console.log(`\nMigration complete. ${TABLES.length} tables processed.`);
  } catch (err) {
    console.error("Migration failed:", err.message);
  }
}

if (require.main === module) {
  migrate().then(() => process.exit(0));
}

module.exports = { TABLES, migrate };