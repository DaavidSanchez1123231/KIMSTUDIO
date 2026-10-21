package com.kimstudio.backend_api.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ServicioService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Cacheable("serviciosCache")
    public List<Map<String, Object>> obtenerServiciosActivos() {
        // Añadimos 'categoria AS \"categoriaId\"' para que Angular lo reconozca automáticamente
        String sql = "SELECT id_servicio, nombre AS nombre, descripcion AS \"desc\", precio, duracion_minutos, imagen_url, categoria AS \"categoriaId\" " +
                     "FROM Servicios WHERE estado = '1'";
        return jdbcTemplate.queryForList(sql);
    }

    @CacheEvict(value = "serviciosCache", allEntries = true)
    public Map<String, Object> crearServicio(String nombre, String descripcion, double precio, int duracionMinutos, String imagenUrl, String categoria) {
        
        // Agregamos 'categoria' a la consulta SQL
        String sql = "INSERT INTO Servicios (nombre, descripcion, precio, duracion_minutos, imagen_url, categoria, estado) " +
                     "VALUES (?, ?, ?, ?, ?, ?, TRUE)";
        
        jdbcTemplate.update(sql, nombre, descripcion, precio, duracionMinutos, imagenUrl, categoria);
        
        Map<String, Object> respuesta = new HashMap<>();
        respuesta.put("mensaje", "Servicio creado exitosamente");
        return respuesta;
    }
    @CacheEvict(value = "serviciosCache", allEntries = true)
    public Map<String, Object> actualizarServicio(int idServicio, String nombre, String descripcion, double precio,
                                                  int duracionMinutos, String imagenUrl, String categoria) {
        String sql = "UPDATE Servicios SET nombre = ?, descripcion = ?, precio = ?, duracion_minutos = ?, "
                   + "imagen_url = ?, categoria = ? WHERE id_servicio = ? AND estado = TRUE";
        int filas = jdbcTemplate.update(sql, nombre, descripcion, precio, duracionMinutos, imagenUrl, categoria, idServicio);

        Map<String, Object> respuesta = new HashMap<>();
        respuesta.put("actualizado", filas > 0);
        respuesta.put("mensaje", filas > 0 ? "Servicio actualizado correctamente" : "Servicio no encontrado");
        return respuesta;
    }

    @CacheEvict(value = "serviciosCache", allEntries = true)
    public Map<String, Object> eliminarServicio(int idServicio) {
        String sql = "UPDATE Servicios SET estado = FALSE WHERE id_servicio = ?";
        jdbcTemplate.update(sql, idServicio);
        
        Map<String, Object> respuesta = new HashMap<>();
        respuesta.put("mensaje", "Servicio eliminado (inactivado) correctamente");
        return respuesta;
    }
}