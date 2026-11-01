
# BancoCloud

Aplicación bancaria desarrollada bajo una arquitectura Cloud Native utilizando servicios de AWS, microservicios con Spring Boot y un frontend desarrollado con React + TypeScript.

El proyecto permite gestionar usuarios, cuentas bancarias y solicitudes de apertura de cuentas, diferenciando los permisos de clientes y empleados mediante Amazon Cognito.

---

## Descripción del proyecto

BancoCloud permite gestionar las siguientes funcionalidades:

### Cliente

- Registrarse e iniciar sesión.
- Consultar sus cuentas bancarias.
- Consultar sus saldos.
- Crear solicitudes de apertura de cuentas.
- Consultar el estado de sus solicitudes.

### Empleado

- Iniciar sesión con permisos administrativos.
- Consultar todas las cuentas.
- Consultar solicitudes de clientes.
- Aprobar solicitudes.
- Rechazar solicitudes.
- Autorizar usuarios para acceder como clientes.
- Gestionar el acceso según los grupos definidos en Amazon Cognito.

Cuando una solicitud es aprobada, el sistema crea automáticamente la cuenta bancaria correspondiente y asigna un número de cuenta.

---

## Arquitectura

La solución utiliza los siguientes componentes:

- **AWS Amplify:** hosting y despliegue del frontend.
- **Amazon Cognito:** autenticación, usuarios y grupos.
- **Amazon API Gateway HTTP API:** punto de entrada de las APIs y autorización mediante JWT.
- **Amazon EC2:** ejecución del backend.
- **banco-bff:** Backend For Frontend.
- **cuentas-service:** gestión de cuentas.
- **solicitudes-service:** gestión de solicitudes.
- **Amazon RDS MySQL:** persistencia de datos.
- **RabbitMQ:** mensajería asíncrona.
- **Nginx:** servidor web utilizado para servir el frontend.

```text
React + TypeScript + Vite
            |
            v
       AWS Amplify
            |
            v
       Amazon Cognito
      Autenticación/JWT
            |
            v
   API Gateway HTTP API
            |
            v
        banco-bff
            |
       +----+----+
       |         |
       v         v
cuentas-service  solicitudes-service
       |         |
       +----+----+
            |
            v
       Amazon RDS
          MySQL

         RabbitMQ
            |
      Exchanges / Queues
            |
       Producers / Consumers
            |
         Retry / DLQ
```

---

## Tecnologías utilizadas

### Frontend

- React
- TypeScript
- Vite
- Axios
- React Router
- AWS Amplify

### Backend

- Java 21
- Spring Boot
- Spring Security
- Spring Data JPA
- OAuth2 Resource Server
- Lombok
- Maven
- Spring Boot Actuator
- Spring AMQP

### Base de datos

- MySQL
- Amazon RDS

### Mensajería

- RabbitMQ
- Exchanges
- Queues
- Bindings
- Producers
- Consumers
- ACK / NACK
- Retry
- Dead Letter Queue (DLQ)

### AWS

- AWS Amplify
- Amazon Cognito
- Amazon API Gateway
- Amazon EC2
- Amazon RDS
- Amazon VPC
- AWS Security Groups

### Control de versiones

- Git
- GitHub

---

## Estructura del proyecto

```text
banco_cloud/
├── banco-bff/
│   └── Backend For Frontend
├── banco-frontend/
│   └── Aplicación React + TypeScript
├── cuentas-service/
│   └── Microservicio de cuentas
├── solicitudes-service/
│   └── Microservicio de solicitudes
└── README.md
```

---

## Autenticación y autorización

La autenticación se realiza mediante **Amazon Cognito**.

Se utilizan dos grupos principales:

```text
Cliente
Empleado
```

Después de iniciar sesión, Cognito entrega tokens JWT.

El frontend utiliza el token de acceso para realizar las solicitudes hacia API Gateway.

Las solicitudes contienen:

```http
Authorization: Bearer <JWT>
```

API Gateway utiliza un JWT Authorizer para validar el token antes de permitir el acceso al backend.

La autorización también se controla en el BFF, evitando depender únicamente de las restricciones visuales del frontend.

