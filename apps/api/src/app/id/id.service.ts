import db from 'cyclic-dynamodb';
import { HttpException, HttpStatus } from '../shared/exceptions/http-exception';

const COLL_ID = 'id';

export class IdService {

  constructor() {}

  async getIds(): Promise<string[]> {
    const list = await db.collection(COLL_ID).list();
    return list.results.map((item) => item.key);
  }

  async createId(id: string): Promise<string> {
    return await db.collection(COLL_ID).set(id, {});
  }

  /**
   * Calls callback if ID is valid
   * @param id
   */
  async checkValidId(id: string): Promise<void> {
    const entry = await db.collection(COLL_ID).get(id);
    if (!entry) {
      throw new HttpException('Invalid Id', HttpStatus.BAD_REQUEST);
    }
  }
}
