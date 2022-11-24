import http from '../http-common';
import { Schedule, ScheduleRequest } from '../types';

class ScheduleService {
  async getSchedules(
    id: string,
    status: 'active' | 'all' = 'active',
  ): Promise<Schedule[]> {
    return http
      .get<Schedule[]>('/schedule', {
        headers: {
          id,
        },
        params: {
          status,
        },
      })
      .then((resp) => resp.data);
  }

  async getSchedule(id: string, scheduleId: string): Promise<Schedule> {
    return http
      .get<Schedule>(`/schedule/${scheduleId}`, {
        headers: {
          id,
        },
      })
      .then((resp) => resp.data);
  }

  async createSchedule(
    id: string,
    request: ScheduleRequest,
  ): Promise<Schedule> {
    return http
      .post<Schedule>('/schedule', request, {
        headers: {
          id,
        },
      })
      .then((resp) => resp.data);
  }

  async deleteSchedule(id: string, scheduleId: string): Promise<void> {
    return http.delete(`/schedule/${scheduleId}`, {
      headers: {
        id,
      },
    });
  }

  async updateSchedule(
    id: string,
    scheduleId: string,
    schedule: Partial<Schedule>,
  ): Promise<Schedule> {
    return http
      .patch<Schedule>(`/schedule/${scheduleId}`, schedule, {
        headers: {
          id,
        },
      })
      .then((resp) => resp.data);
  }
}

export default new ScheduleService();
