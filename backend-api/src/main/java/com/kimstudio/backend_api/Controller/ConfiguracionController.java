package com.kimstudio.backend_api.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/configuracion")
@CrossOrigin(origins = "http://localhost:4200")
public class ConfiguracionController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    /** El formulario del panel usa: nombre, telefono, correo, direccion, instagram y facebook. */
    @GetMapping("/empresa")
    public ResponseEntity<Map<String, Object>> obtenerConfiguracion() {
        List<Map<String, Object>> result = jdbcTemplate.queryForList(
                "SELECT nombre_salon AS nombre, telefono_whatsapp AS telefono, correo_contacto AS correo, "
              + "direccion, instagram, facebook FROM Configuracion ORDER BY id_config DESC LIMIT 1");
        if (result.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("mensaje", "Sin configuración."));
        }
        return ResponseEntity.ok(result.get(0));
    }

    @PutMapping("/empresa")
    public ResponseEntity<Map<String, Object>> actualizarConfiguracion(@RequestBody Map<String, Object> body) {
        // Acepta los nombres del formulario (nombre, telefono, correo) y los de la base (nombre_salon...)
        String nombre = texto(body, "nombre", "nombre_salon");
        String telefono = texto(body, "telefono", "telefono_whatsapp");
        String correo = texto(body, "correo", "correo_contacto");
        String direccion = texto(body, "direccion");
        String instagram = texto(body, "instagram");
        String facebook = texto(body, "facebook");

        if (nombre.isEmpty() || nombre.length() > 100) return error("El nombre del salón es obligatorio (máximo 100 caracteres).");
        if (telefono.length() > 20) return error("El teléfono no puede superar 20 caracteres.");
        if (correo.length() > 150 || (!correo.isEmpty() && !correo.contains("@"))) return error("Ingresa un correo válido (máximo 150 caracteres).");
        if (direccion.length() > 200) return error("La dirección no puede superar 200 caracteres.");
        if (instagram.length() > 200 || facebook.length() > 200) return error("Los enlaces de redes no pueden superar 200 caracteres.");

        int filas = jdbcTemplate.update(
                "UPDATE Configuracion SET nombre_salon = ?, telefono_whatsapp = ?, correo_contacto = ?, direccion = ?, "
              + "instagram = ?, facebook = ?, fecha_actualizacion = NOW() "
              + "WHERE id_config = (SELECT id_config FROM Configuracion ORDER BY id_config DESC LIMIT 1)",
                nombre, vacioANulo(telefono), vacioANulo(correo), vacioANulo(direccion), vacioANulo(instagram), vacioANulo(facebook));
        if (filas == 0) {   // la tabla estaba vacía: se crea la primera fila
            jdbcTemplate.update(
                    "INSERT INTO Configuracion (nombre_salon, telefono_whatsapp, correo_contacto, direccion, instagram, facebook) "
                  + "VALUES (?, ?, ?, ?, ?, ?)",
                    nombre, vacioANulo(telefono), vacioANulo(correo), vacioANulo(direccion), vacioANulo(instagram), vacioANulo(facebook));
        }
        return ResponseEntity.ok(Map.of("mensaje", "Configuración actualizada correctamente."));
    }

    /** Devuelve el primer campo que venga con valor; "" si ninguno. */
    private static String texto(Map<String, Object> body, String... claves) {
        for (String clave : claves) {
            Object v = body.get(clave);
            if (v != null && !v.toString().isBlank()) return v.toString().trim();
        }
        return "";
    }

    private static String vacioANulo(String s) {
        return s.isEmpty() ? null : s;
    }

    private static ResponseEntity<Map<String, Object>> error(String mensaje) {
        Map<String, Object> cuerpo = new HashMap<>();
        cuerpo.put("mensaje", mensaje);
        return ResponseEntity.badRequest().body(cuerpo);
    }
}