import React from "react";
import Login from "../Login/Login.jsx";
import Loby from "../Loby/Loby.jsx";
import Api from "../../Api.js";
import { connect } from "react-redux";
import { setUser } from "../../UserRedux.js";
class Home extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      showLogin: true,
      currentUser: {
        name: "",
      },
    };
  }
  componentDidMount() {
    const check = JSON.parse(localStorage.getItem("user"));

    if (check?.token != undefined) {
     
      this.setState({
        showLogin: false,
        currentUser: { name: check.name },
      });
      this.props.setUser(check);
      Api.defaults.headers.common = { Authorization: `Bearer ${check.token}` };
    }
  }
  render() {
    return (
      <React.Fragment>
        {this.state.showLogin ? (
          <Login
            loginSuccessHandler={this.onSuccessedLogin.bind(this)}
            loginErrorHandler={this.onLoginError.bind(this)}
          />
        ) : (
          <Loby
            user={this.state.currentUser}
            onUserLoghout={this.onUserLoghout.bind(this)}
          />
        )}
      </React.Fragment>
    );
  }

  onSuccessedLogin(user) {
    this.setState({ showLogin: false });
    this.setState({ currentUser: user });
  }

  onLoginError() {
    console.error("Login failed");
    this.setState({ showLogin: true });
  }

  getUserName() {
    this.fetchUserInfo()
      .then((userInfo) => {
        this.setState({ currentUser: userInfo, showLogin: false });
      })
      .catch((err) => {
        if (err.status === 401) {
          // In case we're getting 'unautorithed' as response
          this.setState({ showLogin: true });
        } else {
          throw err;
        }
      });
  }

  fetchUserInfo() {
    return Api("/users", { credentials: "include" }).then((response) => {
      if (!response.ok) {
        console.log("Could not fetch users");
        throw response;
      }
      return response.json();
    });
  }

  onUserLoghout() {
    fetch("/users/logout", { method: "GET", credentials: "include" }).then(
      (response) => {
        if (!response.ok) {
          console.log(
            `Failed to logout user ${this.state.currentUser.name} `,
            response
          );
        }
        this.setState({ currentUser: { name: "" }, showLogin: true });
      }
    );
  }
}
const mapDispatchToProps = {
  setUser,
};

export default connect(null, mapDispatchToProps)(Home);
