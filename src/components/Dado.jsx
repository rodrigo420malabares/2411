import '../styles/Dado.css'

function Dado({ valor }) {
  // Mapeamos el número (1-6) a su dibujito
  const caras = {
    1: '⚀',
    2: '⚁',
    3: '⚂',
    4: '⚃',
    5: '⚄',
    6: '⚅'
  };

  return (
    <div className="dado">
      {caras[valor]}
    </div>
  );
}

export default Dado;