/**
 * Security utilities for data validation and sanitization
 * This file contains functions to ensure data integrity and security
 */

import { supabase } from '@/integrations/supabase/client';

/**
 * Validate and sanitize product data
 */
export const validateProductData = (data: any) => {
  if (!data || typeof data !== 'object') {
    return null;
  }

  // Required fields validation
  const requiredFields = ['id', 'name', 'base_price', 'stock_quantity'];
  for (const field of requiredFields) {
    if (!data[field]) {
      console.warn(`Missing required field: ${field}`);
      return null;
    }
  }

  // Type validation and sanitization
  const sanitized = {
    id: String(data.id).trim(),
    name: String(data.name).trim(),
    base_price: Math.max(0, Number(data.base_price) || 0),
    compare_price: data.compare_price ? Math.max(0, Number(data.compare_price)) : null,
    stock_quantity: Math.max(0, Number(data.stock_quantity) || 0),
    description: data.description ? String(data.description).trim() : '',
    status: data.status === 'active' ? 'active' : 'inactive',
    color_options: Array.isArray(data.color_options) ? data.color_options : [],
    size_options: Array.isArray(data.size_options) ? data.size_options : [],
    created_at: data.created_at || new Date().toISOString(),
    updated_at: data.updated_at || new Date().toISOString()
  };

  return sanitized;
};

/**
 * Validate and sanitize variant data
 */
export const validateVariantData = (data: any) => {
  if (!data || typeof data !== 'object') {
    return null;
  }

  const requiredFields = ['product_id', 'color', 'size', 'price'];
  for (const field of requiredFields) {
    if (!data[field]) {
      console.warn(`Missing required variant field: ${field}`);
      return null;
    }
  }

  const sanitized = {
    product_id: String(data.product_id).trim(),
    color: String(data.color).trim(),
    size: String(data.size).trim(),
    price: Math.max(0, Number(data.price) || 0),
    sku: data.sku ? String(data.sku).trim() : `${data.product_id}-${data.size}-${data.color}`,
    stock_quantity: Math.max(0, Number(data.stock_quantity) || 0),
    is_active: Boolean(data.is_active),
    created_at: data.created_at || new Date().toISOString()
  };

  return sanitized;
};

/**
 * Validate user permissions for cart operations
 */
export const validateCartPermissions = async (userId: string, operation: 'read' | 'write' | 'delete') => {
  try {
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { allowed: false, reason: 'User not authenticated' };
    }

    // Check if user ID matches
    if (user.id !== userId) {
      return { allowed: false, reason: 'Unauthorized access' };
    }

    // Additional permission checks can be added here
    // For example, check if user is banned, has exceeded limits, etc.

    return { allowed: true, reason: 'Access granted' };
  } catch (error) {
    console.error('Permission validation error:', error);
    return { allowed: false, reason: 'Permission check failed' };
  }
};

/**
 * Sanitize user input to prevent injection attacks
 */
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') {
    return '';
  }

  // Remove potentially dangerous characters
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .substring(0, 1000); // Limit length
};

/**
 * Validate quantity input
 */
export const validateQuantity = (quantity: number, maxStock: number): { valid: boolean; message?: string } => {
  if (!Number.isInteger(quantity) || quantity < 1) {
    return { valid: false, message: 'Quantity must be a positive integer' };
  }

  if (quantity > 5) {
    return { valid: false, message: 'Maximum quantity allowed is 5' };
  }

  if (quantity > maxStock) {
    return { valid: false, message: `Only ${maxStock} items available in stock` };
  }

  return { valid: true };
};

/**
 * Rate limiting for cart operations
 */
export const checkRateLimit = (userId: string, operation: string): boolean => {
  const key = `rate_limit_${userId}_${operation}`;
  const now = Date.now();
  const window = 60000; // 1 minute window
  const maxRequests = 10; // Max 10 requests per minute

  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      const data = JSON.parse(stored);
      if (now - data.timestamp < window) {
        if (data.count >= maxRequests) {
          return false; // Rate limit exceeded
        }
        data.count++;
      } else {
        data.count = 1;
        data.timestamp = now;
      }
      localStorage.setItem(key, JSON.stringify(data));
    } else {
      localStorage.setItem(key, JSON.stringify({ count: 1, timestamp: now }));
    }
    return true;
  } catch (error) {
    console.error('Rate limit check failed:', error);
    return true; // Allow if rate limiting fails
  }
};

/**
 * Log security events
 */
export const logSecurityEvent = (event: string, details: any, userId?: string) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    details,
    userId: userId || 'anonymous',
    userAgent: navigator.userAgent,
    url: window.location.href
  };

  console.log('Security Event:', logEntry);
  
  // In production, this should be sent to a logging service
  // For now, we'll just log to console
};

/**
 * Check if the current session is secure
 */
export const isSecureSession = (): boolean => {
  // Check if running on HTTPS
  if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
    return false;
  }

  // Check if cookies are secure
  if (document.cookie && !document.cookie.includes('Secure')) {
    return false;
  }

  return true;
};
