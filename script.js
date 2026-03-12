let p1 = { nombre: '', img: '', hp: 100, turnosPasados: 0, defendiendo: false, defEspecial: false };
let p2 = { nombre: '', img: '', hp: 100, turnosPasados: 0, defendiendo: false, defEspecial: false };
let turnoActual = 1;
let movimientosTotales = 0; // Contador para el límite de 25
const MAX_MOVIMIENTOS = 10;
let juegosJugados = parseInt(localStorage.getItem('juegosContador')) || 0;

window.onload = async function() {
    try {
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1000');
        const data = await response.json();
        const dataList = document.getElementById('pokemon-list');
        data.results.forEach(poke => {
            const option = document.createElement('option');
            option.value = poke.name;
            dataList.appendChild(option);
        });
    } catch (error) { console.log("Error en autocompletado", error); }
};

async function iniciarBatalla() {
    const input1 = document.getElementById('poke1-input').value;
    const input2 = document.getElementById('poke2-input').value;
    if (!input1 || !input2) return alert("Selecciona dos Pokémon");

    try {
        // Lógica del contador
        juegosJugados++;
        localStorage.setItem('juegosContador', juegosJugados);
        
        // ¿Es turno de shiny? (Cada 3 o 4 juegos)
        let esTurnoShiny = (juegosJugados % 3 === 0 || juegosJugados % 4 === 0);
        
        const data1 = await obtenerPokemon(input1);
        const data2 = await obtenerPokemon(input2);

        // Pasamos el dato de si puede ser shiny
        configurarPokemon(p1, data1, 'p1', esTurnoShiny);
        configurarPokemon(p2, data2, 'p2', esTurnoShiny);

        document.getElementById('selection-screen').classList.remove('active');
        document.getElementById('battle-screen').classList.add('active');
        
        let msgInicial = esTurnoShiny ? "✨ ¡ATENCIÓN! Han aparecido variantes raras ✨" : "¡Inicia el combate!";
        actualizarNarrador(msgInicial);
        
        setTimeout(simularTurno, 1500);
    } catch (e) { alert("Pokémon no encontrado"); }
}

// 3. Reemplaza tu función configurarPokemon por esta:
function configurarPokemon(obj, data, prefix, puedeSerShiny) {
    obj.nombre = data.name.toUpperCase();
    
    // Probabilidad del 50% de ser shiny si es el juego correcto
    let esShiny = puedeSerShiny && Math.random() > 0.5; 

    if (esShiny) {
        // Usamos la imagen Shiny de la API
        obj.img = data.sprites.other['official-artwork'].front_shiny || data.sprites.front_shiny;
        obj.nombre += " ✨"; 
    } else {
        // Imagen normal
        obj.img = data.sprites.other['official-artwork'].front_default || data.sprites.front_default;
    }

    obj.hp = 100;
    obj.turnosPasados = 0;
    document.getElementById(`${prefix}-name`).innerText = obj.nombre;
    document.getElementById(`${prefix}-img`).src = obj.img;
    // Si es shiny, le añadimos una clase de CSS para que brille
    document.getElementById(`${prefix}-img`).className = esShiny ? "shiny-anim" : "";
}


async function obtenerPokemon(nombre) {
    const r = await fetch(`https://pokeapi.co/api/v2/pokemon/${nombre.toLowerCase()}`);
    return await r.json();
}

function configurarPokemon(obj, data, prefix) {
    obj.nombre = data.name.toUpperCase();
    obj.img = data.sprites.other['official-artwork'].front_default || data.sprites.front_default;
    obj.hp = 100;
    obj.turnosPasados = 0;
    document.getElementById(`${prefix}-name`).innerText = obj.nombre;
    document.getElementById(`${prefix}-img`).src = obj.img;
}

