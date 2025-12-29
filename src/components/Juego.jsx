import { useState } from 'react';
import Dado from './Dado';

function Juego({ volver }) {
  // --- ESTADOS GLOBALES ---
  const [fase, setFase] = useState('inicio_j1');
  const [turno, setTurno] = useState(1);
  const [puntajes, setPuntajes] = useState({ jug1: 0, jug2: 0 }); 
  const [sumasInicio, setSumasInicio] = useState({ j1: 0, j2: 0 });
  const [dados, setDados] = useState([1, 1, 1, 1, 1]); // Visuales para inicio

  // --- ESTADOS DEL TURNO (NUEVA LÓGICA) ---
  const [etapaTurno, setEtapaTurno] = useState('tirar_inicial'); // 'tirar_inicial', 'eligiendo_estrategia', 'ronda_activa', 'resumen'
  const [dadosRonda, setDadosRonda] = useState([null, null, null, null, null]); // Los 5 dados del turno
  const [dadosFijos, setDadosFijos] = useState([false, false, false, false, false]); // Cuáles están "guardados"
  const [estrategia, setEstrategia] = useState(null); // 'bajos' o 'altos'
  const [puntosTurno, setPuntosTurno] = useState(0);

  // --- ESTADOS DE FASE GOLPE (Ataque) ---
  const [enFaseGolpe, setEnFaseGolpe] = useState(false);
  const [dadosGolpe, setDadosGolpe] = useState([null, null, null, null, null]);
  const [dadosBloqueados, setDadosBloqueados] = useState([false, false, false, false, false]);
  const [mensajeGolpe, setMensajeGolpe] = useState('');

  // --- LÓGICA DE INICIO (5 DADOS PARA QUIÉN ARRANCA) ---
  const generarTirada = (cantidad) => Array.from({ length: cantidad }, () => Math.floor(Math.random() * 6) + 1);

  const manejarInicio = () => {
    /* ... (Esta parte queda IGUAL que antes, no cambia) ... */
    if (fase === 'inicio_j1') {
      const tirada = generarTirada(5);
      const suma = tirada.reduce((a, b) => a + b, 0);
      setDados(tirada);
      setSumasInicio({ ...sumasInicio, j1: suma });
      setPuntajes(prev => ({ ...prev, jug1: suma }));
      setTimeout(() => setFase('inicio_j2'), 1000); 
    }
    else if (fase === 'inicio_j2') {
      const tirada = generarTirada(5);
      const suma = tirada.reduce((a, b) => a + b, 0);
      setDados(tirada);
      setSumasInicio(prev => ({ ...prev, j2: suma }));
      setPuntajes(prev => ({ ...prev, jug2: suma }));

      if (sumasInicio.j1 < suma) setTurno(1); 
      else if (suma < sumasInicio.j1) setTurno(2);
      else setTurno(1); 

      setTimeout(() => setFase('jugando'), 1500);
    }
  };

  // --- NUEVA LÓGICA DE TURNO ---

  // 1. Primer lanzamiento de los 5 dados
  const iniciarRonda = () => {
    const tiradaInicial = generarTirada(5);
    setDadosRonda(tiradaInicial);
    setDadosFijos([false, false, false, false, false]); // Ninguno fijo al arrancar
    setEtapaTurno('eligiendo_estrategia'); // Ahora elige Altos/Bajos viendo los dados
  };

  // 2. Elegir estrategia
  const seleccionarEstrategia = (tipo) => {
    setEstrategia(tipo);
    setEtapaTurno('ronda_activa'); 
  };

  // 3. Click en un dado para "Guardarlo" (Toggle)
  const toggleDado = (index) => {
    // Solo permitimos cambiar si estamos jugando y NO se han completado todos
    if (etapaTurno !== 'ronda_activa') return;

    const nuevosFijos = [...dadosFijos];
    nuevosFijos[index] = !nuevosFijos[index]; // Invierte: si estaba fijo se suelta, si estaba suelto se fija
    setDadosFijos(nuevosFijos);
  };

  // 4. Volver a tirar los dados NO fijados
  const tirarRestantes = () => {
    // Validamos que haya al menos 1 fijo si quieres seguir, 
    // pero técnicamente en la generala puedes tirar todo si quieres.
    // Asumiremos la regla "Dejas mínimamente un dado" acumulado.
    
    // Generamos nuevos valores solo para los que dicen false en dadosFijos
    const nuevosDados = dadosRonda.map((val, i) => {
        return dadosFijos[i] ? val : Math.floor(Math.random() * 6) + 1;
    });
    
    setDadosRonda(nuevosDados);

    // Si ya fijaste TODOS, calculamos automáticamente (o dejamos que el usuario lo haga)
    const todosFijos = dadosFijos.every(d => d === true);
    if (todosFijos) {
        calcularResultado(nuevosDados);
    }
  };

  // 5. Botón manual de "Plantarse" (por si quiere quedarse con los 5 dados actuales aunque no haya fijado todos visualmente)
  const plantarse = () => {
      // Fijamos todos visualmente
      setDadosFijos([true, true, true, true, true]);
      calcularResultado(dadosRonda);
  };

  // 6. Calcular puntaje final del turno
  const calcularResultado = (dadosFinales) => {
      const sumaTotal = dadosFinales.reduce((a,b) => a+b, 0);
      let res = 0;
      
      if (estrategia === 'altos') {
          res = sumaTotal - 24; 
      } else {
          res = 11 - sumaTotal;
      }
      
      setPuntosTurno(res);
      setEtapaTurno('resumen'); // Muestra la pantalla de confirmar/atacar
  };

  // --- LÓGICA DE FIN DE TURNO Y ATAQUE (Igual que antes pero adaptado) ---

  const terminarTurno = () => {
    if (puntosTurno <= 0) {
        aplicarPuntosYCambiar(puntosTurno, false); 
    } else {
        // Iniciar Fase de Golpe
        setEnFaseGolpe(true);
        setDadosGolpe([null, null, null, null, null]);
        setDadosBloqueados([false, false, false, false, false]);
        setMensajeGolpe(`¡Ataque iniciado! Busca el número ${puntosTurno}`);
    }
  };

  const aplicarPuntosYCambiar = (puntos, esDaño) => {
      setPuntajes(prev => {
          let nuevoScore = { ...prev };
          if (esDaño) {
              if (turno === 1) nuevoScore.jug2 -= puntos; else nuevoScore.jug1 -= puntos;
          } else {
              if (turno === 1) nuevoScore.jug1 += puntos; else nuevoScore.jug2 += puntos;
          }
          return nuevoScore;
      });

      // Reset total
      setTurno(prev => prev === 1 ? 2 : 1);
      setEtapaTurno('tirar_inicial');
      setEnFaseGolpe(false);
      setEstrategia(null);
  };

  // (Aquí irían las funciones tirarGolpe y finalizarAtaque que hicimos antes)
  // Te las pongo resumidas para que funcione el bloque completo:
  const tirarGolpe = () => {
      const nuevosValores = dadosGolpe.map((v, i) => dadosBloqueados[i] ? v : Math.floor(Math.random() * 6) + 1);
      setDadosGolpe(nuevosValores);
      
      let acierto = false;
      const nuevosBloq = [...dadosBloqueados];
      nuevosValores.forEach((val, i) => {
          if (!dadosBloqueados[i] && val === puntosTurno) {
              nuevosBloq[i] = true;
              acierto = true;
          }
      });
      setDadosBloqueados(nuevosBloq);
      
      if (nuevosBloq.every(b=>b)) setMensajeGolpe("¡PLENO! Daño máximo.");
      else if (acierto) setMensajeGolpe("¡Acertaste! Tira los restantes.");
      else setMensajeGolpe("Fallaste. Fin del ataque.");
  };

  const finalizarAtaque = () => {
      const aciertos = dadosBloqueados.filter(b => b).length;
      const daño = aciertos * puntosTurno; // Regla de daño
      alert(`Daño causado: ${daño}`);
      aplicarPuntosYCambiar(daño, true);
  };

  // --- RENDERIZADO ---
  return (
    <div className="card">
      {/* HEADER GLOBAL */}
      <div style={{marginBottom:'20px', borderBottom:'1px solid #555', paddingBottom:'10px'}}>
        <h3>Global - J1: {puntajes.jug1} | J2: {puntajes.jug2}</h3>
        <p style={{color:'cyan'}}>Turno actual: Jugador {turno}</p>
      </div>

      {/* FASE INICIO (5 dados iniciales) */}
      {fase !== 'jugando' && (
        <div>
           {/* ... Código visual del inicio igual que antes ... */}
           <p>Fase de inicio... <button onClick={manejarInicio}>Tirar</button></p>
           <div style={{display:'flex', gap:10, justifyContent:'center', marginTop:10}}>
              {dados.map((v,i)=><Dado key={i} valor={v}/>)}
           </div>
        </div>
      )}

      {/* FASE JUEGO */}
      {fase === 'jugando' && (
        <div>
            {/* 1. Botón Inicial */}
            {etapaTurno === 'tirar_inicial' && (
                <button onClick={iniciarRonda} style={{padding:'10px 20px'}}>
                    Tirar 5 Dados para empezar turno
                </button>
            )}

            {/* 2. Elegir Estrategia */}
            {etapaTurno === 'eligiendo_estrategia' && (
                <div>
                    <p>Estos son tus dados:</p>
                    <div style={{display:'flex', gap:10, justifyContent:'center', margin:'15px'}}>
                        {dadosRonda.map((v,i)=><Dado key={i} valor={v}/>)}
                    </div>
                    <p>Elige estrategia:</p>
                    <div style={{display:'flex', gap:20, justifyContent:'center'}}>
                        <button onClick={()=>seleccionarEstrategia('bajos')}>Bajos</button>
                        <button onClick={()=>seleccionarEstrategia('altos')}>Altos</button>
                    </div>
                </div>
            )}

            {/* 3. Ronda Activa (Seleccionar y Tirar) */}
            {etapaTurno === 'ronda_activa' && (
                <div>
                    <h4>Estrategia: {estrategia.toUpperCase()}</h4>
                    <p style={{fontSize:'0.8em'}}>Haz clic en los dados para guardarlos (Verde)</p>
                    
                    <div style={{display:'flex', gap:15, justifyContent:'center', margin:'20px'}}>
                        {dadosRonda.map((v, i) => (
                            <div key={i} onClick={() => toggleDado(i)} style={{cursor:'pointer', transform: dadosFijos[i] ? 'scale(1.1)' : 'scale(1)'}}>
                                <div style={{border: dadosFijos[i] ? '3px solid lime' : '3px solid transparent', borderRadius:'10px'}}>
                                    <Dado valor={v} />
                                </div>
                                {dadosFijos[i] && <small style={{color:'lime'}}>Guardado</small>}
                            </div>
                        ))}
                    </div>

                    <div style={{display:'flex', gap:20, justifyContent:'center'}}>
                        {/* Botón de Reroll (Deshabilitado si todos están fijos) */}
                        <button 
                            onClick={tirarRestantes} 
                            disabled={dadosFijos.every(d=>d)}
                            style={{background: '#444'}}
                        >
                            Volver a tirar (Restantes)
                        </button>
                        
                        {/* Botón Plantarse */}
                        <button onClick={plantarse} style={{background: 'cyan', color: 'black'}}>
                            ¡Plantarse con estos!
                        </button>
                    </div>
                </div>
            )}

            {/* 4. Resumen y Ataque */}
            {(etapaTurno === 'resumen' || enFaseGolpe) && (
                <div style={{marginTop: '20px', backgroundColor: '#333', padding: '15px', borderRadius: '10px'}}>
                    {!enFaseGolpe ? (
                        <>
                            <h3>Resultado del turno: {puntosTurno}</h3>
                            <p style={{fontSize:'0.8em'}}>
                                (Dados: {dadosRonda.join(', ')} | Suma: {dadosRonda.reduce((a,b)=>a+b,0)})
                            </p>
                            <button onClick={terminarTurno} style={{
                                border: puntosTurno > 0 ? '2px solid gold' : '2px solid red', 
                                color: puntosTurno > 0 ? 'gold' : 'red'
                            }}>
                                {puntosTurno > 0 ? '¡INICIAR ATAQUE!' : 'Aceptar y pasar'}
                            </button>
                        </>
                    ) : (
                        // PANTALLA DE ATAQUE
                        <div>
                            <h3 style={{color:'gold'}}>¡GOLPE! Objetivo: {puntosTurno}</h3>
                            <p>{mensajeGolpe}</p>
                            <div style={{display:'flex', gap:10, justifyContent:'center', margin:10}}>
                                {dadosGolpe.map((v,i) => (
                                    <div key={i} style={{opacity: dadosBloqueados[i]?1:0.5}}>
                                        {v ? <Dado valor={v}/> : <div style={{width:50,height:50,border:'1px dashed gray'}}></div>}
                                        {dadosBloqueados[i] && "✔"}
                                    </div>
                                ))}
                            </div>
                             {/* Botones de Control de Ataque */}
                             {(!mensajeGolpe.includes("Fin") && !mensajeGolpe.includes("PLENO") && !dadosBloqueados.every(b=>b)) ? (
                                    <button onClick={tirarGolpe} style={{background: 'gold', color: 'black'}}>
                                        {dadosGolpe[0] === null ? 'Primer Tiro Ataque' : 'Tirar Restantes'}
                                    </button>
                                ) : (
                                    <button onClick={finalizarAtaque} style={{background: 'red', color: 'white'}}>
                                        Terminar Ataque
                                    </button>
                                )}
                        </div>
                    )}
                </div>
            )}
        </div>
      )}

      <button onClick={volver} style={{marginTop:30}}>Salir</button>
    </div>
  );
}

export default Juego;