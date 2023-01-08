import crypto from 'crypto';
export const hash = (value: string) => crypto.createHash('sha1').update(value).digest('base64');
