// Datos del negocio: edítalos aquí y se actualizan en todas las políticas.
export const EMPRESA = {
  nombre: 'NOVA Beauty Salon',
  razonSocial: '[razón social]',
  ruc: '[RUC]',
  direccion: '[dirección del local]',
  correo: '[correo de contacto]',
  telefono: '[teléfono / WhatsApp]',
};
export const VERSION_POLITICAS = '2026-10';
export interface Seccion { t: string; p: string[]; }
export interface Doc { titulo: string; actualizado: string; secciones: Seccion[]; }
const E = EMPRESA;
const ACT = 'Octubre de 2026';
const LEY = 'Ley N.° 29733, Ley de Protección de Datos Personales, y su Reglamento (D.S. N.° 016-2024-JUS)';

export const DOCS: Record<string, Doc> = {
  privacidad: { titulo: 'Política de Privacidad', actualizado: ACT, secciones: [
    { t: '1. Responsable del tratamiento', p: [`${E.nombre} (${E.razonSocial}, RUC ${E.ruc}), con domicilio en ${E.direccion}. Contacto: ${E.correo}. Tratamos tus datos conforme a la ${LEY}.`] },
    { t: '2. Datos que recopilamos', p: ['Nombre, correo electrónico, teléfono, contraseña (almacenada cifrada), historial de citas y servicios, y los mensajes que nos envías por el formulario de contacto.'] },
    { t: '3. Finalidades', p: ['Finalidades necesarias: crear y administrar tu cuenta, reservar y gestionar citas, enviarte confirmaciones y recordatorios por correo o WhatsApp, y atender tus consultas.', 'Finalidad opcional: enviarte promociones y novedades. Solo si la autorizas expresamente y puedes retirarla cuando quieras.'] },
    { t: '4. Base legal', p: ['Tu consentimiento libre, previo, expreso, informado e inequívoco, y la ejecución del servicio que solicitas (reservas).'] },
    { t: '5. Destinatarios y encargados', p: ['No vendemos tus datos. Los compartimos solo con proveedores que nos ayudan a operar (alojamiento, envío de correo y mensajería por WhatsApp), que los tratan según nuestras instrucciones. Si alguno está fuera del Perú, aplicamos las garantías que exige la normativa.'] },
    { t: '6. Plazo de conservación', p: ['Mientras mantengas tu cuenta y durante el tiempo necesario para cumplir obligaciones legales. Luego se eliminan o anonimizan.'] },
    { t: '7. Tus derechos', p: [`Puedes ejercer tus derechos de acceso, rectificación, cancelación, oposición y revocar tu consentimiento escribiendo a ${E.correo}, indicando tu nombre y correo de registro. Si consideras que no atendimos tu solicitud, puedes acudir a la Autoridad Nacional de Protección de Datos Personales.`] },
    { t: '8. Seguridad', p: ['Aplicamos medidas técnicas y organizativas razonables (cifrado de contraseñas, control de acceso por roles y conexión segura) para proteger tus datos.'] },
    { t: '9. Menores de edad', p: ['Si eres menor de 18 años, tu cuenta debe crearse con autorización de tu padre, madre o tutor.'] },
    { t: '10. Cookies y cambios', p: ['Consulta la Política de Cookies para saber qué almacenamos en tu navegador. Publicaremos aquí cualquier cambio a esta política.'] },
  ]},
  terminos: { titulo: 'Términos y Condiciones', actualizado: ACT, secciones: [
    { t: '1. Aceptación', p: [`Al usar este sitio y registrarte aceptas estos términos. El sitio pertenece a ${E.nombre} (${E.razonSocial}, RUC ${E.ruc}).`] },
    { t: '2. Cuenta de usuario', p: ['Debes dar información veraz y mantener la confidencialidad de tu contraseña. Eres responsable de la actividad realizada con tu cuenta.'] },
    { t: '3. Reservas de citas', p: ['La reserva queda sujeta a disponibilidad y a la confirmación del salón. Te pedimos llegar con puntualidad; pasados 15 minutos de retraso podríamos reprogramar o cancelar la cita. Las condiciones de cancelación y reembolso están en la Política de Reembolsos.'] },
    { t: '4. Precios y pagos', p: ['Los precios publicados están en soles (S/) e incluyen impuestos, salvo que se indique lo contrario, y pueden cambiar sin afectar reservas ya confirmadas.'] },
    { t: '5. Uso adecuado', p: ['Está prohibido usar el sitio para fines ilícitos, intentar acceder sin autorización a cuentas o sistemas, o enviar contenido ofensivo.'] },
    { t: '6. Propiedad intelectual', p: [`Los textos, imágenes, logotipos y diseño del sitio pertenecen a ${E.nombre} o a sus licenciantes y no pueden reproducirse sin autorización.`] },
    { t: '7. Responsabilidad', p: ['Hacemos lo posible por mantener el sitio disponible, pero no garantizamos que funcione sin interrupciones. Los resultados de los servicios estéticos pueden variar según cada persona.'] },
    { t: '8. Libro de Reclamaciones', p: [`Conforme al Código de Protección y Defensa del Consumidor, puedes presentar un reclamo o queja en nuestro Libro de Reclamaciones (físico en el local o virtual). Contacto: ${E.correo}.`] },
    { t: '9. Ley aplicable', p: ['Estos términos se rigen por las leyes de la República del Perú. Cualquier controversia se someterá a los jueces competentes de su territorio.'] },
  ]},
  cookies: { titulo: 'Política de Cookies', actualizado: ACT, secciones: [
    { t: '1. Qué son', p: ['Son pequeños archivos o datos que un sitio guarda en tu navegador. También incluimos tecnologías similares, como el almacenamiento local (localStorage).'] },
    { t: '2. Qué usamos hoy', p: ['Estrictamente necesarias (no requieren consentimiento): guardan tu sesión (token de acceso, rol y nombre) para que puedas iniciar sesión y reservar, y recuerdan tu elección sobre cookies. Sin ellas el sitio no funciona.', 'Análisis y publicidad: actualmente NO las usamos. Si en el futuro las activamos, pediremos tu consentimiento previo y podrás rechazarlas sin perder acceso al sitio.'] },
    { t: '3. Servicios de terceros', p: ['El sitio carga tipografías y librerías desde servicios externos (Google Fonts, jsDelivr, cdnjs y unpkg). Al hacerlo, estos proveedores pueden recibir datos técnicos como tu dirección IP, según sus propias políticas.'] },
    { t: '4. Cómo gestionarlas', p: ['Puedes cambiar tu elección con el botón de abajo, o borrar y bloquear cookies desde la configuración de tu navegador. Si bloqueas las necesarias, no podrás iniciar sesión.'] },
    { t: '5. Más información', p: [`Consulta la Política de Privacidad para conocer tus derechos y cómo contactarnos (${E.correo}).`] },
  ]},
  reembolsos: { titulo: 'Política de Reembolsos y Cancelaciones', actualizado: ACT, secciones: [
    { t: '1. Cancelación y reprogramación', p: ['Puedes cancelar o reprogramar tu cita sin costo con al menos 24 horas de anticipación, comunicándote por nuestros canales de contacto.', 'Con menos de 24 horas de aviso o inasistencia, el salón puede retener el adelanto entregado para cubrir el tiempo reservado.'] },
    { t: '2. Adelantos', p: ['Si pagaste un adelanto y cancelas dentro del plazo, se te devuelve íntegro o se aplica a una nueva cita, a tu elección.', 'Si el salón cancela o no puede atenderte, se te devuelve el 100 % del adelanto o se reprograma sin costo.'] },
    { t: '3. Servicios ya prestados', p: ['Por su naturaleza, los servicios estéticos ya realizados no son reembolsables. Si no quedaste conforme, avísanos dentro de los 7 días siguientes y evaluaremos un ajuste o repetición sin costo.'] },
    { t: '4. Productos', p: ['Los productos sin abrir y con su empaque original pueden cambiarse dentro de 7 días con tu comprobante. Si presentan defecto de fábrica, los cambiamos o reembolsamos.'] },
    { t: '5. Plazo y medio de reembolso', p: ['Los reembolsos se hacen por el mismo medio de pago, en un plazo máximo de 15 días hábiles desde que se aprueba la solicitud.'] },
    { t: '6. Cómo solicitarlo', p: [`Escríbenos a ${E.correo} o al ${E.telefono} indicando tu nombre, fecha de la cita y motivo. También puedes usar el Libro de Reclamaciones.`] },
  ]},
};
