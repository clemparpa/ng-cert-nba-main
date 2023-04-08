import { Injectable, OnDestroy, inject } from '@angular/core';
import { NbaService } from '../nba.service';
import {
  BehaviorSubject,
  Subject,
  Subscription,
  map,
  skipWhile,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';
import { Game, Team } from '../data.models';
import { GameStatsStore } from '../game-stats/game-stats.store';

@Injectable()
export class TeamStatsStore implements OnDestroy {
  private nbaService = inject(NbaService);
  private gameStatsStore = inject(GameStatsStore);

  private gamesSubject = new BehaviorSubject<Game[]>([]);
  private onDestroy$ = new Subject<void>();
  private team: Team | null = null;

  public games$ = this.gamesSubject.asObservable();

  public stats$ = this.games$.pipe(
    skipWhile(() => this.team === null),
    map((games) => this.nbaService.getStatsFromGames(games, this.team as Team))
  );

  public days$ = this.gameStatsStore.days$;

  public setTeam(team: Team) {
    this.team = team;
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  public onDaysChangeEffect(): Subscription {
    return this.gameStatsStore.days$
      .pipe(
        skipWhile(() => this.team === null),
        switchMap((days) =>
          this.nbaService
            .getLastResults(this.team as Team, days)
            .pipe(tap((games) => this.gamesSubject.next(games)))
        ),
        takeUntil(this.onDestroy$)
      )
      .subscribe();
  }
}
