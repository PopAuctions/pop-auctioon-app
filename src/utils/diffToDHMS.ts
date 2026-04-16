export type DHMS = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  completed: boolean;
};

export function diffToDHMS(ms: number): DHMS {
  if (ms <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, completed: true };
  }
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds, completed: false };
}
