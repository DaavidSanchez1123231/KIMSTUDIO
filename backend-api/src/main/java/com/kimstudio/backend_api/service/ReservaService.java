package com.kimstudio.backend_api.service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;

@Service
public class ReservaService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public List<Map<String, Object>> obtenerHorariosDisponibles(int idEspecialista, String fecha) {
        String sql = "SELECT * FROM sp_horarios_disponibles(?, ?)";
        return jdbcTemplate.queryForList(sql, idEspecialista, fecha);
    }

    public Map<String, Object> reservarCitaTemporal(int idUsuario, int idHorario, int idServicio) {
        String sql = "SELECT * FROM sp_reservar_cita_temporal(?, ?, ?)";
        return jdbcTemplate.queryForMap(sql, idUsuario, idHorario, idServicio);
    }

    public Map<String, Object> confirmarCita(int idHorario, int idUsuario) {
        String sql = "SELECT * FROM sp_confirmar_cita(?, ?)";
        return jdbcTemplate.queryForMap(sql, idHorario, idUsuario);
    }
}