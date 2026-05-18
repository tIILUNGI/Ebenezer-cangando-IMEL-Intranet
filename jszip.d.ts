declare module 'jszip' {
  export function load(data: string | ArrayBuffer | Uint8Array, options?: any): Promise<JSZip>;
  export class JSZip {
    static load(data: string | ArrayBuffer | Uint8Array, options?: any): Promise<JSZip>;
    file(name: string, data: any, options?: any): JSZip;
    generateAsync(options: { type: string; compression?: string; compressionOptions?: any }): Promise<string>;
  }
}
