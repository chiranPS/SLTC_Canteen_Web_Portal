console.log('=== [PRESTART] Configuring thread limits ===');
process.env.TOKIO_WORKER_THREADS = '1';
process.env.UV_THREADPOOL_SIZE = '1';
console.log('=== [PRESTART] TOKIO_WORKER_THREADS set to:', process.env.TOKIO_WORKER_THREADS, '===');

