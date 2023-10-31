import React from "react";
import GameList from "../GameList/GameList.jsx";

import Button from "../Button/Button.jsx";

import "./Loby.css";
import Api from "../../Api.js";

import Game from "../Game/Game.jsx";

import Purchase_detail from "./PurchaseDetail.jsx";
import Dashboard from "./Dashboard.jsx";
import Shop from "./Shop.jsx";
import Withdraw from "./Withdraw.jsx";
import Bot from "../Game/Bot.jsx";

class Loby extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      showNewGame: false,
      showGame: false,
      isFinish: false,
      id: 0,
      Pucrhase: null,
      Coins: 0,
    };
  }

  async componentDidMount() {
    this.setState({ isFinish: false });
    await this.LastMatch();
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
          {/* <Withdraw /> */}
        </React.Fragment>
      </React.Fragment>
    );
  }
  onSetFinish() {
    this.setState({ isFinish: true });
  }
  async MakeOrder() {
    console.log("running");
    this.setState({ loading: true });
    await Api.post(`/users/generatePayments`, {
      data: { TotalAmount: this.state.Coins, PaymentOption: "USDT" },
      credentials: "include",
    })
      .then((res) => {
        this.setState({ Pucrhase: res.data, loading: false });
      })
      .catch((err) => {
        console.log(err);
      });
  }
  async LastMatch() {
    try {
      return await Api.get(`games/lastmatch`, {
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
    // we are directly get id of game and every thing gooing correct
    this.setState({ showGame: true, id });
    // console.log(id);
    // try {
    //   if (id != undefined) {
    //     return await Api.get(`/games/${id}/join`, {
    //       credentials: "include",
    //     })
    //       .then((response) => {
    //         if (response.status == 201) {
    //           setTimeout(() => {
    //             console.log("re run ");
    //             this.onGameClick(id);
    //           }, 500);
    //         }
    //         if (!response.status == 200 && !response.status == 201) {
    //           throw response;
    //         }
    //         return response;
    //       })
    //       .then(() => {

    //       });
    //   }
    // } catch (error) {
    //   // localStorage.removeItem("user");
    //   // location.reload();
    //   console.log(error.status);
    // }
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
