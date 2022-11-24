import { formatISO } from 'date-fns';
import http from '../http-common';
import { Status } from '../types';

class StatusService {
  async getStatus(id: string): Promise<Status> {
    return http.get<Status>('/status', {
      headers: {
        id,
      },
    })
    .then(resp => resp.data);
  }

  async getStatuses(id: string, from: Date, to: Date): Promise<Status[]> {
    return http.get<Status[]>('/statuses', {
      headers: {
        id,
      },
      params: {
        from: from ? formatISO(from) : undefined,
        to: to ? formatISO(to) : undefined,
      }
    })
    .then(resp => resp.data);
  }

}

export default new StatusService();
