import React from "react";
import ErrorBoundary from "./ErrorBoundary";
import TripForm from "./components/TripForm";

function App() {
  return (
    <ErrorBoundary>
      <TripForm />
    </ErrorBoundary>
  );
}

export default App;
