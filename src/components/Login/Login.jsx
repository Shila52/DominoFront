import React from "react";
import Button from "../Button/Button.jsx";
import DominoEffect from "../DominoEffect/DominoEffect.jsx";
import "./Login.css";

import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../../GoogleLogin.js";
import { connect } from "react-redux";
import { setUser } from "../../UserRedux.js";
import Api from "../../Api.js";

class Login extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      errMessage: "",
    };
  }

  render() {
    return (
      <div className="login">
        <h1>Domino</h1>
        <DominoEffect />
        <h2>Welcome!</h2>
        <div className="login-form">
          <form onSubmit={this.onUserLogin.bind(this)}>
            <Button
              value="login with google"
              buttonType="login"
              name="Login"
              type="sumbit"
            />
          </form>
          {this.renderErrorMessage()}
        </div>
      </div>
    );
  }

  renderErrorMessage() {
    if (this.state.errMessage) {
      return <div>{this.state.errMessage}</div>;
    }
    return null;
  }

  async onUserLogin(event) {
    event.preventDefault();
    signInWithPopup(auth, provider).then(async (data) => {
      const user = data.user;

      const json = {
        id: user.uid,
        name: user.displayName,
        img: user.photoURL,
        token: null,
      };
      const Token = await user.getIdToken().then((token) => {
        return token;
      });
      json.token = Token;
      this.props.setUser(json);
      localStorage.setItem("user", JSON.stringify(json));
      this.props.loginSuccessHandler(json);
      Api.defaults.headers.common = { Authorization: `Bearer ${Token}` };
    });
  }
}
const mapDispatchToProps = {
  setUser, // This makes the setUser action creator available as a prop
};
export default connect(null, mapDispatchToProps)(Login);