function simularTurno() {
    movimientosTotales++;
    
    // Condición de fin por límite de movimientos
    if (movimientosTotales > MAX_MOVIMIENTOS) {
        finalizarPorLimite();
        return;
    }

    if (p1.hp <= 0 || p2.hp <= 0) return;

    const atacante = turnoActual === 1 ? p1 : p2;
    const defensor = turnoActual === 1 ? p2 : p1;

    let opciones = ['ataque', 'defensa'];
    if (atacante.turnosPasados >= 3) opciones.push('especial');
    if (atacante.turnosPasados >= 2) opciones.push('def-especial');

    const accion = opciones[Math.floor(Math.random() * opciones.length)];
    const falla = Math.random() < 0.20;

    if (falla) {
        actualizarNarrador(`[Mov ${movimientosTotales}] ${atacante.nombre} intentó ${accion} pero ¡FALLÓ!`);
    } else {
        procesarAccion(atacante, defensor, accion);
    }

    atacante.turnosPasados++;
    if (defensor.hp <= 0) {
        setTimeout(() => mostrarGanador(atacante), 1000);
    } else {
        turnoActual = turnoActual === 1 ? 2 : 1;
        setTimeout(simularTurno, 2000);
    }
}

function procesarAccion(atacante, defensor, tipo) {
    let danio = 0;
    atacante.defendiendo = false;
    atacante.defEspecial = false;
    let msg = `[Mov ${movimientosTotales}] ${atacante.nombre}: `;

    if (tipo === 'ataque') {
        danio = Math.floor(Math.random() * 15) + 10;
        msg += `Ataque normal.`;
    } else if (tipo === 'especial') {
        danio = Math.floor(Math.random() * 25) + 20;
        msg += `¡ATAQUE ESPECIAL!`;
        atacante.turnosPasados = -1; // Reset cooldown
    } else if (tipo === 'defensa') {
        atacante.defendiendo = true;
        msg += `Se defiende.`;
    } else if (tipo === 'def-especial') {
        atacante.defEspecial = true;
        msg += `¡DEFENSA ESPECIAL!`;
        atacante.turnosPasados = -1;
    }

    if (danio > 0) {
        if (defensor.defEspecial) {
            danio = 0;
            msg += ` ¡Bloqueado por Def. Especial!`;
        } else if (defensor.defendiendo) {
            danio = Math.floor(danio / 2);
            msg += ` ¡Mitigado por defensa!`;
        }
        defensor.hp -= danio;
        if (defensor.hp < 0) defensor.hp = 0;
        
        // Animación de golpe
        const imgId = turnoActual === 1 ? 'p2-img' : 'p1-img';
        document.getElementById(imgId).classList.add('shake');
        setTimeout(() => document.getElementById(imgId).classList.remove('shake'), 500);
    }

    actualizarNarrador(`${msg} Causó ${danio}% de daño. ${defensor.nombre} tiene ${defensor.hp}%.`);
    actualizarBarrasHP();
}

function finalizarPorLimite() {
    actualizarNarrador("¡Límite de movimientos alcanzado!");
    if (p1.hp === p2.hp) {
        alert("¡Empate técnico!");
        location.reload();
    } else {
        const ganador = p1.hp > p2.hp ? p1 : p2;
        actualizarNarrador(`¡Por decisión de vida restante, gana ${ganador.nombre}!`);
        setTimeout(() => mostrarGanador(ganador), 1500);
    }
}

function actualizarNarrador(m) {
    document.getElementById('narrator-text').innerText = m;
    const li = document.createElement('li');
    li.innerText = m;
    document.getElementById('log-list').prepend(li);
}

function actualizarBarrasHP() {
    document.getElementById('p1-hp-bar').style.width = p1.hp + '%';
    document.getElementById('p1-hp-text').innerText = p1.hp;
    document.getElementById('p2-hp-bar').style.width = p2.hp + '%';
    document.getElementById('p2-hp-text').innerText = p2.hp;
}

function mostrarGanador(g) {
    document.getElementById('battle-screen').classList.remove('active');
    document.getElementById('winner-screen').classList.add('active');
    document.getElementById('winner-name').innerText = g.nombre;
    document.getElementById('winner-img').src = g.img;
}