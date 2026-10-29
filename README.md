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
- **Nginx:** servidor web utilizado para servir el frontend en EC2.

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

### Base de datos

- MySQL
- Amazon RDS

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

Además, se configuró Nginx para servir el frontend directamente desde EC2.

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

Nginx se configuró en EC2 para servir el frontend generado por Vite.

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

Esto permite comprobar que el JWT Authorizer está funcionando.

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

Se validó el flujo completo:

```text
Frontend
→ Cognito
→ API Gateway
→ BFF
→ Microservicio
→ RDS
```

---

## Ejecución local

### Requisitos

- Node.js 22
- npm
- Java 21
- Maven
- Git
- Acceso a MySQL o a la instancia RDS configurada

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

Proyecto desarrollado como solución Cloud Native utilizando servicios de Amazon Web Services, arquitectura basada en microservicios y un frontend web desarrollado con React + TypeScript.

El objetivo es demostrar la integración entre autenticación, autorización, APIs, microservicios, persistencia y servicios cloud administrados.
