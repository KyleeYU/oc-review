const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const ts = require('typescript')
const source = fs.readFileSync('lib/courseDiscovery.ts', 'utf8')
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true } }).outputText
const moduleUnderTest = { exports: {} }
new Function('require', 'module', 'exports', compiled)(name => {
  if (name === '@/data/course-catalog.json') return require('../data/course-catalog.json')
  throw new Error(`Unexpected runtime dependency ${name}`)
}, moduleUnderTest, moduleUnderTest.exports)
const { courseIdentity, courseMetadata, discoverCourses } = moduleUnderTest.exports
const make = (id, name, count, rating) => ({ id, name, review_count: count, avg_rating: rating })
const items = [make(1, 'CS_OX 170', 4, 4), make(2, 'CS_OX 255', 0), make(3, 'ECON_OX 101', 8, 3.5), make(4, 'PHIL_OX 110', 4, 5)]
const filters = { search: '', subject: '', ger: '', introductory: false, sort: 'name' }
test('popular means count, not rating; unreviewed courses sort last', () => {
  assert.deepEqual(discoverCourses(items, { ...filters, sort: 'popular' }).map(x => x.id), [3, 1, 4, 2])
  assert.deepEqual(discoverCourses(items, { ...filters, sort: 'rating' }).map(x => x.id), [4, 1, 3, 2])
})
test('GER, subject and introductory filters intersect', () => {
  assert.deepEqual(discoverCourses(items, { ...filters, subject: 'CS', ger: 'QR', introductory: true }).map(x => x.id), [1])
  assert.deepEqual(discoverCourses(items, { ...filters, search: '经济学' }).map(x => x.id), [3])
})
test('catalog metadata is conservative and suffix-specific', () => {
  assert.deepEqual(courseMetadata('CS_OX 170').ger, ['QR'])
  assert.ok(courseMetadata('BIOL_OX 141 (L)').ger.includes('NS'))
  assert.equal(courseMetadata('BIOL_OX 141L').introductory, false)
  assert.equal(courseMetadata('CS_OX 171').introductory, false)
  assert.equal(courseMetadata('MATH_OX 112').introductory, false)
  assert.equal(courseMetadata('CS_OX 170').introductory, true)
  assert.equal(courseMetadata('UNKNOWN_OX 101').introductory, false)
  assert.deepEqual(courseMetadata('UNKNOWN_OX 101').ger, [])
  assert.ok(courseMetadata('ENG_OX 262W').ger.includes('CC'))
  assert.ok(courseMetadata('ART_OX 104E').ger.includes('XA'))
  assert.ok(!courseMetadata('ART_OX 104').ger.includes('XA'))
  assert.ok(courseMetadata('QTM_OX 110').ger.includes('QR'))
})
test('duplicate keys normalize spacing, case and optional suffixes, preserving different courses', () => {
  assert.equal(courseIdentity(' anth_ox 101 '), courseIdentity('ANTH_OX101'))
  assert.equal(courseIdentity('BIOL_OX 141 (L)'), courseIdentity('BIOL_OX 141L'))
  assert.notEqual(courseIdentity('BIOL_OX 141'), courseIdentity('BIOL_OX 141L'))
  assert.notEqual(courseIdentity('ENG_OX 262'), courseIdentity('ENG_OX 262W'))
})
test('sorting is deterministic, nonmutating and combines with search', () => {
  const before = [...items]
  assert.deepEqual(discoverCourses(items, { ...filters, search: 'CS', sort: 'popular' }).map(x => x.id), [1, 2])
  assert.deepEqual(items, before)
  assert.deepEqual(discoverCourses(items, { ...filters, subject: 'CHEM' }), [])
})
