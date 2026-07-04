-- ============================================================
-- KCI-OS Reference Data Seed
-- All lookup tables populated per the ER Diagram
-- ============================================================

-- State
INSERT INTO State (StateID, StateName) VALUES (1, 'Karnataka');

-- District
INSERT INTO District (DistrictID, DistrictName, StateID) VALUES
(1, 'Bengaluru Urban', 1), (2, 'Belagavi', 1), (3, 'Kalaburagi', 1),
(4, 'Mysuru', 1), (5, 'Mangaluru', 1), (6, 'Hubli-Dharwad', 1),
(7, 'Bengaluru Rural', 1), (8, 'Shivamogga', 1), (9, 'Ballari', 1);

-- UnitType
INSERT INTO UnitType (UnitTypeID, UnitTypeName, CityDistState, Hierarchy) VALUES
(1, 'Police Station', 'City', 5), (2, 'Circle Office', 'City', 4),
(3, 'Sub-Division', 'District', 3), (4, 'District Police Office', 'District', 2),
(5, 'State Headquarters', 'State', 1);

-- Unit (Police Stations)
INSERT INTO Unit (UnitID, UnitName, TypeID, DistrictID, StateID) VALUES
(1, 'Cubbon Park PS', 1, 1, 1), (2, 'MG Road PS', 1, 1, 1),
(3, 'Whitefield PS', 1, 1, 1), (4, 'Marathahalli PS', 1, 1, 1),
(5, 'Belagavi City PS', 1, 2, 1), (6, 'Belagavi Rural PS', 1, 2, 1),
(7, 'Kalaburagi City PS', 1, 3, 1), (8, 'Kalaburagi Rural PS', 1, 3, 1),
(9, 'Mysuru City PS', 1, 4, 1), (10, 'Mysuru Rural PS', 1, 4, 1),
(11, 'Mangaluru City PS', 1, 5, 1), (12, 'Mangaluru Rural PS', 1, 5, 1),
(13, 'Hubli PS', 1, 6, 1), (14, 'Dharwad PS', 1, 6, 1);

-- CaseCategory
INSERT INTO CaseCategory (CaseCategoryID, LookupValue) VALUES
(1, 'FIR'), (2, 'UDR'), (3, 'Zero FIR'), (4, 'PAR');

-- GravityOffence
INSERT INTO GravityOffence (GravityOffenceID, LookupValue) VALUES
(1, 'Heinous'), (2, 'Non-Heinous');

-- CrimeHead (Major)
INSERT INTO CrimeHead (CrimeHeadID, CrimeGroupName) VALUES
(1, 'Crimes Against Body'), (2, 'Crimes Against Property'),
(3, 'Crimes Against Women'), (4, 'Crimes Against Children'),
(5, 'Crimes Against State'), (6, 'Economic Offences'),
(7, 'Cyber Crimes'), (8, 'Drug Related Offences'),
(9, 'Other Crimes');

-- CrimeSubHead (Minor)
INSERT INTO CrimeSubHead (CrimeSubHeadID, CrimeHeadID, CrimeHeadName, SeqID) VALUES
(1, 2, 'Theft', 1), (2, 2, 'Burglary', 2), (3, 2, 'Robbery', 3),
(4, 1, 'Assault', 4), (5, 6, 'Cheating', 5),
(6, 7, 'Cyber Fraud', 6), (7, 3, 'Chain Snatching', 7),
(8, 8, 'Drug Offense', 8), (9, 2, 'Vehicle Theft', 9),
(10, 6, 'Financial Fraud', 10), (11, 2, 'Dacoity', 11),
(12, 1, 'Murder', 12), (13, 3, 'Dowry Death', 13);

-- Act
INSERT INTO Act (ActCode, ActDescription, ShortName) VALUES
('IPC', 'Indian Penal Code', 'IPC'),
('NDPS', 'Narcotic Drugs and Psychotropic Substances Act', 'NDPS'),
('IT', 'Information Technology Act', 'IT Act'),
('CrPC', 'Code of Criminal Procedure', 'CrPC');

