# Blockchain Based Evidence Management System

A role-based criminal evidence management system built with Next.js, MySQL, IPFS, and blockchain technology.  
The system focuses on protecting digital evidence integrity using SHA-256 hashing, IPFS CID storage, blockchain transaction proof, audit logs, and chain-of-custody tracking.

## Project Objective

The main objective of this project is to manage digital evidence used in criminal cases and protect it from tampering.

This system is case-centered, not criminal-profile-centered.  
Each case can contain evidence, assigned team members, lab reports, legal notes, judge verdicts, and audit history.

## Main Features

- JWT login and role-based access control
- Admin dashboard
- Investigator dashboard
- Lab Technician dashboard
- Lawyer / Legal dashboard
- Judge dashboard
- Evidence upload
- SHA-256 file hash generation
- IPFS CID storage
- Blockchain transaction proof using Ganache
- Evidence timeline / chain of custody
- Evidence verification page
- Lab report submission
- Lab report PDF export
- Legal notes
- Judge verdict management
- Verdict PDF export
- Audit logs
- Responsive dashboard sidebar
- Loading skeletons
- Status badges
- Trusted Assistant search/helper
- Modern login particle background

## User Roles

### Admin

The Admin manages users, cases, team assignments, audit logs, and infrastructure status.

### Investigator

The Investigator views assigned cases and submits digital evidence.  
When evidence is submitted, the system generates a SHA-256 hash, stores an IPFS CID, and records blockchain proof.

### Lab Technician

The Lab Technician accepts pending evidence, analyzes evidence, and submits lab reports.

Evidence flow:

```txt
Pending → Accepted → Analyzed