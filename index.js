import "react-native-gesture-handler";
import { registerRootComponent } from "expo";
import React from "react";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import App from "./App";

function Root() {
  // Only wrap with GestureHandlerRootView on native platforms
  // On web, it blocks all touch/click events
  if (Platform.OS === "web") {
    return <App />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <App />
    </GestureHandlerRootView>
  );
}

registerRootComponent(Root);
