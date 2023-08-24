import React from "react";
import Timer from "../Timer/Timer.jsx";
import PlayerStatus from "../PlayerStatus/PlayerStatus.jsx";
import "./GameToolbar.css";

const GameToolbar = (props) => {
  return (
    <React.Fragment>
      <div className="toolbar text-slate-900">
        <span>
          {props.numPlayers !== props.players.length ? (
            <strong>Waiting for players</strong>
          ) : (
            <strong>
              {props.players.find((a)=>a.id==props.currentPlayer).userName} Playing
            </strong>
          )}
        </span>
        <span>Turns: {props.stats.numTurns}</span>
        <span>Withdrawals: {props.stats.stockWithdrawals}</span>
        <span>Avg. Turn: {props.stats.avgTurnTime}s</span>
        <span>Score: {props.stats.score}</span>

        <Timer elapsedSeconds={props.elapsedSeconds} />
      </div>

      <div className="player-status-container text-slate-900">
        {props.players &&
          props.players.map((player, index) => (
            <PlayerStatus
              key={index}
              player={player}
              currentPlayer={
               props.currentPlayer === player.id
              }
            />
          ))}
      </div>
      <div
        className={`ui-message ${props.uiMessage.show ? "show" : "hide"} ${
          props.uiMessage.type
        }`}
      >
        <span>{props.uiMessage.message}</span>
      </div>
    </React.Fragment>
  );
};

export default GameToolbar;
