package com.kimstudio.backend_api.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class EspecialistaService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public List<Map<String, Object>> obtenerEspecialistasActivos() {
        // Agregamos el campo 'telefono' a la consulta
        String sql = "SELECT id_especialista, nombre, especialidad, telefono, estado " +
                     "FROM Especialistas WHERE estado = 1"; 
        return jdbcTemplate.queryForList(sql);
    }

    public Map<String, Object> crearEspecialista(String nombre, String especialidad, String telefono) {
        // Guardamos el teléfono en la base de datos
        String sql = "INSERT INTO Especialistas (nombre, especialidad, telefono, estado) VALUES (?, ?, ?, 1)";
        jdbcTemplate.update(sql, nombre, especialidad, telefono);
        return Map.of("mensaje", "Colaborador registrado exitosamente");
    }

   public Map<String, Object> eliminarEspecialista(int id) {
    String sql = "UPDATE Especialistas SET estado = 0 WHERE id_especialista = ?"; 
    jdbcTemplate.update(sql, id);
    return Map.of("mensaje", "Empleado dado de baja correctamente");
    }
}