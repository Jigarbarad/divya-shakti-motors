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

## Enquiry emails

Copy `.env.example` to `.env`, then fill in `NOTIFY_TO` (who gets the emails), `SMTP_USER` (the Gmail that sends them) and `SMTP_PASS` (a Gmail App Password, not the normal password). Restart the server, then run `npm run test-email` to check it. Without these settings the site works as before and no emails are sent.

## Where data lives

The database and photos uploaded in admin are stored in `DATA_DIR` (default: the `data/` folder). On a host, point `DATA_DIR` at a permanent disk so they survive restarts and updates. The bike photos that ship with the code are in `public/uploads/`.
