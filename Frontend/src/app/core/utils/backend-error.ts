import { HttpErrorResponse } from '@angular/common/http';

type ErrorBody = {
  detail?: unknown;
  message?: unknown;
  error?: unknown;
  title?: unknown;
  errors?: unknown;
};

const GENERIC_SERVER_ERRORS = new Set([
  'Bad Request',
  'Unauthorized',
  'Forbidden',
  'Not Found',
  'Conflict',
  'Internal Server Error'
]);

export function backendErrorMessage(error: unknown, fallback: string): string {
  if (!(error instanceof HttpErrorResponse)) {
    return fallback;
  }

  if (error.status === 0) {
    return 'The server could not be reached. Please try again.';
  }

  const bodyMessage = messageFromBody(error.error);
  if (bodyMessage) {
    return bodyMessage;
  }

  return fallback;
}

function messageFromBody(body: unknown): string {
  if (!body) {
    return '';
  }

  if (typeof body === 'string') {
    return body.trim();
  }

  if (typeof body !== 'object') {
    return '';
  }

  const errorBody = body as ErrorBody;
  const validationMessage = messageFromValidationErrors(errorBody.errors);
  if (validationMessage) {
    return validationMessage;
  }

  const candidates = [
    errorBody.detail,
    errorBody.message,
    errorBody.title,
    errorBody.error
  ];

  for (const candidate of candidates) {
    if (typeof candidate !== 'string') continue;
    const message = candidate.trim();
    if (message && !GENERIC_SERVER_ERRORS.has(message)) {
      return message;
    }
  }

  return '';
}

function messageFromValidationErrors(errors: unknown): string {
  if (!errors || typeof errors !== 'object') {
    return '';
  }

  const messages = Object.values(errors)
    .flatMap(value => Array.isArray(value) ? value : [value])
    .filter((value): value is string => typeof value === 'string' && value.trim().length > 0);

  return messages.join(' ');
}
