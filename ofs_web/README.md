# OfsWeb

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.3.2.

## Galería de fotos

El carrusel de la página principal se alimenta de las carpetas que hay en
`src/assets/img/fotos`. Para añadir imágenes:

1. Crea una subcarpeta dentro de `src/assets/img/fotos` y mete ahí las fotos.
2. Añade un `nota.txt` o `notas.txt` con la descripción. La primera línea se
   usa como título azul del carrusel; si no hay nota, se usa el nombre de la
   carpeta.
3. Arranca la web con `npm start`. El manifiesto `fotos.json` se regenera solo
   al arrancar y, mientras el servidor está en marcha, también al añadir o
   quitar carpetas/fotos.

`npm run build` genera igualmente el manifiesto antes de compilar. Si se usa
`ng serve` directamente, se puede mantener actualizado con `npm run fotos:watch`
en otra terminal.

## Development server

To start a local development server, run:

```bash
npm start
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
