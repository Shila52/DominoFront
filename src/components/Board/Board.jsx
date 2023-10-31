import React from "react";
import Tile from "../Tile/Tile.jsx";
import "./Board.css";

const Board = (props) => {
  const handleTilePlace = (event) => {
    const tileId = event.currentTarget.id;

    props.onTilePlaced(tileId);
  };

  return (
    <div className="board">
      {props.boardTiles &&
        props.boardTiles.map((tile) => {
          const prev = props.OrderedPlacedTiles.findIndex(
            (Tile) => Tile.id == tile.id
          );
          return (
            <React.Fragment key={tile.id}>
              {tile.rendered ? (
                <Tile
                  prevTile={
                    props.OrderedPlacedTiles[tile.id < 406 ? prev + 1 : prev - 1]
                      ?.tile
                  }
                  prevId={
                    props.OrderedPlacedTiles[tile.id < 406 ? prev + 1 : prev - 1]
                      ?.id
                  }
                  tile={tile.tile}
                  placeholder={tile.placeholder}
                  placed={tile.placed}
                  onTileClick={handleTilePlace}
                  rotated={tile.rotated}
                  reversed={tile.reversed}
                  id={tile.id}
                  rendered={tile.rendered}
                />
              ) : (
                <div className="board-placeholder" />
              )}
            </React.Fragment>
          );
        })}
    </div>
  );
};

export default Board;
