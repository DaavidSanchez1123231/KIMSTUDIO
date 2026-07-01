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
        try {
            String enlaceMagico = "http://localhost:8081/api/usuarios/verificar?correo=" + destino;

            SimpleMailMessage mensaje = new SimpleMailMessage();
            mensaje.setFrom("kimstudio.support@gmail.com"); // ← agrega el from explícito
            mensaje.setTo(destino);
            mensaje.setSubject("¡Bienvenido a KIM Studio! Verifica tu cuenta");
            mensaje.setText("Hola " + nombre + ",\n\n" +
                    "Gracias por registrarte. Para verificar tu cuenta haz clic aquí:\n\n" +
                    enlaceMagico + "\n\n¡Te esperamos!");

            mailSender.send(mensaje);
            System.out.println("✅ Correo enviado a: " + destino);

        } catch (Exception e) {
            // Antes era silencioso — ahora imprime el error real
            System.err.println("❌ Error al enviar correo a " + destino + ": " + e.getMessage());
            e.printStackTrace();
        }
    }
}