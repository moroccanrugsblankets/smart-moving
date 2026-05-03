# Smart Moving — GetMoveCost.com

A Next.js 15 application providing a free moving & cleaning cost estimator for the USA, backed by a full-featured backoffice admin panel.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Environment Variables](#environment-variables)
3. [Public Website (Frontend)](#public-website-frontend)
4. [Admin Access — Login](#admin-access--login)
5. [Backoffice Sections](#backoffice-sections)
   - [Dashboard](#1-dashboard)
   - [Leads](#2-leads)
   - [Blog](#3-blog)
   - [Pages](#4-pages)
   - [Market Data](#5-market-data-admin-only)
   - [Settings](#6-settings-admin-only)
   - [Users](#7-users-admin-only)
   - [Email Config](#8-email-config-admin-only)
   - [Email Logs](#9-email-logs)
   - [Activity Logs](#10-activity-logs-admin-only)
6. [User Roles](#user-roles)
7. [Data Storage](#data-storage)

---

## Getting Started

```bash
# Install dependencies
npm install --legacy-peer-deps

# Start development server (with Turbopack)
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

The application runs at **http://localhost:3000** by default.

---

## Environment Variables

Copy `env.example` to `.env.local` and fill in the values:

```env
# NextAuth
NEXTAUTH_URL=https://getmovecost.com      # Base URL of your deployment
NEXTAUTH_SECRET=your-secret-here          # Random string for JWT signing

# Public base URL (used for sitemap, etc.)
NEXT_PUBLIC_BASE_URL=https://getmovecost.com
```

> **Tip:** Generate a secure `NEXTAUTH_SECRET` with `openssl rand -base64 32`.

---

## Public Website (Frontend)

The frontend is accessible at the root URL and includes:

| Route | Description |
|---|---|
| `/` | Home page with the moving cost calculator |
| `/moving-cost` | Browse all city moving cost guides |
| `/moving-cost/[state]/[city]` | Per-city moving cost guide |
| `/privacy` | Privacy Policy |
| `/terms` | Terms of Service |
| `/do-not-sell` | Do Not Sell My Personal Information |

The calculator lets visitors enter origin/destination zip codes, home size, and service type to get an instant cost estimate based on 2026 BLS market-rate data.

---

## Admin Access — Login

### 🔗 Login URL

```
http://localhost:3000/portal-access-secure
```

> In production: `https://getmovecost.com/portal-access-secure`

### 🔑 Default Credentials

| Field | Value |
|---|---|
| **Email** | `admin@getmovecost.com` |
| **Password** | `admin123` |

> ⚠️ **Change the default password immediately after your first login.** Go to **Backoffice → Users** to update your account password.

After successful login, you are redirected to the backoffice dashboard at `/backoffice`.

**Security note:** The login page enforces a rate limit — after multiple failed attempts from the same IP address, the account is locked for 15 minutes.

---

## Backoffice Sections

The backoffice is accessible at `/backoffice` after authentication.

### 1. Dashboard

**URL:** `/backoffice`

The main overview page showing:
- Total leads, leads today, and leads this month
- Number of published blog posts
- Bar chart of leads received over the last 7 days
- Table of the 5 most recent leads
- Quick links to other sections

---

### 2. Leads

**URL:** `/backoffice/leads`

Manage all visitor contact form submissions (leads):
- View the full list of leads with name, email, phone, service type, and date
- See the moving cost estimate attached to each lead
- Delete individual leads

---

### 3. Blog

**URL:** `/backoffice/blog`

Full blog management:
- **List posts** — view all drafts and published articles
- **Create post** — `/backoffice/blog/new` — rich text editor with SEO fields (meta title, meta description, canonical URL, Open Graph)
- **Edit post** — `/backoffice/blog/[id]`
- **Categories** — `/backoffice/blog/categories` — create and manage blog categories
- Set post status to **Draft** or **Published**

Published blog posts appear on the public-facing site.

---

### 4. Pages

**URL:** `/backoffice/pages`

Edit the content of static legal/informational pages:
- Privacy Policy (`/privacy`)
- Terms of Service (`/terms`)
- About Us
- Do Not Sell My Personal Information (`/do-not-sell`)

Each page supports full content editing plus SEO fields.

---

### 5. Market Data *(admin only)*

**URL:** `/backoffice/market-data`

Upload and manage the JSON market-rate data file that powers the moving cost calculator. The uploaded data is used to compute cost estimates for all cities.

---

### 6. Settings *(admin only)*

**URL:** `/backoffice/settings`

Configure site-wide settings:
- Company name and tagline
- Header and footer logo URLs
- Favicon URL
- Admin contact email
- Social media links (Twitter/X, Facebook, LinkedIn, Instagram)

---

### 7. Users *(admin only)*

**URL:** `/backoffice/users`

Manage admin panel accounts:
- View all users and their roles
- Create new users (admin or manager)
- Change passwords
- Delete users

> Use this section to change the default `admin123` password after first login.

---

### 8. Email Config *(admin only)*

**URL:** `/backoffice/email/config`

Configure the outbound SMTP server used to send emails:
- SMTP host and port
- Username and password
- From email address
- Encryption mode (SSL / TLS / None)

---

### 9. Email Logs

**URL:** `/backoffice/email/logs`

View the history of all emails sent by the application, including:
- Recipient address and subject
- Sent timestamp
- Status (sent / failed)
- Error message if delivery failed

---

### 10. Activity Logs *(admin only)*

**URL:** `/backoffice/activity-logs`

Audit trail of all actions performed inside the backoffice:
- User login events
- Create / update / delete actions on leads, blog posts, pages, settings, and users
- Timestamp and IP address for each event

The last **1 000** entries are retained.

---

## User Roles

| Role | Description |
|---|---|
| `admin` | Full access to all backoffice sections |
| `manager` | Access to Dashboard, Leads, Blog, Pages, and Email Logs |

---

## Data Storage

All application data is stored as JSON files inside the `data/` directory at the project root:

| File | Contents |
|---|---|
| `data/users.json` | Admin user accounts |
| `data/settings.json` | Site settings |
| `data/leads.json` | Contact form submissions |
| `data/blog.json` | Blog posts |
| `data/blog-categories.json` | Blog categories |
| `data/pages.json` | Static page content |
| `data/email-config.json` | SMTP configuration |
| `data/email-logs.json` | Email send history |
| `data/activity-logs.json` | Audit trail |
| `data/market-rates.json` | Moving cost market-rate data |

> The `data/` directory is created automatically on first run. Back it up regularly in production.
