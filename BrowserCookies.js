"use strict";
/*
 * BrowserCookies library v1.0.1
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
const BROWSER_COOKIE_MAX_AGE_HOUR = 60 * 60;
const BROWSER_COOKIE_MAX_AGE_DAY = 24 * 60 * 60;
const BROWSER_COOKIE_MAX_AGE_YEAR = 365 * 24 * 60 * 60;
class BrowserCookie {
    constructor(name, value, options) {
        this.name = "";
        this.name = name ? name : '';
        this.value = value;
        this.apply(options);
    }
    apply(options, overwrite) {
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
    clone() {
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
    toString() {
        let encodeSimple = function (part) {
            return part.replace("%", "%25").replace(";", "%3B");
        };
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
            s += ';Domain=' + encodeSimple(this.domain);
        }
        if (this.path) {
            s += ';Path=' + encodeSimple(this.path);
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
    [Symbol.iterator]() {
        return this.entries();
    }
    constructor(defaultOptions) {
        this.defaultOptions = defaultOptions;
    }
    set(cookieOrName, value, options) {
        let cookie;
        if (typeof (cookieOrName) === 'string') {
            cookie = new BrowserCookie(cookieOrName, value);
        }
        else {
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
    remove(name, domain, path) {
        let cookie = new BrowserCookie();
        cookie.name = name;
        cookie.domain = domain;
        cookie.path = path;
        cookie.expires = new Date(0);
        this.set(cookie);
    }
    entries() {
        return BrowserCookies.getInternalCookieMap().entries();
    }
    has(name) {
        return typeof (BrowserCookies.getInternalCookieMap().get(name)) === 'string';
    }
    get(name) {
        return BrowserCookies.getInternalCookieMap().get(name);
    }
    getAll() {
        return new Map(BrowserCookies.getInternalCookieMap()); //prevent modifications of the cache
    }
    static set(cookieOrName, value, options) {
        return BrowserCookies.INSTANCE.set(cookieOrName, value, options);
    }
    static remove(name, domain, path) {
        BrowserCookies.INSTANCE.remove(name, domain, path);
    }
    static entries() {
        return BrowserCookies.INSTANCE.entries();
    }
    static has(name) {
        return BrowserCookies.INSTANCE.has(name);
    }
    static get(name) {
        return BrowserCookies.INSTANCE.get(name);
    }
    static getAll() {
        return BrowserCookies.INSTANCE.getAll();
    }
    static parse(cookiesString) {
        let cookieMap = new Map();
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
    static getInternalCookieMap() {
        let cookieMap;
        let cookiesString = document.cookie;
        if (BrowserCookies.cookieMapCache && BrowserCookies.cookieCacheSource === cookiesString) {
            cookieMap = BrowserCookies.cookieMapCache;
        }
        else {
            cookieMap = BrowserCookies.parse(cookiesString);
            BrowserCookies.cookieMapCache = cookieMap;
            BrowserCookies.cookieCacheSource = cookiesString;
        }
        return cookieMap;
    }
}
BrowserCookies.INSTANCE = new BrowserCookies();
BrowserCookies.cookieMapCache = null;
BrowserCookies.cookieCacheSource = null;
window.BrowserCookie = BrowserCookie;
window.BrowserCookies = BrowserCookies;
