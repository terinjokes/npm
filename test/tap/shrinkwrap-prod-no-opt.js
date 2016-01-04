var fs = require('fs')
var path = require('path')

var mkdirp = require('mkdirp')
var mr = require('npm-registry-mock')
var osenv = require('osenv')
var rimraf = require('rimraf')
var test = require('tap').test

var common = require('../common-tap.js')
var npm = npm = require('../../')

var pkg = path.resolve(__dirname, 'shrinkwrap-prod-no-opt')

test('shrinkwrap should not include opt dependency', function (t) {
  t.plan(1)

  mr({port: common.port}, function (er, s) {
    setup(function (err) {
      if (err) return t.fail(err)

      npm.install('.', function (err) {
        if (err) return t.fail(err)

        npm.commands.shrinkwrap([], true, function (err, results) {
          if (err) return t.fail(err)

          t.deepEqual(results, desired)
          s.close()
          t.end()
        })
      })
    })
  })
})

test('cleanup', function (t) {
  cleanup()
  t.end()
})

var desired = {
  name: 'npm-test-shrinkwrap-prod-no-opt',
  version: '0.0.0',
  dependencies: {
    request: {
      version: '0.9.0',
      from: 'request@0.9.0',
      resolved: common.registry + '/request/-/request-0.9.0.tgz'
    }
  }
}

var json = {
  author: 'Terin Stock',
  name: 'npm-test-shrinkwrap-prod-no-opt',
  version: '0.0.0',
  dependencies: {
    request: '0.9.0'
  },
  optionalDependencies: {
    underscore: '1.5.1'
  }
}

function setup (cb) {
  cleanup()
  mkdirp.sync(pkg)
  fs.writeFileSync(path.join(pkg, 'package.json'), JSON.stringify(json, null, 2))
  process.chdir(pkg)

  var opts = {
    cache: path.resolve(pkg, 'cache'),
    registry: common.registry
  }
  npm.load(opts, cb)
}

function cleanup () {
  process.chdir(osenv.tmpdir())
  rimraf.sync(pkg)
}
