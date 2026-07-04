-- ============================================================
-- KCI-OS Database Schema
-- Full ER Diagram — Karnataka Police Department
-- DDL for Catalyst Data Store / PostgreSQL
-- ============================================================

-- ── 1. LOOKUP TABLES ──

CREATE TABLE State (
    StateID INT PRIMARY KEY,
    StateName VARCHAR(100) NOT NULL,
    NationalityID INT DEFAULT 1,
    Active BIT DEFAULT 1
);

CREATE TABLE District (
    DistrictID INT PRIMARY KEY,
    DistrictName VARCHAR(100) NOT NULL,
    StateID INT NOT NULL REFERENCES State(StateID),
    Active BIT DEFAULT 1
);

CREATE TABLE UnitType (
    UnitTypeID INT PRIMARY KEY,
    UnitTypeName VARCHAR(100) NOT NULL,
    CityDistState VARCHAR(50),
    Hierarchy INT,
    Active BIT DEFAULT 1
);

CREATE TABLE Unit (
    UnitID INT PRIMARY KEY,
    UnitName VARCHAR(200) NOT NULL,
    TypeID INT REFERENCES UnitType(UnitTypeID),
    ParentUnit INT,
    NationalityID INT DEFAULT 1,
    StateID INT REFERENCES State(StateID),
    DistrictID INT REFERENCES District(DistrictID),
    Active BIT DEFAULT 1
);

CREATE TABLE Rank (
    RankID INT PRIMARY KEY,
    RankName VARCHAR(100) NOT NULL,
    Hierarchy INT,
    Active BIT DEFAULT 1
);

CREATE TABLE Designation (
    DesignationID INT PRIMARY KEY,
    DesignationName VARCHAR(100) NOT NULL,
    Active BIT DEFAULT 1,
    SortOrder INT DEFAULT 0
);

CREATE TABLE Employee (
    EmployeeID INT PRIMARY KEY,
    DistrictID INT REFERENCES District(DistrictID),
    UnitID INT REFERENCES Unit(UnitID),
    RankID INT REFERENCES Rank(RankID),
    DesignationID INT REFERENCES Designation(DesignationID),
    KGID VARCHAR(50),
    FirstName VARCHAR(100) NOT NULL,
    EmployeeDOB DATE,
    GenderID INT,
    BloodGroupID INT,
    PhysicallyChallenged BIT DEFAULT 0,
    AppointmentDate DATE
);

CREATE TABLE CaseCategory (
    CaseCategoryID INT PRIMARY KEY,
    LookupValue VARCHAR(50) NOT NULL
);

CREATE TABLE GravityOffence (
    GravityOffenceID INT PRIMARY KEY,
    LookupValue VARCHAR(50) NOT NULL
);

CREATE TABLE CrimeHead (
    CrimeHeadID INT PRIMARY KEY,
    CrimeGroupName VARCHAR(200) NOT NULL,
    Active BIT DEFAULT 1
);

CREATE TABLE CrimeSubHead (
    CrimeSubHeadID INT PRIMARY KEY,
    CrimeHeadID INT NOT NULL REFERENCES CrimeHead(CrimeHeadID),
    CrimeHeadName VARCHAR(200) NOT NULL,
    SeqID INT DEFAULT 0
);

CREATE TABLE Act (
    ActCode VARCHAR(20) PRIMARY KEY,
    ActDescription VARCHAR(500) NOT NULL,
    ShortName VARCHAR(100),
    Active BIT DEFAULT 1
);

CREATE TABLE Section (
    ActCode VARCHAR(20) NOT NULL REFERENCES Act(ActCode),
    SectionCode VARCHAR(20) NOT NULL,
    SectionDescription VARCHAR(500),
    Active BIT DEFAULT 1,
    PRIMARY KEY (ActCode, SectionCode)
);

CREATE TABLE CrimeHeadActSection (
    CrimeHeadID INT NOT NULL REFERENCES CrimeHead(CrimeHeadID),
    ActCode VARCHAR(20) NOT NULL REFERENCES Act(ActCode),
    SectionCode VARCHAR(20) NOT NULL,
    PRIMARY KEY (CrimeHeadID, ActCode, SectionCode)
);

CREATE TABLE CaseStatusMaster (
    CaseStatusID INT PRIMARY KEY,
    CaseStatusName VARCHAR(100) NOT NULL
);

CREATE TABLE Court (
    CourtID INT PRIMARY KEY,
    CourtName VARCHAR(200) NOT NULL,
    DistrictID INT REFERENCES District(DistrictID),
    StateID INT REFERENCES State(StateID),
    Active BIT DEFAULT 1
);

CREATE TABLE CasteMaster (
    caste_master_id INT PRIMARY KEY,
    caste_master_name VARCHAR(100) NOT NULL
);

CREATE TABLE ReligionMaster (
    ReligionID INT PRIMARY KEY,
    ReligionName VARCHAR(100) NOT NULL
);

CREATE TABLE OccupationMaster (
    OccupationID INT PRIMARY KEY,
    OccupationName VARCHAR(100) NOT NULL
);

