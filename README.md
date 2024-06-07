# BrowserCookies
TypeScript / JavaScript library to manage cookies easy and securely

## Cookie Parameters
```
- expires: Date
- maxAge: number
- domain: string
- path: string
- sameSite: "Lax" | "Strict" | "None"
- secure: boolean
- partitioned: boolean
```

## Constants
```
- BROWSER_COOKIE_MAX_AGE_HOUR
- BROWSER_COOKIE_MAX_AGE_DAY
- BROWSER_COOKIE_MAX_AGE_YEAR
```


## Examples

### Setting cookie value and parameters

#### Set using `BrowserCookie` instance
```
let cookie = new BrowserCookie('hello', 'world', {maxAge: 60}); //creates a cookie instance that will expire in one minute
cookie.secure = true; //cookie will be sent through HTTPS protocol only
console.log(cookie.toString());

BrowserCookies.set(cookie); //sets the cookie (applies in the browser)
```

#### Set using `BrowserCookies` static methods
```
BrowserCookies.set('hello', 'world', {maxAge: 60, secure: true});
```

#### Set using `BrowserCookies` instance
```
let cookies = new BrowserCookies({domain: 'example.com', secure: true, path: '/test'}); //provide default values that will be applied to cookies when not set
cookie.set('hello', 'world', {maxAge: 60});
```

### Getting cookie value
```
let value = BrowserCookies.get('hello', 'example.com', '/test');
```

### Removing cookie

#### Simple cookie removal
```
BrowserCookie.remove('hello');
```


#### Scoped cookie removal
```
let cookies = new BrowserCookies({domain: 'example.org', path: '/test'}); //provide default values that will be applied to cookies when not set
cookies.remove('hello'); //automatically appies domain and path of the cookie scope to be removed
```

or

```
let cookie = new BrowserCookie('hello');
cookie.domain = 'example.org';
cookie.path = '/test';
BrowserCookies.remove(cookie);
```

### Listing all accessible cookies
```
let cookieMap = BrowserCookies.getAll();
for (const [key, value] of cookieMap.entries()) {
  console.log(`${key} = ${value}`);
}
```
