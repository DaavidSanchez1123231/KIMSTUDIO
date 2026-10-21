package com.kimstudio.backend_api.Controller;

import com.kimstudio.backend_api.service.GestionComercialService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*") 
public class GestionComercialController {
@Autowired
private JdbcTemplate jdbcTemplate;
    @Autowired
    private GestionComercialService comercialService;


    @PostMapping("/productos")
public ResponseEntity<?> registrarProducto(@RequestBody Map<String, Object> body) {
    try {
        String nombre      = body.get("nombre").toString();
        String categoria   = body.get("categoria").toString();
        double precio      = Double.parseDouble(body.get("precio").toString());
        int stock          = Integer.parseInt(body.get("stock").toString());
        String descripcion = body.get("desc") != null ? body.get("desc").toString() : ""; // ← era "descripcion"

        Map<String, Object> respuesta = comercialService.registrarProducto(
            nombre, categoria, precio, stock, descripcion
        );
        return ResponseEntity.ok(respuesta);
    } catch (Exception e) {
        return ResponseEntity.status(500).body(Map.of("mensaje", "Error: " + e.getMessage()));
    }
}

    @PostMapping("/ventas")
public ResponseEntity<?> registrarVenta(@RequestBody Map<String, Object> body) {
    try {
        String cliente  = body.get("cliente") != null ? body.get("cliente").toString() : "";
        String metodo   = body.get("metodo").toString();
        double total    = Double.parseDouble(body.get("total").toString());
        return ResponseEntity.ok(comercialService.registrarVenta(cliente, metodo, total));
    } catch (Exception e) {
        return ResponseEntity.status(500).body(Map.of("mensaje", "Error: " + e.getMessage()));
    }
}
    @PostMapping("/promociones")
    public ResponseEntity<?> crearPromocion(@RequestBody Map<String, Object> body) {
        Map<String, Object> respuesta = comercialService.crearPromocion(
                body.get("nombre").toString(),
                Integer.parseInt(body.get("descuento").toString()),
                body.get("codigo").toString(),
                body.get("fecha_expiracion").toString(),
                body.get("descripcion").toString()
        );
        return ResponseEntity.ok(respuesta);
    }
    @DeleteMapping("/productos/{id}")
public ResponseEntity<?> eliminarProducto(@PathVariable int id) {
    try {
        int filas = jdbcTemplate.update("UPDATE Productos SET estado = FALSE WHERE id_producto = ?", id);
        if (filas == 0) return ResponseEntity.status(404).body(Map.of("mensaje", "Producto no encontrado."));
        return ResponseEntity.ok(Map.of("mensaje", "Producto eliminado correctamente."));
    } catch (Exception e) {
        return ResponseEntity.status(500).body(Map.of("mensaje", "Error: " + e.getMessage()));
    }
}
    @GetMapping("/productos")
    public ResponseEntity<List<Map<String, Object>>> listarProductos() {
        return ResponseEntity.ok(comercialService.obtenerProductos());
    }

    @GetMapping("/promociones")
    public ResponseEntity<List<Map<String, Object>>> listarPromociones() {
        return ResponseEntity.ok(comercialService.obtenerPromociones());
    }

    @GetMapping("/ventas")
    public ResponseEntity<List<Map<String, Object>>> listarVentas() {
        return ResponseEntity.ok(comercialService.obtenerVentasRecientes());
    }
    @GetMapping("/ventas/metricas-hoy")
public ResponseEntity<Map<String, Object>> metricasHoy() {
    return ResponseEntity.ok(comercialService.obtenerMetricasHoy());
}

@PostMapping("/ventas/{id}/anular")
public ResponseEntity<?> anularVenta(@PathVariable int id, @RequestBody Map<String, Object> body) {
    String motivo = body.get("motivo") != null ? body.get("motivo").toString() : "Sin motivo";
    return ResponseEntity.ok(comercialService.anularVenta(id, motivo));
}
@DeleteMapping("/promociones/{id}")
public ResponseEntity<?> eliminarPromocion(@PathVariable int id) {
    try {
        int filas = jdbcTemplate.update(
            "UPDATE Promociones SET estado = FALSE WHERE id_promocion = ?", id
        );
        if (filas == 0) {
            return ResponseEntity.status(404).body(Map.of("mensaje", "Promoción no encontrada."));
        }
        return ResponseEntity.ok(Map.of("mensaje", "Promoción eliminada correctamente."));
    } catch (Exception e) {
        return ResponseEntity.status(500).body(Map.of("mensaje", "Error: " + e.getMessage()));
    }
}
}