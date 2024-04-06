import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function toResult<T>(promise: Promise<T>) {
  return promise
    .then((data) => ({ ok: true as const, data, err: undefined }))
    .catch((err: unknown) => ({ ok: false as const, err, data: undefined }))
}
