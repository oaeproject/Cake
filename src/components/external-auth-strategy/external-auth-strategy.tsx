import { Component, h, Prop } from '@stencil/core';
import { getLoginRedirectUrl as getRedirectUrl, getInvitationInfo } from '../../helpers/utils';

@Component({
  tag: 'external-auth-strategy',
  styleUrl: 'external-auth-strategy.css',
})
export class ExternalAuthStrategy {
  @Prop() name: string;
  @Prop() id: string;
  @Prop() url: string;
  @Prop() icon: string;
  @Prop() redirectUrl: string;
  @Prop() invitationToken: string;
  @Prop() invitationEmail: string;

  componentWillLoad() {
    console.log('Component is about to be rendered');
    // TODO debug
    this.redirectUrl = getRedirectUrl();
    console.log(`redirectUrl: ${this.redirectUrl}`);

    // Variable that keeps track of the invitation info that is available in the page context, if any
    const invitationInfo = getInvitationInfo();
    this.invitationToken = invitationInfo.token;
    this.invitationEmail = invitationInfo.email;

    // TODO debug
    console.log(`invitation info: ${invitationInfo.email} / ${invitationInfo.token}`);
  }

  submitForm(e) {
    e.preventDefault();
    console.log('Submitting!!!');
  }

  render() {
    return (
      <form action={this.url} method="POST">
        <input type="hidden" name="invitationToken" value={this.invitationToken} />
        <input type="hidden" name="invitationEmail" value={this.invitationEmail} />
        <input type="hidden" name="redirectUrl" value={this.redirectUrl} />
        <a onClick={this.submitForm} class="twitter button is-round signIn-button">
          <i class={this.icon}></i>
        </a>
      </form>
    );
  }
}
