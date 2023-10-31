import React, { useState, useEffect, useRef } from "react";
import PlayerStack from "../PlayerStack/PlayerStack.jsx";
import Board from "../Board/Board.jsx";
import Stock from "../Stock/Stock.jsx";
import GameToolbar from "../GameToolbar/GameToolbar.jsx";
import { tilesMap } from "../../TilesMap";

import Api from "../../Api.js";
import { useSelector } from "react-redux";
export default function Bot(props) {
  const user = useSelector((state) => state.user.user);

  const Counter = useRef(0);
  const [showstock, setshowstock] = useState(false);
  const [isChangePlayer, setisChangePlayer] = useState(false);
  const [Loading, setLoading] = useState(false);
  const [interval, setinterval] = useState(null);
  const [State, setState] = useState({
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
  });

  const startGame = async () => {
    showUiMessage("New game started", { type: "info" });
    setState({
      ...State,
      elapsedSeconds: 60,
      isGameOver: false,
      stats: {
        ...State.stats,
        numTurns: 0,
        stockWithdrawals: 0,
        turnTime: [0],
        avgTurnTime: 0,
      },
    });
    stopTimer();
  };
  useEffect(() => {
    const Get = async () => await getGameData();
    Counter.current = Counter.current + 1;
    console.log(Counter.current);
    if (Counter.current == 2) {
      console.log("getgame Data");
      Get();
    }

    stopTimer();

    return async () => {
      setState(async (prevState) => {
        if (prevState.active !== State.active && State.active) {
          startGame();
        }
        const CurrentPlayer = State.currentPlayer;
        const id = user.id;
        const elapsed = State.elapsedSeconds;

        if (CurrentPlayer == id && elapsed <= 0) {
          setState({ ...State, elapsedSeconds: 60 });
          setisChangePlayer(true);
          await makeTurn({ method: "" });

          stopTimer();
        }
      });
    };
  }, [State.elapsedSeconds]);
  const initTimer = () => {
    const interval = setInterval(() => {
      setState((prevState) => ({
        ...prevState,
        elapsedSeconds: prevState.elapsedSeconds - 1,
      }));
    }, 1000);
    setinterval(interval);
  };

  const stopTimer = () => {
    clearInterval(interval);
  };
  const getGameData = async () => {
    try {
      setLoading(true);
      const response = await Api.get(`/games/${props.id}`, {
        credentials: "include",
      });
  
      if (response.status !== 200) {
        throw new Error("Failed to fetch game data");
      }
  
      const gameData = response.data;
      console.log(State, "before");
  
      const boardTiles = gameData.boardTiles;
      gameData.playerTiles = gameData.players[gameData.currentPlayer === user.id ? 0 : 1].playerTiles;
  
      setState((prevState) => ({
        ...prevState,
        ...gameData,
        boardTiles,
        active: gameData.active,
        playing: gameData.active,
        elapsedSeconds: 60,
      }));
      console.log(State, "after");
      setisChangePlayer(false);
  
      const show = await showStock(gameData.OrderedPlacedTiles, gameData.players, gameData.currentPlayer);
      setshowstock(show);
  
      if (gameData.currentPlayer === "cedd0894-6a57-11ee-8c99-0242ac120002") {
        setTimeout(() => {
          console.log("bot start line 159");
          BotPlaying(gameData.playerTiles, gameData.OrderedPlacedTiles);
        }, 3000);
      }
    } catch (error) {
      console.error("Error fetching game data:", error);
      // Handle the error gracefully, e.g., display an error message to the user
    } finally {
      setLoading(false);
    }
  };
  
  const availableTile = async (OrderedPlacedTiles, selectedTile) => {
    let check = false;
    const placedTiles = OrderedPlacedTiles;
    let first, last;
    const lastFour = LastFour(placedTiles);

    if (placedTiles.length == 1) {
      first = tilesMap[lastFour[0]].a;
      last = tilesMap[lastFour[0]].b;
    } else {
      first = (await tilesMap[lastFour[0]].double)
        ? tilesMap[lastFour[0]].a
        : findUncommonValue([tilesMap[lastFour[0]]], [tilesMap[lastFour[1]]]);
      last = (await tilesMap[lastFour[lastFour.length - 1]].double)
        ? tilesMap[lastFour[lastFour.length - 1]].a
        : findUncommonValue(
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
  const setSelectedTile = (selectedTile) => {
    const { currentPlayer } = State;
    setState({
      ...State,
      selectedTile: selectedTile,
    });

    findPlaceholders(currentPlayer == "cedd0894-6a57-11ee-8c99-0242ac120002");
  };
  const onTilePlaced = async (tileId) => {
    const {
      boardTiles,
      selectedTile,
      OrderedPlacedTiles,
      LeftPosition,
      RightPosition,
      playerTiles,
    } = State;

    if (boardTiles[tileId].placed === true) {
      showUiMessage("This tile is already placed", { type: "warning" });
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

      playerTiles.splice(playerTiles.indexOf(parseInt(selectedTile, 10)), 1);

      console.log(" we slice from tiles  1003");
      setState({
        ...State,
        OrderedPlacedTiles,
        LeftPosition,
        RightPosition,
        boardTiles,
        playerTiles,
        selectedTile: -1,
      });
      setisChangePlayer(true);

      makeTurn({ method: "place" });
    } else {
      showUiMessage("You must select a tile first", { type: "warning" });
    }

    await clearPlaceholders();
  };
  const clearPlaceholders = async () => {
    const { boardTiles } = State;

    setState({
      ...State,
      boardTiles: await boardTiles.map((tile) => {
        return {
          ...tile,
          rendered: tile.isFirst || tile.placed,
        };
      }),
    });
  };
  const showUiMessage = (message, { type }) => {
    setState({
      ...State,
      uiMessage: {
        message,
        type,
        show: true,
      },
    });

    setTimeout(
      () =>
        setState({ ...State, uiMessage: { ...State.uiMessage, show: false } }),
      2500
    );
  };
  const checkForTiles = async (OrderedPlacedTiles, remaintiles, players) => {
    const allTiles = [];
    const placedTiles = OrderedPlacedTiles;

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
      const lastFour = LastFour(placedTiles);

      first = tilesMap[lastFour[0]].double
        ? tilesMap[lastFour[0]].a
        : findUncommonValue([tilesMap[lastFour[0]]], [tilesMap[lastFour[1]]]);

      last = tilesMap[lastFour[lastFour.length - 1]].double
        ? tilesMap[lastFour[lastFour.length - 1]].a
        : findUncommonValue(
            [tilesMap[lastFour[lastFour.length - 1]]],
            [tilesMap[lastFour[lastFour.length - 2]]]
          );

      allTiles.forEach((selectedTile) => {
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
  };
  const isGameOver = async () => {
    const { gameTiles, OrderedPlacedTiles, players } = State;
    const check = await checkForTiles(OrderedPlacedTiles, gameTiles, players);
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
      showUiMessage("Qapat!", {
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
        return { result: true, id: user.id };
      } else {
        //no one win
        return { result: true, id: "" };
      }
    } else if (players[0].playerTiles.length === 0) {
      return { result: true, id: user.id };
    } else if (players[1].playerTiles.length === 0) {
      return { result: true, id: "cedd0894-6a57-11ee-8c99-0242ac120002" };
    }

    return { result: false };
  };
  const onGameOver = (winner) => {
    setState({ ...State, isGameOver: true });

    if (winner == user.id) {
      showUiMessage("GAME OVER! Congratulations, you WON!", {
        type: "info",
      });
    } else {
      showUiMessage("GAME OVER! Too bad, you lost.", {
        type: "info",
      });
    }
    stopTimer();
  };
  const makeTurn = async ({ method }) => {
    // Check game over
    const isGameOver = await isGameOver();
    if (isGameOver.result) {
      onGameOver(isGameOver.id);
    }
    setshowstock(false);
    await Api.patch(`/games/${props.id}/update`, {
      body: {
        RightPosition: State.RightPosition,
        LeftPosition: State.LeftPosition,
        OrderedPlacedTiles: State.OrderedPlacedTiles,
        isChangePlayer: isChangePlayer,
        playerTiles: State.playerTiles,
        boardTiles: State.boardTiles,
        players: State.players,
        currentPlayer: State.currentPlayer,
        gameTiles: State.gameTiles,
        gameStats: {
          isGameover: isGameOver,
        },
      },
      credentials: "include",
    })
      .then((response) => {
        if (response.status == 200) {
          handleSocketUpdate(response.data);
        }
      })
      .catch((err) => {
        localStorage.removeItem("user");
        location.reload();
      });
    return false;
  };
  const handleSocketUpdate = async (data) => {
    let gameData = data.gameData;

    if (gameData.$isNew == false) {
      gameData._doc.playerTiles = gameData.playerTiles;
      gameData._doc.stats = gameData.stats;
      gameData = gameData._doc;
    }

    await clearPlaceholders();
    // Check for game over
    if (gameData.gameStats.isGameover.result) {
      showUiMessage("Game Finished you can go back to loby", {
        type: "warning",
      });
      setState({ ...gameData });
      props.isFinish();
      return; // Return early to avoid the rest of the code
    }

    // Update player tiles
    gameData.playerTiles =
      gameData.players[gameData.currentPlayer === user.id ? 0 : 1].playerTiles;

    const boardTiles = gameData.boardTiles;
    const newState = {
      ...gameData,
      stats: State.stats,
      boardTiles,
      active: gameData.active,
      playing: gameData.active,
      elapsedSeconds: 60,
    };

    setisChangePlayer(false);

    const show = await showStock(
      gameData.OrderedPlacedTiles,
      gameData.players,
      gameData.currentPlayer
    );

    setshowstock(show);

    if (gameData.currentPlayer === user.id) {
      console.log("mzhda");
      //   this.whoIsCurrent = true;

      const check = await Checkhave(
        gameData.OrderedPlacedTiles,
        gameData.gameTiles,
        gameData.playerTiles
      );
      if (!check) {
        this.handleNoTilesScenario();
      }

      stopTimer();
      initTimer();
    } else if (
      gameData.currentPlayer === "cedd0894-6a57-11ee-8c99-0242ac120002"
    ) {
      //   this.whoIsCurrent = false;
      console.log("bot playing");
      const check = await Checkhave(
        gameData.OrderedPlacedTiles,
        gameData.gameTiles,
        gameData.players[1].playerTiles
      );
      if (!check) {
        handleNoTilesScenario();
      } else {
        setTimeout(() => {
          console.log("nbot start line 535");
          BotPlaying(gameData.playerTiles, gameData.OrderedPlacedTiles);
        }, 3000);
      }
      stopTimer();
    }

    // Finally, set the state
    setState(newState);
  };
  const handleNoTilesScenario = () => {
    showUiMessage("u dont have any tiles We change to other ", {
      type: "warning",
    });
    setTimeout(async () => {
      setisChangePlayer(true);
      await makeTurn({ method: "" });
    }, 2000);
  };
  const Checkhave = async (OrderedPlacedTiles, gametile, playerTiles) => {
    const stack = gametile;

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
      let first, last;

      if (placedTiles.length == 0) {
        check = true;
      } else {
        const lastFour = LastFour(placedTiles);

        first = tilesMap[lastFour[0]].double
          ? tilesMap[lastFour[0]].a
          : findUncommonValue([tilesMap[lastFour[0]]], [tilesMap[lastFour[1]]]);
        last = tilesMap[lastFour[lastFour.length - 1]].double
          ? tilesMap[lastFour[lastFour.length - 1]].a
          : findUncommonValue(
              [tilesMap[lastFour[lastFour.length - 1]]],
              [tilesMap[lastFour[lastFour.length - 2]]]
            );

        allTiles.forEach((selectedTile) => {
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
  };
  const findPlaceholders = async (isBot) => {
    const { selectedTile } = State;
    const avaiablePositions = [];

    const placedTiles = State.OrderedPlacedTiles;

    if (placedTiles.length == 0) {
      if (isBot) {
        onTilePlaced(406);
      }
      return;
    } else {
      const lastFour = LastFour(placedTiles);
      // kota puly dasy rast ahenet aw sary kotay
      let RightSide = tilesMap[lastFour[lastFour.length - 1].tile].double
        ? tilesMap[lastFour[lastFour.length - 1].tile].a
        : findUncommonValue(
            [tilesMap[lastFour[lastFour.length - 1].tile]],
            [tilesMap[lastFour[lastFour.length - 2].tile]]
          );
      // kota puly dasy chap ahenet aw sary saratay
      let LeftSide = tilesMap[lastFour[0].tile].double
        ? tilesMap[lastFour[0].tile].a
        : findUncommonValue(
            [tilesMap[lastFour[0].tile]],
            [tilesMap[lastFour[1].tile]]
          );

      avaiablePositions.push(
        FindPlaceToRight(
          placedTiles.length == 1 ? tilesMap[placedTiles[0].tile].b : RightSide,
          selectedTile
        )
      );
      avaiablePositions.push(
        FindPlaceToleft(
          placedTiles.length == 1 ? tilesMap[placedTiles[0].tile].a : LeftSide,
          selectedTile
        )
      );

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
          showPlaceholders(avaiablePositions);
          setTimeout(() => {
            onTilePlaced(randomPosition.position);
          }, 500);
        } else {
          console.log("No objects to select from after filtering out 406.");
        }
      } else {
        await clearPlaceholders();
        showPlaceholders(avaiablePositions);
      }
    }
  };
  const FindDoubleRight = (IsDouble, id) => {
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
  };
  const FindDoubleLeft = (IsDouble, id) => {
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
  };
  const FindPlaceToRight = (RightSide, selectedTile) => {
    const { RightPosition } = State;

    if (
      tilesMap[selectedTile].b === RightSide &&
      RightPosition[0] !== undefined
    ) {
      return {
        position: RightPosition[0],
        reversed: false,
        double: FindDoubleRight(
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
        double: FindDoubleRight(
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
  };
  const FindPlaceToleft = (LeftSide, selectedTile) => {
    const { LeftPosition } = State;

    if (
      tilesMap[selectedTile].b === LeftSide &&
      LeftPosition[0] !== undefined
    ) {
      return {
        position: LeftPosition[0],
        reversed: false,
        double: FindDoubleLeft(tilesMap[selectedTile].double, LeftPosition[0]),
      };
    } else if (
      tilesMap[selectedTile].a === LeftSide &&
      LeftPosition[0] !== undefined
    ) {
      return {
        position: LeftPosition[0],
        reversed: false,
        double: FindDoubleLeft(tilesMap[selectedTile].double, LeftPosition[0]),
      };
    } else {
      return {
        position: 406,
        reversed: false,
        double: false,
      };
    }
  };
  const BotPlaying = async (BotTiles, placedTiles) => {
    // first we are checking if bot have placed randomly tile

    if (placedTiles.length == 0) {
      console.log("zero runing");
      const randomTileIndex = Math.floor(Math.random() * BotTiles.length);
      await setSelectedTile(BotTiles[randomTileIndex]);
      return;
    } else {
      console.log("not zero runing line 553");
      const availableTiles = [];
      await Promise.all(
        BotTiles.map(async (tile) => {
          if (await availableTile(placedTiles, tile)) {
            availableTiles.push(tile);
          }
        })
      );

      if (availableTiles.length > 0) {
        console.log(availableTiles, "available tiles more than zero 565");
        const randomTileIndex = Math.floor(
          Math.random() * availableTiles.length
        );
        await setSelectedTile(availableTiles[randomTileIndex]);
      } else {
        const stock = State.gameTiles.length;
        console.log("availabale tiles is zero  get tile from stock 572");
        if (stock == 0) {
          // we dont have tiles and and stock empty we change to real player
          console.log("  stock lenght zero  575");
          showUiMessage("u dont have any tiles We change to other ", {
            type: "warning",
          });
          setTimeout(async () => {
            setisChangePlayer(true);

            await makeTurn({ method: "" });
          }, 2000);
        } else {
          console.log("stock length not zero  withdrawl line 584");
          onStockWithdrawal(true);
        }
      }
    }
    // if bot dont have normaly get one tile from stock
  };

  const LastFour = (placedTiles) => {
    if (placedTiles.length > 3) {
      return [
        placedTiles[0].tile,
        placedTiles[1].tile,
        placedTiles[placedTiles.length - 2].tile,
        placedTiles[placedTiles.length - 1].tile,
      ];
    } else if (placedTiles.length > 2) {
      return [
        placedTiles[0].tile,
        placedTiles[1].tile,
        placedTiles[1].tile,
        placedTiles[placedTiles.length - 1].tile,
      ];
    } else if (placedTiles.length > 1) {
      return [
        placedTiles[0].tile,
        placedTiles[1].tile,
        placedTiles[0].tile,
        placedTiles[1].tile,
      ];
    } else if (placedTiles.length > 0) {
      return [
        placedTiles[0].tile,
        placedTiles[0].tile,
        placedTiles[0].tile,
        placedTiles[0].tile,
      ];
    }
    return [];
  };
  const showStock = async (OrderedPlacedTiles, players, current) => {
    let check = true;
    const allTiles = await players.find((p) => p.id == current).playerTiles;
    const placedTiles = OrderedPlacedTiles;

    const lastFour = LastFour(placedTiles);
    if (placedTiles.length == 0) {
      return false;
    } else {
      const first = tilesMap[lastFour[0]].double
        ? tilesMap[lastFour[0]].a
        : findUncommonValue([tilesMap[lastFour[0]]], [tilesMap[lastFour[1]]]);
      const last = tilesMap[lastFour[lastFour.length - 1]].double
        ? tilesMap[lastFour[lastFour.length - 1]].a
        : findUncommonValue(
            [tilesMap[lastFour[lastFour.length - 1]]],
            [tilesMap[lastFour[lastFour.length - 2]]]
          );

      allTiles.forEach((selectedTile) => {
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
  };
  const findUncommonValue = (arr1, arr2) => {
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
  };
  const findCommonValue = (arr1, arr2) => {
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
  };
  return Loading ? null : (
    <div>
      <div>
        <GameToolbar
          stats={State.stats}
          uiMessage={State.uiMessage}
          elapsedSeconds={State.elapsedSeconds}
          isGameOver={State.isGameOver}
          players={State.players}
          numPlayers={2}
          currentPlayer={State.currentPlayer}
        />

        <Board
          boardTiles={State.boardTiles}
          selectedTile={State.selectedTile}
          onTilePlaced={onTilePlaced}
          OrderedPlacedTiles={State.OrderedPlacedTiles}
        />

        {State.active ? (
          <div
            className={`player-section ${
              State.players.find((player) => player.id == user.id).id ==
              State.currentPlayer
                ? ""
                : "hidden"
            }
         text-slate-900`}
          >
            <Stock
              gameTiles={State.gameTiles}
              empty={State.gameTiles.length === 0}
              onStockWithdrawal={onStockWithdrawal}
              isGameOver={State.gameStats.isGameover.result}
              visible={showstock}
            />

            <PlayerStack
              playerTiles={State.playerTiles}
              selectedTile={State.selectedTile}
              setSelectedTile={setSelectedTile}
              OrderedPlacedTiles={State.OrderedPlacedTiles}
              onTilePlace={onTilePlaced}
              isGameOver={State.gameStats.isGameover.result}
              visible={true}
            />
          </div>
        ) : (
          ""
        )}
      </div>
    </div>
  );
}
