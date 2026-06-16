package com.kimstudio.backend_api.Controller;

import com.kimstudio.backend_api.model.loginDTO;
import com.kimstudio.backend_api.model.RegistroDTO;
import com.kimstudio.backend_api.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "http://localhost:4200") 
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

    @PostMapping("/registro")
    public ResponseEntity<Map<String, Object>> registrar(@RequestBody RegistroDTO peticion) {
        Map<String, Object> respuesta = usuarioService.registrarUsuario(
                peticion.getNombre(),
                peticion.getEmail(),
                peticion.getTelefono(),
                peticion.getPassword()

        );
        return ResponseEntity.ok(respuesta);
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody loginDTO peticion) {
        Map<String, Object> respuesta = usuarioService.login(
                peticion.getEmail(),
                peticion.getPassword()
        );
        

        if (respuesta.containsKey("token")) {
            return ResponseEntity.ok(respuesta);
        } else {
            // Si falló (contraseña incorrecta o no verificado), devolvemos un 401 Unauthorized
            return ResponseEntity.status(401).body(respuesta);
        }
    }

    @PutMapping("/rol/{idUsuario}")
    public ResponseEntity<Map<String, Object>> cambiarRol(@PathVariable int idUsuario, @RequestBody Map<String, String> body) {
        String nuevoRol = body.get("rol");
        int filasAfectadas = usuarioService.actualizarRolPrueba(idUsuario, nuevoRol);
        
        Map<String, Object> respuesta = new java.util.HashMap<>();
        if (filasAfectadas > 0) {
            respuesta.put("mensaje", "Rol actualizado a: " + nuevoRol);
            respuesta.put("idUsuario", idUsuario);
        } else {
            respuesta.put("mensaje", "Usuario no encontrado");
        }
        
        return ResponseEntity.ok(respuesta);
    }

    @GetMapping("/verificar")
    public ResponseEntity<String> verificarCuenta(@RequestParam String correo) {
        boolean exito = usuarioService.procesarVerificacion(correo);
        if (exito) {
            return ResponseEntity.ok("<h1>¡Cuenta Verificada!</h1><p>Tu cuenta en KIM Studio ha sido activada con éxito. Ya puedes iniciar sesión en la aplicación.</p>");
        } else {
            return ResponseEntity.badRequest().body("<h1>Error</h1><p>No se pudo verificar la cuenta o el enlace es inválido.</p>");
        }
    }
}