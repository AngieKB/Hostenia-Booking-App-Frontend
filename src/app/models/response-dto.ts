export interface ResponseDTO<T> {
  error: boolean;
  status: number;
  content: T;
}
