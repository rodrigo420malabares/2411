import { useState } from 'react';
import Dado from './Dado';

function Juego({ volver }) {
    // --- ESTADOS GLOBALES ---
    const [fase, setFase] = useState('inicio_j1');
    const [turno, setTurno] = useState(1);
    const [puntajes, setPuntajes] = useState({ jug1: 0, jug2: 0 });
    const [sumasInicio, setSumasInicio] = useState({ j1: 0, j2: 0 });
    const [dados, setDados] = useState([1, 1, 1, 1, 1]);

    // --- ESTADOS DEL TURNO ---
    const [etapaTurno, setEtapaTurno] = useState('tirar_inicial');
    const [dadosRonda, setDadosRonda] = useState([null, null, null, null, null]);
    const [dadosFijos, setDadosFijos] = useState([false, false, false, false, false]);
    const [estrategia, setEstrategia] = useState(null);
    const [puntosTurno, setPuntosTurno] = useState(0);

    // --- CAMBIO: NUEVO ESTADO DE CONTROL ---
    // Recuerda cuántos dados teníamos guardados en la tirada anterior para obligar a guardar uno más
    const [countGuardados, setCountGuardados] = useState(0);

    // --- ESTADOS DE FASE GOLPE ---
    const [enFaseGolpe, setEnFaseGolpe] = useState(false);
    const [dadosGolpe, setDadosGolpe] = useState([null, null, null, null, null]);
    const [dadosBloqueados, setDadosBloqueados] = useState([false, false, false, false, false]);
    const [mensajeGolpe, setMensajeGolpe] = useState('');

// --- ESTADO DE GAME OVER ---
  const [ganador, setGanador] = useState(null); // Será 1 o 2 cuando alguien gane

    // --- LÓGICA DE INICIO (Igual que antes) ---
    const generarTirada = (cantidad) => Array.from({ length: cantidad }, () => Math.floor(Math.random() * 6) + 1);

    const manejarInicio = () => {
        /* ... (Mismo código de siempre para manejarInicio) ... */
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

    // --- LÓGICA DE TURNO ---

    const iniciarRonda = () => {
        const tiradaInicial = generarTirada(5);
        setDadosRonda(tiradaInicial);
        setDadosFijos([false, false, false, false, false]);

        // --- CAMBIO: Reseteamos el contador de guardados a 0 al iniciar turno
        setCountGuardados(0);

        setEtapaTurno('eligiendo_estrategia');
    };

    const seleccionarEstrategia = (tipo) => {
        setEstrategia(tipo);
        setEtapaTurno('ronda_activa');
    };

    const toggleDado = (index) => {
        if (etapaTurno !== 'ronda_activa') return;
        const nuevosFijos = [...dadosFijos];
        nuevosFijos[index] = !nuevosFijos[index];
        setDadosFijos(nuevosFijos);
    };

    const tirarRestantes = () => {
        // --- CAMBIO: Actualizamos la "marca" de cuántos hay guardados ahora
        const cantidadActualGuardados = dadosFijos.filter(Boolean).length;
        setCountGuardados(cantidadActualGuardados);

        const nuevosDados = dadosRonda.map((val, i) => {
            return dadosFijos[i] ? val : Math.floor(Math.random() * 6) + 1;
        });

        setDadosRonda(nuevosDados);

        const todosFijos = dadosFijos.every(d => d === true);
        if (todosFijos) {
            calcularResultado(nuevosDados);
        }
    };

    const plantarse = () => {
        setDadosFijos([true, true, true, true, true]);
        calcularResultado(dadosRonda);
    };

    const calcularResultado = (dadosFinales) => {
        const sumaTotal = dadosFinales.reduce((a, b) => a + b, 0);
        let res = 0;
        if (estrategia === 'altos') res = sumaTotal - 24;
        else res = 11 - sumaTotal;

        setPuntosTurno(res);
        setEtapaTurno('resumen');
    };

    // --- LÓGICA DE FIN DE TURNO (Igual que antes) ---
    const terminarTurno = () => {
        if (puntosTurno <= 0) {
            // CAMINO A: Negativo o Cero -> Me resto y paso el turno
            aplicarPuntosYCambiar(puntosTurno, false);
        } else {
            // CAMINO B: Positivo -> ¡Sumo mis puntos Y voy al ataque!

            // 1. Sumar INMEDIATAMENTE al jugador actual
            setPuntajes(prev => {
                const nuevo = { ...prev };
                if (turno === 1) nuevo.jug1 += puntosTurno;
                else nuevo.jug2 += puntosTurno;
                return nuevo;
            });

            // 2. Activar la fase de golpe (sin cambiar de turno todavía)
            setEnFaseGolpe(true);
            setDadosGolpe([null, null, null, null, null]);
            setDadosBloqueados([false, false, false, false, false]);
            setMensajeGolpe(`¡Puntos sumados! Ahora busca el número ${puntosTurno} para atacar.`);
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

        setTurno(prev => prev === 1 ? 2 : 1);
        setEtapaTurno('tirar_inicial');
        setEnFaseGolpe(false);
        setEstrategia(null);
        setCountGuardados(0); // Reset extra por seguridad
    };

    const tirarGolpe = () => { /* ... Mismo código de golpe ... */
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

        if (nuevosBloq.every(b => b)) setMensajeGolpe("¡PLENO! Daño máximo.");
        else if (acierto) setMensajeGolpe("¡Acertaste! Tira los restantes.");
        else setMensajeGolpe("Fallaste. Fin del ataque.");
    };

  const finalizarAtaque = () => {
      const aciertos = dadosBloqueados.filter(b => b).length;
      const daño = aciertos * puntosTurno;
      
      if (daño > 0) {
        // Calculamos cuánto le quedaría al rival
        const puntajeRivalActual = turno === 1 ? puntajes.jug2 : puntajes.jug1;
        const puntajeRivalFinal = puntajeRivalActual - daño;

        // VERIFICAMOS SI LO ELIMINAMOS (Menor a 0)
        if (puntajeRivalFinal < 0) {
            // Actualizamos el puntaje visualmente para que se vea el negativo
            setPuntajes(prev => {
                const nuevo = { ...prev };
                if (turno === 1) nuevo.jug2 = puntajeRivalFinal;
                else nuevo.jug1 = puntajeRivalFinal;
                return nuevo;
            });
            
            // Declaramos ganador y CORTAMOS la ejecución (no cambiamos de turno)
            setGanador(turno); 
            return; 
        }

        // Si sobrevive, flujo normal
        alert(`¡ATAQUE FINALIZADO!\n\nLe quitaste ${daño} puntos al rival.`);
        setPuntajes(prev => {
            const nuevo = { ...prev };
            if (turno === 1) nuevo.jug2 -= daño;
            else nuevo.jug1 -= daño;
            return nuevo;
        });

      } else {
        alert("Ataque fallido. No hiciste daño extra.");
      }
      
      // Solo cerramos el turno si NO hubo ganador
      cerrarTurnoCompleto();
  };

    // --- RENDERIZADO ---
    // Calculamos dinámicamente si el botón debe estar deshabilitado
    const cantidadGuardadosAhora = dadosFijos.filter(Boolean).length;
    // Solo se puede tirar si guardaste MÁS dados que la vez anterior
    const puedeTirar = cantidadGuardadosAhora > countGuardados;
    const todosGuardados = dadosFijos.every(Boolean);

    return (
        <div className="card">
            {/* HEADER GLOBAL */}
            <div style={{ marginBottom: '20px', borderBottom: '1px solid #555', paddingBottom: '10px' }}>
                <h3>Global - J1: {puntajes.jug1} | J2: {puntajes.jug2}</h3>
                <p style={{ color: 'cyan' }}>Turno actual: Jugador {turno}</p>
            </div>

            {/* FASE INICIO */}
            {fase !== 'jugando' && (
                <div>
                    {/* ... Mismo código inicio ... */}
                    <p>Fase de inicio... <button onClick={manejarInicio}>Tirar</button></p>
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 10 }}>
                        {dados.map((v, i) => <Dado key={i} valor={v} />)}
                    </div>
                </div>
            )}

            {/* FASE JUEGO */}
            {fase === 'jugando' && (
                <div>
                    {etapaTurno === 'tirar_inicial' && (
                        <button onClick={iniciarRonda} style={{ padding: '10px 20px' }}>
                            Tirar 5 Dados para empezar turno
                        </button>
                    )}

                    {etapaTurno === 'eligiendo_estrategia' && (
                        <div>
                            <p>Estos son tus dados:</p>
                            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', margin: '15px' }}>
                                {dadosRonda.map((v, i) => <Dado key={i} valor={v} />)}
                            </div>
                            <p>Elige estrategia:</p>
                            <div style={{ display: 'flex', gap: 20, justifyContent: 'center' }}>
                                <button onClick={() => seleccionarEstrategia('bajos')}>Bajos</button>
                                <button onClick={() => seleccionarEstrategia('altos')}>Altos</button>
                            </div>
                        </div>
                    )}

                    {etapaTurno === 'ronda_activa' && (
                        <div>
                            <h4>Estrategia: {estrategia.toUpperCase()}</h4>
                            <p style={{ fontSize: '0.8em' }}>
                                Debes guardar al menos 1 dado nuevo para poder volver a tirar.
                            </p>

                            <div style={{ display: 'flex', gap: 15, justifyContent: 'center', margin: '20px' }}>
                                {dadosRonda.map((v, i) => (
                                    <div key={i} onClick={() => toggleDado(i)} style={{ cursor: 'pointer', transform: dadosFijos[i] ? 'scale(1.1)' : 'scale(1)' }}>
                                        <div style={{ border: dadosFijos[i] ? '3px solid lime' : '3px solid transparent', borderRadius: '10px' }}>
                                            <Dado valor={v} />
                                        </div>
                                        {dadosFijos[i] && <small style={{ color: 'lime' }}>Guardado</small>}
                                    </div>
                                ))}
                            </div>

                            <div style={{ display: 'flex', gap: 20, justifyContent: 'center' }}>
                                {/* --- CAMBIO: Botón con lógica de deshabilitado --- */}
                                <button
                                    onClick={tirarRestantes}
                                    disabled={!puedeTirar || todosGuardados}
                                    style={{
                                        background: (!puedeTirar || todosGuardados) ? '#333' : '#444',
                                        cursor: (!puedeTirar || todosGuardados) ? 'not-allowed' : 'pointer',
                                        opacity: (!puedeTirar || todosGuardados) ? 0.5 : 1
                                    }}
                                >
                                    Volver a tirar (Restantes)
                                </button>

                                <button onClick={plantarse} style={{ background: 'cyan', color: 'black' }}>
                                    ¡Plantarse con estos!
                                </button>
                            </div>
                        </div>
                    )}

                    {/* FASE RESUMEN Y GOLPE (Igual que antes) */}
                    {(etapaTurno === 'resumen' || enFaseGolpe) && (
                        <div style={{ marginTop: '20px', backgroundColor: '#333', padding: '15px', borderRadius: '10px' }}>
                            {!enFaseGolpe ? (
                                <>
                                    <h3>Resultado del turno: {puntosTurno}</h3>
                                    <button onClick={terminarTurno} style={{
                                        border: puntosTurno > 0 ? '2px solid gold' : '2px solid red',
                                        color: puntosTurno > 0 ? 'gold' : 'red'
                                    }}>
                                        {puntosTurno > 0 ? '¡INICIAR ATAQUE!' : 'Aceptar y pasar'}
                                    </button>
                                </>
                            ) : (
                                <div>
                                    <h3 style={{ color: 'gold' }}>¡GOLPE! Objetivo: {puntosTurno}</h3>
                                    <p>{mensajeGolpe}</p>
                                    <div style={{ display: 'flex', gap: 10, justifyContent: 'center', margin: 10 }}>
                                        {dadosGolpe.map((v, i) => (
                                            <div key={i} style={{ opacity: dadosBloqueados[i] ? 1 : 0.5 }}>
                                                {v ? <Dado valor={v} /> : <div style={{ width: 50, height: 50, border: '1px dashed gray' }}></div>}
                                                {dadosBloqueados[i] && "✔"}
                                            </div>
                                        ))}
                                    </div>
                                    {(!mensajeGolpe.includes("Fin") && !mensajeGolpe.includes("PLENO") && !dadosBloqueados.every(b => b)) ? (
                                        <button onClick={tirarGolpe} style={{ background: 'gold', color: 'black' }}>
                                            {dadosGolpe[0] === null ? 'Primer Tiro Ataque' : 'Tirar Restantes'}
                                        </button>
                                    ) : (
                                        <button onClick={finalizarAtaque} style={{ background: 'red', color: 'white' }}>
                                            Terminar Ataque
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            <button onClick={volver} style={{ marginTop: 30 }}>Salir</button>
        </div>
    );
}

export default Juego;