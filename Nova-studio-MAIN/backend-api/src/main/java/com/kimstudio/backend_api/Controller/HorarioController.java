
package com.kimstudio.backend_api.Controller;

import com.kimstudio.backend_api.service.HorarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/horarios")
@CrossOrigin(origins = "http://localhost:4200")
public class HorarioController {

    @Autowired
    private HorarioService horarioService;

    @GetMapping("/disponibles")
    public ResponseEntity<?> listarHorariosDisponibles(
            @RequestParam String fecha) {

        if (fecha == null || fecha.isBlank()) {
            return ResponseEntity.badRequest().body(
                    Map.of("mensaje", "Selecciona una fecha.")
            );
        }

        return ResponseEntity.ok(
                horarioService.obtenerHorariosDisponibles(fecha)
        );
    }

    @GetMapping("/especialista/{id}")
    public ResponseEntity<List<Map<String, Object>>> listarHorariosDelEspecialista(
            @PathVariable int id) {

        return ResponseEntity.ok(
                horarioService.obtenerHorariosPorEspecialista(id)
        );
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> asignarHorario(
            @RequestBody Map<String, Object> body) {

        int id = Integer.parseInt(body.get("id_especialista").toString());
        String fecha = body.get("fecha").toString();
        String horaInicio = body.get("hora_inicio").toString();
        String horaFin = body.get("hora_fin").toString();

        return ResponseEntity.ok(
                horarioService.crearHorario(id, fecha, horaInicio, horaFin)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> eliminarHorario(
            @PathVariable int id) {

        return ResponseEntity.ok(
                horarioService.eliminarHorario(id)
        );
    }
}
