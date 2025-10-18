/**
 * Core type definitions for the Todo application
 * 
 * This file defines the data structures used throughout the application,
 * including the Todo entity and related types for state management.
 */

/**
 * Represents a single todo item
 * 
 * @property id - Unique identifier (UUID v4)
 * @property text - Task description (1-500 characters)
 * @property completed - Completion status
 * @property createdAt - Creation timestamp
 * @property updatedAt - Last modification timestamp
 */
export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Application state for managing todos
 * 
 * @property todos - Array of todo items
 * @property isLoading - Loading state indicator
 * @property error - Error message if any operation fails
 */
export interface TodoState {
  todos: Todo[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Storage schema for localStorage persistence
 * Includes version for future migration support
 * 
 * @property todos - Array of todo items to persist
 * @property version - Schema version for data migration
 */
export interface StorageSchema {
  todos: Todo[];
  version: string;
}

/**
 * Serialized todo format for storage
 * Dates are stored as ISO strings for JSON compatibility
 */
export interface SerializedTodo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Serialized storage schema
 */
export interface SerializedStorageSchema {
  todos: SerializedTodo[];
  version: string;
}

/**
 * Constants for the application
 */
export const STORAGE_KEY = 'todo-app-data';
export const STORAGE_VERSION = '1.0.0';
export const MAX_TEXT_LENGTH = 500;
export const MIN_TEXT_LENGTH = 1;
