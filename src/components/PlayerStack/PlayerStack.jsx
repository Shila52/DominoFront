import React, { useEffect, useState } from "react";
import Tile from "../Tile/Tile.jsx";
import "./PlayerStack.css";
import { tilesMap } from "../../TilesMap";
const PlayerStack = (props) => {
  const [tileAvailability, setTileAvailability] = useState([]);
  const handleTileClick = (event) => {
    event.preventDefault();
    const selectedTile = event.currentTarget.dataset.tile;

    if (!props.isGameOver) {
      props.setSelectedTile(selectedTile);
    }
  };
  useEffect(() => {
    const fetchTileAvailability = async () => {
      const availability = await Promise.all(
        props.playerTiles.map(async (tile) =>
          (await availableTile(props.boardTiles, tile)) ? tile : null
        )
      );
      setTileAvailability(availability);
    };

    fetchTileAvailability();
  }, [props.playerTiles]);
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
  const availableTile = async (boardTiles, selectedTile) => {
    let check = false;
    const placedTiles = [];
    let lastFour = [],
      first,
      last;

    await boardTiles.map((tile, index) => {
      if (tile.placed === true) {
        placedTiles.push(tile);
      }
    });
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
      return true;
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
    }
    return check;
  };

  return (
    <div className="player-stack">
      {props.visible &&
        props.playerTiles &&
        props.playerTiles.map((tile, key) => {
          return (
            <div
              key={key}
              className={`${
                tileAvailability.find((a) => a == tile) == tile
                  ? "translate-y-2"
                  : "opacity-10 hover:opacity-10"
              }`}
            >
              <Tile
                availability={tileAvailability.find((a) => a == tile)}
                tile={tile}
                key={key}
                selected={props.selectedTile == tile}
                onTileClick={handleTileClick.bind(this)}
              />
            </div>
          );
        })}
    </div>
  );
};

export default PlayerStack;
