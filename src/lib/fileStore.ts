import { prisma } from './prisma';
import { Role, PostStatus, EmailStatus, EncryptionType } from '@/generated/prisma/enums';
import type { Prisma } from '@/generated/prisma/client';

// ─── Re-exported enums for consumers ─────────────────────────────────────────
export { Role, PostStatus, EmailStatus, EncryptionType };

// ─── Types (preserved for API-layer compatibility) ────────────────────────────

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
  categoryIds: string[];
  featuredImage: string;
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

export interface EmailTemplate {
  id: string;
  key: string;
  name: string;
  subject: string;
  htmlContent: string;
  defaultContent: string;
  variables: string[];
  updatedAt: string;
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mapRole(role: Role): 'admin' | 'manager' {
  return role === Role.ADMIN ? 'admin' : 'manager';
}

function toDbRole(role: string): Role {
  return role === 'admin' ? Role.ADMIN : Role.MANAGER;
}

function mapPostStatus(status: PostStatus): 'draft' | 'published' {
  return status === PostStatus.PUBLISHED ? 'published' : 'draft';
}

function toDbPostStatus(status: string): PostStatus {
  return status === 'published' ? PostStatus.PUBLISHED : PostStatus.DRAFT;
}

function mapEmailStatus(status: EmailStatus): 'sent' | 'failed' {
  return status === EmailStatus.SENT ? 'sent' : 'failed';
}

function toDbEncryption(enc: string): EncryptionType {
  if (enc === 'SSL') return EncryptionType.SSL;
  if (enc === 'TLS') return EncryptionType.TLS;
  return EncryptionType.NONE;
}

function mapEncryption(enc: EncryptionType): 'SSL' | 'TLS' | 'none' {
  if (enc === EncryptionType.SSL) return 'SSL';
  if (enc === EncryptionType.TLS) return 'TLS';
  return 'none';
}

// ─── Default values ────────────────────────────────────────────────────────────

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

const defaultPages = [
  { slug: 'privacy', title: 'Privacy Policy' },
  { slug: 'terms', title: 'Terms of Service' },
  { slug: 'about', title: 'About Us' },
  { slug: 'do-not-sell', title: 'Do Not Sell My Personal Information' },
];

// ─── Store accessors ───────────────────────────────────────────────────────────

export const usersStore = {
  getAll: async (): Promise<AdminUser[]> => {
    const rows = await prisma.user.findMany({ orderBy: { createdAt: 'asc' } });
    return rows.map(u => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: mapRole(u.role),
      passwordHash: u.passwordHash,
      createdAt: u.createdAt.toISOString(),
    }));
  },
  findByEmail: async (email: string): Promise<AdminUser | undefined> => {
    const u = await prisma.user.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } },
    });
    if (!u) return undefined;
    return {
      id: u.id,
      email: u.email,
      name: u.name,
      role: mapRole(u.role),
      passwordHash: u.passwordHash,
      createdAt: u.createdAt.toISOString(),
    };
  },
  findById: async (id: string): Promise<AdminUser | undefined> => {
    const u = await prisma.user.findUnique({ where: { id } });
    if (!u) return undefined;
    return {
      id: u.id,
      email: u.email,
      name: u.name,
      role: mapRole(u.role),
      passwordHash: u.passwordHash,
      createdAt: u.createdAt.toISOString(),
    };
  },
  create: async (data: Omit<AdminUser, 'createdAt'>): Promise<AdminUser> => {
    const u = await prisma.user.create({
      data: {
        id: data.id,
        email: data.email,
        name: data.name,
        role: toDbRole(data.role),
        passwordHash: data.passwordHash,
      },
    });
    return {
      id: u.id,
      email: u.email,
      name: u.name,
      role: mapRole(u.role),
      passwordHash: u.passwordHash,
      createdAt: u.createdAt.toISOString(),
    };
  },
  update: async (id: string, data: Partial<Pick<AdminUser, 'name' | 'email' | 'role' | 'passwordHash'>>): Promise<AdminUser> => {
    const u = await prisma.user.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.role !== undefined && { role: toDbRole(data.role) }),
        ...(data.passwordHash !== undefined && { passwordHash: data.passwordHash }),
      },
    });
    return {
      id: u.id,
      email: u.email,
      name: u.name,
      role: mapRole(u.role),
      passwordHash: u.passwordHash,
      createdAt: u.createdAt.toISOString(),
    };
  },
  deleteById: async (id: string): Promise<void> => {
    await prisma.user.delete({ where: { id } });
  },
};

