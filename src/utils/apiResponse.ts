class ApiResponse<T = any> {
  public status: number;
  public message: string;
  public payload: T | null;
  public metaData: any;

  /**
   * @param {number} status
   * @param {string} message
   * @param {*} payload
   * @param {*} metaData -- This params includes all other
   */
  constructor(
    status: number = 200,
    message: string = "Success.",
    payload: T | null = null,
    metaData: any = {}
  ) {
    this.status = status;
    this.message = message;
    this.payload = payload;
    this.metaData = metaData;
  }
}

export default ApiResponse;

