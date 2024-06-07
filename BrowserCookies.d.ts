type BrowserCookieSameSite = 'Lax' | 'Strict' | 'None';
declare const BROWSER_COOKIE_MAX_AGE_HOUR: number;
declare const BROWSER_COOKIE_MAX_AGE_DAY: number;
declare const BROWSER_COOKIE_MAX_AGE_YEAR: number;
interface BrowserCookieOptions {
    expires?: Date;
    maxAge?: number;
    domain?: string;
    path?: string;
    sameSite?: BrowserCookieSameSite;
    secure?: boolean;
    partitioned?: boolean;
}
declare class BrowserCookie implements BrowserCookieOptions {
    name: string;
    value?: string;
    expires?: Date;
    maxAge?: number;
    domain?: string;
    path?: string;
    sameSite?: BrowserCookieSameSite;
    secure?: boolean;
    partitioned?: boolean;
    constructor(name?: string, value?: string, options?: BrowserCookieOptions);
    apply(options?: BrowserCookieOptions, overwrite?: boolean): void;
    clone(): BrowserCookie;
    toString(): string;
}
declare class BrowserCookies {
    private defaultOptions?;
    [Symbol.iterator](): IterableIterator<[string, string]>;
    static readonly INSTANCE: BrowserCookies;
    private static cookieMapCache?;
    private static cookieCacheSource?;
    constructor(defaultOptions?: BrowserCookieOptions | undefined);
    set(cookieOrName: BrowserCookie | string, value?: string, options?: BrowserCookieOptions): BrowserCookie;
    remove(name: string, domain?: string, path?: string): void;
    entries(): IterableIterator<[string, string]>;
    has(name: string): boolean;
    get(name: string): string | undefined;
    getAll(): Map<string, string>;
    static set(cookieOrName: BrowserCookie | string, value?: string, options?: BrowserCookieOptions): BrowserCookie;
    static remove(name: string, domain?: string, path?: string): void;
    static entries(): IterableIterator<[string, string]>;
    static has(name: string): boolean;
    static get(name: string): string | undefined;
    static getAll(): Map<string, string>;
    private static parse;
    private static getInternalCookieMap;
}
