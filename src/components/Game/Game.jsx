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
      LeftPosition: [],
      RightPosition: [],
      OrderedPlacedTiles: [],
      availablepositions: [],
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
    this.Counter = 0;
  }
  async componentDidMount() {
    this.Counter++;
    console.log(this.Counter);
    if (this.Counter == 2) {
      console.log("getgame Data");
      await this.getGameData();
    }
    // socket.emit("playing", { id: this.props.user.id, gameid: this.props.id });
    // socket.on("game", this.handleSocketUpdate);
    // socket.on("userNotReturn", () => {
    //   this.showUiMessage("User Doesn't come back u Win The Game", {
    //     type: "warning",
    //   });
    // });
    // socket.on("returned", ({ name }) => {
    //   this.showUiMessage(`${name} Reconnect To The Game`, {
    //     type: "warning",
    //   });
    // });
    // socket.on("userGoingOffline", () => {
    //   this.showUiMessage(
    //     "oponent player going offline if not returning in 90 second u win the game ",
    //     {
    //       type: "warning",
    //     }
    //   );
    // });
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
          OrderedPlacedTiles={this.state.OrderedPlacedTiles}
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
              OrderedPlacedTiles={this.state.OrderedPlacedTiles}
              onTilePlace={this.onTilePlaced.bind(this)}
              isGameOver={this.state.gameStats.isGameover.result}
              visible={true}
             
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
      .then(async (gameData) => {
        const boardTiles = gameData.boardTiles;
        gameData.playerTiles =
          gameData.players[
            gameData.currentPlayer === this.props.user.id ? 0 : 1
          ].playerTiles;

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
        const show = await this.showStock(
          gameData.OrderedPlacedTiles,
          gameData.players,
          gameData.currentPlayer
        );
        this.showstock = show;
        if (gameData.currentPlayer === "cedd0894-6a57-11ee-8c99-0242ac120002") {
          setTimeout(() => {
            console.log("bot start line 159");
            this.BotPlaying(gameData.playerTiles, gameData.OrderedPlacedTiles);
          }, 3000);
        }
        this.setState({ elapsedSeconds: 60 });
      })
      .catch((err) => {
        throw err;
      });
  }
  async checkForTiles(OrderedPlacedTiles, remaintiles, players) {
    const allTiles = [];
    const placedTiles = OrderedPlacedTiles;
    let lastFour = [];
    let first, last;
    let check = false;
    await players.forEach(async (player) => {
      await player.playerTiles.forEach((t) => {
        allTiles.push(t);
      });
    });
    if (remaintiles.length != 0) {
      await remaintiles.forEach((tile) => allTiles.push(tile));
    }

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
  async showStock(OrderedPlacedTiles, players, current) {
    let check = true;
    const allTiles = await players.find((p) => p.id == current).playerTiles;
    const placedTiles = OrderedPlacedTiles;
    let lastFour = [],
      first,
      last;

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

  async Checkhave(OrderedPlacedTiles, gametile, playertiles) {
    const stack = gametile;
    const playerTiles = playertiles;

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

      let placedTiles = OrderedPlacedTiles;
      let lastFour = [],
        first,
        last;

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
            check = true;
          }
          if (first === tilesMap[selectedTile].b) {
            check = true;
          }
          if (last === tilesMap[selectedTile].a) {
            //console.log(tilesMap[placedTiles[0]].a + "");
            check = true;
          }
          if (last === tilesMap[selectedTile].b) {
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

    await this.clearPlaceholders();
    // Check for game over
    if (gameData.gameStats.isGameover.result) {
      this.showUiMessage("Game Finished you can go back to loby", {
        type: "warning",
      });
      this.setState({ ...gameData });
      this.props.isFinish();
      return; // Return early to avoid the rest of the code
    }

    // Update player tiles
    gameData.playerTiles =
      gameData.players[
        gameData.currentPlayer === this.props.user.id ? 0 : 1
      ].playerTiles;

    const boardTiles = gameData.boardTiles;
    const newState = {
      ...gameData,
      stats: this.state.stats,
      boardTiles,
      active: gameData.active,
      playing: gameData.active ? true : false,
    };

    this.isChangePlayer = false;

    const show = await this.showStock(
      gameData.OrderedPlacedTiles,
      gameData.players,
      gameData.currentPlayer
    );
    this.showstock = show;

    if (gameData.currentPlayer === this.props.user.id) {
      console.log("mzhda");
      this.whoIsCurrent = true;
      newState.elapsedSeconds = 60;

      const check = await this.Checkhave(
        gameData.OrderedPlacedTiles,
        gameData.gameTiles,
        gameData.playerTiles
      );
      if (!check) {
        this.handleNoTilesScenario();
      }

      this.stopTimer();
      this.initTimer();
    } else if (
      gameData.currentPlayer === "cedd0894-6a57-11ee-8c99-0242ac120002"
    ) {
      this.whoIsCurrent = false;
      console.log("bot playing");
      const check = await this.Checkhave(
        gameData.OrderedPlacedTiles,
        gameData.gameTiles,
        gameData.players[1].playerTiles
      );
      if (!check) {
        this.handleNoTilesScenario();
      } else {
        setTimeout(() => {
          console.log("nbot start line 535");
          this.BotPlaying(gameData.playerTiles, gameData.OrderedPlacedTiles);
        }, 3000);
      }
      this.stopTimer();
      newState.elapsedSeconds = 60;
    }

    // Finally, set the state
    this.setState(newState);
  };
  BotPlaying = async (BotTiles, placedTiles) => {
    // first we are checking if bot have placed randomly tile

    if (placedTiles.length == 0) {
      console.log("zero runing");
      const randomTileIndex = Math.floor(Math.random() * BotTiles.length);
      await this.setSelectedTile(BotTiles[randomTileIndex]);
      return;
    } else {
      console.log("not zero runing line 553");
      const availableTiles = [];
      await Promise.all(
        BotTiles.map(async (tile) => {
          if (await this.availableTile(placedTiles, tile)) {
            availableTiles.push(tile);
          }
        })
      );

      if (availableTiles.length > 0) {
        console.log(availableTiles, "available tiles more than zero 565");
        const randomTileIndex = Math.floor(
          Math.random() * availableTiles.length
        );
        await this.setSelectedTile(availableTiles[randomTileIndex]);
      } else {
        const stock = this.state.gameTiles.length;
        console.log("availabale tiles is zero  get tile from stock 572");
        if (stock == 0) {
          // we dont have tiles and and stock empty we change to real player
          console.log("  stock lenght zero  575");
          this.showUiMessage("u dont have any tiles We change to other ", {
            type: "warning",
          });
          setTimeout(async () => {
            this.isChangePlayer = true;
            await this.makeTurn({ method: "" });
          }, 2000);
        } else {
          console.log("stock length not zero  withdrawl line 584");
          this.onStockWithdrawal(true);
        }
      }
    }
    // if bot dont have normaly get one tile from stock
  };

  availableTile = async (OrderedPlacedTiles, selectedTile) => {
    let check = false;
    const placedTiles = OrderedPlacedTiles;
    let lastFour = [],
      first,
      last;

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

    if (placedTiles.length == 1) {
      first = tilesMap[lastFour[0]].a;
      last = tilesMap[lastFour[0]].b;
    } else {
      first = (await tilesMap[lastFour[0]].double)
        ? tilesMap[lastFour[0]].a
        : this.findUncommonValue(
            [tilesMap[lastFour[0]]],
            [tilesMap[lastFour[1]]]
          );
      last = (await tilesMap[lastFour[lastFour.length - 1]].double)
        ? tilesMap[lastFour[lastFour.length - 1]].a
        : this.findUncommonValue(
            [tilesMap[lastFour[lastFour.length - 1]]],
            [tilesMap[lastFour[lastFour.length - 2]]]
          );
    }
    if (first === tilesMap[selectedTile].a) {
      check = true;
    }
    if (first === tilesMap[selectedTile].b) {
      check = true;
    }
    if (last === tilesMap[selectedTile].a) {
      //console.log(tilesMap[placedTiles[0]].a + "");
      check = true;
    }
    if (last === tilesMap[selectedTile].b) {
      check = true;
    }

    return check;
  };
  handleNoTilesScenario = () => {
    this.showUiMessage("u dont have any tiles We change to other ", {
      type: "warning",
    });
    setTimeout(async () => {
      this.isChangePlayer = true;
      await this.makeTurn({ method: "" });
    }, 2000);
  };
  async componentDidUpdate(prevProps, prevState) {
    if (prevState.active !== this.state.active && this.state.active) {
      this.startGame();
    }
    const CurrentPlayer = this.state.currentPlayer;
    const id = this.props.user.id;
    const elapsed = this.state.elapsedSeconds;

    if (CurrentPlayer == id && elapsed <= 0) {
      this.setState({ elapsedSeconds: 60 });
      this.isChangePlayer = true;
      // await this.makeTurn({ method: "" });

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
      const { currentPlayer } = this.state;

      this.findPlaceholders(
        currentPlayer == "cedd0894-6a57-11ee-8c99-0242ac120002"
      );
    });
  }
  FindDoubleRight(IsDouble, id) {
    switch (id) {
      case 437:
        return false;
      case 438:
        return true;

      case 466:
        return !IsDouble;

      case 494:
        return true;
      case 493:
        return false;
      case 485:
        return false;
      case 457:
        return true;
      case 458:
        return false;
      case 462:
        return false;
      case 434:
        return true;
      case 433:
        return false;

      default:
        return IsDouble;
    }
  }
  FindDoubleLeft(IsDouble, id) {
    switch (id) {
      case 401:
        return false;

      case 400:
        return true;

      case 372:
        return !IsDouble;

      case 344:
        return true;
      case 345:
        return false;
      case 355:
        return false;
      case 383:
        return true;
      case 382:
        return false;

      default:
        return IsDouble;
    }
  }
  FindPlaceToRight(RightSide, selectedTile) {
    const { RightPosition } = this.state;

    if (
      tilesMap[selectedTile].b === RightSide &&
      RightPosition[0] !== undefined
    ) {
      return {
        position: RightPosition[0],
        reversed: false,
        double: this.FindDoubleRight(
          tilesMap[selectedTile].double,
          RightPosition[0]
        ),
      };
    } else if (
      tilesMap[selectedTile].a === RightSide &&
      RightPosition[0] !== undefined
    ) {
      return {
        position: RightPosition[0],
        reversed: false,
        double: this.FindDoubleRight(
          tilesMap[selectedTile].double,
          RightPosition[0]
        ),
      };
    } else {
      return {
        position: 406,
        reversed: false,
        double: false,
      };
    }
  }
  FindPlaceToleft(LeftSide, selectedTile) {
    const { LeftPosition } = this.state;

    if (
      tilesMap[selectedTile].b === LeftSide &&
      LeftPosition[0] !== undefined
    ) {
      return {
        position: LeftPosition[0],
        reversed: false,
        double: this.FindDoubleLeft(
          tilesMap[selectedTile].double,
          LeftPosition[0]
        ),
      };
    } else if (
      tilesMap[selectedTile].a === LeftSide &&
      LeftPosition[0] !== undefined
    ) {
      return {
        position: LeftPosition[0],
        reversed: false,
        double: this.FindDoubleLeft(
          tilesMap[selectedTile].double,
          LeftPosition[0]
        ),
      };
    } else {
      return {
        position: 406,
        reversed: false,
        double: false,
      };
    }
  }
  async findPlaceholders(isBot) {
    const { selectedTile } = this.state;
    const avaiablePositions = [];

    let placedTiles = this.state.OrderedPlacedTiles;
    let lastFour = [];

    if (placedTiles.length == 0) {
      if (isBot) {
        this.onTilePlaced(406);
      }
      return;
    } else {
      if (placedTiles.length > 3) {
        lastFour = [
          placedTiles[0],
          placedTiles[1],
          placedTiles[placedTiles.length - 2],
          placedTiles[placedTiles.length - 1],
        ];
      } else if (placedTiles.length > 2) {
        lastFour = [
          placedTiles[0],
          placedTiles[1],
          placedTiles[1],
          placedTiles[placedTiles.length - 1],
        ];
      } else if (placedTiles.length > 1) {
        lastFour = [
          placedTiles[0],
          placedTiles[1],
          placedTiles[0],
          placedTiles[1],
        ];
      } else if (placedTiles.length > 0) {
        lastFour = [
          placedTiles[0],
          placedTiles[0],
          placedTiles[0],
          placedTiles[0],
        ];
      }
      // kota puly dasy rast ahenet aw sary kotay
      let RightSide = tilesMap[lastFour[lastFour.length - 1].tile].double
        ? tilesMap[lastFour[lastFour.length - 1].tile].a
        : this.findUncommonValue(
            [tilesMap[lastFour[lastFour.length - 1].tile]],
            [tilesMap[lastFour[lastFour.length - 2].tile]]
          );
      // kota puly dasy chap ahenet aw sary saratay
      let LeftSide = tilesMap[lastFour[0].tile].double
        ? tilesMap[lastFour[0].tile].a
        : this.findUncommonValue(
            [tilesMap[lastFour[0].tile]],
            [tilesMap[lastFour[1].tile]]
          );

      avaiablePositions.push(
        this.FindPlaceToRight(
          placedTiles.length == 1 ? tilesMap[placedTiles[0].tile].b : RightSide,
          selectedTile
        )
      );
      avaiablePositions.push(
        this.FindPlaceToleft(
          placedTiles.length == 1 ? tilesMap[placedTiles[0].tile].a : LeftSide,
          selectedTile
        )
      );

      console.log(avaiablePositions);
      if (isBot) {
        const filteredpositions = avaiablePositions.filter(
          (obj) => obj.position != 406
        );

        if (filteredpositions.length > 0) {
          // Generate a random index to select an object from the filtered list
          console.log("bot now set position automatic  915 isbot:" + isBot);
          const randomIndex = Math.floor(
            Math.random() * filteredpositions.length
          );
          const randomPosition = filteredpositions[randomIndex];
          // this.isChangePlayer = true;
          this.showPlaceholders(avaiablePositions);
          setTimeout(() => {
            this.onTilePlaced(randomPosition.position);
          }, 500);
        } else {
          console.log("No objects to select from after filtering out 406.");
        }
      } else {
        await this.clearPlaceholders();
        this.showPlaceholders(avaiablePositions);
      }
    }
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
          rotated: tile.position == 418 ? true : !tile.double,
        };
      }
    });

    this.setState({ boardTiles });
  }

  async onTilePlaced(tileId) {
    const { boardTiles, selectedTile } = this.state;

    const { OrderedPlacedTiles, LeftPosition, RightPosition } = this.state;

    if (boardTiles[tileId].placed === true) {
      this.showUiMessage("This tile is already placed", { type: "warning" });
    } else if (selectedTile != -1) {
      const BoradData = {
        ...boardTiles[tileId],
        tile: String(selectedTile),
        placed: true,
        placeholder: false,
        rotated: boardTiles[tileId].rotated,
      };
      boardTiles[tileId] = BoradData;
      //set Ordered placed tiles Logic
      if (tileId >= 406) {
        tileId != 406 && RightPosition.splice(0, 1);
        console.log(`Removed ${tileId} from the array right.`);

        OrderedPlacedTiles.push(BoradData);
      } else {
        LeftPosition.splice(0, 1);
        console.log(`Removed ${tileId} from the array left.`);

        OrderedPlacedTiles.unshift(BoradData);
      }

      // Remove from playerTiles
      const { currentPlayer, players, playerTiles } = this.state;
      // if (currentPlayer == "cedd0894-6a57-11ee-8c99-0242ac120002") {
      //   players[1].playerTiles.splice(
      //     players[1].playerTiles.indexOf(parseInt(selectedTile, 10)),
      //     1
      //   );
      // } else {
      playerTiles.splice(playerTiles.indexOf(parseInt(selectedTile, 10)), 1);

      console.log(" we slice from tiles  1003");
      this.setState({
        // OrderedPlacedTiles,
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

  onStockWithdrawal(isBot) {
    const { playerTiles, gameTiles, players } = this.state;

    const randomIndex = Math.floor(
      Math.random() * Math.floor(this.state.gameTiles.length)
    );

    if (randomIndex === -1) {
      this.showUiMessage("Stock is empty!", { type: "warning" });
    } else {
      if (isBot) {
        players[1].playerTiles.push(this.state.gameTiles[randomIndex]);
        gameTiles.splice(randomIndex, 1);
        this.makeTurn({ method: "stock" });
        this.setState({ playerTiles, gameTiles, players, selectedTile: -1 });
      } else {
        playerTiles.push(this.state.gameTiles[randomIndex]);
        gameTiles.splice(randomIndex, 1);
        this.makeTurn({ method: "stock" });
        this.setState({ playerTiles, gameTiles, selectedTile: -1 });
      }
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

    // const stats = {
    //   ...this.state.stats,
    //   numTurns: numTurns + 1,
    //   stockWithdrawals:
    //     method === "stock" ? stockWithdrawals + 1 : stockWithdrawals,
    //   score,
    //   turnTime,
    //   avgTurnTime: updatedAverageTurnTime.toFixed(1),
    // };

    //

    // Check game over
    const isGameOver = await this.isGameOver();
    if (isGameOver.result) {
      this.onGameOver(isGameOver.id);
    }
    this.showstock = false;
    await Api.patch(`/games/${this.props.id}/update`, {
      body: {
        RightPosition: this.state.RightPosition,
        LeftPosition: this.state.LeftPosition,
        OrderedPlacedTiles: this.state.OrderedPlacedTiles,
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
        if (response.status == 200) {
          // socket.emit("sendupdate", {
          //   id: this.props.id,
          //   user_id: this.props.user.id,
          //   gameData: response.data.gameData,
          // });

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
    const { gameTiles, OrderedPlacedTiles, players } = this.state;
    const check = await this.checkForTiles(
      OrderedPlacedTiles,
      gameTiles,
      players
    );
    let p1 = 0;
    let p2 = 0;
    players[0].playerTiles.forEach((t) => {
      p1 = p1 + tilesMap[t].a + tilesMap[t].b;
    });
    players[1].playerTiles.forEach((t) => {
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
          id: players[1].id,
        };
      } else if (p1 < p2) {
        // current player 1 win
        return { result: true, id: this.props.user.id };
      } else {
        //no one win
        return { result: true, id: "" };
      }

      // 0 means no one won
    } else if (players[0].playerTiles.length === 0) {
      return { result: true, id: this.props.user.id };
    } else if (players[1].playerTiles.length === 0) {
      return { result: true, id: "cedd0894-6a57-11ee-8c99-0242ac120002" };
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
