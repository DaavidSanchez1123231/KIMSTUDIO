package com.kimstudio.backend_api.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/galeria")
@CrossOrigin(origins = "http://localhost:4200")
public class GaleriaController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> listarImagenes() {
        String sql = "SELECT id_imagen, titulo, categoria, url_imagen, fecha_subida " +
                     "FROM Galeria WHERE estado = 'ACTIVO' " +
                     "ORDER BY fecha_subida DESC";
        return ResponseEntity.ok(jdbcTemplate.queryForList(sql));
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> agregarImagen(@RequestBody Map<String, Object> body) {
        try {
            String titulo    = body.get("titulo") != null ? body.get("titulo").toString() : "Sin título";
            String categoria = body.get("categoria") != null ? body.get("categoria").toString() : "General";
            String urlImagen = body.get("url_imagen").toString();

            jdbcTemplate.update(
                "INSERT INTO Galeria (titulo, categoria, url_imagen, estado) VALUES (?, ?, ?, 'ACTIVO')",
                titulo, categoria, urlImagen
            );
            return ResponseEntity.ok(Map.of("mensaje", "Imagen agregada correctamente."));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("mensaje", "Error: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> eliminarImagen(@PathVariable int id) {
        try {
            int filas = jdbcTemplate.update(
                "UPDATE Galeria SET estado = 'INACTIVO' WHERE id_imagen = ?", id
            );
            if (filas == 0) return ResponseEntity.status(404).body(Map.of("mensaje", "Imagen no encontrada."));
            return ResponseEntity.ok(Map.of("mensaje", "Imagen eliminada correctamente."));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("mensaje", "Error: " + e.getMessage()));
        }
    }
}