
 import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Status } from '@models';
import { BehaviorSubject, catchError, of, Subject, takeUntil } from 'rxjs';
import { StatusService } from '../shared/status.service';

@Component({
  selector: 'thermo-dashboard',
  templateUrl: './dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit, OnDestroy {

  readonly id = 'nwTKGCZVEMJCq_TIjlvjf8zJ7yFOAOEga3xnPeitsVc';

  private status = new BehaviorSubject<Status | null>(null);
  status$ = this.status.asObservable();

  private readonly destroy$ = new Subject();

  constructor(
    private readonly statusSvc: StatusService
  ) {}

  ngOnInit(): void {
      this.statusSvc.getStatus(this.id).pipe(
        catchError(err => {
          console.error(err);
          return of(null);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(this.status);
  }

  ngOnDestroy(): void {
      this.destroy$.next(undefined);
      this.destroy$.complete();
  }
}
