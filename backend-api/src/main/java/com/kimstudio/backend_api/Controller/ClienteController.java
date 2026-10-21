package com.kimstudio.backend_api.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/clientes")
@CrossOrigin(origins = "http://localhost:4200")
public class ClienteController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> listarClientes() {
        String sql = "SELECT id_usuario, nombre, email AS correo, telefono, " +
                     "(SELECT COUNT(*) FROM Citas WHERE id_usuario = Usuarios.id_usuario) AS \"citasTotales\" " +
                     "FROM Usuarios WHERE rol = 'cliente'";  // ← id_cliente corregido a id_usuario

        List<Map<String, Object>> clientes = jdbcTemplate.queryForList(sql);
        return ResponseEntity.ok(clientes);
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> crearCliente(@RequestBody Map<String, Object> body) {
        try {
            String nombre   = (String) body.get("nombre");
            String correo   = (String) body.get("correo");
            String telefono = (String) body.get("telefono");

            // Verificar si el correo ya existe
            String sqlCheck = "SELECT COUNT(*) FROM Usuarios WHERE LOWER(email) = LOWER(?)";
            int existe = jdbcTemplate.queryForObject(sqlCheck, Integer.class, correo);
            if (existe > 0) {
                return ResponseEntity.status(400).body(Map.of("mensaje", "El correo ya está registrado."));
            }

            // Contraseña temporal encriptada
            String passwordTemporal = passwordEncoder.encode("Kim2024*");

            String sql = "INSERT INTO Usuarios (nombre, email, telefono, contraseña, rol, cuenta_verificada) " +
                         "VALUES (?, ?, ?, ?, 'cliente', TRUE)";
            jdbcTemplate.update(sql, nombre, correo, telefono, passwordTemporal);

            return ResponseEntity.ok(Map.of("mensaje", "Cliente registrado correctamente."));

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("mensaje", "Error interno: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> eliminarCliente(@PathVariable int id) {
        try {
            // Verificar si tiene citas activas antes de eliminar
            int citas = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM Citas WHERE id_usuario = ?", Integer.class, id);

            if (citas > 0) {
                return ResponseEntity.status(409).body(
                    Map.of("mensaje", "No se puede eliminar: el cliente tiene " + citas + " cita(s) registrada(s)."));
            }

            jdbcTemplate.update("DELETE FROM Usuarios WHERE id_usuario = ?", id);
            return ResponseEntity.ok(Map.of("mensaje", "Cliente eliminado correctamente."));

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("mensaje", "Error interno: " + e.getMessage()));
        }
    }
}