export const settingsStore = {
  get: async (): Promise<Settings> => {
    const row = await prisma.setting.findUnique({ where: { id: 1 } });
    if (!row) return defaultSettings;
    return {
      companyName: row.companyName,
      tagline: row.tagline,
      logoUrlHeader: row.logoUrlHeader,
      logoUrlFooter: row.logoUrlFooter,
      faviconUrl: row.faviconUrl,
      adminEmail: row.adminEmail,
      socialLinks: (row.socialLinks ?? {}) as Settings['socialLinks'],
    };
  },
  save: async (settings: Settings): Promise<void> => {
    await prisma.setting.upsert({
      where: { id: 1 },
      update: {
        companyName: settings.companyName,
        tagline: settings.tagline,
        logoUrlHeader: settings.logoUrlHeader,
        logoUrlFooter: settings.logoUrlFooter,
        faviconUrl: settings.faviconUrl,
        adminEmail: settings.adminEmail,
        socialLinks: settings.socialLinks,
      },
      create: {
        id: 1,
        companyName: settings.companyName,
        tagline: settings.tagline,
        logoUrlHeader: settings.logoUrlHeader,
        logoUrlFooter: settings.logoUrlFooter,
        faviconUrl: settings.faviconUrl,
        adminEmail: settings.adminEmail,
        socialLinks: settings.socialLinks,
      },
    });
  },
};

export const blogStore = {
  getAll: async (): Promise<BlogPost[]> => {
    const rows = await prisma.blogPost.findMany({ orderBy: { createdAt: 'desc' } });
    return rows.map(p => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      content: p.content,
      excerpt: p.excerpt,
      category: p.category,
      categoryIds: p.categoryIds,
      featuredImage: p.featuredImage,
      tags: p.tags,
      status: mapPostStatus(p.status),
      metaTitle: p.metaTitle,
      metaDesc: p.metaDesc,
      canonical: p.canonical,
      ogTitle: p.ogTitle,
      ogDesc: p.ogDesc,
      ogImage: p.ogImage,
      authorId: p.authorId,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    }));
  },
  findById: async (id: string): Promise<BlogPost | undefined> => {
    const p = await prisma.blogPost.findUnique({ where: { id } });
    if (!p) return undefined;
    return {
      id: p.id,
      title: p.title,
      slug: p.slug,
      content: p.content,
      excerpt: p.excerpt,
      category: p.category,
      categoryIds: p.categoryIds,
      featuredImage: p.featuredImage,
      tags: p.tags,
      status: mapPostStatus(p.status),
      metaTitle: p.metaTitle,
      metaDesc: p.metaDesc,
      canonical: p.canonical,
      ogTitle: p.ogTitle,
      ogDesc: p.ogDesc,
      ogImage: p.ogImage,
      authorId: p.authorId,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    };
  },
  create: async (data: Omit<BlogPost, 'createdAt' | 'updatedAt'>): Promise<BlogPost> => {
    const p = await prisma.blogPost.create({
      data: {
        id: data.id,
        title: data.title,
        slug: data.slug,
        content: data.content ?? '',
        excerpt: data.excerpt ?? '',
        category: data.category ?? '',
        categoryIds: data.categoryIds ?? [],
        featuredImage: data.featuredImage ?? '',
        tags: data.tags ?? [],
        status: toDbPostStatus(data.status),
        metaTitle: data.metaTitle ?? '',
        metaDesc: data.metaDesc ?? '',
        canonical: data.canonical ?? '',
        ogTitle: data.ogTitle ?? '',
        ogDesc: data.ogDesc ?? '',
        ogImage: data.ogImage ?? '',
        authorId: data.authorId,
      },
    });
    return {
      id: p.id,
      title: p.title,
      slug: p.slug,
      content: p.content,
      excerpt: p.excerpt,
      category: p.category,
      categoryIds: p.categoryIds,
      featuredImage: p.featuredImage,
      tags: p.tags,
      status: mapPostStatus(p.status),
      metaTitle: p.metaTitle,
      metaDesc: p.metaDesc,
      canonical: p.canonical,
      ogTitle: p.ogTitle,
      ogDesc: p.ogDesc,
      ogImage: p.ogImage,
      authorId: p.authorId,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    };
  },
  update: async (id: string, data: Partial<Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>>): Promise<BlogPost> => {
    const p = await prisma.blogPost.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.slug !== undefined && { slug: data.slug }),
        ...(data.content !== undefined && { content: data.content }),
        ...(data.excerpt !== undefined && { excerpt: data.excerpt }),
        ...(data.category !== undefined && { category: data.category }),
        ...(data.categoryIds !== undefined && { categoryIds: data.categoryIds }),
        ...(data.featuredImage !== undefined && { featuredImage: data.featuredImage }),
        ...(data.tags !== undefined && { tags: data.tags }),
        ...(data.status !== undefined && { status: toDbPostStatus(data.status) }),
        ...(data.metaTitle !== undefined && { metaTitle: data.metaTitle }),
        ...(data.metaDesc !== undefined && { metaDesc: data.metaDesc }),
        ...(data.canonical !== undefined && { canonical: data.canonical }),
        ...(data.ogTitle !== undefined && { ogTitle: data.ogTitle }),
        ...(data.ogDesc !== undefined && { ogDesc: data.ogDesc }),
        ...(data.ogImage !== undefined && { ogImage: data.ogImage }),
        ...(data.authorId !== undefined && { authorId: data.authorId }),
      },
    });
    return {
      id: p.id,
      title: p.title,
      slug: p.slug,
      content: p.content,
      excerpt: p.excerpt,
      category: p.category,
      categoryIds: p.categoryIds,
      featuredImage: p.featuredImage,
      tags: p.tags,
      status: mapPostStatus(p.status),
      metaTitle: p.metaTitle,
      metaDesc: p.metaDesc,
      canonical: p.canonical,
      ogTitle: p.ogTitle,
      ogDesc: p.ogDesc,
      ogImage: p.ogImage,
      authorId: p.authorId,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    };
  },
  deleteById: async (id: string): Promise<void> => {
    await prisma.blogPost.delete({ where: { id } });
  },
};

