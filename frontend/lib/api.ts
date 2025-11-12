// API client for communicating with the Express backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export interface ApiError {
  message: string;
  status: number;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw { message: error.message || 'An error occurred', status: response.status } as ApiError;
  }

  // Handle empty responses
  const text = await response.text();
  return text ? JSON.parse(text) : ({} as T);
}

// Auth API
export const authApi = {
  async login(username: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, password }),
    });
    return handleResponse<{ accessToken: string; refreshToken: string }>(response);
  },

  async logout() {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    return handleResponse<void>(response);
  },

  async refresh() {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });
    return handleResponse<{ accessToken: string }>(response);
  },

  async me(token: string) {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: 'include',
    });
    return handleResponse<{ username: string }>(response);
  },

  async changePassword(token: string, currentPassword: string, newPassword: string) {
    const response = await fetch(`${API_BASE_URL}/auth/password`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    return handleResponse<{ message: string }>(response);
  },
};

// Wishlist types
export interface Wishlist {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  notes: string | null;
  coverImage: string | null;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Item {
  id: string;
  wishlistId: string;
  name: string;
  description: string | null;
  price: number | null;
  currency: string;
  quantity: number;
  priority: 'low' | 'medium' | 'high';
  imageUrl: string | null;
  purchaseUrls: Array<{ label: string; url: string; isPrimary: boolean }> | null;
  notes: string | null;
  isArchived: boolean;
  claimedByName: string | null;
  claimedByNote: string | null;
  claimedAt: string | null;
  isPurchased: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

// Wishlists API
export const wishlistsApi = {
  async getAll(token: string) {
    const response = await fetch(`${API_BASE_URL}/wishlists`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: 'include',
    });
    return handleResponse<Wishlist[]>(response);
  },

  async getAllPublic() {
    const response = await fetch(`${API_BASE_URL}/public/wishlists`, {
      credentials: 'include',
    });
    return handleResponse<{ success: boolean; wishlists: Wishlist[] }>(response);
  },

  async getOne(token: string, id: string) {
    const response = await fetch(`${API_BASE_URL}/wishlists/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: 'include',
    });
    return handleResponse<Wishlist>(response);
  },

  async getBySlug(slug: string) {
    const response = await fetch(`${API_BASE_URL}/${slug}`, {
      credentials: 'include',
    });
    return handleResponse<Wishlist>(response);
  },

  async create(token: string, data: Partial<Wishlist>) {
    const response = await fetch(`${API_BASE_URL}/wishlists`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    return handleResponse<Wishlist>(response);
  },

  async update(token: string, id: string, data: Partial<Wishlist>) {
    const response = await fetch(`${API_BASE_URL}/wishlists/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    return handleResponse<Wishlist>(response);
  },

  async delete(token: string, id: string) {
    const response = await fetch(`${API_BASE_URL}/wishlists/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
      credentials: 'include',
    });
    return handleResponse<void>(response);
  },
};

// Items API
export const itemsApi = {
  async getAll(wishlistId: string, token?: string) {
    const headers: HeadersInit = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    const response = await fetch(`${API_BASE_URL}/wishlists/${wishlistId}/items`, {
      headers,
      credentials: 'include',
    });
    return handleResponse<Item[]>(response);
  },

  async getOne(id: string, token?: string) {
    const headers: HeadersInit = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    const response = await fetch(`${API_BASE_URL}/items/${id}`, {
      headers,
      credentials: 'include',
    });
    return handleResponse<Item>(response);
  },

  async create(token: string, wishlistId: string, data: Partial<Item>) {
    const response = await fetch(`${API_BASE_URL}/wishlists/${wishlistId}/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    return handleResponse<Item>(response);
  },

  async update(token: string, id: string, data: Partial<Item>) {
    const response = await fetch(`${API_BASE_URL}/items/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    return handleResponse<Item>(response);
  },

  async delete(token: string, id: string) {
    const response = await fetch(`${API_BASE_URL}/items/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
      credentials: 'include',
    });
    return handleResponse<void>(response);
  },

  async reorder(token: string, id: string, newOrder: number) {
    const response = await fetch(`${API_BASE_URL}/items/${id}/reorder`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
      body: JSON.stringify({ newOrder }),
    });
    return handleResponse<void>(response);
  },
};

// Claiming API (public)
export const claimingApi = {
  async claim(itemId: string, name?: string, note?: string) {
    const response = await fetch(`${API_BASE_URL}/public/items/${itemId}/claim`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name, note }),
    });
    return handleResponse<{ claimToken: string; message: string }>(response);
  },

  async unclaim(claimToken: string) {
    const response = await fetch(`${API_BASE_URL}/public/claims/${claimToken}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    return handleResponse<{ message: string }>(response);
  },

  async updateClaim(claimToken: string, name?: string, note?: string, isPurchased?: boolean) {
    const response = await fetch(`${API_BASE_URL}/public/claims/${claimToken}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name, note, isPurchased }),
    });
    return handleResponse<{ message: string }>(response);
  },
};

// Scraping API
export interface ScrapedData {
  title?: string;
  description?: string;
  price?: number;
  currency?: string;
  imageUrl?: string;
}

export const scrapingApi = {
  async scrapeUrl(token: string, url: string) {
    const response = await fetch(`${API_BASE_URL}/scrape`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
      body: JSON.stringify({ url }),
    });
    return handleResponse<ScrapedData>(response);
  },
};
