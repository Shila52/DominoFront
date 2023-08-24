import React, { useState, useEffect } from "react";
import GameListItem from "../GameListItem/GameListItem.jsx";

import Button from "../Button/Button.jsx";
import "./GameList.css";
import Api from "../../Api.js";


import { useSelector } from "react-redux";
import socket from "../../socket.js";
function GameList(props) {
 
  const user = useSelector((state) => state.user.user);
  const [games, setGames] = useState([]);
  const [Loading, setLoading] = useState(true);
  useEffect(() => {
  
    socket.on("gamelist", (get) => {
      setLoading(true);
      setGames(get.data);
      setLoading(false);
    });
  }, [socket]);

  useEffect(() => {
    getGames();

    return () => {
      return null;
    };
  }, []);

  const getGames = async () => {
    try {
      setLoading(true);
      const response = await Api("/games/all", {
        method: "GET",
        credentials: "include",
      });
      if (response.status !== 200) {
        throw response;
      }
      console.log(response.data);
      setGames(response.data);
      setLoading(false);
    } catch (err) {
      console.log(err);
      throw err;
    }
  };
  const MakeNewGame = async () => {
    await Api.post("/games/new", {
      body: {
        id: user.id,
      },
      credentials: "include",
    }).then((response) => {
      if (response.status == 200) {
        socket.emit("getgamelist", { get: true });
      } else {
      }
    });
    return false;
  };

  return (
    <React.Fragment>
      <div className="game-list-container">
        <div className="game-list-header">
          <h2>Games</h2>
          <Button
            buttonType="new-game"
            name="Create a New Game"
            onClick={MakeNewGame}
          />
        </div>
        <ul>
          {Loading
            ? null
            : games.map((game, index) => (
                <GameListItem
                  game={game}
                  key={index}
                  onGameClick={game.active ? () => {} : props.onGameClick}
                />
              ))}
        </ul>
      </div>
    </React.Fragment>
  );
}

export default GameList;
