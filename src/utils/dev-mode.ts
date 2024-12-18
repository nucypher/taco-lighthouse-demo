export function createTestBuffer(): ArrayBuffer {
  const testBuffer = new ArrayBuffer(1024);
  const testView = new Uint8Array(testBuffer);
  for (let i = 0; i < testView.length; i++) {
    testView[i] = i % 256;
  }
  return testBuffer;
}