---

## Roles

### Cliente

El cliente puede:

- Consultar sus cuentas.
- Consultar sus saldos.
- Crear solicitudes.
- Consultar sus solicitudes.

### Empleado

El empleado puede:

- Consultar todas las cuentas.
- Consultar solicitudes.
- Aprobar solicitudes.
- Rechazar solicitudes.
- Administrar usuarios.
- Autorizar usuarios para acceder como clientes.

---

## Microservicios

### banco-bff

Puerto:

```text
8080
```

Es la capa Backend For Frontend.

Se encarga de:

- Recibir las solicitudes provenientes de API Gateway.
- Validar roles.
- Coordinar los microservicios.
- Aplicar reglas de autorización.
- Gestionar operaciones que involucran más de un microservicio.
- Exponer funcionalidades administrativas relacionadas con RabbitMQ.

### cuentas-service

Puerto:

```text
8081
```

Responsable de la gestión de cuentas bancarias.

Endpoints principales:

```http
GET /cuentas
GET /cuentas/{id}
GET /cuentas/{id}/saldo
POST /cuentas
PUT /cuentas/{id}/numero
```

### solicitudes-service

Puerto:

```text
8082
```

Responsable de la gestión de solicitudes de apertura de cuentas.

Endpoints principales:

```http
POST /solicitudes
GET /solicitudes
GET /solicitudes/{id}
PUT /solicitudes/{id}/aprobar
PUT /solicitudes/{id}/rechazar
```

---

## Flujo de solicitud de cuenta

Cuando un cliente solicita una nueva cuenta, la solicitud pasa por el frontend, API Gateway, BFF y `solicitudes-service`, donde se almacena en RDS MySQL.

La solicitud se crea inicialmente con estado:

```text
PENDIENTE
```

Cuando un empleado aprueba la solicitud:

```text
Solicitud → APROBADA → Creación de cuenta → Asignación de número
```

El BFF coordina la actualización de la solicitud y la creación de la cuenta mediante `cuentas-service`.

Si la solicitud es rechazada:

```text
Solicitud → RECHAZADA
```

No se crea una cuenta.

---

## Base de datos

La aplicación utiliza MySQL mediante Amazon RDS.

Base de datos:

```text
bancocloud
```

La conexión de los microservicios se realiza mediante Spring Data JPA.

Las credenciales de la base de datos no se almacenan directamente en el código fuente.

Se utiliza una variable de entorno:

```text
DB_PASSWORD
```

En el entorno EC2, la configuración sensible se mantiene fuera del repositorio.

---

## AWS Amplify

AWS Amplify se utiliza para alojar y desplegar el frontend React.

El repositorio de GitHub está conectado a Amplify para permitir despliegues automáticos cuando se realizan cambios en la rama configurada.

Proceso:

```text
Git Push
   ↓
GitHub
   ↓
AWS Amplify
   ↓
npm ci
   ↓
npm run build
   ↓
Deploy
```

El frontend se genera mediante Vite y el resultado de producción se encuentra en:

```text
dist/
```

---

## Amazon Cognito

Amazon Cognito se utiliza para:

- Registro de usuarios.
- Inicio de sesión.
- Confirmación de usuarios.
- Gestión de grupos.
- Emisión de tokens JWT.

Grupos utilizados:

```text
Cliente
Empleado
```

La identidad y los grupos del usuario son utilizados para aplicar las reglas de autorización correspondientes.

---

## Amazon API Gateway

Se utiliza **API Gateway HTTP API** como punto de entrada del backend.

API Gateway:

- Recibe las solicitudes del frontend.
- Valida los JWT mediante Cognito.
- Aplica CORS.
- Envía las solicitudes hacia el BFF.

Las solicitudes sin un JWT válido son rechazadas con:

```text
401 Unauthorized
```

Esto permite comprobar que el JWT Authorizer está funcionando.

---

## Amazon EC2

La instancia EC2 ejecuta:

```text
banco-bff
cuentas-service
solicitudes-service
```

Además, se configuró Nginx para servir el frontend.

Sistema operativo:

```text
Amazon Linux 2023
```

Los servicios backend utilizan Java 21.

