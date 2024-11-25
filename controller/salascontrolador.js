globalThis.salas = []; 
let nextSalaId = 1; 

const getSalas = (req, res) => res.status(200).json(globalThis.salas)

const createSala = (req, res) => {
    const { nombre, capacidad, estado } = req.body;
    if (!nombre || !capacidad) {
        return res.status(400).json({ error: 'Los campos son obligatorios' });
    }
    
    if (globalThis.salas.some(sala => sala.nombre === nombre)) {
        return res.status(400).json({ error: 'Ya existe una sala con ese nombre' });
    }
    const nuevaSala = {
        id: nextSalaId++,
        nombre,
        capacidad,
        estado: estado ?? 'activo'
    };
    
    globalThis.salas.push(nuevaSala);
    
    globalThis.broadcastUpdate('updateSalas', globalThis.salas);
    
    res.status(201).json(nuevaSala);
}

const updateSala = (req, res) => {
    const { id } = req.params;
    const { nombre, capacidad, estado } = req.body;
    
    const salaIndex = globalThis.salas.findIndex(sala => sala.id === parseInt(id));
    if (salaIndex === -1) {
        return res.status(404).json({ error: 'Not Found' });
    }
    
    if (nombre && nombre !== globalThis.salas[salaIndex].nombre) {
        if (globalThis.salas.some(sala => sala.nombre === nombre)) {
            return res.status(400).json({ error: 'Ya existe una sala con esa referencia' });
        }
    }
    
    globalThis.salas[salaIndex] = {
        ...globalThis.salas[salaIndex],
        nombre: nombre || globalThis.salas[salaIndex].nombre,
        capacidad: capacidad || globalThis.salas[salaIndex].capacidad,
        estado: estado || globalThis.salas[salaIndex].estado
    };
    
    globalThis.broadcastUpdate('updateSalas', globalThis.salas);
    
    res.json(globalThis.salas[salaIndex]);
}

const deleteSala = (req, res) => {
    const { id } = req.params;
    const salaIndex = globalThis.salas.findIndex(sala => sala.id === parseInt(id));
    
    if (salaIndex === -1) {
        return res.status(404).json({ error: 'La sala no fue encontrada.' });
    }
    
    globalThis.salas.splice(salaIndex, 1);
    
    globalThis.broadcastUpdate('updateSalas', globalThis.salas);
    
    res.status(204).send();
}

module.exports = {getSalas, createSala, updateSala, deleteSala}
