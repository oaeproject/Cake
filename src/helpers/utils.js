import { assoc, replace, pipe, prop, defaultTo } from "ramda";
const INVITATION_TOKEN = "invitationToken";
const INVITATION_EMAIL = "invitationEmail";

function getRedirectUrl(location = document.location.toString()) {
  const parameters = new URL(location).searchParams;
  return defaultTo("", parameters.get("url"));
}

function getUrlParameters(url) {
  let parameters = {};
  const PARAMETERS_REGEX = /[?&]+([^=&]+)=([^&]*)/gi;

  replace(
    PARAMETERS_REGEX,
    (...args) => {
      const { 1: key, 2: value } = args;
      parameters = assoc(key, value, parameters);
    },
    url
  );

  return parameters;
}

function getInvitationInfo(location) {
  /*
  const parameters = pipe(
    getRedirectUrl(location),
    defaultTo(""),
    getUrlParameters
  )();
  */
  const parameters = getUrlParameters(defaultTo("", getRedirectUrl(location)));
  const extractURLParameter = (parameterName) =>
    pipe(prop(parameterName), decodeURIComponent)(parameters);

  const token = extractURLParameter(INVITATION_TOKEN);
  const email = extractURLParameter(INVITATION_EMAIL);

  return {
    token,
    email,
  };
}

export { getRedirectUrl, getInvitationInfo };
