import '../styles/Dado.css'; // Asegúrate de que importe tu archivo CSS

const Dado = ({ valor }) => {
  // Esta función determina dónde van los puntos según el número
  const getPuntos = () => {
    const puntos = [];
    // Lógica de posicionamiento para una cuadrícula de 3x3 columns
    // (Esto define qué celdas del grid llevan un punto)
    const posiciones = {
      1: [4], // Centro
      2: [0, 8], // Esquina sup-izq, inf-der
      3: [0, 4, 8], // Diagonal
      4: [0, 2, 6, 8], // Las 4 esquinas
      5: [0, 2, 4, 6, 8], // Esquinas + centro
      6: [0, 2, 3, 5, 6, 8] // Dos columnas laterales
    };

    const posActuales = posiciones[valor] || [];

    // Creamos 9 celdas posibles. Si la celda está en 'posActuales', lleva punto.
    for (let i = 0; i < 9; i++) {
      puntos.push(
        <div 
          key={i} 
          className={`celda ${posActuales.includes(i) ? 'punto' : ''}`} 
        />
      );
    }
    return puntos;
  };

  return (
    <div className="dado-cubo">
      {getPuntos()}
    </div>
  );
};

export default Dado;