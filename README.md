# Divya Shakti Motors

Hero bike showroom website: public site (English / ગુજરાતી), customer accounts, admin panel.

## Run
    npm install
    npm start            # http://localhost:3000

First run prints the admin login (a random password, shown once; set ADMIN_PHONE and ADMIN_PASSWORD in the environment to choose your own).
To choose your own: `ADMIN_PASSWORD='your-password' npm start` on the very first run.

## Pages
/ home · /products.html bikes · /contact.html · /login.html · /dashboard.html (customer) · /admin.html (admin)

## Data
SQLite file: `data/dsm.db` (back this up). Uploaded bike photos: `public/uploads/`.

## Deploying
Needs Node >= 22.13 and a persistent disk for `data/` and `public/uploads/`.
Set `NODE_ENV=production` and, behind a proxy (Render, Railway, nginx), `TRUST_PROXY=1`. Serve over HTTPS.