export const blogCategoriesStore = {
  getAll: async (): Promise<BlogCategory[]> => {
    return prisma.blogCategory.findMany({ orderBy: { name: 'asc' } });
  },
  create: async (data: { id: string; name: string; slug: string }): Promise<BlogCategory> => {
    return prisma.blogCategory.create({ data });
  },
  deleteById: async (id: string): Promise<void> => {
    await prisma.blogCategory.delete({ where: { id } });
  },
};

export const emailConfigStore = {
  get: async (): Promise<EmailConfig> => {
    const row = await prisma.emailConfig.findUnique({ where: { id: 1 } });
    if (!row) return defaultEmailConfig;
    return {
      host: row.host,
      port: row.port,
      username: row.username,
      password: row.password,
      fromEmail: row.fromEmail,
      encryption: mapEncryption(row.encryption),
    };
  },
  save: async (config: EmailConfig): Promise<void> => {
    const enc = toDbEncryption(config.encryption);
    await prisma.emailConfig.upsert({
      where: { id: 1 },
      update: {
        host: config.host,
        port: config.port,
        username: config.username,
        password: config.password,
        fromEmail: config.fromEmail,
        encryption: enc,
      },
      create: {
        id: 1,
        host: config.host,
        port: config.port,
        username: config.username,
        password: config.password,
        fromEmail: config.fromEmail,
        encryption: enc,
      },
    });
  },
};

