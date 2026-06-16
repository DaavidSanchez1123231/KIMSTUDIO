package com.kimstudio.backend_api.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/publico")
@CrossOrigin(origins = "http://localhost:4200")
public class PublicoController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @GetMapping("/galeria")
    public ResponseEntity<List<Map<String, Object>>> obtenerGaleriaPublica() {
        // ← lee de la BD real, devuelve campo "categoria" que coincide con el frontend corregido
        String sql = "SELECT id_imagen, titulo, categoria, url_imagen " +
                     "FROM Galeria WHERE estado = 'ACTIVO' " +
                     "ORDER BY fecha_subida DESC";
        return ResponseEntity.ok(jdbcTemplate.queryForList(sql));
    }

    @GetMapping("/servicios")
    public ResponseEntity<List<Map<String, Object>>> obtenerServiciosPublicos() {
        String sql = "SELECT id_servicio, nombre, descripcion, precio, " +
                     "duracion_minutos, categoria, imagen_url " +
                     "FROM Servicios WHERE estado = 'activo'";
        return ResponseEntity.ok(jdbcTemplate.queryForList(sql));
    }

    @GetMapping("/promociones")
    public ResponseEntity<List<Map<String, Object>>> obtenerPromocionesPublicas() {
        String sql = "SELECT id_promocion, nombre, descuento, codigo, " +
                     "fecha_expiracion, descripcion " +
                     "FROM Promociones WHERE estado = 'ACTIVO' " +
                     "AND fecha_expiracion >= CAST(GETDATE() AS DATE)";
        return ResponseEntity.ok(jdbcTemplate.queryForList(sql));
    }
}