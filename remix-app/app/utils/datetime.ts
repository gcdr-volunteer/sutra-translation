import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

export const utcNow = (): string => dayjs.utc().format();
export const isXBeforeY = ({ x, y }: { x: string; y: string }) => dayjs(x).isBefore(dayjs(y));
