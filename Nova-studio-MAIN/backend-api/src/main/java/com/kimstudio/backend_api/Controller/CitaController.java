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

        // 1. VALIDAR LOS DATOS RECIBIDOS
        if (body == null ||
            body.getId_usuario() == null ||
            body.getId_servicio() == null ||
            body.getFecha() == null ||
            body.getHora() == null ||
            body.getFecha().isBlank() ||
            body.getHora().isBlank()) {

            return ResponseEntity.badRequest().body(
                Map.of("mensaje",
                    "Selecciona un cliente, un servicio, una fecha y una hora.")
            );
        }

        int idUsuario = body.getId_usuario();
        int idServicio = body.getId_servicio();

        if (idUsuario <= 0 || idServicio <= 0) {
            return ResponseEntity.badRequest().body(
                Map.of("mensaje",
                    "El cliente o el servicio seleccionado no es válido.")
            );
        }

        // 2. VERIFICAR QUE EXISTA EL CLIENTE
        Integer clienteExiste = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM Usuarios " +
            "WHERE id_usuario = ? AND rol = 'cliente'",
            Integer.class,
            idUsuario
        );

        if (clienteExiste == null || clienteExiste == 0) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                Map.of("mensaje",
                    "El cliente seleccionado no existe o no está registrado como cliente.")
            );
        }

        // 3. VERIFICAR QUE EL SERVICIO EXISTA Y ESTÉ ACTIVO
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

        // 4. BUSCAR UN HORARIO DISPONIBLE PARA ESA FECHA Y HORA
        List<Map<String, Object>> horarios =
            jdbcTemplate.queryForList(
                "SELECT id_horario, id_especialista " +
                "FROM Horarios " +
                "WHERE fecha = CAST(? AS DATE) " +
                "AND hora_inicio = CAST(? AS TIME) " +
                "AND estado = 'DISPONIBLE' " +
                "ORDER BY id_horario " +
                "LIMIT 1 FOR UPDATE",
                body.getFecha(),
                body.getHora()
            );

        if (horarios.isEmpty()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(
                Map.of("mensaje",
                    "No hay un horario disponible para la fecha y hora seleccionadas. Elige otro horario.")
            );
        }

        // 5. OBTENER EL HORARIO Y EL ESPECIALISTA ASOCIADO
        Map<String, Object> horario = horarios.get(0);

        int idHorario = ((Number) horario.get("id_horario")).intValue();

        Object especialistaObjeto = horario.get("id_especialista");

        Integer idEspecialista = especialistaObjeto instanceof Number
            ? ((Number) especialistaObjeto).intValue()
            : null;

        // 6. MARCAR EL HORARIO COMO RESERVADO
        int horariosActualizados = jdbcTemplate.update(
            "UPDATE Horarios " +
            "SET estado = 'RESERVADO', fecha_bloqueo = NULL " +
            "WHERE id_horario = ? AND estado = 'DISPONIBLE'",
            idHorario
        );

        if (horariosActualizados == 0) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(
                Map.of("mensaje",
                    "El horario acaba de ser reservado. Selecciona otro.")
            );
        }

        // 7. REGISTRAR LA CITA CON LOS IDENTIFICADORES REALES
        if (idEspecialista != null) {

            jdbcTemplate.update(
                "INSERT INTO Citas " +
                "(id_usuario, id_especialista, id_servicio, id_horario, estado) " +
                "VALUES (?, ?, ?, ?, 'Pendiente')",
                idUsuario,
                idEspecialista,
                idServicio,
                idHorario
            );

        } else {

            jdbcTemplate.update(
                "INSERT INTO Citas " +
                "(id_usuario, id_servicio, id_horario, estado) " +
                "VALUES (?, ?, ?, 'Pendiente')",
                idUsuario,
                idServicio,
                idHorario
            );
        }

        return ResponseEntity.ok(
            Map.of("mensaje",
                "Cita registrada correctamente con su cliente y servicio.")
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