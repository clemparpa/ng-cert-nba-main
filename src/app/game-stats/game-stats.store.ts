import { Injectable, OnDestroy } from '@angular/core';
import {
  BehaviorSubject,
  distinctUntilChanged,
  distinctUntilKeyChanged,
  map,
  Observable,
  of,
  shareReplay,
  skipWhile,
  Subject,
  take,
  takeUntil,
  tap,
} from 'rxjs';
import { Conference, Team } from '../data.models';
import { NbaService } from '../nba.service';
import { CONFERENCES, DIVISIONS } from '../constants';

export interface GameStatsState {
  teams: Array<Team>;
  days: number;
  selectedConference: Conference | null;
  selectedDivision: string;
  divisions: Array<string>;
  conferences: Array<Conference>;
}

const initialState: GameStatsState = {
  divisions: DIVISIONS,
  conferences: CONFERENCES,
  days: 12,
  teams: [],
  selectedConference: null,
  selectedDivision: '',
};

@Injectable({
  providedIn: 'root',
})
export class GameStatsStore implements OnDestroy {
  private state = new BehaviorSubject<GameStatsState>(initialState);
  private onDestroy$ = new Subject<void>();

  public state$ = this.state.asObservable();

  public conferences$ = of(this.state.value.conferences);

  public days$ = this.state$.pipe(
    distinctUntilKeyChanged('days'),
    map((state) => state.days),
    shareReplay(1)
  );

  public filteredDivisions$ = this.state$.pipe(
    distinctUntilKeyChanged('selectedConference'),
    map((state) => {
      if (state.selectedConference !== null) {
        return state.selectedConference.divisions;
      }
      return state.divisions;
    })
  );

  public filteredTeams$ = this.state$.pipe(
    skipWhile((s) => s.teams.length === 0),
    distinctUntilChanged(
      (prevState, newState) =>
        prevState.selectedConference === newState.selectedConference &&
        prevState.selectedDivision === newState.selectedDivision
    ),
    map((state) => {
      if (state.selectedDivision !== '')
        return state.teams.filter(
          (team) => team.division === state.selectedDivision
        );
      if (state.selectedConference !== null)
        return state.teams.filter(
          (team) => team.conference === state.selectedConference!.name
        );
      return state.teams;
    })
  );

  constructor(private readonly nbaService: NbaService) {}

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  public async setTeams() {
    this.nbaService
      .getAllTeams()
      .pipe(
        take(1),
        map((teams) =>
          this.state.next({
            ...this.state.value,
            teams: teams,
          })
        )
      )
      .subscribe();
  }

  public getTeams() {
    return this.state.value.teams;
  }

  public updateDivision(divisionChange$: Observable<string>) {
    divisionChange$
      .pipe(
        tap((division) => {
          this.state.next({
            ...this.state.value,
            selectedDivision: division,
          });
        }),
        takeUntil(this.onDestroy$)
      )
      .subscribe();
  }

  public updateConference(conferenceChange$: Observable<string>) {
    conferenceChange$
      .pipe(
        tap((conferenceName) => {
          this.state.next({
            ...this.state.value,
            selectedConference:
              this.state.value.conferences.find(
                (conf) => conf.name === conferenceName
              ) ?? null,
            selectedDivision: '',
          });
        }),
        takeUntil(this.onDestroy$)
      )
      .subscribe();
  }

  public updateDays(daysChange$: Observable<number>) {
    daysChange$
      .pipe(
        tap((days) =>
          this.state.next({
            ...this.state.value,
            days: days,
          })
        ),
        takeUntil(this.onDestroy$)
      )
      .subscribe();
  }
}
