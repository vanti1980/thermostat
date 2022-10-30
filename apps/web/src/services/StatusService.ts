import http from '../http-common';
import { Status } from '../types';

class StatusService {
  getStatus(id: string): Promise<Status> {
    return http.get('/status', {
      headers: {
        id,
      },
    })
    .then(resp => resp.data);
  }
}

export default new StatusService();
