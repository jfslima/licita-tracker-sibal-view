/**
 * Converte chaves de objeto de snake_case para camelCase recursivamente
 */
export function camelizeKeys(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => camelizeKeys(item));
  }

  if (typeof obj === 'object' && obj.constructor === Object) {
    const camelized: any = {};
    
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
        camelized[camelKey] = camelizeKeys(obj[key]);
      }
    }
    
    return camelized;
  }

  return obj;
}

/**
 * Converte chaves de objeto de camelCase para snake_case recursivamente
 */
export function snakeCaseKeys(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => snakeCaseKeys(item));
  }

  if (typeof obj === 'object' && obj.constructor === Object) {
    const snakeCased: any = {};
    
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        snakeCased[snakeKey] = snakeCaseKeys(obj[key]);
      }
    }
    
    return snakeCased;
  }

  return obj;
}