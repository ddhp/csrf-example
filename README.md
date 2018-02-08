# XSRF attack practice
This example shows how csrf attack works and how to mitigate it

## How to
- set two domain `http://csrf-attacker.local` and `http://csrf-victim.local` pointing to localhost by putting these two lines in your hosts file (`/etc/hosts`)
```
127.0.0.1 csrf-attacker.local
127.0.0.1 csrf-victim.local
```

- set these two domain to local port (nginx is recommended)
  - attacker: `:5000`
  - victim: `:5100`
  
  if your os is osx and using nginx, put following setting into your nginx.conf 
  (check your nginx installed path by `(sudo) nginx -t`

```
upstream csrf-victim_upstream {
  server 127.0.0.1:5100;
  keepalive 64;
}

upstream csrf-attacker_upstream {
  server 127.0.0.1:5000;
  keepalive 64;
}

server {
  listen 80;
  server_name csrf-victim.local;
  access_log      /usr/local/var/log/nginx/csrf-local.access.log;
  error_log       /usr/local/var/log/nginx/csrf-local.error.log;

  location / {
    proxy_redirect off;
    proxy_set_header   X-Real-IP            $remote_addr;
    proxy_set_header   X-Forwarded-For  $proxy_add_x_forwarded_for;
    proxy_set_header   X-Forwarded-Proto $scheme;
    proxy_set_header   Host                   $http_host;
    proxy_set_header   X-NginX-Proxy    true;
    proxy_set_header   Connection "";
    proxy_http_version 1.1;
    # proxy_cache one;
    # proxy_cache_key sfs$request_uri$scheme;
    proxy_pass         http://csrf-victim_upstream;
  }
}

# attacker server
server {
  listen 80;
  server_name csrf-attacker.local;
  access_log      /usr/local/var/log/nginx/csrf-local.access.log;
  error_log       /usr/local/var/log/nginx/csrf-local.error.log;

  location / {
    proxy_redirect off;
    proxy_set_header   X-Real-IP            $remote_addr;
    proxy_set_header   X-Forwarded-For  $proxy_add_x_forwarded_for;
    proxy_set_header   X-Forwarded-Proto $scheme;
    proxy_set_header   Host                   $http_host;
    proxy_set_header   X-NginX-Proxy    true;
    proxy_set_header   Connection "";
    proxy_http_version 1.1;
    # proxy_cache one;
    # proxy_cache_key sfs$request_uri$scheme;
    proxy_pass         http://csrf-attacker_upstream;
  }
}
```
- in two different terminal windows:
  - `cd victim && node server.js`
  - `cd attacker && node server.js`
- visit `http://csrf-victim.local` and press login
- visit `http://csrf-attacker.local` and check how csrf has done by **img** and **form post**
- press 2 buttons which would do AJAX request and see how `/api/vulnerable` is being hacked and `/api/protected` is fine
