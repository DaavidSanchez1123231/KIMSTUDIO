package com.kimstudio.backend_api.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "http://localhost:4200")
public class DashboardController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @GetMapping("/metricas")
    public ResponseEntity<Map<String, Object>> getMetricas() {
        Map<String, Object> metricas = new HashMap<>();
        // Enviaremos datos base para que el panel cobre vida
        metricas.put("totalCaja", 1145.00);
        metricas.put("porServicios", 1035.00);
        metricas.put("porProductos", 110.00);
        metricas.put("citasHoy", 5);
        return ResponseEntity.ok(metricas);
    }

    @GetMapping("/citas-recientes")
public ResponseEntity<List<Map<String, Object>>> getCitasRecientes() {
    String sql = "SELECT " +
             "c.id_cita, " +
             "h.fecha, " +
             "h.hora_inicio as hora, " +
             "u.nombre as cliente, " +
             "s.nombre as servicio, " +   // ← era nombre_servicio
             "c.estado " +
             "FROM Citas c " +
             "JOIN Usuarios u ON c.id_usuario = u.id_usuario " +
             "JOIN Horarios h ON c.id_horario = h.id_horario " +
             "JOIN Servicios s ON c.id_servicio = s.id_servicio " +
             "ORDER BY h.fecha DESC, h.hora_inicio DESC LIMIT 5";
                 
    List<Map<String, Object>> citas = jdbcTemplate.queryForList(sql);
    return ResponseEntity.ok(citas);
}
}