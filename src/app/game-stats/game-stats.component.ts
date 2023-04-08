import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Team } from '../data.models';
import { tap } from 'rxjs';
import { NbaService } from '../nba.service';
import { GameStatsStore } from '../game-stats.store';
import { NonNullableFormBuilder } from '@angular/forms';

@Component({
  selector: 'app-game-stats',
  templateUrl: './game-stats.component.html',
  styleUrls: ['./game-stats.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameStatsComponent {
  allTeams: Team[] = [];

  public divisionControl = this.fb.control<string>('');
  public conferenceControl = this.fb.control<string>('');
  public conferences$ = this.store.conferences$;
  public divisions$ = this.store.filteredDivisions$;
  public teams$ = this.store.filteredTeams$;

  constructor(
    private fb: NonNullableFormBuilder,
    private store: GameStatsStore,
    protected nbaService: NbaService
  ) {
    this.store.updateDivision(this.divisionControl.valueChanges);
    this.store.updateConference(
      this.conferenceControl.valueChanges.pipe(
        tap(() =>
          this.divisionControl.reset('', {
            emitEvent: false,
          })
        )
      )
    );
  }

  trackTeam(teamId: string): void {
    const team = this.store
      .getTeams()
      .find((team) => team.id === Number(teamId));
    if (team) this.nbaService.addTrackedTeam(team);
  }
}
