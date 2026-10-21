package com.kimstudio.backend_api.Controller;

import com.kimstudio.backend_api.service.ServicioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/servicios")
@CrossOrigin(origins = "http://localhost:4200")
public class ServicioController {

    @Autowired
    private ServicioService servicioService;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> listarServicios() {
        return ResponseEntity.ok(servicioService.obtenerServiciosActivos());
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> registrarServicio(@RequestBody Map<String, Object> body) {
        
        // 1. Capturamos la URL de la imagen
        String imagen = body.containsKey("imagen_url") && body.get("imagen_url") != null ? 
                        body.get("imagen_url").toString() : "";

        // 2. Capturamos la categoría (Le ponemos 'cabello' por defecto si viene vacía)
        String categoria = body.containsKey("categoriaId") && body.get("categoriaId") != null ? 
                           body.get("categoriaId").toString() : "cabello";

        Map<String, Object> respuesta = servicioService.crearServicio(
                body.get("nombre").toString(),
                body.get("desc").toString(),
                Double.parseDouble(body.get("precio").toString()),
                60, 
                imagen, 
                categoria 
        );
        return ResponseEntity.ok(respuesta);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> eliminarServicio(@PathVariable int id) {
        return ResponseEntity.ok(servicioService.eliminarServicio(id));
    }
}