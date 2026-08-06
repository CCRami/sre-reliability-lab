export class DependencyError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "DependencyError";
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}
