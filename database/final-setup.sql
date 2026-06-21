CREATE DATABASE IF NOT EXISTS criminal_evidence_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE criminal_evidence_db;

-- =========================================================
-- 1. USERS
-- =========================================================
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(150) NOT NULL,
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(150) NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_users_role (role),
  INDEX idx_users_active (active)
);

-- =========================================================
-- 2. CASES
-- =========================================================
CREATE TABLE IF NOT EXISTS cases (
  id INT AUTO_INCREMENT PRIMARY KEY,
  case_code VARCHAR(50) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  priority VARCHAR(30) NOT NULL DEFAULT 'Medium',
  status VARCHAR(30) NOT NULL DEFAULT 'Open',
  created_by INT NULL,
  lead_investigator_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_cases_created_by
    FOREIGN KEY (created_by) REFERENCES users(id)
    ON DELETE SET NULL,

  CONSTRAINT fk_cases_lead_investigator
    FOREIGN KEY (lead_investigator_id) REFERENCES users(id)
    ON DELETE SET NULL,

  INDEX idx_cases_case_code (case_code),
  INDEX idx_cases_status (status),
  INDEX idx_cases_priority (priority)
);

-- =========================================================
-- 3. CASE TEAM ASSIGNMENTS
-- =========================================================
CREATE TABLE IF NOT EXISTS case_team_assignments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  case_id INT NOT NULL,
  user_id INT NOT NULL,
  role VARCHAR(50) NOT NULL,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_case_team_case
    FOREIGN KEY (case_id) REFERENCES cases(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_case_team_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,

  UNIQUE KEY uq_case_user_role (case_id, user_id, role),
  INDEX idx_case_team_case_id (case_id),
  INDEX idx_case_team_user_id (user_id),
  INDEX idx_case_team_role (role)
);

-- =========================================================
-- 4. EVIDENCE
-- =========================================================
CREATE TABLE IF NOT EXISTS evidence (
  id INT AUTO_INCREMENT PRIMARY KEY,
  case_id INT NOT NULL,
  evidence_type VARCHAR(100) NOT NULL,
  description TEXT NULL,

  file_name VARCHAR(255) NULL,
  file_size BIGINT NULL,
  mime_type VARCHAR(150) NULL,

  file_hash VARCHAR(128) NOT NULL,
  ipfs_cid VARCHAR(255) NULL,

  submitted_by VARCHAR(150) NULL,
  submitted_by_user_id INT NULL,

  status VARCHAR(30) NOT NULL DEFAULT 'Pending',

  blockchain_tx_hash VARCHAR(255) NULL,
  blockchain_status VARCHAR(30) NOT NULL DEFAULT 'Not Recorded',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_evidence_case
    FOREIGN KEY (case_id) REFERENCES cases(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_evidence_submitter
    FOREIGN KEY (submitted_by_user_id) REFERENCES users(id)
    ON DELETE SET NULL,

  INDEX idx_evidence_case_id (case_id),
  INDEX idx_evidence_status (status),
  INDEX idx_evidence_type (evidence_type),
  INDEX idx_evidence_file_hash (file_hash),
  INDEX idx_evidence_blockchain_status (blockchain_status)
);

-- =========================================================
-- 5. LAB RESULTS
-- =========================================================
CREATE TABLE IF NOT EXISTS lab_results (
  id INT AUTO_INCREMENT PRIMARY KEY,
  evidence_id INT NOT NULL,
  analyzed_by VARCHAR(100) NOT NULL,
  analysis_type VARCHAR(50) NULL,
  result TEXT NOT NULL,
  conclusion VARCHAR(100) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_lab_results_evidence
    FOREIGN KEY (evidence_id) REFERENCES evidence(id)
    ON DELETE CASCADE,

  INDEX idx_lab_results_evidence_id (evidence_id),
  INDEX idx_lab_results_analyzed_by (analyzed_by),
  INDEX idx_lab_results_conclusion (conclusion)
);

-- =========================================================
-- 6. LAB REPORT ATTACHMENTS
-- =========================================================
CREATE TABLE IF NOT EXISTS lab_report_attachments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  lab_result_id INT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT NULL,
  file_hash VARCHAR(128) NULL,
  ipfs_cid VARCHAR(255) NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_lab_report_attachments_result
    FOREIGN KEY (lab_result_id) REFERENCES lab_results(id)
    ON DELETE CASCADE,

  INDEX idx_lab_report_attachments_result_id (lab_result_id)
);

-- =========================================================
-- 7. LEGAL NOTES
-- flexible columns included to support your legal module safely
-- =========================================================
CREATE TABLE IF NOT EXISTS legal_notes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  case_id INT NOT NULL,
  evidence_id INT NULL,
  lawyer_id INT NULL,

  title VARCHAR(255) NULL,
  note_title VARCHAR(255) NULL,
  note TEXT NULL,
  note_text TEXT NULL,

  note_type VARCHAR(100) NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'Draft',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_legal_notes_case
    FOREIGN KEY (case_id) REFERENCES cases(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_legal_notes_evidence
    FOREIGN KEY (evidence_id) REFERENCES evidence(id)
    ON DELETE SET NULL,

  CONSTRAINT fk_legal_notes_lawyer
    FOREIGN KEY (lawyer_id) REFERENCES users(id)
    ON DELETE SET NULL,

  INDEX idx_legal_notes_case_id (case_id),
  INDEX idx_legal_notes_evidence_id (evidence_id),
  INDEX idx_legal_notes_lawyer_id (lawyer_id),
  INDEX idx_legal_notes_status (status)
);

-- =========================================================
-- 8. COURT VERDICTS
-- =========================================================
CREATE TABLE IF NOT EXISTS court_verdicts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  judge_id INT NOT NULL,
  case_id INT NOT NULL,
  verdict_title VARCHAR(255) NOT NULL,
  decision VARCHAR(50) NOT NULL,
  verdict_summary TEXT NOT NULL,
  sentence_text TEXT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'Draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_court_verdicts_judge
    FOREIGN KEY (judge_id) REFERENCES users(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_court_verdicts_case
    FOREIGN KEY (case_id) REFERENCES cases(id)
    ON DELETE CASCADE,

  INDEX idx_court_verdicts_judge_id (judge_id),
  INDEX idx_court_verdicts_case_id (case_id),
  INDEX idx_court_verdicts_status (status),
  INDEX idx_court_verdicts_decision (decision)
);

-- =========================================================
-- 9. AUDIT LOGS
-- =========================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  actor_name VARCHAR(150) NULL,
  actor_role VARCHAR(50) NULL,
  action VARCHAR(255) NOT NULL,
  entity_type VARCHAR(100) NULL,
  entity_id VARCHAR(100) NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'Success',
  details TEXT NULL,
  ip_address VARCHAR(100) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_audit_actor_name (actor_name),
  INDEX idx_audit_actor_role (actor_role),
  INDEX idx_audit_entity (entity_type, entity_id),
  INDEX idx_audit_status (status),
  INDEX idx_audit_created_at (created_at)
);

-- =========================================================
-- 10. OPTIONAL SAMPLE CASE STATUSES / NOTES
-- No sample users are inserted here because password_hash must be bcrypt.
-- Create users from your Admin UI or seed script.
-- =========================================================