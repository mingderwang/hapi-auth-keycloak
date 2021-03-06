const nock = require('nock')
const test = require('ava')
const helpers = require('./_helpers')
const fixtures = require('./fixtures')

const cfg = helpers.getOptions({ entitlement: true })
const targetScope = [...fixtures.targetScope, 'scope:foo.READ', 'scope:foo.WRITE']

test.afterEach.always('reset instances and prototypes', () => {
  nock.cleanAll()
})

test.cb.serial('authentication does succeed', (t) => {
  const mockReq = helpers.mockRequest(`bearer ${fixtures.composeJwt('rpt')}`)

  helpers.mockEntitlement(200, fixtures.content.rpt)

  helpers.getServer(cfg, (server) => {
    server.inject(mockReq, (res) => {
      t.truthy(res)
      t.is(res.statusCode, 200)
      t.deepEqual(JSON.parse(res.payload).sort(), targetScope)
      t.end()
    })
  })
})

test.cb.serial('authentication does succeed – cached', (t) => {
  const mockReq = helpers.mockRequest(`bearer ${fixtures.composeJwt('rpt')}`)

  helpers.mockEntitlement(200, fixtures.content.rpt)

  helpers.getServer(Object.assign({ cache: true }, cfg), (server) => {
    server.inject(mockReq, () => {
      server.inject(mockReq, (res) => {
        t.truthy(res)
        t.is(res.statusCode, 200)
        t.deepEqual(JSON.parse(res.payload).sort(), targetScope)
        t.end()
      })
    })
  })
})

test.cb.serial('authentication does success – valid roles', (t) => {
  const mockReq = helpers.mockRequest(`bearer ${fixtures.composeJwt('rpt')}`, '/role')

  helpers.mockEntitlement(200, fixtures.content.rpt)

  helpers.getServer(cfg, (server) => {
    server.inject(mockReq, (res) => {
      t.truthy(res)
      t.is(res.statusCode, 200)
      t.deepEqual(JSON.parse(res.payload).sort(), targetScope)
      t.end()
    })
  })
})

test.cb.serial('authentication does success – valid roles', (t) => {
  const mockReq = helpers.mockRequest(`bearer ${fixtures.composeJwt('rpt')}`, '/role/rpt')

  helpers.mockEntitlement(200, fixtures.content.rpt)

  helpers.getServer(cfg, (server) => {
    server.inject(mockReq, (res) => {
      t.truthy(res)
      t.is(res.statusCode, 200)
      t.deepEqual(JSON.parse(res.payload).sort(), targetScope)
      t.end()
    })
  })
})

test.cb.serial('authentication does fail – invalid roles', (t) => {
  const mockReq = helpers.mockRequest(`bearer ${fixtures.composeJwt('rpt')}`, '/role/guest')

  helpers.mockEntitlement(200, fixtures.content.rpt)

  helpers.getServer(cfg, (server) => {
    server.inject(mockReq, (res) => {
      t.truthy(res)
      t.is(res.statusCode, 403)
      t.end()
    })
  })
})

test.cb.serial('authentication does fail – invalid token', (t) => {
  const mockReq = helpers.mockRequest(`bearer ${fixtures.composeJwt('rpt')}`)

  helpers.mockEntitlement(400, fixtures.content.rpt)

  helpers.getServer(cfg, (server) => {
    server.inject(mockReq, (res) => {
      t.truthy(res)
      t.is(res.statusCode, 401)
      t.is(res.headers['www-authenticate'], 'Bearer error="Invalid credentials"')
      t.end()
    })
  })
})

test.cb.serial('authentication does fail – invalid header', (t) => {
  const mockReq = helpers.mockRequest(fixtures.common.token)

  helpers.getServer(cfg, (server) => {
    server.inject(mockReq, (res) => {
      t.truthy(res)
      t.is(res.statusCode, 401)
      t.is(res.headers['www-authenticate'], 'Bearer error="Missing or invalid authorization header"')
      t.end()
    })
  })
})
