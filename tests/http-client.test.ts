import axios from 'axios';
import { HttpClient } from '../src/utils/http-client';
import { RocketlaneConfig } from '../src/types/common';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('HttpClient', () => {
  let httpClient: HttpClient;
  let mockAxiosInstance: any;

  const config: RocketlaneConfig = {
    apiKey: 'test-api-key',
    baseUrl: 'https://api.test.com',
    timeout: 5000,
    retries: 2,
  };

  beforeEach(() => {
    mockAxiosInstance = {
      request: jest.fn(),
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() },
      },
    };

    mockedAxios.create.mockReturnValue(mockAxiosInstance);
    httpClient = new HttpClient(config);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create axios instance with correct config', () => {
    expect(mockedAxios.create).toHaveBeenCalledWith({
      baseURL: 'https://api.test.com',
      timeout: 5000,
      headers: {
        'Authorization': 'Bearer test-api-key',
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
  });

  it('should setup interceptors', () => {
    expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled();
    expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalled();
  });

  describe('HTTP methods', () => {
    beforeEach(() => {
      mockAxiosInstance.request.mockResolvedValue({ data: { success: true } });
    });

    it('should make GET requests', async () => {
      const params = { limit: 10 };
      await httpClient.get('/test', params);

      expect(mockAxiosInstance.request).toHaveBeenCalledWith({
        method: 'GET',
        url: '/test',
        params,
        data: undefined,
        headers: undefined,
      });
    });

    it('should make POST requests', async () => {
      const data = { name: 'Test' };
      await httpClient.post('/test', data);

      expect(mockAxiosInstance.request).toHaveBeenCalledWith({
        method: 'POST',
        url: '/test',
        data,
        params: undefined,
        headers: undefined,
      });
    });

    it('should make PUT requests', async () => {
      const data = { name: 'Updated' };
      await httpClient.put('/test/1', data);

      expect(mockAxiosInstance.request).toHaveBeenCalledWith({
        method: 'PUT',
        url: '/test/1',
        data,
        params: undefined,
        headers: undefined,
      });
    });

    it('should make DELETE requests', async () => {
      await httpClient.delete('/test/1');

      expect(mockAxiosInstance.request).toHaveBeenCalledWith({
        method: 'DELETE',
        url: '/test/1',
        data: undefined,
        params: undefined,
        headers: undefined,
      });
    });

    it('should make PATCH requests', async () => {
      const data = { status: 'updated' };
      await httpClient.patch('/test/1', data);

      expect(mockAxiosInstance.request).toHaveBeenCalledWith({
        method: 'PATCH',
        url: '/test/1',
        data,
        params: undefined,
        headers: undefined,
      });
    });
  });

  describe('Error handling', () => {
    it('should handle network errors', async () => {
      const error = new Error('Network Error');
      mockAxiosInstance.request.mockRejectedValue(error);

      await expect(httpClient.get('/test')).rejects.toThrow('Network Error');
    });

    it('should handle API errors', async () => {
      const error = {
        response: {
          status: 404,
          data: { message: 'Not found' },
        },
      };
      mockAxiosInstance.request.mockRejectedValue(error);

      await expect(httpClient.get('/test')).rejects.toThrow();
    });
  });

  describe('Retry logic', () => {
    it('should retry on 500 errors', async () => {
      const error = {
        response: { status: 500 },
      };
      
      mockAxiosInstance.request
        .mockRejectedValueOnce(error)
        .mockRejectedValueOnce(error)
        .mockResolvedValueOnce({ data: { success: true } });

      const result = await httpClient.get('/test');
      expect(result).toEqual({ success: true });
      expect(mockAxiosInstance.request).toHaveBeenCalledTimes(3);
    });

    it('should retry on 429 errors', async () => {
      const error = {
        response: { status: 429 },
      };
      
      mockAxiosInstance.request
        .mockRejectedValueOnce(error)
        .mockResolvedValueOnce({ data: { success: true } });

      const result = await httpClient.get('/test');
      expect(result).toEqual({ success: true });
      expect(mockAxiosInstance.request).toHaveBeenCalledTimes(2);
    });

    it('should not retry on 400 errors', async () => {
      const error = {
        response: { status: 400 },
      };
      
      mockAxiosInstance.request.mockRejectedValue(error);

      await expect(httpClient.get('/test')).rejects.toThrow();
      expect(mockAxiosInstance.request).toHaveBeenCalledTimes(1);
    });
  });
});