---

## Amazon RDS

Amazon RDS proporciona la base de datos MySQL utilizada por los microservicios.

El acceso a la base de datos se controla mediante Security Groups.

El puerto utilizado por MySQL es:

```text
3306
```

El acceso está restringido mediante las reglas de red configuradas para el entorno.

---

## Nginx

Nginx se configuró para servir el frontend generado por Vite.

El flujo es:

```text
Navegador
   ↓
EC2 :80
   ↓
Nginx
   ↓
/var/www/banco-cloud
   ↓
dist/
```

La configuración utiliza `try_files` para permitir el funcionamiento de las rutas de la aplicación React.

---

## Seguridad

Se implementaron diferentes mecanismos de seguridad:

- Autenticación mediante Amazon Cognito.
- Tokens JWT.
- JWT Authorizer en API Gateway.
- Grupos de usuarios para diferenciar roles.
- Autorización en el BFF.
- Security Groups para controlar el acceso a EC2 y RDS.
- Credenciales fuera del código fuente.
- Variables de entorno para información sensible.
- CORS configurado para los orígenes utilizados.

No se deben almacenar credenciales AWS, contraseñas de RDS ni tokens dentro del repositorio.

---

## Validaciones realizadas

### Backend

Se verificó el estado de los servicios mediante:

```http
GET /actuator/health
```

Los servicios respondieron correctamente con:

```json
{
  "status": "UP"
}
```

### API Gateway

Se verificó que una solicitud sin un JWT válido sea rechazada:

```text
401 Unauthorized
```

### Cognito

Se verificó:

- Inicio de sesión.
- Usuarios confirmados.
- Grupos Cliente y Empleado.
- Obtención de JWT.
- Autorización de usuarios.

### Cliente

Se verificó:

- Inicio de sesión.
- Consulta de cuentas.
- Consulta de saldo.
- Creación de solicitudes.
- Consulta de solicitudes.

### Empleado

Se verificó:

- Consulta de cuentas.
- Consulta de solicitudes.
- Aprobación.
- Rechazo.
- Autorización de usuarios.

### Integración completa

Se validó el flujo:

```text
Frontend
→ Cognito
→ API Gateway
→ BFF
→ Microservicio
→ RDS
```

---

# Integración de RabbitMQ

Como parte de la Evaluación Parcial N.º 3 de **DSY1107 – Desarrollo Cloud Native I**, BancoCloud incorpora RabbitMQ para implementar mensajería asíncrona y desacoplar el procesamiento de eventos entre los componentes backend.

La implementación contempla configuración declarativa de colas, exchanges y bindings; publicación y consumo de eventos; confirmación manual de mensajes; reintentos; Dead Letter Queue (DLQ); y administración de recursos RabbitMQ mediante endpoints REST.

## Arquitectura de mensajería

El microservicio `solicitudes-service` concentra la configuración y los componentes de mensajería del dominio de solicitudes.

El BFF expone las operaciones administrativas y delega su ejecución al microservicio correspondiente.

```text
                         banco-bff
                            |
                 /api/admin/rabbitmq
                            |
                            v
                    solicitudes-service
                            |
              +-------------+--------------+
              |             |              |
              v             v              v
        RabbitMQConfig  Publishers     Consumers
              |             |              |
              +-------------+--------------+
                            |
                            v
                         RabbitMQ
                            |
          +-----------------+------------------+
          |                 |                  |
          v                 v                  v
    Exchange principal  Retry Exchange    DLX / DLQ
          |
          v
    Cola de solicitudes
          |
          v
    SolicitudEventConsumer
          |
          v
    SolicitudEventProcessor
```

## Recursos RabbitMQ configurados

Los nombres de los recursos se centralizan mediante propiedades `app.rabbitmq` en `solicitudes-service/src/main/resources/application.properties` y se vinculan a `RabbitMQProperties`.

