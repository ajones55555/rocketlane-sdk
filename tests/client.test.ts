import { RocketlaneClient } from '../src/client';
import { RocketlaneConfig } from '../src/types/common';

describe('RocketlaneClient', () => {
  let client: RocketlaneClient;
  const mockConfig: RocketlaneConfig = {
    apiKey: 'test-api-key',
    baseUrl: 'https://api.test.com',
    timeout: 5000,
    retries: 2,
  };

  beforeEach(() => {
    client = new RocketlaneClient(mockConfig);
  });

  it('should initialize with correct configuration', () => {
    expect(client).toBeInstanceOf(RocketlaneClient);
  });

  it('should have all resource properties', () => {
    expect(client.tasks).toBeDefined();
    expect(client.projects).toBeDefined();
    expect(client.users).toBeDefined();
    expect(client.timeTracking).toBeDefined();
    expect(client.fields).toBeDefined();
    expect(client.phases).toBeDefined();
    expect(client.resourceAllocations).toBeDefined();
    expect(client.timeOffs).toBeDefined();
    expect(client.spaces).toBeDefined();
    expect(client.spaceDocuments).toBeDefined();
  });

  it('should throw error without API key', () => {
    expect(() => {
      new RocketlaneClient({ apiKey: '' } as RocketlaneConfig);
    }).toThrow();
  });

  it('should use default configuration values', () => {
    const client = new RocketlaneClient({ apiKey: 'test-key' });
    expect(client).toBeDefined();
  });

  describe('Resource initialization', () => {
    it('should initialize tasks resource', () => {
      expect(client.tasks).toHaveProperty('list');
      expect(client.tasks).toHaveProperty('get');
      expect(client.tasks).toHaveProperty('create');
      expect(client.tasks).toHaveProperty('update');
      expect(client.tasks).toHaveProperty('delete');
    });

    it('should initialize projects resource', () => {
      expect(client.projects).toHaveProperty('list');
      expect(client.projects).toHaveProperty('get');
      expect(client.projects).toHaveProperty('create');
      expect(client.projects).toHaveProperty('update');
      expect(client.projects).toHaveProperty('delete');
    });

    it('should initialize users resource', () => {
      expect(client.users).toHaveProperty('list');
      expect(client.users).toHaveProperty('get');
      expect(client.users).toHaveProperty('create');
      expect(client.users).toHaveProperty('update');
      expect(client.users).toHaveProperty('delete');
    });
  });
});