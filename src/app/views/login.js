'use strict';

import BaseView from '../framework/base_view';
import { User } from '../models/user';

export default class LoginView extends BaseView {

  constructor() {
    super();

    this.title = "TourneyMan";
    this.template = "login";
    this.container = "#login-content";

    this.model = {
      email: "",
      password: "",
    }

    this.events = {
      "click": {
        ".register_button": (el) => this.onRegisterClicked(el),
        ".submit_login": (el) => this.onLoginClicked(el)
      }
    }
  }

  pre_render() {}

  post_render() {}

  async onLoginClicked(el) {
    let user = new User();

    let res = await user.authenticate(this.model.email, this.model.password);
    console.log("User Logged In");
    window.user = user;

    this.onMyProfileClicked();
  }

  onRegisterClicked(el) {
    router.navigate("register", {replace: true});
  }
}