| Recurso | Nombre configurado | Tipo / finalidad |
|---|---|---|
| Exchange principal | `bancocloud.solicitudes.exchange` | Topic |
| Cola principal | `bancocloud.solicitudes.queue` | Cola durable |
| Routing key principal | `solicitud.creada` | Enrutamiento de solicitudes |
| Dead Letter Exchange | `bancocloud.solicitudes.dlx` | Direct |
| Dead Letter Queue | `bancocloud.solicitudes.dlq` | Mensajes fallidos |
| Routing key DLQ | `solicitud.fallida` | Enrutamiento a DLQ |
| Retry Exchange | `bancocloud.solicitudes.retry.exchange` | Direct |
| Retry Queue | `bancocloud.solicitudes.retry.queue` | Cola de espera |
| Routing key Retry | `solicitud.reintento` | Enrutamiento de reintentos |
| TTL de Retry | `5000 ms` | Tiempo de espera |
| Máximo de intentos | `3` | Intentos configurados |
| Exchange demo | `bancocloud.demo.exchange` | Direct |
| Cola demo | `bancocloud.demo.queue` | Cola de demostración |
| Routing key demo | `demo.mensaje` | Enrutamiento de mensajes demo |

La configuración se declara mediante beans en `RabbitMQConfig.java`.

Se definen exchanges, colas durables y bindings explícitos. La cola principal y la cola demo incluyen argumentos de Dead Letter Exchange y routing key para derivar mensajes rechazados sin reencolado.

## Configuración centralizada

Archivos principales:

- `solicitudes-service/src/main/java/cl/duoc/solicitudes_service/config/RabbitMQConfig.java`
- `solicitudes-service/src/main/java/cl/duoc/solicitudes_service/config/RabbitMQProperties.java`
- `solicitudes-service/src/main/resources/application.properties`

`RabbitMQProperties` utiliza `@ConfigurationProperties(prefix = "app.rabbitmq")` y validaciones como `@NotBlank`, `@NotNull` y `@Min`.

`RabbitMQConfig` declara los beans de:

- Exchange principal y su binding.
- Cola principal.
- Dead Letter Exchange, Dead Letter Queue y binding.
- Retry Exchange, Retry Queue y binding.
- Exchange y cola de demostración y su binding.
- Conversor JSON basado en Jackson.
- `SimpleRabbitListenerContainerFactory`.
- `RabbitAdmin`.

La factoría de listeners está configurada con `AcknowledgeMode.MANUAL` y `defaultRequeueRejected=false`, permitiendo que los consumidores controlen explícitamente la confirmación y el rechazo de mensajes.

## Productores y consumidores

### Eventos de solicitudes

Se identificaron los siguientes componentes:

- `SolicitudEventPublisher.java`: publica eventos utilizando el exchange y routing key definidos en `RabbitMQProperties`.
- `SolicitudEventConsumer.java`: recibe eventos mediante `@RabbitListener`.
- `SolicitudEventProcessor.java`: encapsula el procesamiento del evento y evita mezclar esa lógica con la configuración de RabbitMQ.

El consumidor valida que el evento y sus datos obligatorios sean correctos.

Si detecta datos inválidos, registra el error y ejecuta NACK sin reencolado, permitiendo que el mensaje siga la ruta de DLQ configurada.

Cuando el procesamiento termina correctamente, envía ACK manual al broker.

### Mensajería de demostración

También existen componentes separados para demostrar el ciclo de publicación y consumo:

- `DemoMessagePublisher.java`
- `DemoMessageConsumer.java`
- `DemoMessage.java`
- `DemoMessageStatusService.java`
- `DemoMessageController.java`

El flujo permite publicar un mensaje de demostración y consultar su estado mediante un identificador.

El estado se mantiene en memoria mediante una estructura concurrente, por lo que no constituye persistencia histórica.

## Confirmación de mensajes, reintentos y DLQ

El consumidor `SolicitudEventConsumer` implementa confirmación manual:

