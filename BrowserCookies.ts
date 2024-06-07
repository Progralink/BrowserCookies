/* 
 * BrowserCookies library v1.0.0
 * https://github.com/Progralink/BrowserCookies
 *
 * 
 * MIT License
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and
 * associated documentation files (the "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the
 * following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial
 * portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT
 * LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
 * NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

type BrowserCookieSameSite = 'Lax' | 'Strict' | 'None';

const BROWSER_COOKIE_MAX_AGE_HOUR = 60 * 60;
const BROWSER_COOKIE_MAX_AGE_DAY = 24 * 60 * 60;
const BROWSER_COOKIE_MAX_AGE_YEAR = 365 * 24 * 60 * 60;

interface BrowserCookieOptions {
    expires?: Date;
    maxAge?: number;
    domain?: string;
    path?: string;
    sameSite?: BrowserCookieSameSite;
    secure?: boolean;
    partitioned?: boolean;
}

class BrowserCookie implements BrowserCookieOptions {
    name: string = "";
    value?: string;
    expires?: Date;
    maxAge?: number;
    domain?: string;
    path?: string;
    sameSite?: BrowserCookieSameSite;
    secure?: boolean;
    partitioned?: boolean;

    constructor(name?: string, value?: string, options?: BrowserCookieOptions) {
        this.name = name ? name : '';
        this.value = value;
        this.apply(options);
    }

    public apply(options?: BrowserCookieOptions, overwrite?: boolean) {
        if (options) {
            if (options.expires && (this.expires === undefined || overwrite)) {
                this.expires = options.expires;
            }
            if (options.maxAge !== undefined && (this.maxAge === undefined || overwrite)) {
                this.maxAge = options.maxAge;
            }
            if (options.domain && (this.domain === undefined || overwrite)) {
                this.domain = options.domain;
            }
            if (options.path && (this.path === undefined || overwrite)) {
                this.path = options.path;
            }
            if (options.sameSite && (this.sameSite === undefined || overwrite)) {
                this.sameSite = options.sameSite;
            }
            if (options.secure !== undefined && (this.secure === undefined || overwrite)) {
                this.secure = options.secure;
            }
            if (options.partitioned !== undefined && (this.partitioned === undefined || overwrite)) {
                this.partitioned = options.partitioned;
            }
        }
    }

    public clone(): BrowserCookie {
        let cloned = new BrowserCookie();
        cloned.name = this.name;
        cloned.value = this.value;
        cloned.expires = this.expires;
        cloned.maxAge = this.maxAge;
        cloned.domain = this.domain;
        cloned.path = this.path;
        cloned.sameSite = this.sameSite;
        cloned.secure = this.secure;
        cloned.partitioned = this.partitioned;
        return cloned;
    }

    public toString() {
        let s = encodeURIComponent(this.name) + '=';
        if (this.value) {
            s += encodeURIComponent(this.value);
        }
        if (this.expires) {
            s += ';Expires=' + this.expires.toUTCString();
        }
        if (this.maxAge) {
            s += ';Max-Age=' + this.maxAge;
        }
        if (this.domain) {
            s += ';Domain=' + this.domain;
        }
        if (this.path) {
            s += ';Path=' + this.path;
        }
        if (this.sameSite) {
            s += ';SameSite=' + this.sameSite;
        }
        if (this.secure) {
            s += ';Secure';
        }
        if (this.partitioned) {
            s += ';Partitioned';
        }

        if (s.length > 4096) {
            throw new Error('Cookie "' + this.name + '" is too big');
        }

        return s;
    }
}

class BrowserCookies {
    [Symbol.iterator](): IterableIterator<[string, string]> {
        return this.entries();
    }

    public static readonly INSTANCE = new BrowserCookies();


    private static cookieMapCache?: Map<string, string>|null = null;
    private static cookieCacheSource?: string|null = null;

    constructor(private defaultOptions?: BrowserCookieOptions) {
    }

    public set(cookieOrName: BrowserCookie|string, value?: string, options?: BrowserCookieOptions): BrowserCookie {
        let cookie: BrowserCookie;
        if (typeof(cookieOrName) === 'string') {
            cookie = new BrowserCookie(cookieOrName as string, value);
        } else {
            cookie = cookieOrName.clone();
            if (value) {
                cookie.value = value;
            }
        }

        if (this.defaultOptions) {
            cookie.apply(this.defaultOptions, false);
        }

        if (options) {
            cookie.apply(options, true);
        }

        document.cookie = cookie.toString();
        
        BrowserCookies.cookieCacheSource = null;
        BrowserCookies.cookieMapCache = null;

        return cookie;
    }

    public remove(name: string, domain?: string, path?: string) {
        let cookie = new BrowserCookie();
        cookie.name = name;
        cookie.domain = domain;
        cookie.path = path;
        cookie.expires = new Date(0);
        this.set(cookie);
    }

    public entries(): IterableIterator<[string, string]> {
        return BrowserCookies.getInternalCookieMap().entries();
    }

    public has(name: string): boolean {
        return typeof(BrowserCookies.getInternalCookieMap().get(name)) ===  'string';
    }

    public get(name: string): string|undefined {
        return BrowserCookies.getInternalCookieMap().get(name);
    }

    public getAll(): Map<string, string> {
        return new Map(BrowserCookies.getInternalCookieMap()); //prevent modifications of the cache
    }


    public static set(cookieOrName: BrowserCookie|string, value?: string, options?: BrowserCookieOptions): BrowserCookie {
        return BrowserCookies.INSTANCE.set(cookieOrName, value, options);
    }

    public static remove(name: string, domain?: string, path?: string) {
        BrowserCookies.INSTANCE.remove(name, domain, path);
    }

    public static entries(): IterableIterator<[string, string]> {
        return BrowserCookies.INSTANCE.entries();
    }

    public static has(name: string): boolean {
        return BrowserCookies.INSTANCE.has(name);
    }

    public static get(name: string): string|undefined {
        return BrowserCookies.INSTANCE.get(name);
    }

    public static getAll(): Map<string, string> {
        return BrowserCookies.INSTANCE.getAll();
    }
    
    
    private static parse(cookiesString: string): Map<string, string> {
        let cookieMap = new Map<string, string>();
        if (cookiesString) {
            let startIndex = 0;
            let endIndex = 0;
            
            do {
                endIndex = cookiesString.indexOf(';', startIndex);
                if (endIndex == -1) {
                    endIndex = cookiesString.length;
                }
                
                let cookieKeyValue = cookiesString.substring(startIndex, endIndex);
                let separatorIndex = cookieKeyValue.indexOf('=');
                let name = decodeURIComponent(cookieKeyValue.substring(0, separatorIndex).trim());
                let value = decodeURIComponent(cookieKeyValue.substring(separatorIndex + 1, endIndex).trim());

                if (name) {
                    cookieMap.set(name, value);
                }

                startIndex = endIndex + 1;
            } while (startIndex < cookiesString.length);
        }

        return cookieMap;
    }

    private static getInternalCookieMap(): Map<string, string> {
        let cookieMap: Map<string, string>;
        let cookiesString = document.cookie;
        if (BrowserCookies.cookieMapCache && BrowserCookies.cookieCacheSource === cookiesString) {
            cookieMap = BrowserCookies.cookieMapCache;
        } else {
            cookieMap = BrowserCookies.parse(cookiesString);
            BrowserCookies.cookieMapCache = cookieMap;
            BrowserCookies.cookieCacheSource = cookiesString;
        }
        return cookieMap;
    }
}

(window as any).BrowserCookie = BrowserCookie;
(window as any).BrowserCookies = BrowserCookies;
