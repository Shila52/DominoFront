import React, { Component } from "react";
import Button from "../Button/Button.jsx";
import DominoEffect from "../DominoEffect/DominoEffect.jsx";
import "./Login.css";
import {
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";
import { auth, provider } from "../../GoogleLogin.js";
import { connect } from "react-redux";
import { setUser } from "../../UserRedux.js";
import Api from "../../Api.js";

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tellNumber: "",
      errMessage: "",
      showOtp: false,
      otpCode: null,
      loading: false,
    };
  }

  componentDidMount() {
    // Initialize the reCAPTCHA verifier
    this.initializeRecaptchaVerifier();
  }

  initializeRecaptchaVerifier = () => {
    if (!window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier = new RecaptchaVerifier(
          auth,
          "recaptcha-container",
          {
            size: "invisible",
            callback: () => {
              this.sendSms();
            },
          }
        );
      } catch (error) {
        console.log(error, "recaptcha error");
        const errorCodeParts = error.code.split("/");
        const specificErrorCode = errorCodeParts[1];
        console.log(specificErrorCode);
      }
    }
  };

  sendSms = async () => {
    this.setState({ loading: true });
    this.onCaptchVerify();
    const formatPhone = "+964" + this.state.tellNumber;

    await signInWithPhoneNumber(auth, formatPhone, window.recaptchaVerifier)
      .then(async (confirmationResult) => {
        window.confirmationResult = confirmationResult;

        this.setState({ loading: false, showOtp: true });
        console.log("OTP sent successfully!");
      })
      .catch((error) => {
        console.log(error, "sending otp error");
        const errorCodeParts = error.code.split("/");
        const specificErrorCode = errorCodeParts[1];
        console.log(specificErrorCode);
        this.setState({ loading: false });
      });
  };

  onCaptchVerify = () => {
    if (!window.recaptchaVerifier) {
      this.initializeRecaptchaVerifier();
    }
  };

  verifyOtp = () => {
    this.setState({ loading: true });
    window.confirmationResult
      .confirm(this.state.otpCode)
      .then(async (res) => {
        await this.SendToEndpoint({
          id: res.user.uid,
          name: res.user.providerData[0].displayName,
          img: null,
          email: res.user.providerData[0].email,
          token: res.user.stsTokenManager.accessToken,
          phone: res.user.providerData[0].phoneNumber,
        });
        this.setState({ loading: false });
      })
      .catch((error) => {
        console.log(error.code, "verify error");
        const errorCodeParts = error.code.split("/");
        const specificErrorCode = errorCodeParts[1];
        console.log(specificErrorCode);
        this.setState({ loading: false });
      });
  };

  renderErrorMessage = () => {
    if (this.state.errMessage) {
      return <div>{this.state.errMessage}</div>;
    }
    return null;
  };

  onUserLogin = async (event) => {
    event.preventDefault();
    signInWithPopup(auth, provider).then(async (data) => {
      const user = data.user;

      const json = {
        id: user.uid,
        name: user.displayName,
        img: user.photoURL,
        email: user.email,
        token: null,
        phone: null,
      };
      const Token = await user.getIdToken().then((token) => {
        return token;
      });
      json.token = Token;
      await this.SendToEndpoint(json);
    });
  };

  SendToEndpoint = async (json) => {
    console.log(json);
    await Api.post("users/create", { data: json }).then((res) => {
      if (res.status === 200) {
        console.log(res.data);
        this.props.setUser(res.data.user);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        this.props.loginSuccessHandler(res.data.user);
        Api.defaults.headers.common = {
          Authorization: `Bearer ${res.data.user.token}`,
        };
      }
    });
  };

  render() {
    return (
      <div className="login">
        <h1>Domino</h1>
        <DominoEffect />

        <h2>Welcome!</h2>
        {this.state.showOtp ? (
          <div className="flex flex-col gap-4">
            {" "}
            <input
              type="number"
              onInput={(event) =>
                this.setState({ otpCode: event.target.value })
              }
              className="p-2 text-white font-bold text-center"
              placeholder="enter otpcode "
            />
            <button onClick={this.verifyOtp}>Verify Otp</button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {" "}
            <input
              type="text"
              onInput={(event) =>
                this.setState({ tellNumber: event.target.value })
              }
              className="p-2 text-white font-bold text-center"
              placeholder="enter phone number "
            />
            <button onClick={this.sendSms.bind(this)}>Send SMS</button>
          </div>
        )}
        <div className="login-form">
          <form onSubmit={this.onUserLogin}>
            <Button
              value="Login with Google"
              buttonType="login"
              name="Login"
              type="submit"
            />
          </form>
          {this.renderErrorMessage()}
        </div>
      </div>
    );
  }
}

const mapDispatchToProps = {
  setUser, // This makes the setUser action creator available as a prop
};

export default connect(null, mapDispatchToProps)(Login);
