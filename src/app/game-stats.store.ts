import { Injectable, OnDestroy } from '@angular/core';
import {
  BehaviorSubject,
  distinctUntilChanged,
  distinctUntilKeyChanged,
  map,
  Observable,
  of,
  skipWhile,
  Subject,
  take,
  takeUntil,
  tap,
  withLatestFrom,
} from 'rxjs';
import { Conference, Team } from './data.models';
import { NbaService } from './nba.service';
import { CONFERENCES, DIVISIONS } from './constants';

export interface GameStatsState {
  teams: Array<Team>;
  selectedConference: Conference | null;
  selectedDivision: string;
  divisions: Array<string>;
  conferences: Array<Conference>;
}

const initialState: GameStatsState = {
  divisions: DIVISIONS,
  conferences: CONFERENCES,
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

  public filteredDivisions$ = this.state$.pipe(
    distinctUntilKeyChanged('selectedConference'),
    map((state) => {
      if (state.selectedConference !== null) {
        return state.divisions.filter((division) =>
          state.selectedConference!.divisions.includes(division)
        );
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
      let teams = state.teams;
      if (state.selectedConference !== null) {
        teams = teams.filter(
          (team) => team.conference === state.selectedConference!.name
        );
      }
      if (state.selectedDivision !== '') {
        teams = teams.filter(
          (team) => team.division === state.selectedDivision
        );
      }
      return teams;
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
        withLatestFrom(this.state$),
        tap(([division, state]) => {
          this.state.next({
            ...state,
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
        withLatestFrom(this.state$),
        tap(([conferenceName, state]) => {
          this.state.next({
            ...state,
            selectedConference:
              state.conferences.find((conf) => conf.name === conferenceName) ??
              null,
            selectedDivision: '',
          });
        }),
        takeUntil(this.onDestroy$)
      )
      .subscribe();
  }
}
