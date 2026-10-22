
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

    // ==========================================
    // REGISTRAR PRODUCTO
    // ==========================================

    @PostMapping("/productos")
    public ResponseEntity<?> registrarProducto(
            @RequestBody Map<String, Object> body) {

        try {
            String nombre = body.get("nombre").toString().trim();

            String categoria = body.get("categoria").toString().trim();

            double precio = Double.parseDouble(
                    body.get("precio").toString()
            );

            int stock = Integer.parseInt(
                    body.get("stock").toString()
            );

            String descripcion = body.get("desc") != null
                    ? body.get("desc").toString().trim()
                    : "";

            String imagenUrl = body.get("imagen_url") != null
                    ? body.get("imagen_url").toString().trim()
                    : "";

            if (nombre.isEmpty() || categoria.isEmpty()) {
                return ResponseEntity.badRequest().body(
                        Map.of(
                                "mensaje",
                                "El nombre y la categoría son obligatorios."
                        )
                );
            }

            if (nombre.length() > 100 || categoria.length() > 50) {
                return ResponseEntity.badRequest().body(
                        Map.of(
                                "mensaje",
                                "El nombre o la categoría exceden el tamaño permitido."
                        )
                );
            }

            if (!Double.isFinite(precio) || precio < 0 || stock < 0) {
                return ResponseEntity.badRequest().body(
                        Map.of(
                                "mensaje",
                                "El precio y el stock deben ser valores válidos no negativos."
                        )
                );
            }

            if (descripcion.length() > 255) {
                return ResponseEntity.badRequest().body(
                        Map.of(
                                "mensaje",
                                "La descripción no puede superar los 255 caracteres."
                        )
                );
            }

            Map<String, Object> respuesta =
                    comercialService.registrarProducto(
                            nombre,
                            categoria,
                            precio,
                            stock,
                            descripcion,
                            imagenUrl
                    );

            return ResponseEntity.ok(respuesta);

        } catch (Exception e) {

            return ResponseEntity.badRequest().body(
                    Map.of(
                            "mensaje",
                            "Error al registrar producto: " + e.getMessage()
                    )
            );
        }
    }

    // ==========================================
    // LISTAR PRODUCTOS
    // ==========================================

    @GetMapping("/productos")
    public ResponseEntity<List<Map<String, Object>>> listarProductos() {

        return ResponseEntity.ok(
                comercialService.obtenerProductos()
        );
    }

    // ==========================================
    // MODIFICAR PRODUCTO
    // ==========================================

    @PutMapping("/productos/{id}")
    public ResponseEntity<?> modificarProducto(
            @PathVariable int id,
            @RequestBody Map<String, Object> body) {

        try {

            String nombre = body.get("nombre") == null
                    ? ""
                    : body.get("nombre").toString().trim();

            String categoria = body.get("categoria") == null
                    ? ""
                    : body.get("categoria").toString().trim();

            if (nombre.isEmpty() || categoria.isEmpty()) {

                return ResponseEntity.badRequest().body(
                        Map.of(
                                "mensaje",
                                "El nombre y la categoría son obligatorios."
                        )
                );
            }

            if (nombre.length() > 100 || categoria.length() > 50) {

                return ResponseEntity.badRequest().body(
                        Map.of(
                                "mensaje",
                                "El nombre o la categoría exceden el tamaño permitido."
                        )
                );
            }

            double precio = Double.parseDouble(
                    body.get("precio").toString()
            );

            int stock = Integer.parseInt(
                    body.get("stock").toString()
            );

            if (!Double.isFinite(precio) || precio < 0 || stock < 0) {

                return ResponseEntity.badRequest().body(
                        Map.of(
                                "mensaje",
                                "El precio y el stock deben ser valores válidos no negativos."
                        )
                );
            }

            String descripcion = body.get("desc") == null
                    ? ""
                    : body.get("desc").toString().trim();

            String imagenUrl = body.get("imagen_url") == null
                    ? ""
                    : body.get("imagen_url").toString().trim();

            if (descripcion.length() > 255) {

                return ResponseEntity.badRequest().body(
                        Map.of(
                                "mensaje",
                                "La descripción no puede superar los 255 caracteres."
                        )
                );
            }

            Map<String, Object> respuesta =
                    comercialService.modificarProducto(
                            id,
                            nombre,
                            categoria,
                            precio,
                            stock,
                            descripcion,
                            imagenUrl
                    );

            if (respuesta.containsKey("no_encontrado")) {

                return ResponseEntity.status(404).body(
                        Map.of(
                                "mensaje",
                                "Producto no encontrado o eliminado."
                        )
                );
            }

            return ResponseEntity.ok(respuesta);

        } catch (NumberFormatException e) {

            return ResponseEntity.badRequest().body(
                    Map.of(
                            "mensaje",
                            "El precio o el stock tienen un formato incorrecto."
                    )
            );

        } catch (Exception e) {

            return ResponseEntity.internalServerError().body(
                    Map.of(
                            "mensaje",
                            "Error al modificar producto: " + e.getMessage()
                    )
            );
        }
    }

    // ==========================================
    // ELIMINAR PRODUCTO
    // ==========================================

    @DeleteMapping("/productos/{id}")
    public ResponseEntity<?> eliminarProducto(
            @PathVariable int id) {

        try {

            int filas = jdbcTemplate.update(
                    """
                    UPDATE productos
                    SET estado = FALSE
                    WHERE id_producto = ?
                      AND estado = TRUE
                    """,
                    id
            );

            if (filas == 0) {

                return ResponseEntity.status(404).body(
                        Map.of(
                                "mensaje",
                                "Producto no encontrado o ya eliminado."
                        )
                );
            }

            return ResponseEntity.ok(
                    Map.of(
                            "mensaje",
                            "Producto eliminado correctamente."
                    )
            );

        } catch (Exception e) {

            return ResponseEntity.internalServerError().body(
                    Map.of(
                            "mensaje",
                            "Error al eliminar producto: " + e.getMessage()
                    )
            );
        }
    }

    // ==========================================
    // REGISTRAR VENTA
    // ==========================================

    @PostMapping("/ventas")
    public ResponseEntity<?> registrarVenta(
            @RequestBody Map<String, Object> body) {

        try {

            String cliente = body.get("cliente") != null
                    ? body.get("cliente").toString()
                    : "";

            String metodo = body.get("metodo").toString();

            double total = Double.parseDouble(
                    body.get("total").toString()
            );

            return ResponseEntity.ok(
                    comercialService.registrarVenta(
                            cliente,
                            metodo,
                            total
                    )
            );

        } catch (Exception e) {

            return ResponseEntity.badRequest().body(
                    Map.of(
                            "mensaje",
                            "Error al registrar venta: " + e.getMessage()
                    )
            );
        }
    }

    // ==========================================
    // CREAR PROMOCIÓN
    // ==========================================

    @PostMapping("/promociones")
    public ResponseEntity<?> crearPromocion(
            @RequestBody Map<String, Object> body) {

        try {

            Map<String, Object> respuesta =
                    comercialService.crearPromocion(
                            body.get("nombre").toString(),
                            Integer.parseInt(
                                    body.get("descuento").toString()
                            ),
                            body.get("codigo").toString(),
                            body.get("fecha_expiracion").toString(),
                            body.get("descripcion").toString()
                    );

            return ResponseEntity.ok(respuesta);

        } catch (Exception e) {

            return ResponseEntity.badRequest().body(
                    Map.of(
                            "mensaje",
                            "Error al crear promoción: " + e.getMessage()
                    )
            );
        }
    }

    // ==========================================
    // LISTAR PROMOCIONES
    // ==========================================

    @GetMapping("/promociones")
    public ResponseEntity<List<Map<String, Object>>> listarPromociones() {

        return ResponseEntity.ok(
                comercialService.obtenerPromociones()
        );
    }

    // ==========================================
    // ELIMINAR PROMOCIÓN
    // ==========================================

    @DeleteMapping("/promociones/{id}")
    public ResponseEntity<?> eliminarPromocion(
            @PathVariable int id) {

        try {

            int filas = jdbcTemplate.update(
                    "UPDATE promociones SET estado = FALSE WHERE id_promocion = ?",
                    id
            );

            if (filas == 0) {

                return ResponseEntity.status(404).body(
                        Map.of(
                                "mensaje",
                                "Promoción no encontrada."
                        )
                );
            }

            return ResponseEntity.ok(
                    Map.of(
                            "mensaje",
                            "Promoción eliminada correctamente."
                    )
            );

        } catch (Exception e) {

            return ResponseEntity.internalServerError().body(
                    Map.of(
                            "mensaje",
                            "Error: " + e.getMessage()
                    )
            );
        }
    }

    // ==========================================
    // LISTAR VENTAS
    // ==========================================

    @GetMapping("/ventas")
    public ResponseEntity<List<Map<String, Object>>> listarVentas() {

        return ResponseEntity.ok(
                comercialService.obtenerVentasRecientes()
        );
    }

    // ==========================================
    // MÉTRICAS DE VENTAS DEL DÍA
    // ==========================================

    @GetMapping("/ventas/metricas-hoy")
    public ResponseEntity<Map<String, Object>> metricasHoy() {

        return ResponseEntity.ok(
                comercialService.obtenerMetricasHoy()
        );
    }

    // ==========================================
    // ANULAR VENTA
    // ==========================================

    @PostMapping("/ventas/{id}/anular")
    public ResponseEntity<?> anularVenta(
            @PathVariable int id,
            @RequestBody Map<String, Object> body) {

        String motivo = body.get("motivo") != null
                ? body.get("motivo").toString()
                : "Sin motivo";

        try {

            return ResponseEntity.ok(
                    comercialService.anularVenta(
                            id,
                            motivo
                    )
            );

        } catch (Exception e) {

            return ResponseEntity.badRequest().body(
                    Map.of(
                            "mensaje",
                            "Error al anular venta: " + e.getMessage()
                    )
            );
        }
    }
}
