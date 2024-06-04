import { useState } from "react";

const rooms = [
  { type: "Single", dailyRate: 50, available: true },
  { type: "Double", dailyRate: 80, available: true },
  { type: "Suite", dailyRate: 150, available: true },
  { type: "Deluxe", dailyRate: 200, available: false },
  { type: "Penthouse", dailyRate: 300, available: false },
];

function App() {
  const [selectedRoom, setSelectedRoom] = useState("");

  return <></>;
}

export default App;
