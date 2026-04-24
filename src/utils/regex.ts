export const phoneRegExp: RegExp = /^[\d()+\s-]*$/;

export const passwordRegExp: RegExp =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&+\*])(?=.{8,})/;

export const searchRegExp: RegExp = /[^a-zA-Z0-9@#\$%\&\-\.\*\s]+/;
