declare module 'html-docx-js/dist/html-docx' {
  function htmlDocx(html: string): string;
  namespace htmlDocx {
    function asBlob(html: string): Blob;
  }
  export = htmlDocx;
}