-- Section
INSERT INTO Section (ActCode, SectionCode, SectionDescription) VALUES
('IPC', '379', 'Punishment for theft'),
('IPC', '380', 'Theft in dwelling house'),
('IPC', '381', 'Theft by clerk or servant'),
('IPC', '382', 'Theft after preparation for causing hurt'),
('IPC', '392', 'Punishment for robbery'),
('IPC', '393', 'Attempt to commit robbery'),
('IPC', '394', 'Voluntarily causing hurt in committing robbery'),
('IPC', '395', 'Punishment for dacoity'),
('IPC', '396', 'Dacoity with murder'),
('IPC', '397', 'Robbery or dacoity with attempt to cause death or grievous hurt'),
('IPC', '398', 'Attempt to commit robbery or dacoity when armed'),
('IPC', '399', 'Making preparation to commit dacoity'),
('IPC', '400', 'Punishment for belonging to gang of dacoits'),
('IPC', '401', 'Punishment for belonging to gang of thieves'),
('IPC', '402', 'Assembling for purpose of committing dacoity'),
('IPC', '403', 'Dishonest misappropriation of property'),
('IPC', '406', 'Punishment for criminal breach of trust'),
('IPC', '408', 'Criminal breach of trust by clerk or servant'),
('IPC', '409', 'Criminal breach of trust by public servant'),
('IPC', '411', 'Dishonestly receiving stolen property'),
('IPC', '413', 'Habitually dealing in stolen property'),
('IPC', '414', 'Assisting in concealment of stolen property'),
('IPC', '417', 'Punishment for cheating'),
('IPC', '419', 'Punishment for cheating by personation'),
('IPC', '420', 'Cheating and dishonestly inducing delivery of property'),
('IPC', '454', 'Lurking house-trespass or house-breaking'),
('IPC', '457', 'Lurking house-trespass or house-breaking by night'),
('IPC', '458', 'Lurking house-trespass or house-breaking after preparation'),
('IPC', '459', 'Grievous hurt caused whilst committing lurking house-trespass'),
('IPC', '460', 'Death caused whilst committing lurking house-trespass'),
('IPC', '302', 'Punishment for murder'),
('IPC', '304', 'Punishment for culpable homicide not amounting to murder'),
('IPC', '307', 'Attempt to murder'),
('IPC', '323', 'Punishment for voluntarily causing hurt'),
('IPC', '324', 'Voluntarily causing hurt by dangerous weapons'),
('IPC', '325', 'Punishment for voluntarily causing grievous hurt'),
('IPC', '326', 'Voluntarily causing grievous hurt by dangerous weapons'),
('IPC', '354', 'Assault or criminal force to woman with intent to outrage her modesty'),
('IPC', '354A', 'Sexual harassment'),
('IPC', '354B', 'Assault or use of criminal force to woman with intent to disrobe'),
('IPC', '354C', 'Voyeurism'),
('IPC', '354D', 'Stalking'),
('IPC', '363', 'Punishment for kidnapping'),
('IPC', '364', 'Kidnapping or abducting in order to murder'),
('IPC', '365', 'Kidnapping or abducting with intent secretly and wrongfully to confine'),
('IPC', '376', 'Punishment for rape'),
('IPC', '376A', 'Punishment for causing death or persistent vegetative state'),
('IPC', '376B', 'Sexual intercourse by husband during separation'),
('IPC', '376C', 'Sexual intercourse by a person in authority'),
('IPC', '376D', 'Gang rape'),
('IPC', '379', 'Punishment for theft'),
('IPC', '380', 'Theft in dwelling house'),
('IPC', '392', 'Punishment for robbery'),
('IPC', '395', 'Punishment for dacoity'),
('IPC', '398', 'Attempt to commit robbery or dacoity when armed'),
('IPC', '399', 'Making preparation to commit dacoity'),
('IPC', '400', 'Punishment for belonging to gang of dacoits'),
('IPC', '406', 'Punishment for criminal breach of trust'),
('IPC', '409', 'Criminal breach of trust by public servant'),
('IPC', '411', 'Dishonestly receiving stolen property'),
('IPC', '413', 'Habitually dealing in stolen property'),
('IPC', '414', 'Assisting in concealment of stolen property'),
('IPC', '417', 'Punishment for cheating'),
('IPC', '419', 'Punishment for cheating by personation'),
('IPC', '420', 'Cheating and dishonestly inducing delivery of property'),
('IPC', '454', 'Lurking house-trespass or house-breaking'),
('IPC', '457', 'Lurking house-trespass or house-breaking by night'),
('IPC', '459', 'Grievous hurt caused whilst committing lurking house-trespass'),
('IPC', '460', 'Death caused whilst committing lurking house-trespass'),
('IPC', '498A', 'Cruelty by husband or relatives'),
('NDPS', '8', 'Prohibition of certain operations'),
('NDPS', '15', 'Punishment for contravention relating to poppy straw'),
('NDPS', '20', 'Punishment for contravention relating to cannabis'),
('NDPS', '21', 'Punishment for contravention relating to manufactured drugs'),
('NDPS', '22', 'Punishment for contravention relating to psychotropic substances'),
('NDPS', '27', 'Punishment for consumption of narcotic drugs'),
('IT', '43', 'Penalty for damage to computer system'),
('IT', '66', 'Computer related offences'),
('IT', '66B', 'Punishment for dishonestly receiving stolen computer resource'),
('IT', '66C', 'Punishment for identity theft'),
('IT', '66D', 'Punishment for cheating by personation using computer'),
('IT', '67', 'Punishment for publishing obscene material in electronic form');

