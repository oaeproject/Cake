import { assoc, replace, pipe, prop, defaultTo } from 'ramda';

const INVITATION_TOKEN = 'invitationToken';
const INVITATION_EMAIL = 'invitationEmail';

function getLoginRedirectUrl() {
  const parameters = new URL(document.location.toString()).searchParams;
  return defaultTo('', parameters.get('url'));
}

function getUrlParameters(url) {
  let parameters = {};
  const PARAMETERS_REGEX = /[?&]+([^=&]+)=([^&]*)/gi;

  replace(
    PARAMETERS_REGEX,
    (key, value) => {
      parameters = assoc(key, value, parameters);
    },
    url,
  );

  return parameters;
}

function getInvitationInfo() {
  const parameters = pipe(getLoginRedirectUrl, defaultTo(''), getUrlParameters)();
  const extractURLParameter = parameterName => pipe(prop(parameterName), decodeURIComponent)(parameters);

  const token = extractURLParameter(INVITATION_TOKEN);
  const email = extractURLParameter(INVITATION_EMAIL);

  return {
    token,
    email,
  };
}

export { getLoginRedirectUrl, getInvitationInfo };
