import React, { useState, useEffect } from "react";
import GameListItem from "../GameListItem/GameListItem.jsx";

import Button from "../Button/Button.jsx";
import "./GameList.css";

import { useSelector } from "react-redux";
import socket from "../../socket.js";
import Timer from "../Timer/Timer.jsx";
function GameList(props) {
  const user = useSelector((state) => state.user.user);
  const [intervalId, setIntervalId] = useState(null); // Renamed to intervalId
  const [elapsed, setElapsed] = useState(0);
  const [gameFound, setgameFound] = useState(false);
  const [State, setState] = useState(-1);
  useEffect(() => {
    if (gameFound === false && State == 3) {
      console.log("runing it means false");
      socket.emit("searchForPlayers", { id: user.id });
    }
    socket.on("foundPlayer", (get) => {
      if (get.stop) {
        clearTimer();
        setgameFound(true);
      }
    });
    socket.on("getgame", async (data) => {
      await props.onGameClick(data.id);
    });
    socket.on("allUserOnline", async (data) => {
      console.log(data);
    });
    socket.on("AnotherLogin", async (data) => {
      if (data.logedout) {
        console.log("Another One Loged in With ur Account");
        setTimeout(() => {
          localStorage.removeItem("user");
          location.reload();
        }, 2000);
      }
    });
  }, [socket]);

  useEffect(() => {
    socket.emit("makeUseronline", { id: user.id }, (res) => {
      setState(res.state);
    });

    return () => {
      clearTimer();
      return null;
    };
  }, []);
  const initTimer = () => {
    if (gameFound === false) {
      clearTimer(); // Clear the existing interval if any
      const newIntervalId = setInterval(async () => {
        setElapsed((prevElapsed) => prevElapsed + 1);
      }, 1000);
      setIntervalId(newIntervalId);
    }
  };
  const clearTimer = () => {
    clearInterval(intervalId);
    setIntervalId(null);
    setElapsed(0);
  };

  const MakeNewGame = async () => {
    socket.emit("makeUserSearching", { id: user.id, coin: 400 }, (res) => {
      setState(res.state);
    });

    initTimer();
    setTimeout(() => {
      socket.emit("searchForPlayers", { coin: 400 });
    }, 1500);
  };
  const Cancel = async () => {
    socket.emit("makeUseronline", { id: user.id }, (res) => {
      console.log(res);
      setState(res.state);
      clearTimer();
    });
  };

  return (
    <React.Fragment>
      <div className="game-list-container">
        <div className="game-list-header">
          <h2>
            Games{" "}
            {gameFound && "Games found waiting untill everything get ready "}
          </h2>
          {State == 3 && <Timer elapsedSeconds={elapsed} />}
          {State == 3 ? (
            <Button buttonType="new-game" name="Cancel" onClick={Cancel} />
          ) : (
            <Button
              buttonType="new-game"
              name="Search For Game"
              onClick={MakeNewGame}
            />
          )}
        </div>
      </div>
    </React.Fragment>
  );
}

export default GameList;
