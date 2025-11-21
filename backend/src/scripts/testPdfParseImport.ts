/**
 * Test pdf-parse import
 */

console.log('Testing pdf-parse import...')

// Try different import methods
try {
  console.log('\n1. Testing require import:')
  const pdf1 = require('pdf-parse')
  console.log('  Type:', typeof pdf1)
  console.log('  Keys:', Object.keys(pdf1).slice(0, 5))
  console.log('  Is function?', typeof pdf1 === 'function')
  console.log('  Has default?', pdf1.default !== undefined)
} catch (e: any) {
  console.log('  Error:', e.message)
}

// Try using it with pdfjs-dist
try {
  console.log('\n2. Testing with pdfjs-dist setup:')
  import('pdfjs-dist').then((pdfjs) => {
    console.log('  pdfjs-dist imported successfully')
    console.log('  pdfjs type:', typeof pdfjs)
  })
} catch (e: any) {
  console.log('  Error:', e.message)
}

// Try loading pdf-parse module directly
try {
  console.log('\n3. Direct module inspection:')
  const modulePath = require.resolve('pdf-parse')
  console.log('  Module path:', modulePath)
  const fs = require('fs')
  const packageJson = require('pdf-parse/package.json')
  console.log('  pdf-parse version:', packageJson.version)
  console.log('  Main entry:', packageJson.main)
} catch (e: any) {
  console.log('  Error:', e.message)
}
