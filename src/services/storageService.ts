export interface StoredFavourite {
  id: string;
  type: 'route' | 'stop';
  name: string;
  subtext?: string;
  addedAt: string;
}

export interface DemoTicket {
  ticketId: string;
  routeNumber: string;
  fromStop: string;
  toStop: string;
  fare: number;
  passengerCount: number;
  busType: string;
  bookingTime: string;
  qrCodeUrl?: string;
  validUntil: string;
}

const FAVOURITES_KEY = 'bmtc_demo_favourites';
const SEARCH_HISTORY_KEY = 'bmtc_demo_recent_searches';
const TICKETS_KEY = 'bmtc_demo_tickets';

export const storageService = {
  getFavourites(): StoredFavourite[] {
    try {
      const data = localStorage.getItem(FAVOURITES_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Failed to parse favourites from localStorage', e);
    }
    // Default initial favourites for a great demo experience
    return [
      { id: 'route-500', type: 'route', name: '500-D', subtext: 'Majestic ↔ Electronic City', addedAt: new Date().toISOString() },
      { id: 'route-335', type: 'route', name: '335-E', subtext: 'Majestic ↔ Whitefield Kadugodi', addedAt: new Date().toISOString() },
      { id: 'stop-silkboard', type: 'stop', name: 'Central Silk Board', subtext: 'South Zone Interchange', addedAt: new Date().toISOString() },
      { id: 'stop-kbs', type: 'stop', name: 'Kempegowda Bus Station (Majestic)', subtext: 'Central Terminal', addedAt: new Date().toISOString() },
    ];
  },

  saveFavourites(favs: StoredFavourite[]): void {
    try {
      localStorage.setItem(FAVOURITES_KEY, JSON.stringify(favs));
    } catch (e) {
      console.warn('Failed to save favourites to localStorage', e);
    }
  },

  isFavourite(id: string): boolean {
    return this.getFavourites().some(f => f.id === id);
  },

  toggleFavourite(item: { id: string; type: 'route' | 'stop'; name: string; subtext?: string }): boolean {
    const list = this.getFavourites();
    const existingIndex = list.findIndex(f => f.id === item.id);
    if (existingIndex >= 0) {
      list.splice(existingIndex, 1);
      this.saveFavourites(list);
      return false; // removed
    } else {
      list.unshift({ ...item, addedAt: new Date().toISOString() });
      this.saveFavourites(list);
      return true; // added
    }
  },

  getRecentSearches(): string[] {
    try {
      const data = localStorage.getItem(SEARCH_HISTORY_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Failed to parse searches', e);
    }
    return ['500-D', 'Electronic City', 'Whitefield', 'Hebbal', '290EN'];
  },

  addRecentSearch(query: string): void {
    if (!query || !query.trim()) return;
    const trimmed = query.trim();
    const list = this.getRecentSearches().filter(q => q.toLowerCase() !== trimmed.toLowerCase());
    list.unshift(trimmed);
    try {
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(list.slice(0, 8)));
    } catch (e) {
      console.warn('Failed to save search history', e);
    }
  },

  clearRecentSearches(): void {
    try {
      localStorage.removeItem(SEARCH_HISTORY_KEY);
    } catch (e) {
      console.warn('Failed to clear search history', e);
    }
  },

  getTickets(): DemoTicket[] {
    try {
      const data = localStorage.getItem(TICKETS_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Failed to parse demo tickets', e);
    }
    // Default sample ticket
    return [
      {
        ticketId: 'BMTC-TKT-884920',
        routeNumber: '500-D',
        fromStop: 'Kempegowda Bus Station (Majestic)',
        toStop: 'Electronic City Toll Gate',
        fare: 45,
        passengerCount: 1,
        busType: 'Electric AC',
        bookingTime: 'Today, 08:30 AM',
        validUntil: 'Today, 11:30 PM',
      },
    ];
  },

  saveTicket(ticket: DemoTicket): void {
    const tickets = this.getTickets();
    tickets.unshift(ticket);
    try {
      localStorage.setItem(TICKETS_KEY, JSON.stringify(tickets.slice(0, 10)));
    } catch (e) {
      console.warn('Failed to save demo ticket', e);
    }
  },
};
