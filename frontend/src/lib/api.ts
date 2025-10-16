import axios, { AxiosInstance } from 'axios';
import { InteractionRequiredAuthError } from '@azure/msal-browser';
import { msalInstance } from '../index';
import { apiConfig } from '../config/authConfig';
import { Task } from '../features/tasks/types';
import { Category } from '../features/categories/types';
import {
  TaskCounts,
  TaskView,
  SortBy,
  CreateTaskDto,
  UpdateTaskDto,
  CreateStepDto,
  UpdateStepDto,
  CreateCategoryDto,
  UpdateCategoryDto,
} from '../types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: apiConfig.uri,
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      async (config) => {
        const isDevelopment = process.env.REACT_APP_BYPASS_AUTH === 'true';
        
        if (isDevelopment) {
          // In development mode, add a dummy token
          config.headers.Authorization = 'Bearer dev-token';
        } else {
          try {
            const accounts = msalInstance.getAllAccounts();
            if (accounts.length > 0) {
              const response = await msalInstance.acquireTokenSilent({
                scopes: apiConfig.scopes,
                account: accounts[0],
              });
              config.headers.Authorization = `Bearer ${response.accessToken}`;
            }
          } catch (error) {
            if (error instanceof InteractionRequiredAuthError) {
              // Redirect to login
              msalInstance.acquireTokenRedirect({
                scopes: apiConfig.scopes,
              });
            }
            throw error;
          }
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }

  // Tasks
  async getTaskCounts(): Promise<TaskCounts> {
    const response = await this.api.get<TaskCounts>('/tasks/counts');
    return response.data;
  }

  async getTasks(view?: TaskView, sortBy?: SortBy, categoryId?: string): Promise<Task[]> {
    const params = new URLSearchParams();
    if (view) params.append('view', view);
    if (sortBy) params.append('sortBy', sortBy);
    if (categoryId) params.append('categoryId', categoryId);
    
    const response = await this.api.get<Task[]>('/tasks', { params });
    return response.data;
  }

  async getTask(id: string): Promise<Task> {
    const response = await this.api.get<Task>(`/tasks/${id}`);
    return response.data;
  }

  async createTask(task: CreateTaskDto): Promise<Task> {
    const response = await this.api.post<Task>('/tasks', task);
    return response.data;
  }

  async updateTask(id: string, task: UpdateTaskDto): Promise<void> {
    await this.api.put(`/tasks/${id}`, task);
  }

  async deleteTask(id: string): Promise<void> {
    await this.api.delete(`/tasks/${id}`);
  }

  // Task Steps
  async addStep(taskId: string, step: CreateStepDto): Promise<void> {
    await this.api.post(`/tasks/${taskId}/steps`, step);
  }

  async updateStep(taskId: string, stepId: string, step: UpdateStepDto): Promise<void> {
    await this.api.put(`/tasks/${taskId}/steps/${stepId}`, step);
  }

  async deleteStep(taskId: string, stepId: string): Promise<void> {
    await this.api.delete(`/tasks/${taskId}/steps/${stepId}`);
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    const response = await this.api.get<Category[]>('/categories');
    return response.data;
  }

  async getCategory(id: string): Promise<Category> {
    const response = await this.api.get<Category>(`/categories/${id}`);
    return response.data;
  }

  async createCategory(category: CreateCategoryDto): Promise<Category> {
    const response = await this.api.post<Category>('/categories', category);
    return response.data;
  }

  async updateCategory(id: string, category: UpdateCategoryDto): Promise<void> {
    await this.api.put(`/categories/${id}`, category);
  }

  async deleteCategory(id: string): Promise<void> {
    await this.api.delete(`/categories/${id}`);
  }
}

const apiService = new ApiService();
export default apiService;
