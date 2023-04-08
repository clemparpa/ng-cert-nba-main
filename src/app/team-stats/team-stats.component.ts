import { Component, Input, OnInit, inject } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Game, Stats, Team } from '../data.models';
import { TeamStatsStore } from './team-stats.store';
import { NbaService } from '../nba.service';

@Component({
  selector: 'app-team-stats',
  templateUrl: './team-stats.component.html',
  styleUrls: ['./team-stats.component.css'],
  providers: [TeamStatsStore],
})
export class TeamStatsComponent implements OnInit {
  @Input()
  team!: Team;

  private store = inject(TeamStatsStore);
  public nbaService = inject(NbaService);
  public games$: Observable<Game[]> = this.store.games$;
  public stats$: Observable<Stats> = this.store.stats$;
  public days$: Observable<number> = this.store.days$;

  ngOnInit(): void {
    this.store.setTeam(this.team);
    this.store.onDaysChangeEffect();
  }
}