-- CrimeHeadActSection mapping
INSERT INTO CrimeHeadActSection (CrimeHeadID, ActCode, SectionCode) VALUES
(1, 'IPC', '302'), (1, 'IPC', '304'), (1, 'IPC', '307'),
(1, 'IPC', '323'), (1, 'IPC', '324'), (1, 'IPC', '325'), (1, 'IPC', '326'),
(3, 'IPC', '354'), (3, 'IPC', '354A'), (3, 'IPC', '354B'), (3, 'IPC', '376'),
(3, 'IPC', '498A'),
(2, 'IPC', '379'), (2, 'IPC', '380'), (2, 'IPC', '381'), (2, 'IPC', '382'),
(2, 'IPC', '392'), (2, 'IPC', '393'), (2, 'IPC', '394'), (2, 'IPC', '395'),
(2, 'IPC', '397'), (2, 'IPC', '398'), (2, 'IPC', '399'), (2, 'IPC', '400'),
(2, 'IPC', '401'), (2, 'IPC', '402'), (2, 'IPC', '454'), (2, 'IPC', '457'),
(2, 'IPC', '459'), (2, 'IPC', '460'),
(6, 'IPC', '406'), (6, 'IPC', '408'), (6, 'IPC', '409'), (6, 'IPC', '411'),
(6, 'IPC', '413'), (6, 'IPC', '414'), (6, 'IPC', '417'), (6, 'IPC', '419'), (6, 'IPC', '420'),
(8, 'NDPS', '20'), (8, 'NDPS', '21'), (8, 'NDPS', '22'), (8, 'NDPS', '27');

-- CaseStatusMaster
INSERT INTO CaseStatusMaster (CaseStatusID, CaseStatusName) VALUES
(1, 'Registered'), (2, 'Under Investigation'), (3, 'Charge Sheeted'),
(4, 'Closed'), (5, 'Pending Court'), (6, 'Convicted'), (7, 'Acquitted'),
(8, 'Transferred'), (9, 'Quashed');

-- Rank
INSERT INTO Rank (RankID, RankName, Hierarchy) VALUES
(1, 'Director General of Police', 1),
(2, 'Additional Director General', 2),
(3, 'Inspector General', 3),
(4, 'Deputy Inspector General', 4),
(5, 'Superintendent of Police', 5),
(6, 'Additional Superintendent', 6),
(7, 'Deputy Superintendent', 7),
(8, 'Assistant Commissioner', 8),
(9, 'Police Inspector', 9),
(10, 'Sub-Inspector', 10),
(11, 'Assistant Sub-Inspector', 11),
(12, 'Head Constable', 12),
(13, 'Constable', 13);

-- Designation
INSERT INTO Designation (DesignationID, DesignationName, SortOrder) VALUES
(1, 'Investigating Officer', 1), (2, 'Station House Officer', 2),
(3, 'Circle Inspector', 3), (4, 'Deputy Superintendent', 4),
(5, 'Superintendent of Police', 5), (6, 'Additional Director', 6),
(7, 'Director', 7);

-- OccupationMaster
INSERT INTO OccupationMaster (OccupationID, OccupationName) VALUES
(1, 'Farmer'), (2, 'Government Employee'), (3, 'Private Employee'),
(4, 'Business'), (5, 'Student'), (6, 'Homemaker'), (7, 'Retired'),
(8, 'Unemployed'), (9, 'Daily Wage Worker'), (10, 'Professional');

-- ReligionMaster
INSERT INTO ReligionMaster (ReligionID, ReligionName) VALUES
(1, 'Hindu'), (2, 'Muslim'), (3, 'Christian'), (4, 'Sikh'),
(5, 'Jain'), (6, 'Buddhist'), (7, 'Other');

-- CasteMaster
INSERT INTO CasteMaster (caste_master_id, caste_master_name) VALUES
(1, 'General'), (2, 'OBC'), (3, 'SC'), (4, 'ST'), (5, 'Other');

-- Court
INSERT INTO Court (CourtID, CourtName, DistrictID, StateID) VALUES
(1, 'CMM Court Bengaluru', 1, 1),
(2, 'JMFC Court Mysuru', 4, 1),
(3, 'CMM Court Belagavi', 2, 1),
(4, 'District Court Kalaburagi', 3, 1),
(5, 'JMFC Court Mangaluru', 5, 1),
(6, 'District Court Hubli', 6, 1);

-- Employees
INSERT INTO Employee (EmployeeID, DistrictID, UnitID, RankID, DesignationID, FirstName, GenderID) VALUES
(1, 1, 1, 9, 1, 'Inspector Sharma', 1),
(2, 1, 2, 10, 1, 'Sub-Inspector Patil', 1),
(3, 4, 9, 10, 1, 'Sub-Inspector Kumar', 1),
(4, 2, 5, 9, 1, 'Inspector Deshmukh', 1),
(5, 3, 7, 10, 1, 'Sub-Inspector Reddy', 1);
