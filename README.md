# hapi-auth-keycloak
#### JSON Web Token based Authentication powered by Keycloak

[![Travis](https://img.shields.io/travis/felixheck/wurst.svg)](https://travis-ci.org/felixheck/hapi-auth-keycloak/builds/) ![node](https://img.shields.io/node/v/hapi-auth-keycloak.svg) ![npm](https://img.shields.io/npm/dt/hapi-auth-keycloak.svg) [![standard](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](http://standardjs.com/) ![npm](https://img.shields.io/npm/l/hapi-auth-keycloak.svg) [![Coverage Status](https://coveralls.io/repos/github/felixheck/hapi-auth-keycloak/badge.svg?branch=master)](https://coveralls.io/github/felixheck/hapi-auth-keycloak?branch=master)
---

1. [Introduction](#introduction)
2. [Installation](#installation)
3. [Usage](#usage)
4. [API](#api)
5. [Example](#example)
6. [Developing and Testing](#developing-and-testing)
7. [Contribution](#contribution)

---

## Introduction
**hapi-auth-keycloak** is a plugin for [hapi.js][hapijs] which enables to protect your endpoints in a smart but professional manner using [Keycloak][keycloak] as authentication service. It is inspired by the related [express.js middleware][keycloak-node]. The plugin validates the passed [`Bearer` token][bearer] online with help of the [Keycloak][keycloak] server and optionally caches successfully validated tokens and the related user data using [`catbox`][catbox]. The caching enables a fast processing although the user data don't get changed until the token expires. It plays well with the [hapi.js][hapijs]-integrated [authentication feature][hapi-route-options]. Besides the authentication strategy it is possible to validate tokens by yourself, e.g. to authenticate incoming websocket or queue messages.

This plugin is implemented in ECMAScript 6 without any transpilers like [`babel`][babel].<br/>
Additionally [`standard`][standardjs] and [`ava`][avajs] are used to grant a high quality implementation.<br/>

## Installation
For installation use the [Node Package Manager][npm]:
```
$ npm install --save hapi-auth-keycloak
```

or clone the repository:
```
$ git clone https://github.com/felixheck/hapi-auth-keycloak
```

Alternatively use the [Yarn Package Manager][yarn]:
```
$ yarn add hapi-auth-keycloak
```

## Usage
#### Import
First you have to import the module:
``` js
const authKeycloak = require('hapi-auth-keycloak');
```

#### Create hapi server
Afterwards create your hapi server and the corresponding connection if not already done:
``` js
const server = new Hapi.Server();

server.connection({
  port: 8888,
  host: 'localhost',
});
```

#### Registration
Finally register the plugin, set the correct options and the authentication strategy:
``` js
server.register({
  register: authKeycloak,
  options: {
    client: {
      realmUrl: 'https://localhost:8080/auth/realms/testme',
      clientId: 'foobar',
      secret: '1234-bar-4321-foo'
    },
    cache: {},
    userInfo: ['name', 'email']
  }
}, function(err) {
  if (err) {
    throw err;
  }

  server.auth.strategy('keycloak-jwt', 'keycloak-jwt');
});
```

#### Route Configuration & Scope
Define your routes and add `keycloak-jwt` when necessary. It is possible to define the necessary scope like documented by the [express.js middleware][keycloak-node]:

- To secure a resource with an application role for the current app, use the role name (e.g. `editor`).
- To secure a resource with an application role for a different app, prefix the role name (e.g. `other-app:creator`)
- To secure a resource with a realm role, prefix the role name with `realm:` (e.g. `realm:admin`).

``` js
server.route([
  {
    method: 'GET',
    path: '/',
    config: {
      description: 'protected endpoint',
      auth: {
        strategies: ['keycloak-jwt'],
        access: {
          scope: ['realm:admin', 'editor', 'other-app:creator']
        }
      },
      handler (req, reply) {
        reply('hello world')
      }
    }
  },
])
```

## API
#### Plugin Options

- `realmUrl {string}`: The absolute uri of the Keycloak realm<br/>
Required. Example: `https://localhost:8080/auth/realms/testme`<br/>

- `clientId {string}` The identifier of the Keycloak client<br/>
Required. Example: `foobar`<br/>


- `secret {string}` The related secret of the Keycloak client<br/>
Required (or `publicKey`). Example: `1234-bar-4321-foo`<br/>

  
- `publicKey {string}` The related public key of the Keycloak client<br/>
Required (or `secret`). Example:
```
-----BEGIN RSA PUBLIC KEY-----
MIICCgKCAgEAur96MoQa/blg5eJFqmN//V4oQjKaBJl6KEvWSGAVgRm2PsnFKzCJ
K9aJrUjETS473/x6fAHXyF5QKun6avNxpWs2VzwlO4t8Bi2EpSW2w0led2OzR/MF
CYUX1Bg00OXLmdh0kvemABHXSOL4Zs4nN95rr77JsdG6ntylWmtnZlofySwLjFrX
B2JFpunl4n7eF7y8vD4Zyycvi+xl+OuMA6qomLQmfIDF0qJh0QMt/xh6CB4ooK5a
Fy6VHORU5gS6MoSgJ78ZPhqmKayRd6U0rhDOq7bWiVykktTPdB1X/YlMbQHonyqZ
0z2sh7e7olroUdE1FsDi0SdxV2Zzvff8IIPSGT74gQuaU4buoVUpMjSdXDfJw9m4
i/mhsZwX1/MUU8Oq1AsBHdgTkNVaVwFc6Z7AqJSGW/mxMKQqspOr+/BAM8pnw5BC
R/RnZBJfMjAYiSh6rVYuEWUBBLgZWIRNAMyRwS8OtWxADfOBtVwn8fmw8schro9X
D17VcqTdjlS1Mkr73ZoD1GagWZvuSOaz2P0PhnfapRUF1KkbjjnbyzLpfT8Mgovv
xBQJDIcRYL5oetXu//V5rNAr0na4zMBkPOi3ArpFp+Z4YKulYmSEG//216rLmzjl
WKEkH1OK39jddDrMTidlxDKY+THheyQBPZ6pFfbKEM5281glYjkeQpECAwEAAQ==
-----END RSA PUBLIC KEY-----
```

- `cache {Object|false}` — The configuration of the [hapi.js cache](https://hapijs.com/api#servercacheoptions) powered by [catbox][catbox].<br/>
If `false` the cache is disabled. Use an empty object (`{}`) to use the built-in default cache.<br/>
Optional. Default: `false`.

- `userInfo {Array.<?string>}` — List of properties which should be included in the `request.auth.credentials` object besides `scope` and `sub`.<br/>
Optional. Default: `[]`.<br/>

#### `server.kjwt.validate(field {string}, done {Function})`
- `field {string}` — The `Bearer` field, including the scheme (`bearer`) itself.<br/>
Example: `bearer 12345.abcde.67890`.<br/>
Required.

- `done {Function}` — The callback handler is passed `err {Error}, result {Object|false}` (error-first approach).<br/>If an error occurs, `err` is not `null`.  If the token is invalid, the `result` is `false`. Otherwise it is an object containing all relevant credentials.<br/>
Required.

## Example

``` js
const Hapi = require('hapi');
const authKeycloak = require('hapi-auth-keycloak');

const server = new Hapi.Server()
server.connection({ port: 3000, host: 'localhost' })

server.route([
  {
    method: 'GET',
    path: '/',
    config: {
      description: 'protected endpoint',
      auth: {
        strategies: ['keycloak-jwt'],
        access: {
          scope: ['realm:admin', 'editor', 'other-app:creator']
        }
      },
      handler (req, reply) {
        reply('hello world')
      }
    }
  },
])

process.on('SIGINT', () => {
  server.stop().then((err) => {
    process.exit((err) ? 1 : 0)
  })
})

server.register({
  register: authKeycloak,
  options: {
    client: {
      realmUrl: 'https://localhost:8080/auth/realms/testme',
      clientId: 'foobar',
      secret: '1234-bar-4321-foo'
    },
    cache: {},
    userInfo: ['name', 'email']
  }
}).then(() => {
  server.auth.strategy('keycloak-jwt', 'keycloak-jwt');
  server.start()
})
.catch(console.error)
```

## Developing and Testing
First you have to install all dependencies:
```
$ npm install
```

To execute all unit tests once, use:
```
$ npm test
```

or to run tests based on file watcher, use:
```
$ npm start
```

To get information about the test coverage, use:
```
$ npm run coverage
```

## Contribution
Fork this repository and push in your ideas.

Do not forget to add corresponding tests to keep up 100% test coverage.<br/>
For further information read the [contributing guideline](CONTRIBUTING.md).

[keycloak]: http://www.keycloak.org/
[keycloak-node]: https://keycloak.gitbooks.io/documentation/content/securing_apps/topics/oidc/nodejs-adapter.html
[hapijs]: https://hapijs.com/
[avajs]: https://github.com/avajs/ava
[standardjs]: https://standardjs.com/
[babel]: https://babeljs.io/
[npm]: https://github.com/npm/npm
[yarn]: https://yarnpkg.com
[jwt]: https://jwt.io/
[catbox]: https://github.com/hapijs/catbox
[bearer]: https://tools.ietf.org/html/rfc6750
[hapi-route-options]: https://hapijs.com/api#route-options
