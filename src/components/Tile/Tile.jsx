import React from "react";
import "./Tile.css";
import { tilesMap } from "../../TilesMap.js";

const Tile = (props) => {
  const renderedClasses = `tile ${props.rotated ? "rotated" : ""} ${
    props.placed ? "placed" : ""
  } ${props.selected ? "selected" : ""} ${props.isStock ? "stock" : ""} ${
    props.placeholder ? "placeholder" : ""
  } ${props.empty ? "empty" : ""} ${props.rendered ? "" : "hide"}`;
  //
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
  const FindleftSide = () => {
    if (props.id > 406) {
      if (props.prevId < props.id) {
        return findCommonValue(
          [tilesMap[props.tile]],
          [tilesMap[props.prevTile]]
        );
      } else {
        return findUncommonValue(
          [tilesMap[props.tile]],
          [tilesMap[props.prevTile]]
        );
      }
    } else {
      if (props.prevId < props.id) {
        return findCommonValue(
          [tilesMap[props.tile]],
          [tilesMap[props.prevTile]]
        );
      } else {
        return findUncommonValue(
          [tilesMap[props.tile]],
          [tilesMap[props.prevTile]]
        );
      }
    }
  };
  const FindRightSide = () => {
    if (props.id > 406) {
      if (props.prevId < props.id) {
        return findUncommonValue(
          [tilesMap[props.tile]],
          [tilesMap[props.prevTile]]
        );
      } else {
        return findCommonValue(
          [tilesMap[props.tile]],
          [tilesMap[props.prevTile]]
        );
      }
    } else {
      if (props.prevId < props.id) {
        return findUncommonValue(
          [tilesMap[props.tile]],
          [tilesMap[props.prevTile]]
        );
      } else {
        return findCommonValue(
          [tilesMap[props.tile]],
          [tilesMap[props.prevTile]]
        );
      }
    }
  };
  //
  return (
    <div
      className={renderedClasses}
      onClick={(event) => props.onTileClick(event, props.placed)}
      data-tile={props.tile}
      id={props.id}
    >
      <div
        className={`side-a tile-${
          props.prevTile != undefined ? FindleftSide() : tilesMap[props.tile].a
          //  props.reversed ? tilesMap[props.tile].b : tilesMap[props.tile].a
        }`}
      >
        <span className="dot dot-1" />
        <span className="dot dot-2" />
        <span className="dot dot-3" />
        <span className="dot dot-4" />
        <span className="dot dot-5" />
        <span className="dot dot-6" />
      </div>
      <div className="divider" />
      <div
        className={`side-b tile-${
          props.prevTile != undefined ? FindRightSide() : tilesMap[props.tile].b
        }`}
      >
        <span className="dot dot-1" />
        <span className="dot dot-2" />
        <span className="dot dot-3" />
        <span className="dot dot-4" />
        <span className="dot dot-5" />
        <span className="dot dot-6" />
      </div>
    </div>
  );
};

Tile.defaultProps = {
  rotated: false,
  placed: false,
  isStock: false,
  tile: 0,
  rendered: true,
};

export default Tile;
