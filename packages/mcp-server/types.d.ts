// Declarações de tipos para módulos sem tipagem

declare module 'express' {
  import { EventEmitter } from 'events';
  
  export interface Request {
    headers: any;
    query: any;
    params: any;
    body: any;
    [key: string]: any;
  }
  
  export interface Response {
    status(code: number): Response;
    json(body: any): Response;
    send(body: any): Response;
    [key: string]: any;
  }
  
  export interface NextFunction {
    (err?: any): void;
  }
  
  export interface Express {
    use(...handlers: any[]): Express;
    get(path: string, ...handlers: any[]): Express;
    post(path: string, ...handlers: any[]): Express;
    listen(port: number | string, callback?: () => void): any; // Simplificado para evitar dependência do http
    [key: string]: any;
  }
  
  export interface Router {
    use(...handlers: any[]): Router;
    get(path: string, ...handlers: any[]): Router;
    post(path: string, ...handlers: any[]): Router;
    [key: string]: any;
  }
  
  function express(): Express;
  
  namespace express {
    export function Router(): Router;
    export interface Request extends Request {}
    export interface Response extends Response {}
    export interface NextFunction extends NextFunction {}
  }
  
  export default express;
}
declare module 'dotenv' {
  export function config(options?: { path: string }): void;
}

declare module '@modelcontextprotocol/sdk' {
  export function createMcpServer(): {
    tool: (name: string, schema: any, handler: Function) => void;
    chatCompletionProxy: (name: string, handler: Function) => void;
    router: () => any;
  };
  export const z: {
    object: (schema: Record<string, any>) => any;
    string: () => any;
    number: () => any;
    boolean: () => any;
    array: (type: any) => any;
  };
}

declare module 'cors' {
  function cors(options?: any): any;
  export default cors;
}

declare module 'groq' {
  export class Groq {
    constructor(options: { apiKey: string | undefined });
    chat: {
      completions: {
        create(params: any): Promise<any>;
      };
    };
  }
}

// Declaração para o node-fetch se estiver usando ESM
declare module 'node-fetch' {
  function fetch(url: string, init?: any): Promise<any>;
  export default fetch;
}
