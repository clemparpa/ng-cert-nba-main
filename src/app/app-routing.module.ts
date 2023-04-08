import { NgModule, inject } from '@angular/core';
import { CanActivateFn, RouterModule, Routes } from '@angular/router';
import { GameResultsComponent } from './game-results/game-results.component';
import { GameStatsComponent } from './game-stats/game-stats.component';
import { GameStatsStore } from './game-stats/game-stats.store';
import { map, tap } from 'rxjs';

const setGameStatsStoreGuard: CanActivateFn = () => {
  const store = inject(GameStatsStore);
  return store.state$.pipe(
    tap((s) => {
      if (s.teams.length === 0) store.setTeams();
    }),
    map((s) => true)
  );
};

const routes: Routes = [
  {
    path: 'results/:teamAbbr',
    component: GameResultsComponent,
  },
  {
    path: '**',
    component: GameStatsComponent,
    canActivate: [setGameStatsStoreGuard],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
