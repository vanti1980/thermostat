import { Recurring } from '../types';

export class RecurringFormatterService {
  constructor(private readonly $t: any) {}

  getRDaysText(rUnit: Recurring['unit'], days: number[]): string {
    switch (rUnit) {
      case 'm':
        return this.$t(`schedule.monthDays`, { days: days.join(',') });
      case 'w':
        return days.map((day) => this.$t(`schedule.weekDays.${day}`)).join(',');
      default:
        return '';
    }
  }
  getREveryText(recurring: Recurring): string {
    return this.$t('schedule.recurring.every', {
      count: this.getRCountText(recurring.count),
      unit: this.$t(`schedule.unit.${recurring.unit}`),
    });
  }

  getRCountText(rCount: number | undefined): string {
    return `${rCount && rCount > 1 ? rCount : ''}`;
  }
  getRIntervalText(recurring: Recurring): string {
    const from = recurring.from;
    const to = recurring.to;
    return `${from?.substring(0, 2)}:${from?.substring(2)} - ${to?.substring(
      0,
      2,
    )}:${to?.substring(2)}`;
  }
}
