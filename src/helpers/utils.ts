function getLoginRedirectUrl() {
  const parameters = new URL(document.location.toString()).searchParams;
  return parameters.get('url');
}

function getInvitationInfo() {
  const parameters = new URL(document.location.toString()).searchParams;
  return {
    token: parameters.get('invitationToken'),
    email: parameters.get('invitationEmail'),
  };
}

export { getLoginRedirectUrl, getInvitationInfo };
