# Soluciones Residenciales - Frontend Angular

Aplicación web desarrollada en **Angular 21+** (standalone) para la gestión de Soluciones Residenciales. Migración del sistema WPF original a una aplicación web moderna con Clean Architecture.

## Características

- Angular 21+ con **Standalone Components**
- **Clean Architecture** organizada por features
- **Autenticación JWT** con login protegido
- CRUD completo para:
  - Empresas (Companies)
  - Edificios (Buildings)
  - Empleados (Employees)
  - Cotizaciones (Quotations)
  - Items de Cotización (Quotation Items)
- Servicios conectados a API REST en **.NET**
- Configuración lista para despliegue en **Azure**

## Arquitectura del Proyecto

```
src/app/
├── core/                          # Capa central (singletons)
│   ├── models/                    # Interfaces TypeScript (DTOs)
│   ├── services/                  # Servicios HTTP globales
│   ├── interceptors/              # Interceptores HTTP (auth)
│   └── guards/                    # Guards de rutas
├── features/                      # Features (Vertical Slice)
│   ├── companies/                 # Empresas
│   │   ├── components/            # List, Form
│   │   └── services/              # Feature service
│   ├── buildings/                 # Edificios
│   ├── employees/                 # Empleados
│   ├── quotations/                # Cotizaciones
│   └── login/                     # Autenticación
├── layout/                        # Layout components
│   ├── main-layout/               # Layout principal
│   ├── sidebar/                   # Menú lateral
│   └── header/                    # Header
├── shared/                        # Componentes compartidos
└── environments/                  # Configuración por ambiente
```

## Requisitos

- Node.js 20+
- Angular CLI 21+
- Backend API REST corriendo (Ver proyecto ProyectoSolucionesRecidencialesV2)

## Instalación

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run start
# o
ng serve
```

La aplicación estará disponible en `http://localhost:4200/`

## Configuración de Environments

### Desarrollo (local)
`src/environments/environment.ts`:
```typescript
apiUrl: 'http://localhost:5000/api'
```

### Producción (Azure)
`src/environments/environment.prod.ts`:
```typescript
apiUrl: 'https://tu-api-azure.azurewebsites.net/api'
```

## Build para Producción

```bash
# Build optimizado para producción
npm run build -- --configuration production

# o simplemente
ng build --configuration production
```

El resultado se genera en `dist/SolucionesRecidencialesWeb/`

## API Endpoints Consumidos

Los servicios se conectan a los siguientes endpoints REST:

| Entidad | Endpoints |
|---------|-----------|
| Companies | `GET /api/companies`, `POST /api/companies`, `PUT /api/companies/{id}`, `DELETE /api/companies/{id}` |
| Buildings | `GET /api/buildings`, `POST /api/buildings`, `PUT /api/buildings/{id}`, `DELETE /api/buildings/{id}` |
| Employees | `GET /api/employees`, `POST /api/employees`, `PUT /api/employees/{id}`, `DELETE /api/employees/{id}` |
| Quotations | `GET /api/quotations`, `POST /api/quotations`, `PUT /api/quotations/{id}`, `DELETE /api/quotations/{id}` |
| QuotationItems | `GET /api/quotationItems`, `GET /api/quotationItems/by-quotation/{id}`, `POST /api/quotationItems`, etc. |
| Auth | `POST /api/users/login` |

## Funcionalidades Implementadas

### Autenticación
- Login con usuario y contraseña
- Almacenamiento de token JWT en localStorage
- Guard de rutas para proteger páginas
- Interceptor HTTP para agregar token a peticiones
- Logout con limpieza de sesión

### Empresas
- Listado con tabla y acciones
- Crear nueva empresa
- Editar empresa existente
- Eliminar empresa
- Campos: Nombre, NIT, Email, Teléfono, Dirección, Estado

### Edificios
- Listado con tabla y acciones
- Crear nuevo edificio
- Editar edificio existente
- Eliminar edificio
- Dropdown para seleccionar empresa asociada
- Campos: Nombre, Ciudad, Departamento, País, Dirección, NIT, Empresa, Estado

### Empleados
- Listado con tabla y acciones
- Crear nuevo empleado
- Editar empleado existente
- Eliminar empleado
- Dropdown para seleccionar edificio asociado
- Campos: Documento, Nombre, Email, Teléfono, Dirección, Barrio, Edificio, Fecha Ingreso, Estado

### Cotizaciones
- Listado con tabla y acciones
- Crear nueva cotización
- Editar cotización existente
- Eliminar cotización
- Dropdown para seleccionar edificio
- Campos: Número, Fecha, Edificio, Asunto, Descripción, Valor, % Utilidad, Firma, etc.

## Flujo de Datos

1. Componente llama a **Feature Service**
2. Feature Service delega a **Core Service**
3. Core Service usa **HttpClient** con **AuthInterceptor**
4. El interceptor agrega el **JWT token** a las peticiones
5. La API responde y los datos fluyen de vuelta al componente
6. El componente actualiza la UI con **Signals/AsyncPipe**

## Comparación con WPF Original

| Feature | WPF | Angular |
|---------|-----|---------|
| Arquitectura | MVVM | Standalone Components + Services |
| Navegación | UserControls | Router + Lazy Loading |
| Estado | INotifyPropertyChanged | Signals + RxJS |
| HTTP | Manual | HttpClient + Interceptors |
| UI | XAML | HTML + SCSS |
| Autenticación | Session | JWT + localStorage |

## Despliegue en Azure

### Opción 1: Azure Static Web Apps

```bash
# Instalar SWA CLI
npm install -g @azure/static-web-apps-cli

# Desplegar
swa deploy ./dist/soluciones-recidenciales-web --env production
```

### Opción 2: Azure App Service

1. Crear un App Service en Azure
2. Configurar el runtime como Node.js 20
3. Subir los archivos de `dist/` vía FTP o Git

### Configuración CORS

Asegúrese de que el backend en Azure tenga configurado CORS para permitir el dominio del frontend:

```csharp
// En Program.cs del backend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularApp", policy =>
    {
        policy.WithOrigins("https://tu-frontend.azurestaticapps.net")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});
```

## Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `npm start` | Inicia servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run watch` | Build en modo watch |
| `npm test` | Ejecuta tests unitarios |

## Estructura de Modelos (DTOs)

Los modelos están alineados con los DTOs del backend:

```typescript
// CompanyResponse (API) -> CompanyResponse (Angular)
interface CompanyResponse {
  idEmpresa: number;
  nombre: string;
  nit?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  activo?: number;
}
```

Ver `src/app/core/models/` para todos los modelos.

## Licencia

Proyecto privado - Soluciones Residenciales
