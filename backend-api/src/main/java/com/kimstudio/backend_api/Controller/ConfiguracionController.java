package com.kimstudio.backend_api.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/configuracion")
@CrossOrigin(origins = "http://localhost:4200")
public class ConfiguracionController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @GetMapping("/empresa")
    public ResponseEntity<Map<String, Object>> obtenerConfiguracion() {
        try {
            String sql = "SELECT nombre_salon, telefono_whatsapp, direccion, instagram, facebook " +
                         "FROM Configuracion ORDER BY id_config DESC LIMIT 1";
            List<Map<String, Object>> result = jdbcTemplate.queryForList(sql);
            if (result.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("mensaje", "Sin configuración."));
            }
            return ResponseEntity.ok(result.get(0));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("mensaje", "Error: " + e.getMessage()));
        }
    }

    @PutMapping("/empresa")
    public ResponseEntity<Map<String, Object>> actualizarConfiguracion(@RequestBody Map<String, Object> body) {
        try {
            String sql = "UPDATE Configuracion SET " +
                         "nombre_salon = ?, telefono_whatsapp = ?, direccion = ?, " +
                         "instagram = ?, facebook = ?, fecha_actualizacion = NOW() " +
                         "WHERE id_config = (SELECT id_config FROM Configuracion ORDER BY id_config DESC LIMIT 1)";
            jdbcTemplate.update(sql,
                body.get("nombre_salon"),
                body.get("telefono_whatsapp"),
                body.get("direccion"),
                body.get("instagram"),
                body.get("facebook")
            );
            return ResponseEntity.ok(Map.of("mensaje", "Configuración actualizada correctamente."));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("mensaje", "Error: " + e.getMessage()));
        }
    }
}