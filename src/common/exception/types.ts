export class ApiException extends Error {
  public statusText: string;
  constructor(
    public status: number,
    public message: string,
  ) {
    super(message);
  }
}
