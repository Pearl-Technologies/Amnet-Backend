import { parentPort } from "worker_threads";

parentPort.on('message', (message) => {
//   console.log(`Received message from main thread: ${message}`);

  parentPort.postMessage('Hello from the worker thread!');
});
