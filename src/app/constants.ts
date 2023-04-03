import { Conference } from './data.models';

export const CONFERENCES: Array<Conference> = [
  {
    name: 'West',
    label: 'Western',
    divisions: ['Northwest', 'Pacific', 'Southwest'],
  },
  {
    name: 'East',
    label: 'Eastern',
    divisions: ['Atlantic', 'Central', 'Southeast'],
  },
];

export const DIVISIONS: Array<string> = CONFERENCES.map(
  (conf) => conf.divisions
).flat();
