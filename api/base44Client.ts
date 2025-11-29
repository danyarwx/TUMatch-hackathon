// Base44 Client - Mock implementation for TUMatch
// In production, replace with actual Base44 SDK

interface User {
  id: string;
  email: string;
  full_name: string;
  profile_photo?: string;
  department?: string;
}

interface Entity {
  id: string;
  [key: string]: any;
}

// Mock storage using localStorage
const storage = {
  get: (key: string) => {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  },
  set: (key: string, value: any) => {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

// Mock current user
const mockUser: User = {
  id: 'user_1',
  email: 'student@tum.de',
  full_name: 'TUM Student',
  profile_photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TUMStudent',
  department: 'Computer Science'
};

class EntityManager {
  constructor(private entityName: string) {}

  async list(sortKey?: string, limit?: number): Promise<Entity[]> {
    let items = storage.get(this.entityName);

    // Apply sorting if sortKey provided
    if (sortKey) {
      const descending = sortKey.startsWith('-');
      const key = sortKey.replace(/^-/, '');
      items = items.sort((a: any, b: any) => {
        if (descending) {
          return b[key] > a[key] ? 1 : -1;
        }
        return a[key] > b[key] ? 1 : -1;
      });
    }

    // Apply limit
    if (limit) {
      items = items.slice(0, limit);
    }

    return items;
  }

  async filter(query: Record<string, any>): Promise<Entity[]> {
    const items = storage.get(this.entityName);
    return items.filter((item: any) => {
      return Object.keys(query).every(key => item[key] === query[key]);
    });
  }

  async create(data: Omit<Entity, 'id'>): Promise<Entity> {
    const items = storage.get(this.entityName);
    const newItem = {
      ...data,
      id: `${this.entityName}_${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    items.push(newItem);
    storage.set(this.entityName, items);
    return newItem;
  }

  async update(id: string, data: Partial<Entity>): Promise<Entity> {
    const items = storage.get(this.entityName);
    const index = items.findIndex((item: any) => item.id === id);
    if (index === -1) throw new Error('Entity not found');

    items[index] = { ...items[index], ...data, updated_at: new Date().toISOString() };
    storage.set(this.entityName, items);
    return items[index];
  }

  async delete(id: string): Promise<void> {
    const items = storage.get(this.entityName);
    const filtered = items.filter((item: any) => item.id !== id);
    storage.set(this.entityName, filtered);
  }

  async get(id: string): Promise<Entity | null> {
    const items = storage.get(this.entityName);
    return items.find((item: any) => item.id === id) || null;
  }
}

class IntegrationManager {
  Core = {
    async UploadFile({ file }: { file: File }): Promise<{ file_url: string }> {
      // In production, implement actual file upload
      // For now, return a placeholder or use FileReader to create data URL
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve({ file_url: reader.result as string });
        };
        reader.readAsDataURL(file);
      });
    }
  };
}

export const base44 = {
  auth: {
    async me(): Promise<User> {
      return mockUser;
    },
    async login(email: string, password: string): Promise<User> {
      return mockUser;
    },
    async logout(): Promise<void> {
      // Handle logout
    }
  },
  entities: {
    Event: new EntityManager('Event'),
    Moment: new EntityManager('Moment'),
    Friendship: new EntityManager('Friendship'),
  },
  integrations: new IntegrationManager(),
};

// Initialize with some sample data if empty
if (storage.get('Event').length === 0) {
  const sampleEvents = [
    {
      id: 'event_1',
      title: 'Machine Learning Workshop',
      description: 'Join us for an introductory workshop on ML algorithms and neural networks.',
      location: 'MI Building, Room 001',
      start_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      image_url: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800',
      organizer_id: 'user_3',
      organizer_name: 'Sara Chen',
      organizer_photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
      organizer_department: 'Informatics',
      category: 'workshop',
      max_participants: 30,
      participants: [
        {
          user_id: 'user_2',
          name: 'Alex Müller',
          photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'
        },
        {
          user_id: 'user_4',
          name: 'Lisa Wang',
          photo: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400'
        }
      ],
      created_at: new Date().toISOString()
    },
    {
      id: 'event_2',
      title: 'Coffee & Code Meetup',
      description: 'Casual coding session over coffee. Bring your laptop and projects!',
      location: 'TUM Café, Main Campus',
      start_time: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
      image_url: 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=800',
      organizer_id: 'user_2',
      organizer_name: 'Alex Müller',
      organizer_photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      organizer_department: 'Computer Science',
      category: 'coffee',
      max_participants: 15,
      participants: [
        {
          user_id: 'user_3',
          name: 'Sara Chen',
          photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400'
        },
        {
          user_id: 'user_4',
          name: 'Lisa Wang',
          photo: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400'
        }
      ],
      created_at: new Date().toISOString()
    },
    {
      id: 'event_3',
      title: 'Hackathon 2024',
      description: '48-hour hackathon focused on AI and sustainability solutions.',
      location: 'TUM Garching Campus',
      start_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      image_url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800',
      organizer_id: 'user_4',
      organizer_name: 'Lisa Wang',
      organizer_photo: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400',
      organizer_department: 'Data Science',
      category: 'hackathon',
      max_participants: 100,
      participants: [],
      created_at: new Date().toISOString()
    }
  ];
  storage.set('Event', sampleEvents);
}
