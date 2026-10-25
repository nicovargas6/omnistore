import React from "react";
import { useStore } from "../context/StoreContext";
import FashionHero from "./FashionHero";
import FoodHero from "./FoodHero";
import DefaultHero from "./DefaultHero";

export default function Hero({ onExploreClick, onSelectCategory }) {
  const { activePresetKey, storeConfig } = useStore();

  const presetId = activePresetKey || storeConfig?.id;

  if (presetId === "fashion") {
    return <FashionHero onExploreClick={onExploreClick} onSelectCategory={onSelectCategory} />;
  }

  if (presetId === "restaurant") {
    return <FoodHero onExploreClick={onExploreClick} onSelectCategory={onSelectCategory} />;
  }

  return <DefaultHero onExploreClick={onExploreClick} onSelectCategory={onSelectCategory} />;
}
