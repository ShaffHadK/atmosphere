import { 
  MdWbSunny, 
  MdCloud, 
  MdFoggy, 
  MdWaterDrop, 
  MdAcUnit, 
  MdFlashOn 
} from 'react-icons/md';

export const getWeatherImage = (code) => {
  if (code <= 3) return "/assets/sunny.jpg";
  if (code >= 45 && code <= 48) return "/assets/foggy.jpg";
  if (code >= 51 && code <= 67) return "/assets/rainy.jpg";
  if (code >= 71 && code <= 77) return "/assets/snow.jpg";
  if (code >= 95) return "/assets/thunderstorm.jpg";
  return "/assets/sunny.jpg";
};

export const getWeatherIcon = (code) => {
  if (code === 0) return MdWbSunny;
  if (code <= 3) return MdCloud;
  if (code >= 45 && code <= 48) return MdFoggy;
  if (code >= 51 && code <= 67) return MdWaterDrop;
  if (code >= 71 && code <= 77) return MdAcUnit;
  if (code >= 95) return MdFlashOn;
  return MdCloud;
};

export const getWeatherDescription = (code) => {
  if (code === 0) return "Clear Sky";
  if (code === 1 || code === 2 || code === 3) return "Partly Cloudy";
  if (code >= 45 && code <= 48) return "Foggy & Misty";
  if (code >= 51 && code <= 57) return "Drizzle";
  if (code >= 61 && code <= 67) return "Rainy";
  if (code >= 71 && code <= 77) return "Snowy";
  if (code >= 80 && code <= 82) return "Rain Showers";
  if (code >= 95) return "Thunderstorms";
  return "Cloudy";
};
