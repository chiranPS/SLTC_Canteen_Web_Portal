// Set Tokio worker threads limit to 1 before any other modules (including Prisma) load.
// This is critical for cPanel hosting to prevent OS Error 11 (Resource temporarily unavailable)
// which occurs when Prisma/Tokio tries to spawn thread-per-core on high-core hosts under tight NPROC limits (25 max).
process.env.TOKIO_WORKER_THREADS = '1';
process.env.UV_THREADPOOL_SIZE = '1';
