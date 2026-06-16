package com.kimstudio.backend_api.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ServicioService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    // 1. En obtenerServiciosActivos()
    public List<Map<String, Object>> obtenerServiciosActivos() {
        // Añadimos 'categoria AS categoriaId' para que Angular lo reconozca automáticamente
        String sql = "SELECT id_servicio, nombre AS nombre, descripcion AS [desc], precio, duracion_minutos, imagen_url, categoria AS categoriaId " +
                     "FROM Servicios WHERE estado = 'ACTIVO'";
        return jdbcTemplate.queryForList(sql);
    }

    // 2. En crearServicio() - Agregamos 'String categoria' como parámetro
    public Map<String, Object> crearServicio(String nombre, String descripcion, double precio, int duracionMinutos, String imagenUrl, String categoria) {
        
        // Agregamos 'categoria' a la consulta SQL
        String sql = "INSERT INTO Servicios (nombre, descripcion, precio, duracion_minutos, imagen_url, categoria, estado) " +
                     "VALUES (?, ?, ?, ?, ?, ?, 'ACTIVO')";
        
        // Pasamos la variable 'categoria' al jdbcTemplate
        jdbcTemplate.update(sql, nombre, descripcion, precio, duracionMinutos, imagenUrl, categoria);
        
        Map<String, Object> respuesta = new HashMap<>();
        respuesta.put("mensaje", "Servicio creado exitosamente");
        return respuesta;
    }

    // "Eliminar" (Borrado lógico cambiando el estado)
    public Map<String, Object> eliminarServicio(int idServicio) {
        String sql = "UPDATE Servicios SET estado = 'INACTIVO' WHERE id_servicio = ?";
        jdbcTemplate.update(sql, idServicio);
        
        Map<String, Object> respuesta = new HashMap<>();
        respuesta.put("mensaje", "Servicio eliminado (inactivado) correctamente");
        return respuesta;
    }
}