export const emailLogsStore = {
  getAll: async (): Promise<EmailLog[]> => {
    const rows = await prisma.emailLog.findMany({ orderBy: { sentAt: 'desc' } });
    return rows.map(l => ({
      id: l.id,
      to: l.to,
      subject: l.subject,
      sentAt: l.sentAt.toISOString(),
      status: mapEmailStatus(l.status),
      content: l.content,
      error: l.error ?? undefined,
    }));
  },
  add: async (log: EmailLog): Promise<void> => {
    await prisma.emailLog.create({
      data: {
        id: log.id,
        to: log.to,
        subject: log.subject,
        status: log.status === 'sent' ? EmailStatus.SENT : EmailStatus.FAILED,
        content: log.content,
        error: log.error,
      },
    });
  },
  findById: async (id: string): Promise<EmailLog | undefined> => {
    const l = await prisma.emailLog.findUnique({ where: { id } });
    if (!l) return undefined;
    return {
      id: l.id,
      to: l.to,
      subject: l.subject,
      sentAt: l.sentAt.toISOString(),
      status: mapEmailStatus(l.status),
      content: l.content,
      error: l.error ?? undefined,
    };
  },
};

export const activityLogsStore = {
  getAll: async (): Promise<ActivityLog[]> => {
    const rows = await prisma.activityLog.findMany({ orderBy: { createdAt: 'desc' }, take: 1000 });
    return rows.map(l => ({
      id: l.id,
      userId: l.userId,
      userEmail: l.userEmail,
      action: l.action,
      resource: l.resource,
      details: l.details,
      createdAt: l.createdAt.toISOString(),
    }));
  },
  add: async (log: ActivityLog): Promise<void> => {
    await prisma.activityLog.create({
      data: {
        id: log.id,
        userId: log.userId,
        userEmail: log.userEmail,
        action: log.action,
        resource: log.resource,
        details: log.details,
      },
    });
  },
};

export const pagesStore = {
  getAll: async (): Promise<PageContent[]> => {
    // Upsert default pages on first call if none exist
    const count = await prisma.page.count();
    if (count === 0) {
      await Promise.all(
        defaultPages.map(p =>
          prisma.page.upsert({
            where: { slug: p.slug },
            update: {},
            create: { slug: p.slug, title: p.title },
          })
        )
      );
    }
    const rows = await prisma.page.findMany({ orderBy: { slug: 'asc' } });
    return rows.map(p => ({
      slug: p.slug,
      title: p.title,
      content: p.content,
      metaTitle: p.metaTitle,
      metaDesc: p.metaDesc,
      canonical: p.canonical,
      ogTitle: p.ogTitle,
      ogDesc: p.ogDesc,
      ogImage: p.ogImage,
      updatedAt: p.updatedAt.toISOString(),
    }));
  },
  findBySlug: async (slug: string): Promise<PageContent | undefined> => {
    const p = await prisma.page.findUnique({ where: { slug } });
    if (!p) return undefined;
    return {
      slug: p.slug,
      title: p.title,
      content: p.content,
      metaTitle: p.metaTitle,
      metaDesc: p.metaDesc,
      canonical: p.canonical,
      ogTitle: p.ogTitle,
      ogDesc: p.ogDesc,
      ogImage: p.ogImage,
      updatedAt: p.updatedAt.toISOString(),
    };
  },
  upsert: async (slug: string, data: Partial<Omit<PageContent, 'slug' | 'updatedAt'>>): Promise<PageContent> => {
    const p = await prisma.page.upsert({
      where: { slug },
      update: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.content !== undefined && { content: data.content }),
        ...(data.metaTitle !== undefined && { metaTitle: data.metaTitle }),
        ...(data.metaDesc !== undefined && { metaDesc: data.metaDesc }),
        ...(data.canonical !== undefined && { canonical: data.canonical }),
        ...(data.ogTitle !== undefined && { ogTitle: data.ogTitle }),
        ...(data.ogDesc !== undefined && { ogDesc: data.ogDesc }),
        ...(data.ogImage !== undefined && { ogImage: data.ogImage }),
      },
      create: {
        slug,
        title: data.title ?? slug,
        content: data.content ?? '',
        metaTitle: data.metaTitle ?? '',
        metaDesc: data.metaDesc ?? '',
        canonical: data.canonical ?? '',
        ogTitle: data.ogTitle ?? '',
        ogDesc: data.ogDesc ?? '',
        ogImage: data.ogImage ?? '',
      },
    });
    return {
      slug: p.slug,
      title: p.title,
      content: p.content,
      metaTitle: p.metaTitle,
      metaDesc: p.metaDesc,
      canonical: p.canonical,
      ogTitle: p.ogTitle,
      ogDesc: p.ogDesc,
      ogImage: p.ogImage,
      updatedAt: p.updatedAt.toISOString(),
    };
  },
};

