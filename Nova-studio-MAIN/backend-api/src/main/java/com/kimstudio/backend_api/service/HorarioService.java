
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

    // Listar horarios disponibles para una fecha
    public List<Map<String, Object>> obtenerHorariosDisponibles(String fecha) {

        String sql =
                "SELECT h.id_horario, " +
                "CAST(h.fecha AS VARCHAR) AS fecha, " +
                "TO_CHAR(h.hora_inicio, 'HH24:MI') AS hora_inicio, " +
                "TO_CHAR(h.hora_fin, 'HH24:MI') AS hora_fin, " +
                "h.id_especialista, " +
                "e.nombre AS especialista " +
                "FROM horarios h " +
                "INNER JOIN especialistas e " +
                "ON e.id_especialista = h.id_especialista " +
                "WHERE h.fecha = CAST(? AS DATE) " +
                "AND h.fecha >= CURRENT_DATE " +
                "AND h.estado = 'DISPONIBLE' " +
                "AND e.estado = TRUE " +
                "ORDER BY h.hora_inicio, e.nombre";

        return jdbcTemplate.queryForList(sql, fecha);
    }

    // Listar horarios de un especialista
    public List<Map<String, Object>> obtenerHorariosPorEspecialista(
            int idEspecialista) {

        String sql =
                "SELECT id_horario, fecha, " +
                "TO_CHAR(hora_inicio, 'HH24:MI') AS hora_inicio, " +
                "TO_CHAR(hora_fin, 'HH24:MI') AS hora_fin, " +
                "estado " +
                "FROM horarios " +
                "WHERE id_especialista = ? " +
                "ORDER BY fecha, hora_inicio";

        return jdbcTemplate.queryForList(sql, idEspecialista);
    }

    // Crear un horario
    public Map<String, Object> crearHorario(
            int idEspecialista,
            String fecha,
            String horaInicio,
            String horaFin) {

        String sql =
                "INSERT INTO horarios " +
                "(id_especialista, fecha, hora_inicio, hora_fin, estado) " +
                "VALUES (?, CAST(? AS DATE), CAST(? AS TIME), CAST(? AS TIME), 'DISPONIBLE')";

        jdbcTemplate.update(
                sql,
                idEspecialista,
                fecha,
                horaInicio,
                horaFin
        );

        Map<String, Object> respuesta = new HashMap<>();
        respuesta.put("mensaje", "Horario creado correctamente");

        return respuesta;
    }

    // Eliminar un horario
    public Map<String, Object> eliminarHorario(int idHorario) {

        String sql = "DELETE FROM horarios WHERE id_horario = ?";

        int filasEliminadas = jdbcTemplate.update(sql, idHorario);

        Map<String, Object> respuesta = new HashMap<>();

        if (filasEliminadas > 0) {
            respuesta.put("mensaje", "Horario eliminado correctamente");
        } else {
            respuesta.put("mensaje", "No se encontró el horario");
        }

        return respuesta;
    }
}
