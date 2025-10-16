/**
 * Storage utility functions for localStorage operations
 * 
 * This module provides functions for persisting and retrieving todo data
 * from browser localStorage with proper error handling and data validation.
 */

import type {
  Todo,
  StorageSchema,
  SerializedTodo,
  SerializedStorageSchema,
} from '../types/todo';
import { STORAGE_KEY, STORAGE_VERSION } from '../types/todo';

/**
 * Error thrown when localStorage is unavailable
 */
export class StorageUnavailableError extends Error {
  constructor(message = 'localStorage is not available') {
    super(message);
    this.name = 'StorageUnavailableError';
  }
}

/**
 * Error thrown when storage quota is exceeded
 */
export class StorageQuotaExceededError extends Error {
  constructor(message = 'Storage quota exceeded') {
    super(message);
    this.name = 'StorageQuotaExceededError';
  }
}

/**
 * Error thrown when stored data is invalid
 */
export class InvalidDataError extends Error {
  constructor(message = 'Invalid data format in storage') {
    super(message);
    this.name = 'InvalidDataError';
  }
}

/**
 * Checks if localStorage is available in the current environment
 * 
 * @returns true if localStorage is available and functional
 */
export const isLocalStorageAvailable = (): boolean => {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
};

/**
 * Serializes a Todo object for storage
 * Converts Date objects to ISO strings
 * 
 * @param todo - Todo object to serialize
 * @returns Serialized todo with dates as strings
 */
export const serializeTodo = (todo: Todo): SerializedTodo => {
  return {
    id: todo.id,
    text: todo.text,
    completed: todo.completed,
    createdAt: todo.createdAt.toISOString(),
    updatedAt: todo.updatedAt.toISOString(),
  };
};

/**
 * Deserializes a stored todo object
 * Converts ISO strings back to Date objects
 * 
 * @param serialized - Serialized todo from storage
 * @returns Todo object with Date instances
 */
export const deserializeTodo = (serialized: SerializedTodo): Todo => {
  return {
    id: serialized.id,
    text: serialized.text,
    completed: serialized.completed,
    createdAt: new Date(serialized.createdAt),
    updatedAt: new Date(serialized.updatedAt),
  };
};

/**
 * Validates a serialized todo object
 * 
 * @param data - Data to validate
 * @returns true if data is a valid serialized todo
 */
const isValidSerializedTodo = (data: unknown): data is SerializedTodo => {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  const todo = data as Record<string, unknown>;

  return (
    typeof todo.id === 'string' &&
    typeof todo.text === 'string' &&
    typeof todo.completed === 'boolean' &&
    typeof todo.createdAt === 'string' &&
    typeof todo.updatedAt === 'string' &&
    !isNaN(Date.parse(todo.createdAt)) &&
    !isNaN(Date.parse(todo.updatedAt))
  );
};

/**
 * Validates the storage schema
 * 
 * @param data - Data to validate
 * @returns true if data matches the storage schema
 */
const isValidStorageSchema = (data: unknown): data is SerializedStorageSchema => {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  const schema = data as Record<string, unknown>;

  return (
    typeof schema.version === 'string' &&
    Array.isArray(schema.todos) &&
    schema.todos.every(isValidSerializedTodo)
  );
};

/**
 * Saves todos to localStorage
 * 
 * @param todos - Array of todos to save
 * @throws {StorageUnavailableError} If localStorage is not available
 * @throws {StorageQuotaExceededError} If storage quota is exceeded
 */
export const saveTodos = (todos: Todo[]): void => {
  if (!isLocalStorageAvailable()) {
    throw new StorageUnavailableError();
  }

  const schema: StorageSchema = {
    todos,
    version: STORAGE_VERSION,
  };

  const serialized: SerializedStorageSchema = {
    todos: todos.map(serializeTodo),
    version: schema.version,
  };

  try {
    const data = JSON.stringify(serialized);
    localStorage.setItem(STORAGE_KEY, data);
  } catch (error) {
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      throw new StorageQuotaExceededError();
    }
    throw error;
  }
};

/**
 * Loads todos from localStorage
 * 
 * @returns Array of todos, or empty array if no data exists
 * @throws {StorageUnavailableError} If localStorage is not available
 * @throws {InvalidDataError} If stored data is invalid
 */
export const loadTodos = (): Todo[] => {
  if (!isLocalStorageAvailable()) {
    throw new StorageUnavailableError();
  }

  try {
    const data = localStorage.getItem(STORAGE_KEY);

    if (!data) {
      return [];
    }

    const parsed: unknown = JSON.parse(data);

    if (!isValidStorageSchema(parsed)) {
      throw new InvalidDataError();
    }

    return parsed.todos.map(deserializeTodo);
  } catch (error) {
    if (error instanceof InvalidDataError) {
      throw error;
    }
    if (error instanceof SyntaxError) {
      throw new InvalidDataError('Failed to parse stored data');
    }
    throw error;
  }
};

/**
 * Clears all todos from localStorage
 * 
 * @throws {StorageUnavailableError} If localStorage is not available
 */
export const clearTodos = (): void => {
  if (!isLocalStorageAvailable()) {
    throw new StorageUnavailableError();
  }

  localStorage.removeItem(STORAGE_KEY);
};

/**
 * Generates a UUID v4
 * Uses crypto.randomUUID() if available, falls back to a polyfill
 * 
 * @returns A UUID v4 string
 */
export const generateId = (): string => {
  // Use native crypto.randomUUID if available
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  // Fallback polyfill for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};
