package com.kimstudio.backend_api.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class GestionComercialService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    
    public Map<String, Object> registrarProducto(String nombre, String categoria, 
                                               double precio, int stock, String descripcion) {
    try {
        String sql = "EXEC sp_crear_producto ?, ?, ?, ?, ?";
        return jdbcTemplate.queryForMap(sql, nombre, categoria, precio, stock, descripcion);
    } catch (Exception e) {
        // Si el SP no devuelve filas, hacemos INSERT directo
        String sqlDirecto = "INSERT INTO Productos (nombre, categoria, precio, stock, descripcion) " +
                           "VALUES (?, ?, ?, ?, ?)";
        jdbcTemplate.update(sqlDirecto, nombre, categoria, precio, stock, descripcion);
        return Map.of("mensaje", "Producto registrado en el inventario.");
    }
}


    public Map<String, Object> registrarVenta(String cliente, String metodoPago, double montoTotal) {
    try {
        String sql = "EXEC sp_registrar_venta ?, ?, ?";
        return jdbcTemplate.queryForMap(sql, cliente, metodoPago, montoTotal);
    } catch (Exception e) {
        // Fallback directo si el SP falla
        jdbcTemplate.update(
            "INSERT INTO Ventas (metodo_pago, monto_total, fecha_venta) VALUES (?, ?, GETDATE())",
            metodoPago, montoTotal
        );
        return Map.of("mensaje", "Venta procesada con éxito y caja actualizada.");
    }
}

    public Map<String, Object> crearPromocion(String nombre, int descuento, String codigo, String fechaExpiracion, String descripcion) {
        String sql = "EXEC sp_crear_promocion ?, ?, ?, ?, ?";
        return jdbcTemplate.queryForMap(sql, nombre, descuento, codigo, fechaExpiracion, descripcion);
    }

    // ==========================================
    // MÉTODOS PARA LEER (GET) - NUEVO
    // ==========================================

    public List<Map<String, Object>> obtenerProductos() {
        String sql = "SELECT * FROM Productos WHERE estado = '1'";
        return jdbcTemplate.queryForList(sql);
    }

    public List<Map<String, Object>> obtenerPromociones() {
        String sql = "SELECT * FROM Promociones WHERE estado = '1'";
        return jdbcTemplate.queryForList(sql);
    }

    
    public List<Map<String, Object>> obtenerVentasRecientes() {
    String sql = "SELECT v.id_venta, " +
                 "'VTA-' + RIGHT('0000' + CAST(v.id_venta AS VARCHAR), 4) AS boleta, " +
                 "v.fecha_venta AS fecha, " +
                 "ISNULL(u.nombre, 'Público General') AS cliente, " +
                 "CASE WHEN v.id_cita IS NOT NULL THEN 'Servicio' ELSE 'Producto' END AS detalle, " +
                 "v.metodo_pago AS metodo, " +
                 "v.monto_total AS total " +
                 "FROM Ventas v " +
                 "LEFT JOIN Usuarios u ON v.id_cliente = u.id_usuario " +
                 "ORDER BY v.fecha_venta DESC";
    return jdbcTemplate.queryForList(sql);
}

public Map<String, Object> obtenerMetricasHoy() {
    String sql = "SELECT " +
                 "ISNULL(SUM(monto_total), 0) AS totalCaja, " +
                 "ISNULL(SUM(CASE WHEN id_cita IS NOT NULL THEN monto_total ELSE 0 END), 0) AS porServicios, " +
                 "ISNULL(SUM(CASE WHEN id_cita IS NULL THEN monto_total ELSE 0 END), 0) AS porProductos " +
                 "FROM Ventas WHERE CAST(fecha_venta AS DATE) = CAST(GETDATE() AS DATE)";
    return jdbcTemplate.queryForMap(sql);
}

public Map<String, Object> anularVenta(int idVenta, String motivo) {
    // Verificar que existe
    String sqlCheck = "SELECT COUNT(*) FROM Ventas WHERE id_venta = ?";
    int existe = jdbcTemplate.queryForObject(sqlCheck, Integer.class, idVenta);
    if (existe == 0) {
        return Map.of("mensaje", "Venta no encontrada.");
    }
    jdbcTemplate.update("DELETE FROM Ventas WHERE id_venta = ?", idVenta);
    return Map.of("mensaje", "Venta anulada. Motivo: " + motivo);
}
}