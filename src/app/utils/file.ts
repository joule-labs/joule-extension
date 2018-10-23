export function blobToHex(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        if (reader.result) {
          const hex = Buffer.from(reader.result as string, 'binary').toString('hex')
          resolve(hex);
        } else {
          reject(new Error('File could not be read'));
        }
      });
      reader.readAsBinaryString(blob);
    } catch(err) {
      reject(err);
    }
  });
}