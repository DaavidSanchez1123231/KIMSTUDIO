package com.kimstudio.backend_api.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;
    
    @Async
    public void enviarCorreoVerificacion(String destino, String nombre) {
        // En la vida real aquí se genera un Token único (UUID).
        // Para este paso, usaremos el email directo como identificador para simplificar.
        String enlaceMagico = "http://localhost:8081/api/usuarios/verificar?correo=" + destino;

        SimpleMailMessage mensaje = new SimpleMailMessage();
        mensaje.setTo(destino);
        mensaje.setSubject("¡Bienvenido a KIM Studio! Verifica tu cuenta");
        mensaje.setText("Hola " + nombre + ",\n\n" +
                "Gracias por registrarte en nuestra estética. Para poder iniciar sesión y agendar tus citas, " +
                "por favor haz clic en el siguiente enlace para verificar tu cuenta:\n\n" +
                enlaceMagico + "\n\n" +
                "¡Te esperamos!");

        mailSender.send(mensaje);
        System.out.println("Correo de verificación enviado a: " + destino);
    }
}