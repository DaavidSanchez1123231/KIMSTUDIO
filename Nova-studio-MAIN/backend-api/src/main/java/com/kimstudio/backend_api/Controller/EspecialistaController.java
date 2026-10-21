package com.kimstudio.backend_api.Controller;

import com.kimstudio.backend_api.service.EspecialistaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/empleados")
@CrossOrigin(origins = "http://localhost:4200")
public class EspecialistaController {

    @Autowired
    private EspecialistaService especialistaService;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> listarEspecialistas() {
        return ResponseEntity.ok(especialistaService.obtenerEspecialistasActivos());
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> registrarEspecialista(@RequestBody Map<String, Object> body) {
        
        String nombre = body.get("nombre") != null ? body.get("nombre").toString() : "";
        String especialidad = body.get("especialidad") != null ? body.get("especialidad").toString() : "Cabello";
        String telefono = body.get("telefono") != null ? body.get("telefono").toString() : "";

        // Ya no mandamos el horario
        return ResponseEntity.ok(especialistaService.crearEspecialista(nombre, especialidad, telefono));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> eliminarEspecialista(@PathVariable int id) {
        return ResponseEntity.ok(especialistaService.eliminarEspecialista(id));
    }
}