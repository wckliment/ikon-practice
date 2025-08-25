# Ikon Practice – Handoff Notes

## Overview
This repository contains the current state of the **Ikon Practice** dental practice management software. Development was structured around the phases outlined in the project proposal.

## Completed
- **Phase 1 – Discovery \& Planning**  
  - Requirements gathered, workflows mapped  
  - Integration approach with Open Dental identified  

- **Phase 2 – Frontend Development \& Integration**  
  - React-based frontend scaffolded and connected to Open Dental’s MariaDB  
  - Core UI components implemented (dashboard, forms, navigation)  
  - Data synchronization working  

- **Phase 3 – Self Check-In Kiosk**  
  - Kiosk UI for patient check-in built  
  - Real-time updates to Open Dental patient records  

- **Phase 4 – Patient Engagement**  
  - Messaging features for reminders and two-way communication  
  - Staff dashboard for managing patient interactions  

- **Phase 5 – Online Scheduling**  
  - Appointment booking and rescheduling system implemented  
  - SMS/email reminders integrated  

## Not Yet Implemented
- **Phase 6 – Smart Form Builder**  
- **Phase 7 – Customizable Treatment Plans**  
- **Phase 8 – Patient Reviews**  
- Backend services beyond direct DB integration  

## Setup Instructions
1. Clone the repo:  
   ```bash
   git clone https://github.com/<yourusername>/ikon-practice.git
   cd ikon-practice
   ```

2. Install dependencies:  
   ```bash
   npm install
   ```

3. Start development server:  
   ```bash
   npm start
   ```

4. Environment variables:  
   - Requires access to the **Open Dental MariaDB database**  
   - Update connection details in `/src/config/db.js` (or `.env` if configured)  

## Notes
- All code through **Phase 5 (Online Scheduling)** is included in this repo.  
- No partially completed milestones remain outstanding per the cancellation notice.  
- Future developers should review Open Dental’s API/documentation for backend expansion.  

---

*Prepared by: Chase Kliment*  
*Date: August 25, 2025*