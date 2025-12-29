// src/context/ScoreContext.jsx
import { createContext, useState, useContext } from 'react';

// 1. Crear el contexto
const ScoreContext = createContext();

// 2. Crear el componente "Provider"
export const ScoreProvider = ({ children }) => {
  // Estado inicial: puede ser un objeto si tienes varios jugadores
  const [scores, setScores] = useState({
    player1: 0,
    player2: 0
  });

  // Función para sumar puntos
  const addPoints = (player, points) => {
    setScores(prevScores => ({
      ...prevScores,
      [player]: prevScores[player] + points
    }));
  };

  // Función para reiniciar (útil para "Nueva Partida")
  const resetScores = () => {
    setScores({ player1: 0, player2: 0 });
  };

  return (
    <ScoreContext.Provider value={{ scores, addPoints, resetScores }}>
      {children}
    </ScoreContext.Provider>
  );
};

// 3. Hook personalizado para usarlo fácil
export const useScore = () => useContext(ScoreContext);