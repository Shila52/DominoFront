import React from "react";
import PlayerStack from "../PlayerStack/PlayerStack.jsx";
import Board from "../Board/Board.jsx";
import Stock from "../Stock/Stock.jsx";
import GameToolbar from "../GameToolbar/GameToolbar.jsx";
import { tilesMap } from "../../TilesMap";
import { connect } from "react-redux";
import Api from "../../Api.js";
import socket from "../../socket.js";

const NUM_TILES = 28;

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
    this.isChangePlayer = false;
  }
  componentDidMount() {
    this.getGameData();
    socket.emit("jointoroom", {
      id: this.props.id,
      user_id: this.props.user.id,
    });
    socket.on("game", this.handleSocketUpdate);
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
                ? "bg-white"
                : "bg-black"
            }
             text-slate-900`}
          >
            <Stock
              gameTiles={this.state.gameTiles}
              empty={this.state.gameTiles.length === 0}
              onStockWithdrawal={this.onStockWithdrawal.bind(this)}
              isGameOver={this.state.isGameOver}
              visible={this.state.playing}
            />
            <PlayerStack
              playerTiles={this.state.playerTiles}
              selectedTile={this.state.selectedTile}
              setSelectedTile={this.setSelectedTile.bind(this)}
              onTilePlace={this.onTilePlaced.bind(this)}
              isGameOver={this.state.isGameOver}
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
      })
      .catch((err) => {
        throw err;
      });
  }

  componentWillUnmount() {
    this.stopTimer();
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }
  handleSocketUpdate = (data) => {
    let gameData = data.gameData;
    console.log("socket mounted");
    console.log(gameData);
    console.log("------------------------------------------");
    if (gameData.$isNew == false) {
      gameData._doc.playerTiles = gameData.playerTiles;
      gameData._doc.stats = gameData.stats;
      gameData = gameData._doc;
    }
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
    if (gameData.active) {
      this.setState({ active: true });
      this.setState({ playing: true });
    } else {
      this.setState({ active: false });
      this.setState({ playing: false });
    }
  };

  componentDidUpdate(prevProps, prevState) {
    if (prevState.active !== this.state.active && this.state.active) {
      this.startGame();
    }
  }

  async startGame() {
    this.showUiMessage("New game started", { type: "info" });
    this.setState({
      elapsedSeconds: 0,
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
    this.initTimer();
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

          if (tilesMap[tile.tile].double) {
            if (tilesMap[tile.tile].a === tilesMap[selectedTile].a) {
              avaiablePositions.push({
                position: index - NUM_TILES,
                reversed: true,
                double: !tilesMap[selectedTile].double,
              });
            }
            if (tilesMap[tile.tile].a === tilesMap[selectedTile].b) {
              avaiablePositions.push({
                position: index - NUM_TILES,
                reversed: false,
                double: !tilesMap[selectedTile].double,
              });
            }
            if (tilesMap[tile.tile].b === tilesMap[selectedTile].a) {
              avaiablePositions.push({
                position: index + NUM_TILES,
                reversed: false,
                double: !tilesMap[selectedTile].double,
              });
            }
            if (tilesMap[tile.tile].b === tilesMap[selectedTile].b) {
              avaiablePositions.push({
                position: index + NUM_TILES,
                reversed: true,
                double: !tilesMap[selectedTile].double,
              });
            }
          }
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
    const isGameOver = this.isGameOver();
    if (isGameOver.result) {
      this.onGameOver(isGameOver.winner);
    }

    await Api.patch(`/games/${this.props.id}/update`, {
      body: {
        isChangePlayer: this.isChangePlayer,
        playerTiles: this.state.playerTiles,
        boardTiles: this.state.boardTiles,
        currentPlayer: this.state.currentPlayer,
        gameTiles: this.state.gameTiles,
        isGameOver: isGameOver.result,
        winner: isGameOver.winner,
      },
      credentials: "include",
    }).then((response) => {
      if ((response.status = 200)) {
        socket.emit("sendupdate", {
          id: this.props.id,
          user_id: this.props.user.id,
          gameData: response.data.gameData,
        });

        this.handleSocketUpdate(response.data);
      }
    });
    return false;
  }

  isGameOver() {
    const { gameTiles, playerTiles } = this.state;

    if (gameTiles.length === 0) {
      return { result: true, winner: 0 }; // 0 means no one won
    } else if (playerTiles.length === 0) {
      return { result: true, winner: 1 };
    }

    return { result: false };
  }

  onGameOver(winner) {
    this.setState({ isGameOver: true });

    if (winner) {
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
      this.setState({ elapsedSeconds: this.state.elapsedSeconds + 1 });
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
