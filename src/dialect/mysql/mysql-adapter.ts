import { Kysely } from '../../kysely.js'
import { DialectAdapter } from '../dialect-adapter.js'

const LOCK_ID = 'ea586330-2c93-47c8-908d-981d9d270f9d'
const LOCK_TIMEOUT_SECONDS = 60 * 60

export class MysqlAdapter implements DialectAdapter {
  get supportsTransactionalDdl(): boolean {
    return false
  }

  get supportsReturning(): boolean {
    return false
  }

  async acquireMigrationLock(db: Kysely<any>): Promise<void> {
    // Kysely uses a single connection to run the migrations. Because of that, we
    // can take a lock using `get_lock`. Locks acquired using `get_lock` get
    // released when the connection is destroyed (session ends) or when the lock
    // is released using `release_lock`. This way we know that the lock is either
    // released by us after successfull or failed migrations OR it's released by
    // mysql if the process gets killed for some reason.
    await db
      .raw(`select get_lock('${LOCK_ID}', ${LOCK_TIMEOUT_SECONDS})`)
      .execute()
  }

  async releaseMigrationLock(db: Kysely<any>): Promise<void> {
    await db.raw(`select release_lock('${LOCK_ID}')`).execute()
  }
}
