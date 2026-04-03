export class CranklyError extends Error {
  readonly code: string;
  readonly status?: number;

  constructor(message: string, code = "CRANKLY_ERROR", status?: number) {
    super(message);
    this.name = "CranklyError";
    this.code = code;
    this.status = status;
  }
}

export class NotFoundError extends CranklyError {
  constructor(message: string) {
    super(message, "NOT_FOUND", 404);
    this.name = "NotFoundError";
  }
}

export const toToolErrorMessage = (error: unknown): string => {
  if (error instanceof CranklyError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unexpected server error.";
};
