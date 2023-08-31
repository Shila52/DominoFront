import React from "react";
import "./PlayerStatus.css";

const PlayerStatus = (props) => {
  return (
    <div
      className={`player-status ${props.currentPlayer ? "current-player" : ""}`}
    >
      <div>{props.player.userName} </div>
      <div>points : {props.player.point}</div>
      <div>
        {[...Array(props.player.playerTiles.length)].map((_, index) => (
          <span key={index} className="tiny-tile" />
        ))}
      </div>
    </div>
  );
};

export default PlayerStatus;
