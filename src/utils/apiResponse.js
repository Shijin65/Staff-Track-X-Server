class ApiResponse {
  /**
   * @param {number} status
   * @param {string} message
   * @param {*} payload
   * @param {*} metaData -- This params includes all other
   */
  constructor(
    status = 200,
    message = "Success.",
    payload = null,
    metaData = {}
  ) {
    this.status = status;
    this.message = message;
    this.payload = payload;
    this.metaData = metaData;
  }
}

module.exports = ApiResponse;
