import { ServiceItem, ProjectItem, TestimonialItem, InquiryFormData, InquiryRecord, AdminStats, AdminUser } from '../types';

const API_BASE = '/api';

export async function fetchServices(): Promise<ServiceItem[]> {
  try {
    const res = await fetch(`${API_BASE}/services`);
    if (!res.ok) throw new Error('Failed to fetch services');
    const data = await res.json();
    return data.services || [];
  } catch (err) {
    console.error('API fetchServices error:', err);
    return [];
  }
}

export async function fetchServiceBySlug(slug: string): Promise<ServiceItem | null> {
  try {
    const res = await fetch(`${API_BASE}/services/${slug}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.service || null;
  } catch (err) {
    console.error(`API fetchServiceBySlug(${slug}) error:`, err);
    return null;
  }
}

export async function fetchProjects(category?: string, featured?: boolean): Promise<ProjectItem[]> {
  try {
    const params = new URLSearchParams();
    if (category && category !== 'All') params.set('category', category);
    if (featured) params.set('featured', 'true');

    const res = await fetch(`${API_BASE}/portfolio?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch projects');
    const data = await res.json();
    return data.projects || [];
  } catch (err) {
    console.error('API fetchProjects error:', err);
    return [];
  }
}

export async function fetchProjectBySlug(slug: string): Promise<ProjectItem | null> {
  try {
    const res = await fetch(`${API_BASE}/portfolio/${slug}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.project || null;
  } catch (err) {
    console.error(`API fetchProjectBySlug(${slug}) error:`, err);
    return null;
  }
}

export async function fetchTestimonials(): Promise<TestimonialItem[]> {
  try {
    const res = await fetch(`${API_BASE}/testimonials`);
    if (!res.ok) throw new Error('Failed to fetch testimonials');
    const data = await res.json();
    return data.testimonials || [];
  } catch (err) {
    console.error('API fetchTestimonials error:', err);
    return [];
  }
}

export async function submitInquiry(data: InquiryFormData): Promise<{ success: boolean; message: string; inquiryId?: string }> {
  const res = await fetch(`${API_BASE}/inquiries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const result = await res.json();
  if (!res.ok) {
    throw new Error(result.error || 'Failed to submit inquiry.');
  }

  return result;
}

export async function subscribeNewsletter(email: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/newsletter`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  const result = await res.json();
  if (!res.ok) {
    throw new Error(result.error || 'Failed to subscribe to newsletter.');
  }

  return result;
}

// Admin API
export async function adminLogin(email: string, password: string): Promise<{ user: AdminUser }> {
  const res = await fetch(`${API_BASE}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, session: 'cookie' }),
  });

  const result = await res.json();
  if (!res.ok) {
    throw new Error(result.error || 'Login failed.');
  }

  return result;
}

export async function hasAdminSession() {
  const res = await fetch(`${API_BASE}/admin/me`, { cache: 'no-store' });
  if (res.status === 401) return false;
  if (!res.ok) throw new Error('Could not check admin session.');
  return true;
}

export async function adminLogout() {
  const res = await fetch(`${API_BASE}/admin/logout`, { method: 'POST' });
  if (!res.ok) throw new Error('Could not sign out.');
}

export async function fetchAdminStats(): Promise<AdminStats> {
  const res = await fetch(`${API_BASE}/admin/stats`, { cache: 'no-store' });
  if (res.status === 401) throw new Error('Your session has expired.');

  if (!res.ok) throw new Error('Failed to fetch admin statistics');
  const data = await res.json();
  return data.stats;
}

export interface InquiryPage {
  inquiries: InquiryRecord[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export async function fetchAdminInquiries(status: string, search: string, page: number): Promise<InquiryPage> {
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  if (search) params.set('search', search);
  params.set('page', String(page));

  const res = await fetch(`${API_BASE}/inquiries?${params.toString()}`, {
    cache: 'no-store',
  });

  if (res.status === 401) throw new Error('Your session has expired.');
  if (!res.ok) throw new Error('Could not load inquiries.');
  return res.json();
}

export async function updateInquiryStatus(id: string, status: string, notes?: string): Promise<void> {
  const res = await fetch(`${API_BASE}/inquiries/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status, notes }),
  });

  if (!res.ok) throw new Error('Failed to update inquiry');
}

export async function deleteInquiry(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/inquiries/${id}`, {
    method: 'DELETE',
  });

  if (!res.ok) throw new Error('Failed to delete inquiry');
}
