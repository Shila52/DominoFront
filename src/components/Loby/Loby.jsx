import React from "react";
import GameList from "../GameList/GameList.jsx";

import Button from "../Button/Button.jsx";

import "./Loby.css";
import Api from "../../Api.js";

import Game from "../Game/Game.jsx";

class Loby extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      showNewGame: false,
      showGame: false,
      isFinish: false,
      id: 0,
    };
  }

  componentDidMount() {
    this.setState({ isFinish: false });
    this.checkAlive();
  }
  render() {
    return (
      <React.Fragment>
        <div className="loby-header">
          Hello {this.props.user.name}
          {this.state.isFinish ? (
            <Button
              buttonType="leaveGame"
              name="Back To Loby"
              onClick={this.onLeaveGame.bind(this)}
            />
          ) : (
            ""
          )}
        </div>
        <React.Fragment>
          {this.state.showGame ? (
            <Game isFinish={this.onSetFinish.bind(this)} id={this.state.id} />
          ) : (
            <div className="lists-container">
              <GameList mounted onGameClick={this.onGameClick.bind(this)} />
            </div>
          )}
        </React.Fragment>
      </React.Fragment>
    );
  }
  onSetFinish() {
    this.setState({ isFinish: true });
  }
  async checkAlive() {
    try {
      return await Api.get(`games/alive`, {
        credentials: "include",
      })
        .then((response) => {
          if (!response.status == 200) {
            throw response;
          }
          return response;
        })
        .then((res) => {
          const id = res.data.gameid;

          if (id != null) {
            this.setState({ showGame: true, id });
          }
        });
    } catch (error) {
      console.log(error);
      if (error.response.status == 401) {
        localStorage.removeItem("user");
        location.reload();
      }
      if (error.response.status == 500) {
        
        localStorage.removeItem("user");
        location.reload();
      }
    }
  }
  async onGameClick(id) {
    console.log(id);
    try {
      if (id != undefined) {
        return await Api.get(`/games/${id}/join`, {
          credentials: "include",
        })
          .then((response) => {
            if (!response.status == 200) {
              throw response;
            }
            return response;
          })
          .then(() => {
            this.setState({ showGame: true, id });
          });
      }
    } catch (error) {
      // localStorage.removeItem("user");
      // location.reload();
      console.log(error.status);
    }
  }

  onLeaveGame() {
    Api(`/games/${this.state.id}/leave`, {
      method: "GET",
      credentials: "include",
    }).then((response) => {
      if (response.status == 200) {
        this.setState({ showGame: false, id: 0, isFinish: false });
      }
    });
  }
}

export default Loby;
