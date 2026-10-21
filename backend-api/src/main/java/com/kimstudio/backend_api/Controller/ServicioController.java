package com.kimstudio.backend_api.Controller;

import com.kimstudio.backend_api.service.ServicioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/servicios")
@CrossOrigin(origins = "http://localhost:4200")
public class ServicioController {

    @Autowired
    private ServicioService servicioService;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> listarServicios() {
        return ResponseEntity.ok(servicioService.obtenerServiciosActivos());
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> registrarServicio(@RequestBody Map<String, Object> body) {
        try {
            Datos d = validar(body);
            return ResponseEntity.ok(servicioService.crearServicio(
                    d.nombre, d.desc, d.precio, d.duracion, d.imagen, d.categoria));
        } catch (IllegalArgumentException e) {
            return error(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> actualizarServicio(@PathVariable int id,
                                                                   @RequestBody Map<String, Object> body) {
        try {
            Datos d = validar(body);
            Map<String, Object> respuesta = servicioService.actualizarServicio(
                    id, d.nombre, d.desc, d.precio, d.duracion, d.imagen, d.categoria);
            boolean ok = Boolean.TRUE.equals(respuesta.get("actualizado"));
            return ResponseEntity.status(ok ? 200 : 404).body(respuesta);
        } catch (IllegalArgumentException e) {
            return error(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> eliminarServicio(@PathVariable int id) {
        return ResponseEntity.ok(servicioService.eliminarServicio(id));
    }

    // ---------- validación compartida por crear y editar ----------
    private record Datos(String nombre, String desc, double precio, int duracion, String imagen, String categoria) {}

    private static Datos validar(Map<String, Object> body) {
        String nombre = texto(body, "nombre").trim();
        if (nombre.isEmpty() || nombre.length() > 50) {
            throw new IllegalArgumentException("El nombre es obligatorio (máximo 50 caracteres).");
        }
        double precio;
        int duracion;
        try {
            precio = Double.parseDouble(texto(body, "precio"));
            duracion = body.get("duracion_minutos") == null ? 60 : Integer.parseInt(texto(body, "duracion_minutos"));
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("El precio y la duración deben ser números válidos.");
        }
        if (precio < 0) throw new IllegalArgumentException("El precio no puede ser negativo.");
        if (duracion < 5 || duracion > 600) throw new IllegalArgumentException("La duración debe estar entre 5 y 600 minutos.");

        String imagen = texto(body, "imagen_url").trim();
        if (!imagen.isEmpty() && !imagen.matches("(?i)^https?://\\S+$")) {
            throw new IllegalArgumentException("La URL de la imagen debe empezar con http:// o https://");
        }
        String categoria = texto(body, "categoriaId").trim();
        if (categoria.isEmpty()) categoria = "cabello";
        if (categoria.length() > 50) throw new IllegalArgumentException("La categoría es demasiado larga.");

        return new Datos(nombre, texto(body, "desc").trim(), precio, duracion, imagen, categoria);
    }

    private static String texto(Map<String, Object> body, String clave) {
        Object v = body.get(clave);
        return v == null ? "" : v.toString();
    }

    private static ResponseEntity<Map<String, Object>> error(String mensaje) {
        Map<String, Object> cuerpo = new HashMap<>();
        cuerpo.put("mensaje", mensaje);
        return ResponseEntity.badRequest().body(cuerpo);
    }
}