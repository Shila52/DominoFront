import React from "react";
import PlayerStack from "../PlayerStack/PlayerStack.jsx";
import Board from "../Board/Board.jsx";
import Stock from "../Stock/Stock.jsx";
import GameToolbar from "../GameToolbar/GameToolbar.jsx";
import { tilesMap } from "../../TilesMap";
import { connect } from "react-redux";
import Api from "../../Api.js";
import socket from "../../socket.js";

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      gameTiles: [],
      players: [],
      playerTiles: [],
      selectedTile: -1,
      currentPlayer: "",
      elapsedSeconds: 0,
      isGameOver: false,
      uiMessage: {
        message: "",
        show: false,
        type: "",
      },
      stats: {
        numTurns: 0,
        stockWithdrawals: 0,
        turnTime: [0],
        avgTurnTime: 0,
        score: 0,
      },
    };
    this.showstock = false;
    this.isChangePlayer = false;
  }
  async componentDidMount() {
    this.getGameData();
    socket.emit("jointoroom", {
      id: this.props.id,
      user_id: this.props.user.id,
    });
    socket.emit("playing", { id: this.props.user.id, gameid: this.props.id });
    socket.on("game", this.handleSocketUpdate);
    socket.on("userNotReturn", () => {
      this.showUiMessage("User Doesn't come back u Win The Game", {
        type: "warning",
      });
    });
    socket.on("returned", ({ name }) => {
      this.showUiMessage(`${name} Reconnect To The Game`, {
        type: "warning",
      });
    });
    socket.on("userGoingOffline", () => {
      this.showUiMessage(
        "oponent player going offline if not returning in 90 second u win the game ",
        {
          type: "warning",
        }
      );
    });
    this.stopTimer();
  }
  render() {
    return (
      <div>
        <GameToolbar
          stats={this.state.stats}
          uiMessage={this.state.uiMessage}
          elapsedSeconds={this.state.elapsedSeconds}
          isGameOver={this.state.isGameOver}
          players={this.state.players}
          numPlayers={this.state.numPlayers}
          currentPlayer={this.state.currentPlayer}
        />
        <Board
          boardTiles={this.state.boardTiles}
          selectedTile={this.state.selectedTile}
          onTilePlaced={this.onTilePlaced.bind(this)}
        />
        {this.state.active ? (
          <div
            className={`player-section ${
              this.state.players.find(
                (player) => player.id == this.props.user.id
              ).id == this.state.currentPlayer
                ? ""
                : "hidden"
            }
             text-slate-900`}
          >
            <Stock
              gameTiles={this.state.gameTiles}
              empty={this.state.gameTiles.length === 0}
              onStockWithdrawal={this.onStockWithdrawal.bind(this)}
              isGameOver={this.state.gameStats.isGameover.result}
              visible={this.showstock}
            />

            <PlayerStack
              playerTiles={this.state.playerTiles}
              selectedTile={this.state.selectedTile}
              setSelectedTile={this.setSelectedTile.bind(this)}
              boardTiles={this.state.boardTiles}
              onTilePlace={this.onTilePlaced.bind(this)}
              isGameOver={this.state.gameStats.isGameover.result}
              visible={this.state.playing}
            />
          </div>
        ) : (
          ""
        )}
      </div>
    );
  }

  async getGameData() {
    return await Api.get(`/games/${this.props.id}`, {
      credentials: "include",
    })
      .then((response) => {
        if (!response.status == 200) {
          throw response;
        }

        return response.data;
      })
      .then((gameData) => {
        if (gameData.$isNew == false) {
          gameData._doc.playerTiles = gameData._doc.players.find(
            (p) => p.id == this.props.user.id
          ).playerTiles;
          gameData._doc.stats = gameData.stats;
          gameData = gameData._doc;
        }

        const boardTiles = this.state.playing
          ? this.state.boardTiles
          : gameData.boardTiles;
        this.setState(() => ({
          ...gameData,
          stats: this.state.stats,
          boardTiles,
        }));
        this.isChangePlayer = false;
        if (gameData.active) {
          this.setState({ active: true });
          this.setState({ playing: true });
        } else {
          this.setState({ playing: true });
          this.setState({ active: false });
        }
        socket.emit("notifyuser", {
          id: this.props.id,
          user_id: this.props.user.id,
        });
        this.setState({ elapsedSeconds: 60 });
        this.stopTimer();
        this.initTimer();
      })
      .catch((err) => {
        throw err;
      });
  }
  async checkForTiles(boardTiles, remaintiles, players) {
    const allTiles = [];
    const placedTiles = [];
    let lastFour = [];
    let first, last;
    let check = false;
    await players.forEach(async (player) => {
      await player.playerTiles.forEach((t) => {
        allTiles.push(t);
      });
    });
    if (remaintiles.length != 0) {
      await remaintiles.forEach((t) => allTiles.push(t));
    }
    boardTiles &&
      (await boardTiles.map((tile, index) => {
        if (tile.placed === true) {
          placedTiles.push(tile);
        }
      }));

    if (placedTiles.length == 0) {
      return check;
    } else {
      if (placedTiles.length > 3) {
        lastFour = [
          placedTiles[0].tile,
          placedTiles[1].tile,
          placedTiles[placedTiles.length - 2].tile,
          placedTiles[placedTiles.length - 1].tile,
        ];
      } else if (placedTiles.length > 2) {
        lastFour = [
          placedTiles[0].tile,
          placedTiles[1].tile,
          placedTiles[1].tile,
          placedTiles[placedTiles.length - 1].tile,
        ];
      } else if (placedTiles.length > 1) {
        lastFour = [
          placedTiles[0].tile,
          placedTiles[1].tile,
          placedTiles[0].tile,
          placedTiles[1].tile,
        ];
      } else if (placedTiles.length > 0) {
        console.log("o");
        lastFour = [
          placedTiles[0].tile,
          placedTiles[0].tile,
          placedTiles[0].tile,
          placedTiles[0].tile,
        ];
      }
      console.log(lastFour[0]);
      first = tilesMap[lastFour[0]].double
        ? tilesMap[lastFour[0]].a
        : this.findUncommonValue(
            [tilesMap[lastFour[0]]],
            [tilesMap[lastFour[1]]]
          );

      last = tilesMap[lastFour[lastFour.length - 1]].double
        ? tilesMap[lastFour[lastFour.length - 1]].a
        : this.findUncommonValue(
            [tilesMap[lastFour[lastFour.length - 1]]],
            [tilesMap[lastFour[lastFour.length - 2]]]
          );

      allTiles.forEach((selectedTile, index) => {
        if (first === tilesMap[selectedTile].a) {
          check = true;
        }
        if (first === tilesMap[selectedTile].b) {
          check = true;
        }
        if (last === tilesMap[selectedTile].a) {
          check = true;
        }
        if (last === tilesMap[selectedTile].b) {
          check = true;
        }
      });
    }

    return check;
  }
  async showStock(boardTiles, players, current) {
    let check = true;
    const allTiles = await players.find((p) => p.id == current).playerTiles;
    const placedTiles = [];
    let lastFour = [],
      first,
      last;
    boardTiles &&
      (await boardTiles.map((tile, index) => {
        if (tile.placed === true) {
          placedTiles.push(tile);
        }
      }));
    if (placedTiles.length > 3) {
      console.log("f");
      lastFour = [
        placedTiles[0].tile,
        placedTiles[1].tile,
        placedTiles[placedTiles.length - 2].tile,
        placedTiles[placedTiles.length - 1].tile,
      ];
    } else if (placedTiles.length > 2) {
      console.log("th");
      lastFour = [
        placedTiles[0].tile,
        placedTiles[1].tile,
        placedTiles[1].tile,
        placedTiles[placedTiles.length - 1].tile,
      ];
    } else if (placedTiles.length > 1) {
      console.log("t");
      lastFour = [
        placedTiles[0].tile,
        placedTiles[1].tile,
        placedTiles[0].tile,
        placedTiles[1].tile,
      ];
    } else if (placedTiles.length > 0) {
      console.log("o");
      lastFour = [
        placedTiles[0].tile,
        placedTiles[0].tile,
        placedTiles[0].tile,
        placedTiles[0].tile,
      ];
    }
    if (placedTiles.length == 0) {
      return false;
    } else {
      first = tilesMap[lastFour[0]].double
        ? tilesMap[lastFour[0]].a
        : this.findUncommonValue(
            [tilesMap[lastFour[0]]],
            [tilesMap[lastFour[1]]]
          );
      last = tilesMap[lastFour[lastFour.length - 1]].double
        ? tilesMap[lastFour[lastFour.length - 1]].a
        : this.findUncommonValue(
            [tilesMap[lastFour[lastFour.length - 1]]],
            [tilesMap[lastFour[lastFour.length - 2]]]
          );

      allTiles.forEach((selectedTile, index) => {
        if (first === tilesMap[selectedTile].a) {
          check = false;
        }
        if (first === tilesMap[selectedTile].b) {
          check = false;
        }
        if (last === tilesMap[selectedTile].a) {
          //console.log(tilesMap[placedTiles[0]].a + "");
          check = false;
        }
        if (last === tilesMap[selectedTile].b) {
          check = false;
        }
      });
    }
    return check;
  }
  async Checkhave(board, gametile, playertiles) {
    const stack = gametile;
    const playerTiles = playertiles;

    const boardTiles = board;

    let check = false;
    if (playerTiles.length == 0) {
      check = true;
    }
    if (stack != 0) {
      check = true;
    } else {
      let allTiles = [];
      playerTiles.forEach((s) => {
        allTiles.push(s);
      });

      let placedTiles = [];
      let lastFour = [],
        first,
        last;
      boardTiles &&
        (await boardTiles.map((tile, index) => {
          if (tile.placed === true) {
            placedTiles.push(tile);
          }
        }));

      if (placedTiles.length == 0) {
        check = true;
      } else {
        if (placedTiles.length > 3) {
          lastFour = [
            placedTiles[0].tile,
            placedTiles[1].tile,
            placedTiles[placedTiles.length - 2].tile,
            placedTiles[placedTiles.length - 1].tile,
          ];
        } else if (placedTiles.length > 2) {
          lastFour = [
            placedTiles[0].tile,
            placedTiles[1].tile,
            placedTiles[1].tile,
            placedTiles[placedTiles.length - 1].tile,
          ];
        } else if (placedTiles.length > 1) {
          lastFour = [
            placedTiles[0].tile,
            placedTiles[1].tile,
            placedTiles[0].tile,
            placedTiles[1].tile,
          ];
        } else if (placedTiles.length > 0) {
          lastFour = [
            placedTiles[0].tile,
            placedTiles[0].tile,
            placedTiles[0].tile,
            placedTiles[0].tile,
          ];
        }

        first = tilesMap[lastFour[0]].double
          ? tilesMap[lastFour[0]].a
          : this.findUncommonValue(
              [tilesMap[lastFour[0]]],
              [tilesMap[lastFour[1]]]
            );
        last = tilesMap[lastFour[lastFour.length - 1]].double
          ? tilesMap[lastFour[lastFour.length - 1]].a
          : this.findUncommonValue(
              [tilesMap[lastFour[lastFour.length - 1]]],
              [tilesMap[lastFour[lastFour.length - 2]]]
            );

        allTiles.forEach((selectedTile, index) => {
          if (first === tilesMap[selectedTile].a) {
            console.log(1);
            check = true;
          }
          if (first === tilesMap[selectedTile].b) {
            console.log(2);
            check = true;
          }
          if (last === tilesMap[selectedTile].a) {
            console.log(3);
            //console.log(tilesMap[placedTiles[0]].a + "");
            check = true;
          }
          if (last === tilesMap[selectedTile].b) {
            console.log(4);
            check = true;
          }
        });
      }
    }

    return check;
  }
  findUncommonValue(arr1, arr2) {
    const valuesInArr2 = new Set();

    // Store values from arr1 in a Set for efficient lookup
    for (const obj of arr2) {
      valuesInArr2.add(obj.a);
      valuesInArr2.add(obj.b);
    }

    // Iterate through arr2 and check if the value is in arr1
    for (const obj of arr1) {
      if (valuesInArr2.has(obj.a)) {
        return obj.b; // Return the common value
      }
      if (valuesInArr2.has(obj.b)) {
        return obj.a; // Return the common value
      }
    }

    return undefined;
  }
  findCommonValue(arr1, arr2) {
    const valuesInArr1 = new Set();

    // Store values from arr1 in a Set for efficient lookup
    for (const obj of arr1) {
      valuesInArr1.add(obj.a);
      valuesInArr1.add(obj.b);
    }

    // Iterate through arr2 and check if the value is in arr1
    for (const obj of arr2) {
      if (valuesInArr1.has(obj.a)) {
        return obj.a; // Return the common value
      }
      if (valuesInArr1.has(obj.b)) {
        return obj.b; // Return the common value
      }
    }

    return undefined; // No common value found
  }
  componentWillUnmount() {
    this.stopTimer();
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }
  handleSocketUpdate = async (data) => {
    let gameData = data.gameData;

    if (gameData.$isNew == false) {
      gameData._doc.playerTiles = gameData.playerTiles;
      gameData._doc.stats = gameData.stats;
      gameData = gameData._doc;
    }
    if (gameData.gameStats.isGameover.result) {
      this.showUiMessage("Game Finished you can go back to loby", {
        type: "warning",
      });
      this.setState(() => ({
        ...gameData,
      }));
      this.props.isFinish();
    } else {
      gameData.playerTiles = gameData.players.find(
        (p) => p.id == this.props.user.id
      ).playerTiles;
      const boardTiles = gameData.boardTiles;
      this.setState(() => ({
        ...gameData,
        stats: this.state.stats,
        boardTiles,
      }));
      this.isChangePlayer = false;
      const show = await this.showStock(
        gameData.boardTiles,
        gameData.players,
        gameData.currentPlayer
      );
      this.showstock = show;
      if (gameData.active) {
        this.setState({ active: true });
        this.setState({ playing: true });
      } else {
        this.setState({ active: false });
        this.setState({ playing: false });
      }
      if (gameData.currentPlayer == this.props.user.id) {
        this.setState({ elapsedSeconds: 60 });

        const check = await this.Checkhave(
          gameData.boardTiles,
          gameData.gameTiles,
          gameData.players.find((p) => p.id == this.props.user.id).playerTiles
        );
        const qapat = await this.checkForTiles(
          gameData.boardTiles,
          gameData.gameTiles,
          gameData.players
        );
        if (
          check == false &&
          this.props.user.id == gameData.currentPlayer &&
          qapat == true
        ) {
          this.showUiMessage("u dont have any tiles We change to other ", {
            type: "warning",
          });
          setTimeout(async () => {
            this.isChangePlayer = true;
            await this.makeTurn({ method: "" });
          }, 2000);
        }
        this.stopTimer();
        this.initTimer();
      } else {
        this.stopTimer();
        this.setState({ elapsedSeconds: 60 });
      }
    }
  };

  async componentDidUpdate(prevProps, prevState) {
    if (prevState.active !== this.state.active && this.state.active) {
      this.startGame();
    }
    console.log(prevState.elapsedSeconds);
    if (
      this.state.currentPlayer == this.props.user.id &&
      this.state.elapsedSeconds <= 0
    ) {
      this.setState({ elapsedSeconds: 60 });
      this.isChangePlayer = true;
      await this.makeTurn({ method: "" });

      this.stopTimer();
    }
  }

  async startGame() {
    this.showUiMessage("New game started", { type: "info" });
    this.setState({
      elapsedSeconds: 60,
      isGameOver: false,
      stats: {
        ...this.state.stats,
        numTurns: 0,
        stockWithdrawals: 0,
        turnTime: [0],
        avgTurnTime: 0,
      },
    });
    this.stopTimer();
  }

  async setSelectedTile(selectedTile) {
    this.setState({ selectedTile: selectedTile }, () => {
      console.log(this.state.selectedTile); // Log the updated state value
      this.findPlaceholders();
    });
  }

  async findPlaceholders() {
    const { boardTiles, selectedTile } = this.state;
    const avaiablePositions = [];

    boardTiles &&
      boardTiles.map((tile, index) => {
        if (tile.placed === true) {
          const sideA = tile.reversed ? "b" : "a";
          const sideB = tile.reversed ? "a" : "b";

          if (tilesMap[tile.tile][sideA] === tilesMap[selectedTile].a) {
            avaiablePositions.push({
              position: index - 1,
              reversed: true,
              double: tilesMap[selectedTile].double,
            });
          }
          if (tilesMap[tile.tile][sideA] === tilesMap[selectedTile].b) {
            avaiablePositions.push({
              position: index - 1,
              reversed: false,
              double: tilesMap[selectedTile].double,
            });
          }
          if (tilesMap[tile.tile][sideB] === tilesMap[selectedTile].a) {
            avaiablePositions.push({
              position: index + 1,
              reversed: false,
              double: tilesMap[selectedTile].double,
            });
          }
          if (tilesMap[tile.tile][sideB] === tilesMap[selectedTile].b) {
            avaiablePositions.push({
              position: index + 1,
              reversed: true,
              double: tilesMap[selectedTile].double,
            });
          }

          // if (tilesMap[tile.tile].double) {
          //   if (tilesMap[tile.tile].a === tilesMap[selectedTile].a) {
          //     avaiablePositions.push({
          //       position: index - NUM_TILES,
          //       reversed: true,
          //       double: !tilesMap[selectedTile].double,
          //     });
          //   }
          //   if (tilesMap[tile.tile].a === tilesMap[selectedTile].b) {
          //     avaiablePositions.push({
          //       position: index - NUM_TILES,
          //       reversed: false,
          //       double: !tilesMap[selectedTile].double,
          //     });
          //   }
          //   if (tilesMap[tile.tile].b === tilesMap[selectedTile].a) {
          //     avaiablePositions.push({
          //       position: index + NUM_TILES,
          //       reversed: false,
          //       double: !tilesMap[selectedTile].double,
          //     });
          //   }
          //   if (tilesMap[tile.tile].b === tilesMap[selectedTile].b) {
          //     avaiablePositions.push({
          //       position: index + NUM_TILES,
          //       reversed: true,
          //       double: !tilesMap[selectedTile].double,
          //     });
          //   }
          // }
        }
      });

    await this.clearPlaceholders();
    this.showPlaceholders(avaiablePositions);
  }

  async clearPlaceholders() {
    const { boardTiles } = this.state;

    this.setState({
      boardTiles: await boardTiles.map((tile) => {
        return {
          ...tile,
          rendered: tile.isFirst || tile.placed,
        };
      }),
    });
  }

  showPlaceholders(positions) {
    const { boardTiles } = this.state;

    positions.map((tile) => {
      if (!boardTiles[tile.position].placed) {
        boardTiles[tile.position] = {
          ...boardTiles[tile.position],
          reversed: tile.reversed,
          placeholder: true,
          rendered: true,
          rotated: !tile.double,
        };
      }
    });

    this.setState({ boardTiles });
  }

  async onTilePlaced(tileId) {
    const boardTiles = this.state.boardTiles;
    const selectedTile = this.state.selectedTile;

    if (boardTiles[tileId].placed === true) {
      this.showUiMessage("This tile is already placed", { type: "warning" });
    } else if (selectedTile != -1) {
      boardTiles[tileId] = {
        ...boardTiles[tileId],
        tile: selectedTile,
        placed: true,
        placeholder: false,
        rotated: boardTiles[tileId].rotated,
      };

      // Remove from playerTiles
      const playerTiles = this.state.playerTiles;
      playerTiles.splice(playerTiles.indexOf(parseInt(selectedTile, 10)), 1);
      console.log("set change");
      this.setState({
        boardTiles,
        playerTiles,
        selectedTile: -1,
      });
      this.isChangePlayer = true;

      this.makeTurn({ method: "place" });
    } else {
      this.showUiMessage("You must select a tile first", { type: "warning" });
    }

    await this.clearPlaceholders();
  }

  showUiMessage(message, { type }) {
    this.setState({
      uiMessage: {
        message,
        type,
        show: true,
      },
    });

    setTimeout(
      () =>
        this.setState({
          uiMessage: { ...this.state.uiMessage, show: false },
        }),
      2500
    );
  }

  onStockWithdrawal() {
    const { playerTiles, gameTiles } = this.state;

    const randomIndex = Math.floor(
      Math.random() * Math.floor(this.state.gameTiles.length)
    );

    if (randomIndex === -1) {
      this.showUiMessage("Stock is empty!", { type: "warning" });
    } else {
      playerTiles.push(this.state.gameTiles[randomIndex]);
      gameTiles.splice(randomIndex, 1);
      this.makeTurn({ method: "stock" });
      this.setState({ playerTiles, gameTiles, selectedTile: -1 });
    }
  }

  async makeTurn({ method }) {
    const { numTurns, stockWithdrawals, turnTime } = this.state.stats;

    const timeDifference =
      this.state.elapsedSeconds - turnTime[turnTime.length - 1];
    turnTime.push(timeDifference);

    const score = this.state.playerTiles.reduce(
      (sum, value) => sum + tilesMap[value].a + tilesMap[value].b,
      0
    );

    const updatedAverageTurnTime =
      turnTime.reduce((sum, value) => sum + value, 0) / turnTime.length;

    const stats = {
      ...this.state.stats,
      numTurns: numTurns + 1,
      stockWithdrawals:
        method === "stock" ? stockWithdrawals + 1 : stockWithdrawals,
      score,
      turnTime,
      avgTurnTime: updatedAverageTurnTime.toFixed(1),
    };

    this.setState({
      stats,
    });

    // Check game over
    const isGameOver = await this.isGameOver();
    if (isGameOver.result) {
      this.onGameOver(isGameOver.id);
    }
    this.showstock = false;
    await Api.patch(`/games/${this.props.id}/update`, {
      body: {
        isChangePlayer: this.isChangePlayer,
        playerTiles: this.state.playerTiles,
        boardTiles: this.state.boardTiles,
        players: this.state.players,
        currentPlayer: this.state.currentPlayer,
        gameTiles: this.state.gameTiles,
        gameStats: {
          isGameover: isGameOver,
        },
      },
      credentials: "include",
    })
      .then((response) => {
        if ((response.status = 200)) {
          socket.emit("sendupdate", {
            id: this.props.id,
            user_id: this.props.user.id,
            gameData: response.data.gameData,
          });

          this.handleSocketUpdate(response.data);
        }
      })
      .catch((err) => {
        localStorage.removeItem("user");
        location.reload();
      });
    return false;
  }

  async isGameOver() {
    const { gameTiles, playerTiles, boardTiles, players } = this.state;
    const check = await this.checkForTiles(boardTiles, gameTiles, players);
    let p1 = 0;
    let p2 = 0;
    playerTiles.forEach((t) => {
      p1 = p1 + tilesMap[t].a + tilesMap[t].b;
    });
    players
      .find((p) => p.id != this.props.user.id)
      .playerTiles.forEach((t) => {
        p2 = p2 + tilesMap[t].a + tilesMap[t].b;
      });

    if (gameTiles.length === 0 && check == false) {
      console.log("qapat-----------");
      this.showUiMessage("Qapat!", {
        type: "info",
      });
     
        if (p1 > p2) {
          //player 2 win
          return {
            result: true,
            id: players.find((p) => p.id != this.props.user.id).id,
          };
        } else if (p1 < p2) {
          // current player 1 win
          return { result: true, id: this.props.user.id };
        } else {
          //no one win
          return { result: true, id: "" };
        }
      

      // 0 means no one won
    } else if (playerTiles.length === 0) {
      return { result: true, id: this.props.user.id };
    }

    return { result: false };
  }

  onGameOver(winner) {
    this.setState({ isGameOver: true });

    if (winner == this.props.user.id) {
      this.showUiMessage("GAME OVER! Congratulations, you WON!", {
        type: "info",
      });
    } else {
      this.showUiMessage("GAME OVER! Too bad, you lost.", {
        type: "info",
      });
    }
    this.stopTimer();
  }

  initTimer() {
    this.interval = setInterval(() => {
      this.setState({ elapsedSeconds: this.state.elapsedSeconds - 1 });
    }, 1000);
  }

  stopTimer() {
    clearInterval(this.interval);
  }
}
const mapStateToProps = (state) => ({
  user: state.user.user, // Replace "user" with the correct reducer name
});

export default connect(mapStateToProps)(Game);
