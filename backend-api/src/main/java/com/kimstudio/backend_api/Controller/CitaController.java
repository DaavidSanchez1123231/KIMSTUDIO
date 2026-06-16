package com.kimstudio.backend_api.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/citas")
@CrossOrigin(origins = "http://localhost:4200")
public class CitaController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> listarCitas() {
        String sql = "SELECT c.id_cita, h.fecha, h.hora_inicio as hora, " +
                     "u.nombre as cliente, s.nombre as servicio, c.estado " +
                     "FROM Citas c " +
                     "JOIN Usuarios u ON c.id_usuario = u.id_usuario " +
                     "JOIN Horarios h ON c.id_horario = h.id_horario " +
                     "JOIN Servicios s ON c.id_servicio = s.id_servicio " +
                     "ORDER BY h.fecha DESC, h.hora_inicio DESC";

        List<Map<String, Object>> citas = jdbcTemplate.queryForList(sql);
        return ResponseEntity.ok(citas);
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> crearCita(@RequestBody Map<String, Object> body) {
        try {
            // 1. Buscar o crear el horario disponible
            String fecha = (String) body.get("fecha");
            String hora = (String) body.get("hora");
            Integer idServicio = (Integer) body.get("id_servicio");
            String nombreCliente = (String) body.get("nombre_cliente");

            // 2. Buscar el id_usuario por nombre (búsqueda simple)
            String sqlUsuario = "SELECT TOP 1 id_usuario FROM Usuarios WHERE nombre LIKE ?";
            List<Map<String, Object>> usuarios = jdbcTemplate.queryForList(sqlUsuario, "%" + nombreCliente + "%");

            if (usuarios.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("mensaje", "Cliente no encontrado en el sistema."));
            }

            int idUsuario = ((Number) usuarios.get(0).get("id_usuario")).intValue();

            // 3. Verificar si ya existe un horario para esa fecha/hora
            String sqlHorario = "SELECT id_horario FROM Horarios WHERE fecha = ? AND hora_inicio = ? AND estado = 'disponible'";
            List<Map<String, Object>> horarios = jdbcTemplate.queryForList(sqlHorario, fecha, hora);

            if (horarios.isEmpty()) {
                return ResponseEntity.status(409).body(Map.of("mensaje", "El horario seleccionado no está disponible."));
            }

            int idHorario = ((Number) horarios.get(0).get("id_horario")).intValue();

            // 4. Crear la cita
            String sqlCita = "INSERT INTO Citas (id_usuario, id_servicio, id_horario, estado) VALUES (?, ?, ?, 'Pendiente')";
            jdbcTemplate.update(sqlCita, idUsuario, idServicio, idHorario);

            // 5. Marcar el horario como ocupado
            jdbcTemplate.update("UPDATE Horarios SET estado = 'ocupado' WHERE id_horario = ?", idHorario);

            return ResponseEntity.ok(Map.of("mensaje", "Cita agendada correctamente."));

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("mensaje", "Error interno: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> eliminarCita(@PathVariable int id) {
        try {
            // 1. Obtener el id_horario antes de borrar para liberarlo
            String sqlHorario = "SELECT id_horario FROM Citas WHERE id_cita = ?";
            List<Map<String, Object>> resultado = jdbcTemplate.queryForList(sqlHorario, id);

            if (resultado.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("mensaje", "Cita no encontrada."));
            }

            int idHorario = ((Number) resultado.get(0).get("id_horario")).intValue();

            // 2. Eliminar la cita
            jdbcTemplate.update("DELETE FROM Citas WHERE id_cita = ?", id);

            // 3. Liberar el horario
            jdbcTemplate.update("UPDATE Horarios SET estado = 'disponible' WHERE id_horario = ?", idHorario);

            return ResponseEntity.ok(Map.of("mensaje", "Cita eliminada correctamente."));

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("mensaje", "Error interno: " + e.getMessage()));
        }
    }
}