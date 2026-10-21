package com.kimstudio.backend_api.model;

public class CitaRequest {
    private String nombre_cliente;
    private Integer id_servicio;
    private String fecha;
    private String hora;
    public String getNombre_cliente() {
        return nombre_cliente;
    }
    public void setNombre_cliente(String nombre_cliente) {
        this.nombre_cliente = nombre_cliente;
    }
    public Integer getId_servicio() {
        return id_servicio;
    }
    public void setId_servicio(Integer id_servicio) {
        this.id_servicio = id_servicio;
    }
    public String getFecha() {
        return fecha;
    }
    public void setFecha(String fecha) {
        this.fecha = fecha;
    }
    public String getHora() {
        return hora;
    }
    public void setHora(String hora) {
        this.hora = hora;
    }
    
}
