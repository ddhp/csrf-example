# XSRF attack practice
This example shows how csrf attack works and how to mitigate it

## How to
- set two domain `http://csrf-attacker.local` and `http://csrf-victim.local` pointing to localhost
- set these two domain to local port (nginx is recommended)
  - attacker: `:5000`
  - victim: `:5100`
- in two different terminal windows:
  - `cd victim && node server.js`
  - `cd attacker && node server.js`
- visit `http://csrf-victim.local` and press login
- visit `http://csrf-attacker.local` and check how csrf has done by ****img* and *form post*
- press 2 buttons which would do AJAX request and see how vulnerable api is being hacked
