// API client for Next.js API routes

const API_BASE_URL = '/api';

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

  async me() {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      credentials: 'include',
    });
    return handleResponse<{ username: string }>(response);
  },
};

// Wishlist types
export interface Wishlist {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
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
  imageUrl: string | null;
  purchaseUrls: Array<{ label: string; url: string; isPrimary: boolean }> | null;
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
  async getAll() {
    const response = await fetch(`${API_BASE_URL}/wishlists`, {
      credentials: 'include',
    });
    const data = await handleResponse<{ success: boolean; wishlists: Wishlist[] }>(response);
    return data.wishlists;
  },

  async getAllPublic() {
    const response = await fetch(`${API_BASE_URL}/public/wishlists`, {
      credentials: 'include',
    });
    const data = await handleResponse<{ success: boolean; wishlists: Wishlist[] }>(response);
    return data.wishlists;
  },

  async getOne(id: string) {
    const response = await fetch(`${API_BASE_URL}/wishlists/${id}`, {
      credentials: 'include',
    });
    const result = await handleResponse<{ success: boolean; wishlist: Wishlist }>(response);
    return result.wishlist;
  },

  async getBySlug(slug: string) {
    const response = await fetch(`${API_BASE_URL}/${slug}`, {
      credentials: 'include',
    });
    const result = await handleResponse<{ success: boolean; wishlist: Wishlist }>(response);
    return result.wishlist;
  },

  async create(data: Partial<Wishlist>) {
    const response = await fetch(`${API_BASE_URL}/wishlists`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    const result = await handleResponse<{ success: boolean; wishlist: Wishlist }>(response);
    return result.wishlist;
  },

  async update(id: string, data: Partial<Wishlist>) {
    const response = await fetch(`${API_BASE_URL}/wishlists/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    const result = await handleResponse<{ success: boolean; wishlist: Wishlist }>(response);
    return result.wishlist;
  },

  async delete(id: string) {
    const response = await fetch(`${API_BASE_URL}/wishlists/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    return handleResponse<void>(response);
  },
};

// Items API
export const itemsApi = {
  async getAll(wishlistId: string) {
    const response = await fetch(`${API_BASE_URL}/wishlists/${wishlistId}/items`, {
      credentials: 'include',
    });
    const result = await handleResponse<{ success: boolean; items: Item[] }>(response);
    return result.items;
  },

  async getOne(id: string) {
    const response = await fetch(`${API_BASE_URL}/items/${id}`, {
      credentials: 'include',
    });
    return handleResponse<Item>(response);
  },

  async create(wishlistId: string, data: Partial<Item>) {
    const response = await fetch(`${API_BASE_URL}/wishlists/${wishlistId}/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    return handleResponse<Item>(response);
  },

  async update(id: string, data: Partial<Item>) {
    const response = await fetch(`${API_BASE_URL}/items/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    return handleResponse<Item>(response);
  },

  async delete(id: string) {
    const response = await fetch(`${API_BASE_URL}/items/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    return handleResponse<void>(response);
  },

  async reorder(id: string, newOrder: number) {
    const response = await fetch(`${API_BASE_URL}/items/${id}/reorder`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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
  async scrapeUrl(url: string) {
    const response = await fetch(`${API_BASE_URL}/scrape`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ url }),
    });
    return handleResponse<ScrapedData>(response);
  },
};

// Settings API
export interface Settings {
  siteTitle: string;
  homepageSubtext: string;
}

export const settingsApi = {
  async getSettings() {
    const response = await fetch(`${API_BASE_URL}/settings`, {
      credentials: 'include',
    });
    const result = await handleResponse<{ success: boolean; settings: Settings }>(response);
    return result.settings;
  },

  async updateSettings(settings: Partial<Settings>) {
    const response = await fetch(`${API_BASE_URL}/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(settings),
    });
    return handleResponse<{ success: boolean; message: string }>(response);
  },
};
