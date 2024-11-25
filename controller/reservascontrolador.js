let nextReservaId = 1;

global.reservas = [];

const conflictoHorario = (inicio, fin, salaId, reservaId = null) => {
    return global.reservas.some(reserva => {
        if (reservaId && reserva.id === reservaId) return false;
        if (reserva.salaId !== salaId) return false;
        
        const reservaInicio = new Date(reserva.fechaInicio);
        const reservaFin = new Date(reserva.fechaFin);
        const nuevoInicio = new Date(inicio);
        const nuevoFin = new Date(fin);
        
        return (
            (nuevoInicio >= reservaInicio && nuevoInicio < reservaFin) ||
            (nuevoFin > reservaInicio && nuevoFin <= reservaFin) ||
            (nuevoInicio <= reservaInicio && nuevoFin >= reservaFin)
        );
    });
};

const getReservas = (req, res) => {
    res.json(globalThis.reservas);
};

const createReserva = (req, res) => {
    const { salaId, nombreReservante, fechaInicio, fechaFin } = req.body;
    
    if (!salaId || !nombreReservante || !fechaInicio || !fechaFin) {
        return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }
    
    const sala = global.salas.find(s => s.id === parseInt(salaId));
    if (!sala) {
        return res.status(404).json({ error: 'La sala no fue encontrada.' });
    }
    if (sala.estado !== 'activo') {
        return res.status(400).json({ error: 'La sala no está activa.' });
    }
    
    if (conflictoHorario(fechaInicio, fechaFin, salaId)) {
        return res.status(400).json({ error: 'La sala ya está reservada en este horario.' });
    }
    
    const nuevaReserva = {
        id: nextReservaId++,
        salaId: parseInt(salaId),
        nombreReservante,
        fechaInicio,
        fechaFin
    };
    
    global.reservas.push(nuevaReserva);
    
    global.broadcastUpdate('updateReservas', global.reservas);
    
    res.status(201).json(nuevaReserva);
};

const updateReserva = (req, res) => {
    const { id } = req.params;
    const { salaId, nombreReservante, fechaInicio, fechaFin } = req.body;
    
    const reservaIndex = global.reservas.findIndex(reserva => reserva.id === parseInt(id));
    if (reservaIndex === -1) {
        return res.status(404).json({ error: 'La reserva no fue encontrada.' });
    }
    
    if (salaId) {
        const sala = global.salas.find(s => s.id === parseInt(salaId));
        if (!sala) {
            return res.status(404).json({ error: 'La sala no encontrada.' });
        }
        if (sala.estado !== 'activo') {
            return res.status(400).json({ error: 'La sala no está activa.' });
        }
    }
    
    if ((fechaInicio || fechaFin) && 
        conflictoHorario(
            fechaInicio || global.reservas[reservaIndex].fechaInicio,
            fechaFin || global.reservas[reservaIndex].fechaFin,
            salaId || global.reservas[reservaIndex].salaId,
            parseInt(id)
        )) {
        return res.status(400).json({ error: 'La sala ya está reservada en ese horario' });
    }
    
    global.reservas[reservaIndex] = {
        ...global.reservas[reservaIndex],
        salaId: salaId ? parseInt(salaId) : global.reservas[reservaIndex].salaId,
        nombreReservante: nombreReservante || global.reservas[reservaIndex].nombreReservante,
        fechaInicio: fechaInicio || global.reservas[reservaIndex].fechaInicio,
        fechaFin: fechaFin || global.reservas[reservaIndex].fechaFin
    };
    
    global.broadcastUpdate('updateReservas', global.reservas);
    
    res.json(global.reservas[reservaIndex]);
};

const deleteReserva = (req, res) => {
    const { id } = req.params;
    const reservaIndex = global.reservas.findIndex(reserva => reserva.id === parseInt(id));
    
    if (reservaIndex === -1) {
        return res.status(404).json({ error: 'Reserva no encontrada' });
    }
    
    global.reservas.splice(reservaIndex, 1);
    
    global.broadcastUpdate('updateReservas', global.reservas);
    
    res.status(204).send();
};

module.exports = { getReservas, createReserva, updateReserva, deleteReserva };