export const leadsFileStore = {
  getAll: async (): Promise<StoredLead[]> => {
    const rows = await prisma.lead.findMany({ orderBy: { createdAt: 'desc' } });
    return rows.map(l => ({
      id: l.id,
      firstName: l.firstName,
      lastName: l.lastName,
      email: l.email,
      phone: l.phone,
      serviceDate: l.serviceDate,
      serviceType: l.serviceType,
      originZip: l.originZip ?? undefined,
      destZip: l.destZip ?? undefined,
      homeSize: l.homeSize ?? undefined,
      estimate: l.estimate ?? undefined,
      createdAt: l.createdAt.toISOString(),
    }));
  },
  add: async (lead: StoredLead): Promise<void> => {
    await prisma.lead.create({
      data: {
        id: lead.id,
        firstName: lead.firstName,
        lastName: lead.lastName,
        email: lead.email,
        phone: lead.phone,
        serviceDate: lead.serviceDate,
        serviceType: lead.serviceType,
        originZip: lead.originZip,
        destZip: lead.destZip,
        homeSize: lead.homeSize,
        estimate: lead.estimate,
      },
    });
  },
  findById: async (id: string): Promise<StoredLead | undefined> => {
    const l = await prisma.lead.findUnique({ where: { id } });
    if (!l) return undefined;
    return {
      id: l.id,
      firstName: l.firstName,
      lastName: l.lastName,
      email: l.email,
      phone: l.phone,
      serviceDate: l.serviceDate,
      serviceType: l.serviceType,
      originZip: l.originZip ?? undefined,
      destZip: l.destZip ?? undefined,
      homeSize: l.homeSize ?? undefined,
      estimate: l.estimate ?? undefined,
      createdAt: l.createdAt.toISOString(),
    };
  },
  deleteById: async (id: string): Promise<void> => {
    await prisma.lead.delete({ where: { id } });
  },
};

export const marketRatesStore = {
  get: async (): Promise<Record<string, unknown> | null> => {
    const row = await prisma.setting.findUnique({ where: { id: 1 } });
    if (!row?.marketRates) return null;
    return row.marketRates as Record<string, unknown>;
  },
  save: async (data: Record<string, unknown>): Promise<void> => {
    const jsonData = data as Prisma.InputJsonValue;
    await prisma.setting.upsert({
      where: { id: 1 },
      update: { marketRates: jsonData },
      create: { id: 1, marketRates: jsonData },
    });
  },
};

// ─── Default email templates ──────────────────────────────────────────────────

