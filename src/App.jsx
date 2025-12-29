import './App.css';
import { useState } from 'react';
import Juego from './components/Juego';

function App() {

  const [pantalla, setPantalla] = useState('menu');

  return (
    <>
      {/* PANTALLA 1: EL MENÚ PRINCIPAL */}
      {pantalla === 'menu' && (
        <div className="card">
          <h1>24/11</h1>
          <button onClick={() => setPantalla('seleccion')}>
            Comenzar Juego
          </button>
        </div>
      )}




      {/* PANTALLA 2: SELECCIÓN DE JUGADORES */}
      {pantalla === 'seleccion' && (
        <div className="card">
          <h2>Elige el modo de juego</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button>vs PC</button>
            
            {/* Este botón cambia el estado a 'juego' */}
            <button onClick={() => setPantalla('juego')}>
                2 jugadores
            </button>
            
            <button>3 jugadores</button>
            <button>4 jugadores</button>
          </div>

          <br />
          <button onClick={() => setPantalla('menu')}>
            ⬅ Volver
          </button>
        </div>
      )}








      {/* ↓↓↓ ESTO ES LO QUE TE FALTABA ↓↓↓ 
         Sin esto, el botón cambia el estado pero no muestra nada.
      */}
      {pantalla === 'juego' && (
        <Juego volver={() => setPantalla('menu')} />
      )}
      
    </>
  )
}

export default App;