- **ACK:** se envía cuando el procesamiento finaliza correctamente.
- **NACK sin requeue:** se utiliza para mensajes con datos inválidos, permitiendo su derivación a DLQ según la configuración de la cola.
- **Reintentos:** ante errores de procesamiento, el consumidor publica el mensaje en el Retry Exchange con el encabezado `x-retry-count`.
- **TTL:** la Retry Queue utiliza un TTL de `5000 ms`; al vencer, el mensaje se enruta nuevamente al exchange principal.
- **DLQ:** al agotarse los intentos configurados, el consumidor publica el evento en el Dead Letter Exchange.
- **Publisher Confirms:** antes de confirmar el mensaje original, el consumidor espera la confirmación de publicación de RabbitMQ y comprueba si el mensaje fue devuelto.
- **Fallo al republicar:** si no se puede confirmar la publicación hacia Retry o DLQ, el mensaje original recibe NACK con requeue para evitar perderlo.

El número máximo de intentos está centralizado en `app.rabbitmq.max-attempts=3`.

El timeout de confirmación de publicación está configurado mediante `app.rabbitmq.publisher-confirm-timeout=10000`.

Los logs registran el procesamiento, los errores, los intentos de reenvío, el envío a DLQ y las confirmaciones.

## Administración de RabbitMQ desde el BFF

El BFF expone el controlador:

`banco-bff/src/main/java/cl/duoc/banco_bff/controller/RabbitMQAdminBffController.java`

Ruta base:

```http
/api/admin/rabbitmq
```

Las operaciones administrativas están protegidas mediante:

```java
@PreAuthorize("hasAuthority('ROLE_Empleado')")
```

### Endpoints expuestos por el BFF

| Método | Endpoint | Funcionalidad |
|---|---|---|
| GET | `/api/admin/rabbitmq/queues` | Consultar colas |
| GET | `/api/admin/rabbitmq/exchanges` | Consultar exchanges |
| GET | `/api/admin/rabbitmq/bindings` | Consultar bindings |
| POST | `/api/admin/rabbitmq/queues` | Crear cola |
| DELETE | `/api/admin/rabbitmq/queues?nombre={nombre}` | Eliminar cola |
| POST | `/api/admin/rabbitmq/exchanges` | Crear exchange |
| DELETE | `/api/admin/rabbitmq/exchanges?nombre={nombre}` | Eliminar exchange |
| POST | `/api/admin/rabbitmq/bindings` | Crear binding |
| DELETE | `/api/admin/rabbitmq/bindings` | Eliminar binding |

Para crear una cola:

```json
{
  "nombre": "bancocloud.cola.ejemplo"
}
```

Para crear un exchange:

```json
{
  "nombre": "bancocloud.exchange.ejemplo",
  "tipo": "direct"
}
```

Para crear o eliminar un binding:

```json
{
  "nombreCola": "bancocloud.cola.ejemplo",
  "nombreExchange": "bancocloud.exchange.ejemplo",
  "routingKey": "ejemplo.routing"
}
```

El BFF delega las operaciones a `RabbitMQDemoBffService`, que utiliza `RestClient` para comunicarse con `solicitudes-service`.

El controlador valida los datos obligatorios antes de delegar la operación y maneja `RestClientResponseException` para propagar el estado y cuerpo de error recibido desde el microservicio.

## Administración en solicitudes-service

El microservicio implementa:

- `RabbitMQAdminController.java`: endpoints internos para consultar y administrar recursos.
- `RabbitMQAdminService.java`: encapsula la creación y eliminación de colas, exchanges y bindings mediante `RabbitAdmin`.
- `RabbitMQManagementService.java`: consulta colas, exchanges y bindings mediante la RabbitMQ Management HTTP API.
- `RabbitMQAdminExceptionHandler`: manejo global de errores administrativos.

Las consultas de recursos utilizan la Management API de RabbitMQ, mientras que las operaciones de creación y eliminación se encapsulan en el servicio administrativo.

### Validaciones de entrada

Los DTO del controlador utilizan validaciones Jakarta Bean Validation:

- `@NotBlank` para campos obligatorios.
- `@Size(max = 200)` para limitar la longitud.
- `@Pattern` para restringir caracteres permitidos.
- Validación del tipo de exchange a `direct` o `topic`.

El manejador global responde con HTTP 400 para datos inválidos o cuerpos incorrectos y HTTP 500 para errores no controlados, registrando los detalles técnicos en logs sin exponerlos en la respuesta.

## Pruebas y verificaciones de RabbitMQ

