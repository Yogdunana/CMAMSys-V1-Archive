import htmlDocx from 'html-docx-js/dist/html-docx';

const html = '<html><body><h1>Test</h1></body></html>';

// 尝试不同的调用方式
try {
  const result = htmlDocx(html);
  console.log('htmlDocx(html) - Success');
  console.log('Type:', typeof result);
  console.log('Length:', result.length);
} catch (e) {
  console.log('htmlDocx(html) - Failed:', e instanceof Error ? e.message : String(e));
}

try {
  const result = htmlDocx.asBlob(html);
  console.log('htmlDocx.asBlob(html) - Success');
  console.log('Type:', typeof result);
  console.log('Size:', result.size);
} catch (e) {
  console.log('htmlDocx.asBlob(html) - Failed:', e instanceof Error ? e.message : String(e));
}
