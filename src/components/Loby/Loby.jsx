import React from "react";
import GameList from "../GameList/GameList.jsx";

import Button from "../Button/Button.jsx";

import "./Loby.css";
import Api from "../../Api.js";
import { io } from "socket.io-client";

import Game from "../Game/Game.jsx";
import socket from "../../socket.js";


class Loby extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      showNewGame: false,
      showGame: false,
      id: 0,
    };
    
  }



 

  render() {
    return (
      <React.Fragment>
        <div className="loby-header">
          Hello {this.props.user.name}
          {!this.state.showGame ? (
            <Button
              buttonType="logout"
              name="Logout"
              onClick={this.props.onUserLoghout.bind(this)}
            />
          ) : (
            ""
          )}
          {this.state.id ? (
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
            <Game id={this.state.id} />
          ) : (
            <div className="lists-container">
              <GameList mounted onGameClick={this.onGameClick.bind(this)} />
            </div>
          )}
        </React.Fragment>
      </React.Fragment>
    );
  }

  onGameClick(event, id) {
    // Api(`/users/join/${id}`, {
    //   method: 'POST',
    //   credentials: 'include'
    // })
    //   .then(response => {
    //     if (!response.status==200) {
    //       throw response;
    //     }
    //     return response;
    //   })
    //   .catch(err => {
    //     throw err;
    //   });

    return Api(`/games/${id}/join`, { method: "GET", credentials: "include" })
      .then((response) => {
        if (!response.status == 200) {
          throw response;
        }
        return response;
      })
      .then(() => {
        
        socket.emit("getgamelist", { get: true });
        this.setState({ showGame: true, id });
      })
      .catch((err) => {
        throw err;
      });
  }

  onLeaveGame() {
    // Api(`/users/leave/${this.state.id}`, {
    //   method: 'GET',
    //   credentials: 'include'
    // })
    //   .then(response => {
    //     if (!response.ok) {
    //       throw response;
    //     }
    //     return response;
    //   })
    //   .then(() => {
    //     this.setState({ showGame: false, id: 0 });
    //   })
    //   .catch(err => {
    //     throw err;
    //   });

    Api(`/games/${this.state.id}/leave`, {
      method: "GET",
      credentials: "include",
    }).then((response) => {
      if (response.status == 200) {
        this.setState({ showGame: false, id: 0 });
        socket.emit("getgamelist", { get: true });
      }
    });
  }
}

export default Loby;