Durante el desarrollo se realizaron verificaciones del funcionamiento de RabbitMQ en la instancia EC2. Se informó que varias pruebas ejecutadas en ese entorno finalizaron correctamente.

En la revisión del repositorio se comprobó la existencia de los componentes y configuraciones descritos en esta sección.

Los resultados concretos de cada prueba realizada en EC2 deben respaldarse con sus capturas, respuestas HTTP o logs correspondientes.

### Matriz de seguimiento

| Área | Estado |
|---|---|
| Configuración centralizada de nombres | Implementada en código |
| Beans de Queue, Exchange y Binding | Declarados en `RabbitMQConfig` |
| Separación de configuración y procesamiento | Implementada mediante clases dedicadas |
| Consumidor de eventos de solicitudes | Implementado con `@RabbitListener` |
| ACK manual | Implementado |
| NACK para mensajes inválidos | Implementado |
| Reintentos con TTL | Implementados en configuración y consumidor |
| Derivación a DLQ | Implementada en configuración y consumidor |
| Publisher Confirms y detección de mensajes devueltos | Configurados y utilizados en el flujo de reintentos |
| Administración REST de colas, exchanges y bindings | Implementada en BFF y microservicio |
| Control de acceso administrativo por rol | Implementado en el BFF |
| Validación de parámetros | Implementada mediante validaciones y comprobaciones |
| Pruebas funcionales en EC2 | Realizadas; resultados específicos deben acompañarse con evidencias |

## Rúbrica oficial – Evaluación Parcial N.º 3

La implementación se desarrolla siguiendo la pauta oficial `EP3_DSY1107_Estudiante_encargo(5).pdf`.

| Indicador de evaluación | Ponderación |
|---|---:|
| Centralización de nombres de colas, exchanges y bindings | 12% |
| Beans de configuración RabbitMQ (`Queue`, `Exchange` y `Binding`) | 13% |
| Separación entre lógica de negocio y configuración de mensajería | 10% |
| Implementación y organización de consumidores | 15% |
| Confirmación de mensajes y manejo explícito de errores | 20% |
| Endpoints REST del microservicio administrador | 13% |
| Encapsulación de la administración en un servicio dedicado | 10% |
| Validación de parámetros de entrada | 7% |
| **Total** | **100%** |

La rúbrica anterior es la referencia para el proyecto BancoCloud. La pauta de ponderaciones 18/20/35/15/12 corresponde a un cuestionario distinto y no reemplaza la evaluación oficial del proyecto.

## Configuración de RabbitMQ

Las propiedades de conexión se definen mediante variables de entorno:

```properties
spring.rabbitmq.host=${RABBITMQ_HOST:localhost}
spring.rabbitmq.port=${RABBITMQ_PORT:5672}
spring.rabbitmq.username=${RABBITMQ_USERNAME}
spring.rabbitmq.password=${RABBITMQ_PASSWORD}
```

Las confirmaciones de publicación están configuradas mediante:

```properties
spring.rabbitmq.publisher-confirm-type=correlated
spring.rabbitmq.publisher-returns=true
spring.rabbitmq.template.mandatory=true
```

La Management API utiliza:

```properties
app.rabbitmq.management.api-url=${RABBITMQ_MANAGEMENT_URL:http://localhost:15672}
app.rabbitmq.management.username=${RABBITMQ_USERNAME}
app.rabbitmq.management.password=${RABBITMQ_PASSWORD}
```

No se deben subir credenciales, contraseñas, tokens ni archivos `.env` al repositorio.

### Docker Compose

El repositorio incluye un servicio RabbitMQ con imagen `rabbitmq:4-management`, persistencia mediante volumen y healthcheck.

```yaml
services:
  rabbitmq:
    image: rabbitmq:4-management
    container_name: bancocloud-rabbitmq
    hostname: bancocloud-rabbitmq
    ports:
      - "127.0.0.1:5672:5672"
      - "127.0.0.1:15672:15672"
    environment:
      RABBITMQ_DEFAULT_USER: ${RABBITMQ_USERNAME}
      RABBITMQ_DEFAULT_PASS: ${RABBITMQ_PASSWORD}
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq
    healthcheck:
      test: ["CMD", "rabbitmq-diagnostics", "-q", "ping"]
      interval: 10s
      timeout: 5s
      retries: 10
    restart: unless-stopped

volumes:
  rabbitmq_data:
```

