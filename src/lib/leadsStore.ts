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

export function addLead(lead: Omit<Lead, 'id' | 'createdAt'>): Lead {
  const newLead: Lead = {
    ...lead,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  leadsFileStore.add(newLead);
  return newLead;
}

export function getLeads(): Lead[] {
  return leadsFileStore.getAll();
}
