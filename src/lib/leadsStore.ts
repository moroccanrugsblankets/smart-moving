import { leadsFileStore } from './fileStore';

export interface Lead {
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

export async function addLead(lead: Omit<Lead, 'id' | 'createdAt'>): Promise<Lead> {
  const newLead: Lead = {
    ...lead,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  await leadsFileStore.add(newLead);
  return newLead;
}

export async function getLeads(): Promise<Lead[]> {
  return await leadsFileStore.getAll();
}