-- ── 2. MAIN DATA TABLES ──

CREATE TABLE CaseMaster (
    CaseMasterID INT PRIMARY KEY,
    CrimeNo VARCHAR(50) NOT NULL,
    CaseNo VARCHAR(50),
    CrimeRegisteredDate DATE NOT NULL,
    PolicePersonID INT REFERENCES Employee(EmployeeID),
    PoliceStationID INT REFERENCES Unit(UnitID),
    CaseCategoryID INT REFERENCES CaseCategory(CaseCategoryID),
    GravityOffenceID INT REFERENCES GravityOffence(GravityOffenceID),
    CrimeMajorHeadID INT REFERENCES CrimeHead(CrimeHeadID),
    CrimeMinorHeadID INT REFERENCES CrimeSubHead(CrimeSubHeadID),
    CaseStatusID INT REFERENCES CaseStatusMaster(CaseStatusID),
    CourtID INT REFERENCES Court(CourtID),
    IncidentFromDate TIMESTAMP,
    IncidentToDate TIMESTAMP,
    InfoReceivedPSDate TIMESTAMP,
    latitude DECIMAL(10,7),
    longitude DECIMAL(10,7),
    BriefFacts TEXT
);

CREATE TABLE ComplainantDetails (
    ComplainantID INT PRIMARY KEY,
    CaseMasterID INT NOT NULL REFERENCES CaseMaster(CaseMasterID),
    ComplainantName VARCHAR(200) NOT NULL,
    AgeYear INT,
    OccupationID INT REFERENCES OccupationMaster(OccupationID),
    ReligionID INT REFERENCES ReligionMaster(ReligionID),
    CasteID INT REFERENCES CasteMaster(caste_master_id),
    GenderID INT
);

CREATE TABLE Victim (
    VictimMasterID INT PRIMARY KEY,
    CaseMasterID INT NOT NULL REFERENCES CaseMaster(CaseMasterID),
    VictimName VARCHAR(200) NOT NULL,
    AgeYear INT,
    GenderID INT,
    VictimPolice VARCHAR(10) DEFAULT '0'
);

CREATE TABLE Accused (
    AccusedMasterID INT PRIMARY KEY,
    CaseMasterID INT NOT NULL REFERENCES CaseMaster(CaseMasterID),
    AccusedName VARCHAR(200) NOT NULL,
    AgeYear INT,
    GenderID INT,
    PersonID VARCHAR(10)
);

CREATE TABLE ActSectionAssociation (
    AssocID INT PRIMARY KEY,
    CaseMasterID INT NOT NULL REFERENCES CaseMaster(CaseMasterID),
    ActID VARCHAR(20) NOT NULL,
    SectionID VARCHAR(20) NOT NULL,
    ActOrderID INT DEFAULT 0,
    SectionOrderID INT DEFAULT 0,
    FOREIGN KEY (ActID, SectionID) REFERENCES Section(ActCode, SectionCode)
);

CREATE TABLE ArrestSurrender (
    ArrestSurrenderID INT PRIMARY KEY,
    CaseMasterID INT NOT NULL REFERENCES CaseMaster(CaseMasterID),
    ArrestSurrenderTypeID INT,
    ArrestSurrenderDate DATE,
    ArrestSurrenderStateId INT REFERENCES State(StateID),
    ArrestSurrenderDistrictId INT REFERENCES District(DistrictID),
    PoliceStationID INT REFERENCES Unit(UnitID),
    IOID INT REFERENCES Employee(EmployeeID),
    CourtID INT REFERENCES Court(CourtID),
    AccusedMasterID INT REFERENCES Accused(AccusedMasterID),
    IsAccused BIT DEFAULT 1,
    IsComplainantAccused BIT DEFAULT 0
);

CREATE TABLE ChargesheetDetails (
    CSID INT PRIMARY KEY,
    CaseMasterID INT NOT NULL REFERENCES CaseMaster(CaseMasterID),
    csdate TIMESTAMP,
    cstype CHAR(1),
    PolicePersonID INT REFERENCES Employee(EmployeeID)
);

-- ── 3. INDEXES ──

CREATE INDEX idx_casemaster_policestation ON CaseMaster(PoliceStationID);
CREATE INDEX idx_casemaster_crimecategory ON CaseMaster(CaseCategoryID);
CREATE INDEX idx_casemaster_status ON CaseMaster(CaseStatusID);
CREATE INDEX idx_casemaster_dates ON CaseMaster(CrimeRegisteredDate);
CREATE INDEX idx_casemaster_geo ON CaseMaster(latitude, longitude);
CREATE INDEX idx_complainant_case ON ComplainantDetails(CaseMasterID);
CREATE INDEX idx_victim_case ON Victim(CaseMasterID);
CREATE INDEX idx_accused_case ON Accused(CaseMasterID);
CREATE INDEX idx_arrest_case ON ArrestSurrender(CaseMasterID);
CREATE INDEX idx_actsection_case ON ActSectionAssociation(CaseMasterID);
CREATE INDEX idx_employee_unit ON Employee(UnitID);
CREATE INDEX idx_unit_district ON Unit(DistrictID);
