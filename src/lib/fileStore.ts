import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const DATA_DIR = path.join(process.cwd(), 'data');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readJSON<T>(filename: string, defaultValue: T): T {
  ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    writeJSON(filename, defaultValue);
    return defaultValue;
  }
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content) as T;
  } catch {
    return defaultValue;
  }
}

function writeJSON<T>(filename: string, data: T): void {
  ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// --- Types ---

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager';
  passwordHash: string;
  createdAt: string;
}

export interface Settings {
  companyName: string;
  tagline: string;
  logoUrlHeader: string;
  logoUrlFooter: string;
  faviconUrl: string;
  adminEmail: string;
  socialLinks: {
    twitter?: string;
    facebook?: string;
    linkedin?: string;
    instagram?: string;
  };
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string[];
  status: 'draft' | 'published';
  metaTitle: string;
  metaDesc: string;
  canonical: string;
  ogTitle: string;
  ogDesc: string;
  ogImage: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
}

export interface EmailConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  fromEmail: string;
  encryption: 'SSL' | 'TLS' | 'none';
}

export interface EmailLog {
  id: string;
  to: string;
  subject: string;
  sentAt: string;
  status: 'sent' | 'failed';
  content: string;
  error?: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  resource: string;
  details: string;
  createdAt: string;
}

export interface PageContent {
  slug: string;
  title: string;
  content: string;
  metaTitle: string;
  metaDesc: string;
  canonical: string;
  ogTitle: string;
  ogDesc: string;
  ogImage: string;
  updatedAt: string;
}

export interface StoredLead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  serviceDate: string;
  serviceType: string;
  originZip?: string;
  destZip?: string;
  homeSize?: string;
  estimate?: string;
  createdAt: string;
}

// --- Default values ---

function getDefaultUsers(): AdminUser[] {
  const passwordHash = bcrypt.hashSync('admin123', 10);
  return [
    {
      id: crypto.randomUUID(),
      email: 'admin@getmovecost.com',
      name: 'Admin',
      role: 'admin',
      passwordHash,
      createdAt: new Date().toISOString(),
    },
  ];
}

const defaultSettings: Settings = {
  companyName: 'GetMoveCost.com',
  tagline: 'Free Moving & Cleaning Cost Estimator',
  logoUrlHeader: '',
  logoUrlFooter: '',
  faviconUrl: '',
  adminEmail: 'admin@getmovecost.com',
  socialLinks: {},
};

const defaultEmailConfig: EmailConfig = {
  host: '',
  port: 587,
  username: '',
  password: '',
  fromEmail: '',
  encryption: 'TLS',
};

const defaultPages: PageContent[] = [
  { slug: 'privacy', title: 'Privacy Policy', content: '', metaTitle: '', metaDesc: '', canonical: '', ogTitle: '', ogDesc: '', ogImage: '', updatedAt: new Date().toISOString() },
  { slug: 'terms', title: 'Terms of Service', content: '', metaTitle: '', metaDesc: '', canonical: '', ogTitle: '', ogDesc: '', ogImage: '', updatedAt: new Date().toISOString() },
  { slug: 'about', title: 'About Us', content: '', metaTitle: '', metaDesc: '', canonical: '', ogTitle: '', ogDesc: '', ogImage: '', updatedAt: new Date().toISOString() },
  { slug: 'do-not-sell', title: 'Do Not Sell My Personal Information', content: '', metaTitle: '', metaDesc: '', canonical: '', ogTitle: '', ogDesc: '', ogImage: '', updatedAt: new Date().toISOString() },
];

// --- Store accessors ---

export const usersStore = {
  getAll: (): AdminUser[] => readJSON('users.json', getDefaultUsers()),
  save: (users: AdminUser[]): void => writeJSON('users.json', users),
  findByEmail: (email: string): AdminUser | undefined =>
    usersStore.getAll().find(u => u.email.toLowerCase() === email.toLowerCase()),
  findById: (id: string): AdminUser | undefined =>
    usersStore.getAll().find(u => u.id === id),
};

export const settingsStore = {
  get: (): Settings => readJSON('settings.json', defaultSettings),
  save: (settings: Settings): void => writeJSON('settings.json', settings),
};

export const blogStore = {
  getAll: (): BlogPost[] => readJSON('blog.json', []),
  save: (posts: BlogPost[]): void => writeJSON('blog.json', posts),
  findById: (id: string): BlogPost | undefined =>
    blogStore.getAll().find(p => p.id === id),
};

export const blogCategoriesStore = {
  getAll: (): BlogCategory[] => readJSON('blog-categories.json', []),
  save: (cats: BlogCategory[]): void => writeJSON('blog-categories.json', cats),
};

export const emailConfigStore = {
  get: (): EmailConfig => readJSON('email-config.json', defaultEmailConfig),
  save: (config: EmailConfig): void => writeJSON('email-config.json', config),
};

export const emailLogsStore = {
  getAll: (): EmailLog[] => readJSON('email-logs.json', []),
  save: (logs: EmailLog[]): void => writeJSON('email-logs.json', logs),
  add: (log: EmailLog): void => {
    const logs = emailLogsStore.getAll();
    logs.unshift(log);
    emailLogsStore.save(logs);
  },
  findById: (id: string): EmailLog | undefined =>
    emailLogsStore.getAll().find(l => l.id === id),
};

export const activityLogsStore = {
  getAll: (): ActivityLog[] => readJSON('activity-logs.json', []),
  save: (logs: ActivityLog[]): void => writeJSON('activity-logs.json', logs),
  add: (log: ActivityLog): void => {
    const logs = activityLogsStore.getAll();
    logs.unshift(log);
    const MAX_ACTIVITY_LOGS = 1000;
    if (logs.length > MAX_ACTIVITY_LOGS) logs.splice(MAX_ACTIVITY_LOGS);
    activityLogsStore.save(logs);
  },
};

export const pagesStore = {
  getAll: (): PageContent[] => readJSON('pages.json', defaultPages),
  save: (pages: PageContent[]): void => writeJSON('pages.json', pages),
  findBySlug: (slug: string): PageContent | undefined =>
    pagesStore.getAll().find(p => p.slug === slug),
};

export const leadsFileStore = {
  getAll: (): StoredLead[] => readJSON('leads.json', []),
  save: (leads: StoredLead[]): void => writeJSON('leads.json', leads),
  add: (lead: StoredLead): void => {
    const leads = leadsFileStore.getAll();
    leads.unshift(lead);
    leadsFileStore.save(leads);
  },
  findById: (id: string): StoredLead | undefined =>
    leadsFileStore.getAll().find(l => l.id === id),
  deleteById: (id: string): void => {
    const leads = leadsFileStore.getAll().filter(l => l.id !== id);
    leadsFileStore.save(leads);
  },
};

export const marketRatesStore = {
  get: (): Record<string, unknown> | null => {
    const filePath = path.join(DATA_DIR, 'market-rates.json');
    if (!fs.existsSync(filePath)) return null;
    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch {
      return null;
    }
  },
  save: (data: Record<string, unknown>): void => writeJSON('market-rates.json', data),
};
