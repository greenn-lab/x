export const HEALTH_SERVICE = {
  MARIADB: 'mariadb',
  MONGODB: 'mongodb',
  MONGODB_REPLICA_SET: 'mongodb-replica-set',
  MEMORY_HEAP: 'memory_heap',
  STORAGE: 'storage',
};

export const HEALTH_MESSAGE = {
  CHECK_FAILED: 'error.health.checkFailed',
  DATABASE_ERROR: 'error.health.databaseConnectionFailed',
  MONGODB_ERROR: 'error.health.mongodbConnectionFailed',
  MEMORY_ERROR: 'error.health.memoryExceeded',
  DISK_ERROR: 'error.health.diskSpaceExceeded',
};
