package com.kimstudio.backend_api.Controller;

import com.kimstudio.backend_api.model.CitaRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/citas")
@CrossOrigin(origins = "http://localhost:4200")
public class CitaController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    // ==========================================
    // LISTAR CITAS CON SUS CLIENTES Y SERVICIOS
    // ==========================================
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> listarCitas() {

        String sql =
            "SELECT c.id_cita, " +
            "h.fecha, " +
            "TO_CHAR(h.hora_inicio, 'HH24:MI') AS hora, " +
            "u.nombre AS cliente, " +
            "s.nombre AS servicio, " +
            "c.estado " +
            "FROM Citas c " +
            "INNER JOIN Usuarios u ON c.id_usuario = u.id_usuario " +
            "INNER JOIN Horarios h ON c.id_horario = h.id_horario " +
            "INNER JOIN Servicios s ON c.id_servicio = s.id_servicio " +
            "ORDER BY h.fecha DESC, h.hora_inicio DESC";

        List<Map<String, Object>> citas =
            jdbcTemplate.queryForList(sql);

        return ResponseEntity.ok(citas);
    }

    // ==========================================
    // REGISTRAR CITA VINCULADA A CLIENTE Y SERVICIO
    // ==========================================
    @PostMapping
@Transactional
public ResponseEntity<Map<String, Object>> crearCita(
        @RequestBody CitaRequest body) {

    if (body == null ||
        body.getId_usuario() == null ||
        body.getId_servicio() == null ||
        body.getId_horario() == null ||
        body.getId_usuario() <= 0 ||
        body.getId_servicio() <= 0 ||
        body.getId_horario() <= 0) {

        return ResponseEntity.badRequest().body(
            Map.of("mensaje",
                "Selecciona un cliente, un servicio y un horario.")
        );
    }

    int idUsuario = body.getId_usuario();
    int idServicio = body.getId_servicio();
    int idHorario = body.getId_horario();

    // 1. Comprobar que el cliente existe.
    Integer clienteExiste = jdbcTemplate.queryForObject(
        "SELECT COUNT(*) FROM Usuarios " +
        "WHERE id_usuario = ? AND rol = 'cliente'",
        Integer.class,
        idUsuario
    );

    if (clienteExiste == null || clienteExiste == 0) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
            Map.of("mensaje", "El cliente seleccionado no existe.")
        );
    }

    // 2. Comprobar que el servicio está activo.
    Integer servicioExiste = jdbcTemplate.queryForObject(
        "SELECT COUNT(*) FROM Servicios " +
        "WHERE id_servicio = ? AND estado = TRUE",
        Integer.class,
        idServicio
    );

    if (servicioExiste == null || servicioExiste == 0) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
            Map.of("mensaje",
                "El servicio seleccionado no existe o está inactivo.")
        );
    }

    // 3. Bloquear y comprobar el horario seleccionado.
    List<Map<String, Object>> horarios =
        jdbcTemplate.queryForList(
            "SELECT id_horario, id_especialista " +
            "FROM Horarios " +
            "WHERE id_horario = ? " +
            "AND fecha >= CURRENT_DATE " +
            "AND estado = 'DISPONIBLE' " +
            "FOR UPDATE",
            idHorario
        );

    if (horarios.isEmpty()) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(
            Map.of("mensaje",
                "Ese horario ya no está disponible. " +
                "Selecciona otra fecha u hora.")
        );
    }

    Map<String, Object> horario = horarios.get(0);
    Object especialistaObjeto = horario.get("id_especialista");

    if (!(especialistaObjeto instanceof Number)) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(
            Map.of("mensaje",
                "El horario seleccionado no tiene un especialista asignado.")
        );
    }

    int idEspecialista =
        ((Number) especialistaObjeto).intValue();

    // 4. Reservar el horario. La transacción protege frente
    // a otro intento de reservarlo simultáneamente.
    int actualizados = jdbcTemplate.update(
        "UPDATE Horarios " +
        "SET estado = 'RESERVADO', fecha_bloqueo = NULL " +
        "WHERE id_horario = ? AND estado = 'DISPONIBLE'",
        idHorario
    );

    if (actualizados == 0) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(
            Map.of("mensaje",
                "El horario acaba de ser reservado. Elige otro.")
        );
    }

    // 5. Crear la cita con los identificadores reales.
    // PostgreSQL asignará el estado predeterminado de la tabla.
    jdbcTemplate.update(
        "INSERT INTO Citas " +
        "(id_usuario, id_especialista, id_servicio, id_horario) " +
        "VALUES (?, ?, ?, ?)",
        idUsuario,
        idEspecialista,
        idServicio,
        idHorario
    );

    return ResponseEntity.ok(
        Map.of("mensaje", "¡Cita registrada correctamente!")
    );
}
    // ==========================================
    // ELIMINAR CITA Y LIBERAR EL HORARIO
    // ==========================================
    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Map<String, Object>> eliminarCita(
            @PathVariable int id) {

        List<Map<String, Object>> resultado =
            jdbcTemplate.queryForList(
                "SELECT id_horario FROM Citas WHERE id_cita = ?",
                id
            );

        if (resultado.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                Map.of("mensaje", "No se encontró la cita.")
            );
        }

        int idHorario =
            ((Number) resultado.get(0).get("id_horario")).intValue();

        jdbcTemplate.update(
            "DELETE FROM Citas WHERE id_cita = ?",
            id
        );

        jdbcTemplate.update(
            "UPDATE Horarios " +
            "SET estado = 'DISPONIBLE', fecha_bloqueo = NULL " +
            "WHERE id_horario = ?",
            idHorario
        );

        return ResponseEntity.ok(
            Map.of("mensaje",
                "Cita eliminada y horario liberado correctamente.")
        );
    }
}