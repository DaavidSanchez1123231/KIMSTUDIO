package com.kimstudio.backend_api.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class HorarioService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public List<Map<String, Object>> obtenerHorariosPorEspecialista(int idEspecialista) {
        String sql = "SELECT id_horario, fecha, hora_inicio, hora_fin, estado " +
                     "FROM Horarios WHERE id_especialista = ? ORDER BY fecha, hora_inicio";
        return jdbcTemplate.queryForList(sql, idEspecialista);
    }

    public Map<String, Object> crearHorario(int idEspecialista, String fecha, String horaInicio, String horaFin) {
        String sql = "INSERT INTO Horarios (id_especialista, fecha, hora_inicio, hora_fin, estado) " +
                     "VALUES (?, ?, ?, ?, 'disponible')";
        jdbcTemplate.update(sql, idEspecialista, fecha, horaInicio, horaFin);
        
        Map<String, Object> respuesta = new HashMap<>();
        respuesta.put("mensaje", "Turno asignado correctamente");
        return respuesta;
    }

    public Map<String, Object> eliminarHorario(int idHorario) {
        String sql = "DELETE FROM Horarios WHERE id_horario = ?";
        jdbcTemplate.update(sql, idHorario);
        
        Map<String, Object> respuesta = new HashMap<>();
        respuesta.put("mensaje", "Turno eliminado de la agenda");
        return respuesta;
    }
}