package com.kimstudio.backend_api.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/reportes")
@CrossOrigin(origins = "http://localhost:4200")
public class ReporteController {

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> obtenerMetricas(
            @RequestParam(required = false) String desde, 
            @RequestParam(required = false) String hasta) {
            
        Map<String, Object> respuesta = new HashMap<>();

        // 1. Estructura de Balance
        Map<String, Object> balance = new HashMap<>();
        balance.put("ingresosBrutos", 8500.00);
        balance.put("insumosComisiones", 2100.00);
        balance.put("utilidadNeta", 6400.00);
        respuesta.put("balance", balance);

        // 2. Estructura de Servicios Top
        List<Map<String, Object>> servicios = new ArrayList<>();
        servicios.add(Map.of("nombre", "Balayage / Tintes", "porcentaje", 65));
        servicios.add(Map.of("nombre", "Botox Capilar", "porcentaje", 25));
        servicios.add(Map.of("nombre", "Uñas Acrílicas", "porcentaje", 10));
        respuesta.put("serviciosTop", servicios);

        // 3. Estructura de Empleados Top
        List<Map<String, Object>> empleados = new ArrayList<>();
        empleados.add(Map.of("nombre", "Klara Mendoza", "puesto", "Estilista Principal", "monto", 4250.00));
        empleados.add(Map.of("nombre", "Lucía Torres", "puesto", "Manicurista", "monto", 1800.00));
        respuesta.put("empleadosTop", empleados);

        return ResponseEntity.ok(respuesta);
    }
}