const defaultEmailTemplates: Array<{ id: string; key: string; name: string; subject: string; defaultContent: string; variables: string[] }> = [
  {
    id: 'tpl-lead-confirmation',
    key: 'lead_confirmation',
    name: 'Lead Confirmation',
    subject: 'Your moving estimate request – {{service}}',
    defaultContent: `<p>Hi {{name}},</p>
<p>Thank you for requesting a moving estimate. We have received your inquiry and will be in touch shortly.</p>
<p><strong>Your Request Details:</strong></p>
<ul>
  <li>Service: {{service}}</li>
  <li>Service Date: {{service_date}}</li>
  <li>Estimated Cost: {{estimate}}</li>
  <li>Origin ZIP: {{origin_zip}}</li>
  <li>Destination ZIP: {{dest_zip}}</li>
  <li>Home Size: {{home_size}}</li>
  <li>Phone: {{phone}}</li>
</ul>
<p>Best regards,<br>{{company_name}}</p>`,
    variables: ['{{name}}', '{{email}}', '{{phone}}', '{{service}}', '{{estimate}}', '{{service_date}}', '{{origin_zip}}', '{{dest_zip}}', '{{home_size}}', '{{company_name}}'],
  },
  {
    id: 'tpl-admin-notification',
    key: 'admin_notification',
    name: 'Admin Notification (New Lead)',
    subject: 'New lead received – {{name}}',
    defaultContent: `<p>A new lead has been submitted.</p>
<p><strong>Lead Details:</strong></p>
<ul>
  <li>Name: {{name}}</li>
  <li>Email: {{email}}</li>
  <li>Phone: {{phone}}</li>
  <li>Service: {{service}}</li>
  <li>Estimated Cost: {{estimate}}</li>
  <li>Service Date: {{service_date}}</li>
  <li>Origin ZIP: {{origin_zip}}</li>
  <li>Destination ZIP: {{dest_zip}}</li>
  <li>Home Size: {{home_size}}</li>
</ul>`,
    variables: ['{{name}}', '{{email}}', '{{phone}}', '{{service}}', '{{estimate}}', '{{service_date}}', '{{origin_zip}}', '{{dest_zip}}', '{{home_size}}'],
  },
  {
    id: 'tpl-receipt-acknowledgement',
    key: 'receipt_acknowledgement',
    name: 'Receipt / Acknowledgement',
    subject: 'We received your request – {{company_name}}',
    defaultContent: `<p>Hi {{name}},</p>
<p>This is a confirmation that we have received your moving estimate request. Our team will review it and contact you within 24 hours.</p>
<p><strong>Summary:</strong></p>
<ul>
  <li>Service: {{service}}</li>
  <li>Service Date: {{service_date}}</li>
  <li>Estimated Cost: {{estimate}}</li>
  <li>Origin ZIP: {{origin_zip}}</li>
  <li>Destination ZIP: {{dest_zip}}</li>
  <li>Home Size: {{home_size}}</li>
</ul>
<p>Best regards,<br>{{company_name}}</p>`,
    variables: ['{{name}}', '{{email}}', '{{phone}}', '{{service}}', '{{estimate}}', '{{service_date}}', '{{origin_zip}}', '{{dest_zip}}', '{{home_size}}', '{{company_name}}'],
  },
];

function mapEmailTemplate(t: { id: string; key: string; name: string; subject: string; htmlContent: string; defaultContent: string; variables: string[]; updatedAt: Date }): EmailTemplate {
  return {
    id: t.id,
    key: t.key,
    name: t.name,
    subject: t.subject,
    htmlContent: t.htmlContent || t.defaultContent,
    defaultContent: t.defaultContent,
    variables: t.variables,
    updatedAt: t.updatedAt.toISOString(),
  };
}

export const emailTemplatesStore = {
  getAll: async (): Promise<EmailTemplate[]> => {
    // Upsert defaults — always sync variables and defaultContent from code definitions
    await Promise.all(
      defaultEmailTemplates.map(tpl =>
        prisma.emailTemplate.upsert({
          where: { key: tpl.key },
          update: {
            variables: tpl.variables,
            defaultContent: tpl.defaultContent,
          },
          create: {
            id: tpl.id,
            key: tpl.key,
            name: tpl.name,
            subject: tpl.subject,
            htmlContent: tpl.defaultContent,
            defaultContent: tpl.defaultContent,
            variables: tpl.variables,
          },
        })
      )
    );
    const rows = await prisma.emailTemplate.findMany({ orderBy: { name: 'asc' } });
    return rows.map(mapEmailTemplate);
  },
  findById: async (id: string): Promise<EmailTemplate | undefined> => {
    const t = await prisma.emailTemplate.findUnique({ where: { id } });
    if (!t) return undefined;
    return mapEmailTemplate(t);
  },
  update: async (id: string, data: { subject?: string; htmlContent?: string }): Promise<EmailTemplate> => {
    const t = await prisma.emailTemplate.update({
      where: { id },
      data: {
        ...(data.subject !== undefined && { subject: data.subject }),
        ...(data.htmlContent !== undefined && { htmlContent: data.htmlContent }),
      },
    });
    return mapEmailTemplate(t);
  },
  restoreDefault: async (id: string): Promise<EmailTemplate> => {
    const existing = await prisma.emailTemplate.findUnique({ where: { id } });
    if (!existing) throw new Error('Template not found');
    const t = await prisma.emailTemplate.update({
      where: { id },
      data: { htmlContent: existing.defaultContent },
    });
    return mapEmailTemplate(t);
  },
};