const idRegex = /(?!^([0-9]+)([[\\s]*]?)$)(?!^([0-9]+)[[a-zA-Z]*]?([[\\s]*]?)$)^([_]?([a-zA-Z0-9]+)([[\\s]*]?))$/;
const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export const checkValidId = id => idRegex.test(id);
export const checkValidEmail = email => emailRegex.test(email);
