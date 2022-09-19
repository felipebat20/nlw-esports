

export function convertMinutesNumberToHourString(minutes: number) {
  return [String(Math.floor(minutes / 60)).padStart(2, '0'), String(minutes % 60).padStart(2, '0')].join(':');
}