Los puertos se publican en `127.0.0.1` para limitar el acceso a la interfaz local del host. En EC2, el acceso remoto debe controlarse mediante la configuración de red y Security Groups.

---

## Ejecución local

### Requisitos

- Node.js 22
- npm
- Java 21
- Maven
- Git
- Acceso a MySQL o a la instancia RDS configurada
- RabbitMQ disponible y configurado para los microservicios.

### Iniciar RabbitMQ

Configurar las variables requeridas en un archivo `.env` local, tomando como referencia `.env.example`.

Luego ejecutar:

```bash
docker compose up -d rabbitmq
```

Comprobar el estado del contenedor:

```bash
docker compose ps
```

La interfaz de administración de RabbitMQ utiliza el puerto `15672` y el protocolo AMQP utiliza el puerto `5672`.

### Frontend

Ingresar al directorio:

```bash
cd banco-frontend
```

Instalar dependencias:

```bash
npm install
```

Ejecutar en desarrollo:

```bash
npm run dev
```

Generar build de producción:

```bash
npm run build
```

### Backend

Cada microservicio puede ejecutarse mediante Maven.

Ejemplo:

```bash
mvn spring-boot:run
```

Puertos utilizados:

```text
banco-bff           → 8080
cuentas-service     → 8081
solicitudes-service → 8082
RabbitMQ AMQP       → 5672
RabbitMQ Management → 15672
```

---

## Despliegue

La solución se encuentra distribuida de la siguiente manera:

| Componente | Servicio |
|---|---|
| Frontend | AWS Amplify |
| Autenticación | Amazon Cognito |
| API | API Gateway HTTP API |
| BFF | Amazon EC2 |
| cuentas-service | Amazon EC2 |
| solicitudes-service | Amazon EC2 |
| Base de datos | Amazon RDS MySQL |
| Mensajería | RabbitMQ |

El frontend se actualiza mediante el flujo:

```text
Desarrollo
   ↓
Git
   ↓
GitHub
   ↓
AWS Amplify
   ↓
Build
   ↓
Deploy
```

---

## Servicios y puertos

| Componente | Puerto |
|---|---:|
| banco-bff | 8080 |
| cuentas-service | 8081 |
| solicitudes-service | 8082 |
| MySQL / RDS | 3306 |
| HTTP / Nginx | 80 |
| RabbitMQ AMQP | 5672 |
| RabbitMQ Management | 15672 |

---

## Flujo funcional principal

### Crear una solicitud

1. El cliente inicia sesión mediante Cognito.
2. Cognito entrega el JWT.
3. El frontend envía la solicitud a API Gateway.
4. API Gateway valida el JWT.
5. La solicitud llega al BFF.
6. El BFF envía la operación a `solicitudes-service`.
7. La solicitud se almacena en RDS con estado `PENDIENTE`.

### Aprobar una solicitud

1. El empleado inicia sesión.
2. Cognito identifica al usuario como `Empleado`.
3. El empleado aprueba la solicitud.
4. API Gateway valida el JWT.
5. El BFF valida los permisos.
6. La solicitud cambia a `APROBADA`.
7. Se crea una nueva cuenta mediante `cuentas-service`.
8. Se asigna el número de cuenta.
9. La cuenta queda almacenada en RDS.

### Rechazar una solicitud

1. El empleado selecciona rechazar.
2. API Gateway valida el JWT.
3. El BFF valida los permisos.
4. La solicitud cambia a `RECHAZADA`.
5. No se crea una cuenta.

---

## Proyecto académico

**BancoCloud**

Proyecto desarrollado como solución Cloud Native utilizando servicios de Amazon Web Services, arquitectura basada en microservicios, mensajería asíncrona con RabbitMQ y un frontend web desarrollado con React + TypeScript.

El objetivo es demostrar la integración entre autenticación, autorización, APIs, microservicios, persistencia, mensajería asíncrona y servicios cloud administrados.
