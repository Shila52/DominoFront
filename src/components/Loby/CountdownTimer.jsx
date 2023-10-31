import React, { useState, useEffect } from "react";

function CountdownTimer({ expireTime }) {
  const [remainingTime, setRemainingTime] = useState(
    calculateRemainingTime(expireTime)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const newRemainingTime = calculateRemainingTime(expireTime);
      setRemainingTime(newRemainingTime);

      if (newRemainingTime === 0) {
        clearInterval(interval);
        // Perform actions when the timer expires
        console.log("Timer expired!");
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expireTime]);

  function calculateRemainingTime(expireTime) {
    const currentTime = new Date().getTime();
    return Math.max(expireTime - currentTime, 0);
  }

  const seconds = Math.floor((remainingTime / 1000) % 60);
  const minutes = Math.floor((remainingTime / 1000 / 60) % 60);
 
  return (
    <div>
      <p>Expire  in :</p>
      <p>{`  ${minutes} minutes, ${seconds} seconds`}</p>
    </div>
  );
}

export default CountdownTimer;
