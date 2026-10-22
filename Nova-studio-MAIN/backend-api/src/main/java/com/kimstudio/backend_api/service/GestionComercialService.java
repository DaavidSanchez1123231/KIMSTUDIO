
package com.kimstudio.backend_api.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GestionComercialService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    // REGISTRAR PRODUCTO
   public Map<String, Object> registrarProducto(
        String nombre,
        String categoria,
        double precio,
        int stock,
        String descripcion,
        String imagenUrl) {

    String sql = """
        INSERT INTO productos
            (nombre, categoria, precio, stock, descripcion, imagen_url)
        VALUES (?, ?, ?, ?, ?, ?)
        RETURNING id_producto
        """;

    Integer id = jdbcTemplate.queryForObject(
        sql,
        Integer.class,
        nombre,
        categoria,
        precio,
        stock,
        descripcion,
        imagenUrl
    );

    return Map.of(
        "mensaje", "Producto registrado correctamente",
        "id_producto", id
    );
}

    // LISTAR PRODUCTOS ACTIVOS
    public List<Map<String, Object>> obtenerProductos() {
    String sql = """
        SELECT id_producto, nombre, categoria, precio, stock,
               descripcion AS desc, imagen_url, estado
        FROM productos
        WHERE estado = TRUE
        ORDER BY id_producto DESC
        """;

    return jdbcTemplate.queryForList(sql);
}

    // REGISTRAR VENTA
    public Map<String, Object> registrarVenta(
            String cliente, String metodoPago, double montoTotal) {

        try {
            String sql = "SELECT * FROM sp_registrar_venta(?, ?, ?)";
            return jdbcTemplate.queryForMap(
                    sql, cliente, metodoPago, montoTotal
            );
        } catch (Exception e) {
            jdbcTemplate.update(
                    "INSERT INTO ventas (metodo_pago, monto_total, fecha_venta) " +
                    "VALUES (?, ?, NOW())",
                    metodoPago, montoTotal
            );

            return Map.of(
                    "mensaje", "Venta procesada con éxito."
            );
        }
    }

    // CREAR PROMOCIÓN
    public Map<String, Object> crearPromocion(
            String nombre,
            int descuento,
            String codigo,
            String fechaExpiracion,
            String descripcion) {

        String sql = "SELECT * FROM sp_crear_promocion(?, ?, ?, ?, ?)";

        return jdbcTemplate.queryForMap(
                sql,
                nombre,
                descuento,
                codigo,
                fechaExpiracion,
                descripcion
        );
    }

    // LISTAR PROMOCIONES ACTIVAS
    public List<Map<String, Object>> obtenerPromociones() {
        String sql =
                "SELECT * FROM promociones " +
                "WHERE estado = TRUE";

        return jdbcTemplate.queryForList(sql);
    }

    // LISTAR VENTAS RECIENTES
    public List<Map<String, Object>> obtenerVentasRecientes() {
        String sql =
                "SELECT v.id_venta, " +
                "'VTA-' || LPAD(CAST(v.id_venta AS VARCHAR), 4, '0') AS boleta, " +
                "v.fecha_venta AS fecha, " +
                "COALESCE(u.nombre, 'Público General') AS cliente, " +
                "CASE WHEN v.id_cita IS NOT NULL " +
                "THEN 'Servicio' ELSE 'Producto' END AS detalle, " +
                "v.metodo_pago AS metodo, " +
                "v.monto_total AS total " +
                "FROM ventas v " +
                "LEFT JOIN usuarios u ON v.id_cliente = u.id_usuario " +
                "ORDER BY v.fecha_venta DESC";

        return jdbcTemplate.queryForList(sql);
    }

    // MÉTRICAS DEL DÍA
    public Map<String, Object> obtenerMetricasHoy() {
        String sql =
                "SELECT " +
                "COALESCE(SUM(monto_total), 0) AS \"totalCaja\", " +
                "COALESCE(SUM(CASE WHEN id_cita IS NOT NULL " +
                "THEN monto_total ELSE 0 END), 0) AS \"porServicios\", " +
                "COALESCE(SUM(CASE WHEN id_cita IS NULL " +
                "THEN monto_total ELSE 0 END), 0) AS \"porProductos\" " +
                "FROM ventas " +
                "WHERE CAST(fecha_venta AS DATE) = CURRENT_DATE";

        return jdbcTemplate.queryForMap(sql);
    }

    // ANULAR VENTA
    public Map<String, Object> anularVenta(int idVenta, String motivo) {
        Integer existe = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM ventas WHERE id_venta = ?",
                Integer.class,
                idVenta
        );

        if (existe == null || existe == 0) {
            return Map.of("mensaje", "Venta no encontrada.");
        }

        jdbcTemplate.update(
                "DELETE FROM ventas WHERE id_venta = ?",
                idVenta
        );

        return Map.of(
                "mensaje", "Venta anulada. Motivo: " + motivo
        );
    }
}
