# CampusKart Deployment Fixes

## Tasks
- [x] Install cloudinary dependency (removed)
- [x] Update server.js with local file upload (replaced Cloudinary)
- [x] Update /api/contact-seller endpoint to handle email failures gracefully
- [x] Add Cloudinary environment variables to .env
- [ ] Test the changes on localhost
- [ ] Redeploy to Render and verify fixes

## Add Item Form Validations

## Tasks
- [ ] Add email field to add item form in public/index.html
- [ ] Update database schema to include email column in items table
- [ ] Implement client-side validation in public/script.js (string-only, integer-only, 10-digit phone, @gmail.com email)
- [ ] Implement server-side validation in server.js for POST /api/items endpoint
