import React from "react";

import Thunderstorm from "../assets/Thunderstorm.gif";
import Rain from "../assets/Rain.gif";
import SnowDay from "../assets/Snow.gif";
import ClearDay from "../assets/ClearDay.gif";
import ClearNight from "../assets/ClearNight.gif";
import CloudsDay from "../assets/CloudsDay.gif";
import CloudsNight from "../assets/CloudsNight.gif";
import Haze from "../assets/Haze.gif";
import video from "../assets/video1.mp4";

const WeatherBackground = ({ condition }) => {
  const getBackground = () => {
    if (!condition) return video;

    const desc = condition.description?.toLowerCase() || "";
    const main = condition.main?.toLowerCase() || "";
    const isDay = condition.isDay;

    // Cloud conditions — use includes() instead of exact match
    const cloudTerms = [
      "few clouds",
      "scattered clouds",
      "broken clouds",
      "overcast clouds",
      "clouds",
    ];
    if (cloudTerms.some((term) => desc.includes(term))) {
      return isDay ? CloudsDay : CloudsNight;
    }

    // Clear sky detection - check if description includes "clear"
    if (desc.includes("clear")) {
      return isDay ? ClearDay : ClearNight;
    }

    // Rain detection
    if (desc.includes("rain") || main === "rain") {
      return Rain;
    }

    // Snow or freezing rain
    if (
      desc.includes("snow") ||
      desc.includes("sleet") ||
      desc.includes("freezing")
    ) {
      return SnowDay;
    }

    // Thunderstorm
    if (main === "thunderstorm" || desc.includes("thunder")) {
      return Thunderstorm;
    }

    // Mist, haze, fog etc.
    if (
      ["mist", "haze", "fog", "smoke", "dust", "sand"].some((term) =>
        desc.includes(term)
      )
    ) {
      return Haze;
    }

    return video; // fallback
  };

  const background = getBackground();

  return (
    <div className="fixed inset-0 z-0 overflow-hidden">
      {background === video ? (
        <video
          autoPlay
          loop
          muted
          className="w-full h-full object-cover opacity-100 pointer-events-none animate-fade-in"
        >
          <source src={video} type="video/mp4" />
        </video>
      ) : (
        <img
          src={background}
          alt="weather-background"
          className="w-full h-full object-cover opacity-20 pointer-events-none animate-fade-in"
        />
      )}
      <div className="absolute inset-0 bg-black/30" />
    </div>
  );
};

export default WeatherBackground;
